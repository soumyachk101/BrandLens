import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
 try {
 const body = await request.json();
 const { email, password, name } = body;

 if (!email || !password) {
 return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
 }

 const { data, error } = await supabase.auth.signUp({
 email,
 password,
 options: {
 data: { name },
 },
 });

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 400 });
 }

 return NextResponse.json({ user: data.user, message: 'Signup successful' });
 } catch (error) {
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
