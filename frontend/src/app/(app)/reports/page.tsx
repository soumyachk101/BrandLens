"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/features/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useReports, useGenerateReport, useDownloadReport, useResendReport } from "@/hooks/use-reports";
import { ReportCard, ReportCardSkeleton } from "@/components/features/report-card";
import {
 FileText,
 Plus,
 Download,
 Share2,
 Calendar,
 Filter,
 Search,
} from "lucide-react";

export default function ReportsPage() {
 const { data: reports, isLoading } = useReports("brand-1");
 const generateMutation = useGenerateReport("brand-1");
 const [showGenerate, setShowGenerate] = useState(false);
 const [reportConfig, setReportConfig] = useState({ reportType: "weekly", periodStart: "", periodEnd: "", sendTo: "" });

 const handleGenerate = () => {
 generateMutation.mutate({
 reportType: reportConfig.reportType,
 periodStart: reportConfig.periodStart,
 periodEnd: reportConfig.periodEnd,
 sendTo: reportConfig.sendTo ? reportConfig.sendTo.split(",").map((e) => e.trim()) : [],
 format: ["pdf", "html"],
 });
 setShowGenerate(false);
 };

 return (
 <DashboardShell
 title="Reports"
 description="View and manage generated reports"
 >
 <div className="space-y-6">
 {/* Actions */}
 <div className="flex flex-col sm:flex-row gap-3">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1.5 h-4 w-4 text-slate-400" />
 <input
 placeholder="Search reports..."
 className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
 />
 </div>
 <div className="flex gap-2">
 <Button variant="outline" size="sm">
 <Filter className="h-4 w-4 mr-1.5" />
 Filter
 </Button>
 <Button size="sm" onClick={() => setShowGenerate(true)}>
 <Plus className="h-4 w-4 mr-1.5" />
 Generate Report
 </Button>
 </div>
 </div>

 {/* Reports Grid */}
 {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {[1, 2, 3].map((i) => <ReportCardSkeleton key={i} />)}
 </div>
 ) : reports?.data && reports.data.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {reports.data.map((report) => (
 <ReportCard
 key={report.id}
 {...report}
 onView={(id) => console.log("View report:", id)}
 onDownload={(id) => console.log("Download report:", id)}
 onResend={(id) => console.log("Resend report:", id)}
 />
 ))}
 </div>
 ) : (
 <Card className="py-16">
 <div className="text-center">
 <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
 <h3 className="text-lg font-semibold mb-1">No reports yet</h3>
 <p className="text-sm text-slate-500 max-w-sm mb-4">
 Generate your first report to get comprehensive insights about your brand's AI visibility.
 </p>
 <Button onClick={() => setShowGenerate(true)}>
 <Plus className="h-4 w-4 mr-1.5" />
 Generate First Report
 </Button>
 </div>
 </Card>
 )}

 {/* Generate Report Dialog */}
 <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Generate New Report</DialogTitle>
 <DialogDescription>
 Configure and generate a new report for your brand.
 </DialogDescription>
 </DialogHeader>
 <div className="space-y-4 py-4">
 <div>
 <label className="block text-sm font-medium mb-1">Report Type</label>
 <select
 className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
 value={reportConfig.reportType}
 onChange={(e) => setReportConfig({ ...reportConfig, reportType: e.target.value })}
 >
 <option value="weekly">Weekly</option>
 <option value="monthly">Monthly</option>
 <option value="quarterly">Quarterly</option>
 <option value="custom">Custom</option>
 <option value="competitor">Competitor Analysis</option>
 <option value="sentiment">Sentiment Report</option>
 </select>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-sm font-medium mb-1">Start Date</label>
 <input
 type="date"
 className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
 value={reportConfig.periodStart}
 onChange={(e) => setReportConfig({ ...reportConfig, periodStart: e.target.value })}
 />
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">End Date</label>
 <input
 type="date"
 className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
 value={reportConfig.periodEnd}
 onChange={(e) => setReportConfig({ ...reportConfig, periodEnd: e.target.value })}
 />
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Send To (email, comma-separated)</label>
 <input
 type="text"
 placeholder="client@example.com, team@agency.com"
 className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
 value={reportConfig.sendTo}
 onChange={(e) => setReportConfig({ ...reportConfig, sendTo: e.target.value })}
 />
 </div>
 </div>
 <DialogFooter>
 <Button variant="outline" onClick={() => setShowGenerate(false)}>Cancel</Button>
 <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
 {generateMutation.isPending ? "Generating..." : "Generate Report"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 </DashboardShell>
 );
}
