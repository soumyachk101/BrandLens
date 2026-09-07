export async function createClient() {
 const { createClient } = await import("@supabase/supabase-js");
 return createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 );
}
