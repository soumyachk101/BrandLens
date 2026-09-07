import { create } from "zustand";
import type { Brand, DashboardStats, VisibilityTrend, Alert } from "@/lib/types";
import { MOCK_DASHBOARD_STATS, MOCK_VISIBILITY_TRENDS, MOCK_ALERTS } from "@/lib/mock-data";

interface AgencyState {
 stats: DashboardStats;
 visibilityTrends: VisibilityTrend[];
 alerts: Alert[];
 setStats: (stats: DashboardStats) => void;
 markAlertRead: (id: string) => void;
 markAllAlertsRead: () => void;
}

export const useAgencyStore = create<AgencyState>((set) => ({
 stats: MOCK_DASHBOARD_STATS,
 visibilityTrends: MOCK_VISIBILITY_TRENDS,
 alerts: MOCK_ALERTS,
 setStats: (stats) => set({ stats }),
 markAlertRead: (id) =>
 set((state) => ({ alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)) })),
 markAllAlertsRead: () =>
 set((state) => ({ alerts: state.alerts.map((a) => ({ ...a, read: true })) })),
}));

interface BrandState {
 brands: Brand[];
 selectedBrandId: string | null;
 searchQuery: string;
 filterScanFrequency: string | null;
 selectBrand: (id: string | null) => void;
 setSearchQuery: (q: string) => void;
 setFilterScanFrequency: (f: string | null) => void;
 filteredBrands: () => Brand[];
}

export const useBrandStore = create<BrandState>((set, get) => ({
 brands: [],
 selectedBrandId: null,
 searchQuery: "",
 filterScanFrequency: null,
 selectBrand: (id) => set({ selectedBrandId: id }),
 setSearchQuery: (q) => set({ searchQuery: q }),
 setFilterScanFrequency: (f) => set({ filterScanFrequency: f }),
 filteredBrands: () => {
 const { brands, searchQuery, filterScanFrequency } = get();
 return brands.filter((b) => {
 const matchesSearch = !searchQuery ||
 b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 b.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
 const matchesFilter = !filterScanFrequency || b.scanFrequency === filterScanFrequency;
 return matchesSearch && matchesFilter;
 });
 },
}));

interface ReportState {
 reports: any[];
 generatingReport: boolean;
 setGeneratingReport: (v: boolean) => void;
}

export const useReportStore = create<ReportState>((set) => ({
 reports: [],
 generatingReport: false,
 setGeneratingReport: (v) => set({ generatingReport: v }),
}));

interface UIState {
 sidebarOpen: boolean;
 theme: "light" | "dark" | "system";
 activeModal: string | null;
 toasts: any[];
 setSidebarOpen: (v: boolean) => void,
 toggleSidebar: () => void,
 setTheme: (t: "light" | "dark" | "system") => void,
 openModal: (id: string) => void,
 closeModal: () => void,
 addToast: (toast: any) => void,
 removeToast: (id: string) => void,
}

export const useUIStore = create<UIState>((set) => ({
 sidebarOpen: true,
 theme: "system",
 activeModal: null,
 toasts: [],
 setSidebarOpen: (v) => set({ sidebarOpen: v }),
 toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
 setTheme: (t) => set({ theme: t }),
 openModal: (id) => set({ activeModal: id }),
 closeModal: () => set({ activeModal: null }),
 addToast: (toast) => set((state) => ({ toasts: [...state.toasts, toast] })),
 removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
