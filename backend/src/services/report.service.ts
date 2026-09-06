import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { Report, ReportType, ReportStatus, GenerateReportSchema, ResendReportSchema, Agency, Brand } from '../../types';
import { AppError, NotFoundError } from '../../utils/errors';

export class ReportService {
 constructor(private supabase: SupabaseClient) {}

 async list(
 agencyId: string,
 brandId: string,
 options: {
 page?: number;
 limit?: number;
 report_type?: string;
 from?: string;
 to?: string;
 status?: string;
 } = {}
 ): Promise<{ data: Report[]; meta: { page: number; limit: number; total: number; total_pages: number } }> {
 const { page = 1, limit = 20, report_type, from, to, status } = options;

 const fromIdx = (page - 1) * limit;
 const toIdx = fromIdx + limit - 1;

 let query = this.supabase
 .from('reports')
 .select('*', { count: 'exact' })
 .eq('brand_id', brandId)
 .order('created_at', { ascending: false })
 .range(fromIdx, toIdx);

 if (report_type) {
 query = query.eq('report_type', report_type);
 }

 if (status) {
 query = query.eq('status', status);
 }

 if (from) {
 query = query.gte('period_start', from);
 }

 if (to) {
 query = query.lte('period_end', to);
 }

 const { data, error, count } = await query;

 if (error) {
 throw new AppError(`Failed to fetch reports: ${error.message}`, 500);
 }

 const reports = (data || []).map(this.mapRowToReport);
 const total = count || 0;

 return {
 data: reports,
 meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
 };
 }

 async get(agencyId: string, reportId: string): Promise<Report> {
 const { data, error } = await this.supabase
 .from('reports')
 .select('*, brands!inner(agency_id)')
 .eq('id', reportId)
 .eq('brands.agency_id', agencyId)
 .maybeSingle();

 if (error || !data) {
 throw new NotFoundError('Report');
 }

 return this.mapRowToReport(data);
 }

 async generate(
 agencyId: string,
 brandId: string,
 input: unknown
 ): Promise<{ report_id: string; status: string; estimated_completion_seconds: number; created_at: string }> {
 const parsed = GenerateReportSchema.parse(input);

 const { data: brand, error: brandError } = await this.supabase
 .from('brands')
 .select('name, industry, agency_id')
 .eq('id', brandId)
 .eq('agency_id', agencyId)
 .maybeSingle();

 if (brandError || !brand) {
 throw new NotFoundError('Brand');
 }

 const { data: agency } = await this.supabase
 .from('agencies')
 .select('name, white_label_config')
 .eq('id', agencyId)
 .maybeSingle();

 if (!agency) {
 throw new NotFoundError('Agency');
 }

 const reportId = uuidv4();
 const reportData = {
 summary: 'Report generation in progress...',
 total_queries: 0,
 total_mentions: 0,
 visibility_score: 0,
 sentiment_distribution: { positive: 0, neutral: 0, negative: 0, mixed: 0 },
 };

 const { data, error } = await this.supabase
 .from('reports')
 .insert({
 id: reportId,
 brand_id: brandId,
 report_type: parsed.report_type,
 period_start: parsed.period_start,
 period_end: parsed.period_end,
 data: reportData,
 pdf_url: null,
 html_url: null,
 status: 'generating',
 sent_to: parsed.send_to || [],
 })
 .select()
 .maybeSingle();

 if (error || !data) {
 throw new AppError(`Failed to create report: ${error?.message || 'Unknown error'}`, 500);
 }

 const report = this.mapRowToReport(data);

 this.backgroundGenerateReport(report, brand, agency as Agency);

 return {
 report_id: report.id,
 status: 'generating',
 estimated_completion_seconds: 60,
 created_at: report.created_at,
 };
 }

 async getDownloadUrl(agencyId: string, reportId: string, format: string): Promise<string> {
 const report = await this.get(agencyId, reportId);

 if (report.status !== 'completed') {
 throw new AppError('Report is not ready for download', 400);
 }

 if (format === 'pdf' && report.pdf_url) {
 return report.pdf_url;
 }

 if (format === 'html' && report.html_url) {
 return report.html_url;
 }

 throw new NotFoundError(`${format.toUpperCase()} file`);
 }

 async resend(agencyId: string, reportId: string, input: unknown): Promise<{ report_id: string; sent_to: string[]; sent_at: string }> {
 const parsed = ResendReportSchema.parse(input);
 const report = await this.get(agencyId, reportId);

 if (report.status !== 'completed') {
 throw new AppError('Report is not completed', 400);
 }

 const sentAt = new Date().toISOString();
 await this.supabase
 .from('reports')
 .update({ sent_at: sentAt, sent_to: parsed.to, status: 'sent' })
 .eq('id', reportId);

 return {
 report_id: reportId,
 sent_to: parsed.to,
 sent_at: sentAt,
 };
 }

 private async backgroundGenerateReport(
 report: Report,
 brand: Brand,
 agency: Agency
 ): Promise<void> {
 try {
 await new Promise((resolve) => setTimeout(resolve, 3000));

 const { data: queries } = await this.supabase
 .from('ai_queries')
 .select('id, platform, sentiment_score, created_at')
 .eq('brand_id', report.brand_id)
 .gte('created_at', report.period_start)
 .lte('created_at', report.period_end);

 const { data: mentions } = await this.supabase
 .from('mentions')
 .select('id, entity_type, entity_name, sentiment, sentiment_score, platform')
 .eq('brand_id', report.brand_id)
 .gte('created_at', report.period_start)
 .lte('created_at', report.period_end);

 const totalQueries = queries?.length || 0;
 const totalMentions = mentions?.length || 0;
 const brandMentions = mentions?.filter((m) => m.entity_type === 'brand').length || 0;
 const visibilityScore = totalQueries > 0 ? Math.round((brandMentions / totalQueries) * 10000) / 10000 : 0;

 const sentimentDist = {
 positive: mentions?.filter((m) => m.sentiment === 'positive').length || 0,
 neutral: mentions?.filter((m) => m.sentiment === 'neutral').length || 0,
 negative: mentions?.filter((m) => m.sentiment === 'negative').length || 0,
 mixed: mentions?.filter((m) => m.sentiment === 'mixed').length || 0,
 };

 const sentimentScores = mentions?.filter((m) => m.sentiment_score !== null).map((m) => m.sentiment_score as number) || [];
 const avgSentiment = sentimentScores.length > 0 ? Math.round((sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length) * 1000) / 1000 : 0;

 const platformSet = new Set((queries || []).map((q) => q.platform));
 const platformBreakdown = Array.from(platformSet).map((platform) => {
 const pQueries = (queries || []).filter((q) => q.platform === platform);
 const pMentions = (mentions || []).filter((m) => m.platform === platform);
 const pBrandMentions = pMentions.filter((m) => m.entity_type === 'brand').length;
 return {
 platform,
 queries: pQueries.length,
 mentions: pMentions.length,
 visibility: pQueries.length > 0 ? Math.round((pBrandMentions / pQueries.length) * 10000) / 10000 : 0,
 avg_sentiment: avgSentiment,
 };
 });

 const reportData = {
 ...report.data,
 summary: `${brand.name} visibility report: ${totalMentions} mentions across ${totalQueries} queries with visibility score of ${visibilityScore}.`,
 total_queries: totalQueries,
 total_mentions: totalMentions,
 visibility_score: visibilityScore,
 avg_sentiment: avgSentiment,
 sentiment_distribution: sentimentDist,
 platform_breakdown: platformBreakdown,
 generated_at: new Date().toISOString(),
 agency: {
 name: agency.name,
 logo_url: (agency.white_label_config as Record<string, unknown>)?.logo_url || null,
 },
 brand: {
 name: brand.name,
 industry: brand.industry,
 },
 period: {
 start: report.period_start,
 end: report.period_end,
 label: this.getPeriodLabel(report.report_type, report.period_start, report.period_end),
 },
 };

 const pdfUrl = `https://s3.brandlens.ai/reports/${report.id}/report.pdf`;
 const htmlUrl = `https://s3.brandlens.ai/reports/${report.id}/report.html`;

 await this.supabase
 .from('reports')
 .update({
 data: reportData,
 pdf_url: pdfUrl,
 html_url: htmlUrl,
 status: 'completed',
 updated_at: new Date().toISOString(),
 })
 .eq('id', report.id);

 } catch (error) {
 console.error(`Failed to generate report ${report.id}:`, error);
 await this.supabase
 .from('reports')
 .update({ status: 'failed', updated_at: new Date().toISOString() })
 .eq('id', report.id);
 }
 }

 private getPeriodLabel(type: string, start: string, end: string): string {
 const s = new Date(start);
 const e = new Date(end);
 if (type === 'weekly') {
 return `Week of ${s.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
 }
 if (type === 'monthly') {
 return s.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
 }
 return `${start} to ${end}`;
 }

 private mapRowToReport(row: Record<string, unknown>): Report {
 return {
 id: row.id as string,
 brand_id: row.brand_id as string,
 report_type: row.report_type as ReportType,
 period_start: row.period_start as string,
 period_end: row.period_end as string,
 data: (row.data as Record<string, unknown>) || {},
 pdf_url: (row.pdf_url as string) || null,
 html_url: (row.html_url as string) || null,
 status: row.status as ReportStatus,
 sent_at: (row.sent_at as string) || null,
 sent_to: (row.sent_to as string[]) || [],
 created_at: row.created_at as string,
 updated_at: row.updated_at as string,
 };
 }
}
