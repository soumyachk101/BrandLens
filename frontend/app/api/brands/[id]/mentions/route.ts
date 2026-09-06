import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 const { data, error } = await supabase
 .from('ai_queries')
 .select('*')
 .eq('brand_id', params.id)
 .order('created_at', { ascending: false });

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 400 });
 }

 return NextResponse.json(data);
 } catch (error) {
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
