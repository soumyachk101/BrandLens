import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { config } from '../config/env';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
 if (cachedClient) {
 return cachedClient;
 }

 cachedClient = createClient(config.supabase.url, config.supabase.anonKey, {
 auth: {
 autoRefreshToken: true,
 persistSession: true,
 },
 });

 return cachedClient;
}

export function getServiceRoleClient(): SupabaseClient {
 return createClient(config.supabase.url, config.supabase.serviceRoleKey);
}

export async function verifyAuth(token: string): Promise<User | null> {
 try {
 const supabase = getSupabaseClient();
 const { data, error } = await supabase.auth.getUser(token);

 if (error || !data.user) {
 return null;
 }

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
 const { data, error } = await supabase
 .from('agencies')
 .select('id, name, plan')
 .eq('api_key', apiKey)
 .maybeSingle();

 if (error || !data) {
 return null;
 }

 return data;
 } catch {
 return null;
 }
}

export async function setCurrentAgencyId(supabase: SupabaseClient, agencyId: string): Promise<void> {
 await supabase.rpc('set_config', {
 parameter: 'app.current_agency_id',
 value: agencyId,
 is_local: true,
 });
}
