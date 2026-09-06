import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
 public: {
 Tables: {
 agencies: {
 Row: {
 id: string;
 name: string;
 email: string;
 plan: string;
 white_label_config: any;
 created_at: string;
 };
 Insert: {
 id?: string;
 name: string;
 email: string;
 plan?: string;
 white_label_config?: any;
 created_at?: string;
 };
 };
 brands: {
 Row: {
 id: string;
 agency_id: string;
 name: string;
 industry: string;
 keywords: string[];
 competitors: string[];
 created_at: string;
 };
 Insert: {
 id?: string;
 agency_id: string;
 name: string;
 industry: string;
 keywords: string[];
 competitors: string[];
 created_at?: string;
 };
 };
 ai_queries: {
 Row: {
 id: string;
 brand_id: string;
 platform: string;
 query_text: string;
 ai_response: string;
 mentions: any;
 sentiment_score?: number;
 created_at: string;
 };
 Insert: {
 id?: string;
 brand_id: string;
 platform: string;
 query_text: string;
 ai_response: string;
 mentions: any;
 sentiment_score?: number;
 created_at?: string;
 };
 };
 reports: {
 Row: {
 id: string;
 brand_id: string;
 report_type: string;
 period: string;
 data: any;
 pdf_url?: string;
 sent_at?: string;
 created_at: string;
 };
 Insert: {
 id?: string;
 brand_id: string;
 report_type: string;
 period: string;
 data: any;
 pdf_url?: string;
 sent_at?: string;
 created_at?: string;
 };
 };
 mentions: {
 Row: {
 id: string;
 brand_id: string;
 query_id: string;
 platform: string;
 context: string;
 sentiment: string;
 confidence_score: number;
 created_at: string;
 };
 Insert: {
 id?: string;
 brand_id: string;
 query_id: string;
 platform: string;
 context: string;
 sentiment: string;
 confidence_score: number;
 created_at?: string;
 };
 };
 competitors: {
 Row: {
 id: string;
 brand_id: string;
 name: string;
 mention_count: number;
 visibility_score: number;
 created_at: string;
 };
 Insert: {
 id?: string;
 brand_id: string;
 name: string;
 mention_count?: number;
 visibility_score?: number;
 created_at?: string;
 };
 };
 subscriptions: {
 Row: {
 id: string;
 agency_id: string;
 plan: string;
 status: string;
 current_period_start: string;
 current_period_end: string;
 created_at: string;
 };
 Insert: {
 id?: string;
 agency_id: string;
 plan: string;
 status?: string;
 current_period_start: string;
 current_period_end: string;
 created_at?: string;
 };
 };
 };
 };
}
