import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FIREBASE_PROJECT_ID = "lenslink-7p8za";

/** Public: the Firebase web config (apiKey is a publishable browser key). */
export const getFirebaseConfig = createServerFn({ method: "GET" }).handler(async () => {
  return {
    apiKey: process.env.GOOGLE_API_KEY ?? "",
    authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: `${FIREBASE_PROJECT_ID}.firebasestorage.app`,
    messagingSenderId: "1016005005855",
    appId: "1:1016005005855:web:99c2ca869d16b0c4c57b2a",
  };
});

/**
 * Verifies a Firebase ID token server-side, then mints a matching Lovable Cloud
 * session token so all data/storage keeps working under the normal RLS identity.
 */
export const exchangeFirebaseToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ idToken: z.string().min(20) }).parse(input))
  .handler(async ({ data }) => {
    const { jwtVerify, importX509, decodeProtectedHeader } = await import("jose");

    const header = decodeProtectedHeader(data.idToken);
    const certs: Record<string, string> = await fetch(
      "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
    ).then((r) => r.json());
    const pem = header.kid ? certs[header.kid] : undefined;
    if (!pem) throw new Error("Unknown Firebase signing key");

    const key = await importX509(pem, "RS256");
    const { payload } = await jwtVerify(data.idToken, key, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });

    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    const emailVerified = payload.email_verified === true;
    if (!email || !emailVerified) throw new Error("Firebase account has no verified email");

    const fullName = typeof payload.name === "string" ? payload.name : undefined;
    const picture = typeof payload.picture === "string" ? payload.picture : undefined;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Find or create the matching Lovable Cloud user.
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName, avatar_url: picture, firebase_uid: payload.sub },
    });

    let userId = created?.user?.id;
    if (createError && !userId) {
      // Already exists — look it up.
      const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      userId = list?.users?.find((u) => u.email?.toLowerCase() === email)?.id;
      if (!userId) throw createError;
    }

    if (userId) {
      await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: userId,
            username: email.split("@")[0].replace(/[^a-z0-9]/g, "") || "user",
            display_name: fullName ?? null,
            avatar_url: picture ?? null,
          },
          { onConflict: "id", ignoreDuplicates: true },
        );
    }

    // Mint a one-time token the browser can redeem for a real session.
    const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkError || !link?.properties?.hashed_token) {
      throw linkError ?? new Error("Could not create session");
    }

    return { email, tokenHash: link.properties.hashed_token };
  });
