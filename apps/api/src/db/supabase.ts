import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    '[Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. ' +
    'Supabase client will not be available.',
  );
}

/**
 * Supabase admin client — uses service role key, bypasses RLS.
 * Use for server-side operations only. Never expose to the client.
 */
export const supabaseAdmin = createClient(
  supabaseUrl ?? '',
  supabaseServiceKey ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Helper: upload a file to Supabase Storage.
 * Used for founder avatar uploads.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string,
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, { contentType, upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
