import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
 try {
 const { data, error } = await supabase
 .from('reports')
 .select('*')
 .order('created_at', { ascending: false });

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 400 });
 }

 return NextResponse.json(data);
 } catch (error) {
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}

export async function POST(request: NextRequest) {
 try {
 const body = await request.json();
 const { brandId, reportType, period, data } = body;

 if (!brandId || !reportType || !period) {
 return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
 }

 const { data: report, error } = await supabase
 .from('reports')
 .insert({
 brand_id: brandId,
 report_type: reportType,
 period,
 data: data || {},
 })
 .select()
 .single();

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 400 });
 }

 return NextResponse.json(report, { status: 201 });
 } catch (error) {
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
