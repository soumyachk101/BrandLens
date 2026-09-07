import { PrismaClient, ReportType, ReportStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { AppError, NotFoundError } from '../utils/errors';
import { generateReportSchema, resendReportSchema, reportFilterSchema } from '../utils/validators';
import { Report } from '../types';

export class ReportService {
 constructor(private prisma: PrismaClient) {}

 async list(
 brandId: string,
 options: {
 page?: number;
 limit?: number;
 report_type?: string;
 from?: string;
 to?: string;
 status?: string;
 } = {},
 ): Promise<{ data: Report[]; meta: { page: number; limit: number; total: number; total_pages: number } }> {
 const { page = 1, limit = 20, report_type, from, to, status } = options;

 const where: any = { brand_id: brandId };
 if (report_type) where.report_type = report_type as ReportType;
 if (status) where.status = status as ReportStatus;
 if (from) where.period_start = { gte: from };
 if (to) where.period_end = { lte: to };

 const [data, total] = await Promise.all([
 this.prisma.reports.findMany({
 where,
 skip: (page - 1) * limit,
 take: limit,
 orderBy: { created_at: 'desc' },
 }),
 this.prisma.reports.count({ where }),
 ]);

 const reports = data.map((r) => this.mapRowToReport(r));
 const totalPages = Math.ceil(total / limit);

 return { data: reports, meta: { page, limit, total, total_pages: totalPages } };
 }

 async get(reportId: string): Promise<Report> {
 const report = await this.prisma.reports.findUnique({
 where: { id: reportId },
 });

 if (!report) {
 throw new NotFoundError('Report');
 }

 return this.mapRowToReport(report);
 }

 async generate(
 agencyId: string,
 brandId: string,
 input: unknown,
 ): Promise<{ report_id: string; status: string; estimated_completion_seconds: number; created_at: string }> {
 const parsed = generateReportSchema.parse(input);

 // Verify brand ownership
 const brand = await this.prisma.brands.findFirst({
 where: { id: brandId, agency_id: agencyId },
 select: { id: true, name: true },
 });

 if (!brand) {
 throw new NotFoundError('Brand');
 }

 const reportId = uuidv4();
 const reportData = {
 summary: 'Report generation in progress...',
 total_queries: 0,
 total_mentions: 0,
 visibility_score: 0,
 sentiment_distribution: { positive: 0, neutral: 0, negative: 0, mixed: 0 },
 };

 const report = await this.prisma.reports.create({
 data: {
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
 },
 });

 return {
 report_id: report.id,
 status: 'generating',
 estimated_completion_seconds: 60,
 created_at: report.created_at,
 };
 }

 async getDownloadUrl(agencyId: string, reportId: string, format: string): Promise<string> {
 const report = await this.prisma.reports.findUnique({
 where: { id: reportId },
 });

 if (!report) {
 throw new NotFoundError('Report');
 }

 if (report.status !== 'completed') {
 throw new AppError('Report is not ready for download', 400, 'BAD_REQUEST');
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
 const parsed = resendReportSchema.parse(input);

 const report = await this.prisma.reports.findUnique({
 where: { id: reportId },
 });

 if (!report) {
 throw new NotFoundError('Report');
 }

 if (report.status !== 'completed') {
 throw new AppError('Report is not completed', 400, 'BAD_REQUEST');
 }

 const sentAt = new Date().toISOString();
 await this.prisma.reports.update({
 where: { id: reportId },
 data: { sent_at: sentAt, sent_to: parsed.to, status: 'sent' },
 });

 return {
 report_id: reportId,
 sent_to: parsed.to,
 sent_at: sentAt,
 };
 }

 async getBrandReports(brandId: string, options: { report_type?: string; from?: string; to?: string; status?: string; page?: number; limit?: number } = {}): Promise<{ data: Report[]; meta: any }> {
 const { report_type, from, to, status, page = 1, limit = 20 } = options;

 const where: any = { brand_id: brandId };
 if (report_type) where.report_type = report_type as ReportType;
 if (status) where.status = status as ReportStatus;
 if (from) where.period_start = { gte: from };
 if (to) where.period_end = { lte: to };

 const [data, total] = await Promise.all([
 this.prisma.reports.findMany({
 where,
 skip: (page - 1) * limit,
 take: limit,
 orderBy: { created_at: 'desc' },
 }),
 this.prisma.reports.count({ where }),
 ]);

 const reports = data.map((r) => this.mapRowToReport(r));
 const totalPages = Math.ceil(total / limit);

 return { data: reports, meta: { page, limit, total, total_pages: totalPages } };
 }

 private mapRowToReport(row: any): Report {
 return {
 id: row.id,
 brand_id: row.brand_id,
 report_type: row.report_type,
 period_start: row.period_start,
 period_end: row.period_end,
 data: (row.data as Record<string, unknown>) || {},
 pdf_url: row.pdf_url,
 html_url: row.html_url,
 status: row.status,
 sent_at: row.sent_at,
 sent_to: row.sent_to,
 created_at: row.created_at,
 updated_at: row.updated_at,
 };
 }
}