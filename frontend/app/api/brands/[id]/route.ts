import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 const { data, error } = await supabase
 .from('brands')
 .select('*')
 .eq('id', params.id)
 .single();

 if (error) {
 return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
 }

 return NextResponse.json(data);
 } catch (error) {
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}

export async function PATCH(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 const body = await request.json();
 const { data, error } = await supabase
 .from('brands')
 .update(body)
 .eq('id', params.id)
 .select()
 .single();

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 400 });
 }

 return NextResponse.json(data);
 } catch (error) {
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
