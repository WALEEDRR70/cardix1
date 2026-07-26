// Uploads studio images to the private studio-media bucket and returns a long-lived signed URL.
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "studio-media";
const YEAR = 60 * 60 * 24 * 365;

export async function uploadStudioImage(file: File): Promise<string> {
  const { data: auth } = await supabase.auth.getSession();
  const uid = auth.session?.user.id;
  if (!uid) throw new Error("not signed in");
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage.from(BUCKET).createSignedUrl(path, YEAR);
  if (signErr || !data?.signedUrl) throw signErr ?? new Error("could not sign url");
  return data.signedUrl;
}
