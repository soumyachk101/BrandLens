// BrandLens Vercel Analytics Integration
// Track page views and custom events

type AnalyticsEvent = {
 name: string;
 data?: Record<string, any>;
};

class Analytics {
 private enabled: boolean;

 constructor() {
 this.enabled = typeof window !== 'undefined' &&
 process.env.NODE_ENV === 'production';
 }

 trackPageView(url: string): void {
 if (!this.enabled) return;

 if (typeof window !== 'undefined' && (window as any).va) {
 (window as any).va('track', 'pageview', { url });
 }
 }

 trackEvent(event: AnalyticsEvent): void {
 if (!this.enabled) return;

 if (typeof window !== 'undefined' && (window as any).va) {
 (window as any).va('track', event.name, event.data || {});
 }
 }

 // BrandLens-specific events
 trackBrandCreated(brandId: string, industry: string): void {
 this.trackEvent({
 name: 'Brand Created',
 data: { brand_id: brandId, industry },
 });
 }

 trackScanTriggered(brandId: string, platforms: string[]): void {
 this.trackEvent({
 name: 'Scan Triggered',
 data: { brand_id: brandId, platforms },
 });
 }

 trackReportGenerated(reportType: string, brandId: string): void {
 this.trackEvent({
 name: 'Report Generated',
 data: { report_type: reportType, brand_id: brandId },
 });
 }
}

export const analytics = new Analytics();
