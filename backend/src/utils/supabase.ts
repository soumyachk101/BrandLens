import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { config } from '../config/env';

let cachedClient: SupabaseClient | null = null;
let cachedServiceRoleClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
 if (cachedClient) return cachedClient;
 if (!config.supabase.url || !config.supabase.anonKey) return null;

 cachedClient = createClient(config.supabase.url, config.supabase.anonKey, {
 auth: {
 autoRefreshToken: true,
 persistSession: false,
 },
 });
 return cachedClient;
}

export function getServiceRoleClient(): SupabaseClient | null {
 if (cachedServiceRoleClient) return cachedServiceRoleClient;
 if (!config.supabase.url || !config.supabase.serviceRoleKey) return null;

 cachedServiceRoleClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
 auth: { persistSession: false },
 });
 return cachedServiceRoleClient;
}

export async function verifyAuth(token: string): Promise<User | null> {
 try {
 const supabase = getSupabaseClient();
 if (!supabase) return null;
 const { data, error } = await supabase.auth.getUser(token);
 if (error || !data.user) return null;
 return data.user;
 } catch {
 return null;
 }
}

export async function getAgencyByApiKey(apiKey: string): Promise<
 | {
 id: string;
 name: string;
 plan: string;
 }
 | null
 > {
 try {
 const supabase = getServiceRoleClient();
 if (!supabase) return null;
 const { data, error } = await supabase
 .from('agencies')
 .select('id, name, plan')
 .eq('api_key', apiKey)
 .eq('email_verified', true)
 .maybeSingle();
 if (error || !data) return null;
 return data;
 } catch {
 return null;
 }
}