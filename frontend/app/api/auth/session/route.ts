import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
 try {
 const session = await supabase.auth.getSession();

 if (!session.data.session) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 return NextResponse.json({ user: session.data.session.user });
 } catch (error) {
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
