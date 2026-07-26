import { supabase } from "@/integrations/supabase/client";
import { exchangeFirebaseToken, getFirebaseConfig } from "@/lib/firebase.functions";

let appPromise: Promise<import("firebase/app").FirebaseApp> | null = null;

async function getFirebaseApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const [{ initializeApp, getApps, getApp }, config] = await Promise.all([
        import("firebase/app"),
        getFirebaseConfig(),
      ]);
      return getApps().length ? getApp() : initializeApp(config);
    })();
  }
  return appPromise;
}

/**
 * Google sign-in through Firebase. The resulting Firebase ID token is verified
 * server-side and exchanged for a Lovable Cloud session, so cards, vault data
 * and image uploads keep working under the same account.
 */
export async function signInWithFirebaseGoogle(): Promise<void> {
  const app = await getFirebaseApp();
  const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const cred = await signInWithPopup(auth, provider);
  const idToken = await cred.user.getIdToken();

  const { tokenHash } = await exchangeFirebaseToken({ data: { idToken } });

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });
  if (error) throw error;
}
