# BrandLens — Component Structure

Component tree, state management, and architecture for BrandLens.

---

## 1. Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | React 18+ (TypeScript) |
| Build | Vite |
| Routing | React Router v6 |
| State | Zustand (client) + TanStack Query v5 (server) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix primitives) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| PDF | react-pdf / PDF.js |
| Real-time | native WebSocket |
| Testing | Vitest + Testing Library |

---

## 2. Project Directory Structure

```
src/
├── main.tsx # App entry point
├── App.tsx # Root layout + router
├── vite-env.d.ts
│
├── components/
│ ├── layout/ # Shared layout components
│ │ ├── AppShell.tsx
│ │ ├── Sidebar.tsx
│ │ ├── TopBar.tsx
│ │ ├── MobileNav.tsx
│ │ └── PageHeader.tsx
│ │
│ ├── charts/ # Chart wrappers
│ │ ├── LineChart.tsx
│ │ ├── BarChart.tsx
│ │ ├── DonutChart.tsx
│ │ ├── Heatmap.tsx
│ │ ├── Sparkline.tsx
│ │ └── WordCloud.tsx
│ │
│ ├── dashboard/ # Dashboard-specific components
│ │ ├── KPICard.tsx
│ │ ├── ScoreCard.tsx
│ │ ├── BrandCard.tsx
│ │ ├── MentionsFeed.tsx
│ │ ├── CompetitorTable.tsx
│ │ └── AlertCard.tsx
│ │
│ ├── reports/ # Report components
│ │ ├── ReportViewer.tsx
│ │ ├── ReportTableOfContents.tsx
│ │ ├── ReportGenerator.tsx
│ │ ├── ReportConfigForm.tsx
│ │ └── ReportCard.tsx
│ │
│ ├── brands/ # Brand management
│ │ ├── BrandForm.tsx
│ │ ├── BrandList.tsx
│ │ ├── BrandDetail.tsx
│ │ ├── CompetitorRow.tsx
│ │ └── KeywordInput.tsx
│ │
│ ├── team/ # Team management
│ │ ├── MemberRow.tsx
│ │ ├── InviteForm.tsx
│ │ └── RoleSelect.tsx
│ │
│ ├── settings/ # Settings pages
│ │ ├── ProfileSettings.tsx
│ │ ├── WhiteLabelSettings.tsx
│ │ ├── IntegrationSettings.tsx
│ │ └── APISettings.tsx
│ │
│ ├── billing/ # Billing components
│ │ ├── PlanCard.tsx
│ │ ├── UsageMeter.tsx
│ │ ├── InvoiceTable.tsx
│ │ └── BillingOverview.tsx
│ │
│ ├── ui/ # shadcn/ui wrappers (auto-generated)
│ │ ├── button.tsx
│ │ ├── card.tsx
│ │ ├── dialog.tsx
│ │ ├── dropdown-menu.tsx
│ │ ├── input.tsx
│ │ ├── label.tsx
│ │ ├── select.tsx
│ │ ├── table.tsx
│ │ ├── tabs.tsx
│ │ ├── toast.tsx
│ │ ├── tooltip.tsx
│ │ ├── badge.tsx
│ │ ├── skeleton.tsx
│ │ ├── switch.tsx
│ │ ├── slider.tsx
│ │ ├── avatar.tsx
│ │ ├── separator.tsx
│ │ ├── popover.tsx
│ │ └── ...
│ │
│ └── shared/ # Shared components
│ ├── EmptyState.tsx
│ ├── LoadingSpinner.tsx
│ ├── ErrorBoundary.tsx
│ ├── ConfirmDialog.tsx
│ ├── SearchInput.tsx
│ ├── DataTable.tsx
│ ├── Pagination.tsx
│ ├── FilterDrawer.tsx
│ ├── DateRangePicker.tsx
│ └── ThemeToggle.tsx
│
├── pages/ # Route-level page components
│ ├── LandingPage.tsx
│ ├── LoginPage.tsx
│ ├── SignupPage.tsx
│ ├── MFAPage.tsx
│ ├── OnboardingPage.tsx
│ ├── DashboardPage.tsx
│ ├── BrandDetailPage.tsx
│ ├── ReportsPage.tsx
│ ├── ReportViewerPage.tsx
│ ├── CompetitorsPage.tsx
│ ├── TeamPage.tsx
│ ├── SettingsPage.tsx
│ ├── BillingPage.tsx
│ ├── ForgotPasswordPage.tsx
│ ├── NotFoundPage.tsx
│ └── UnauthorizedPage.tsx
│
├── store/ # Zustand stores
│ ├── authStore.ts
│ ├── agencyStore.ts
│ ├── brandStore.ts
│ ├── reportStore.ts
│ ├── uiStore.ts
│ ├── themeStore.ts
│ └── notificationStore.ts
│
├── hooks/ # Custom hooks
│ ├── useAuth.ts
│ ├── useDebounce.ts
│ ├── useWebSocket.ts
│ ├── useReportGenerator.ts
│ ├── useBrandFilters.ts
│ ├── useExportPDF.ts
│ └── useKeyboardShortcut.ts
│
├── services/ # API client
│ ├── api.ts # Axios / fetch wrapper
│ ├── auth.ts
│ ├── brands.ts
│ ├── reports.ts
│ ├── team.ts
│ ├── billing.ts
│ └── websocket.ts
│
├── types/ # TypeScript types
│ ├── user.ts
│ ├── brand.ts
│ ├── report.ts
│ ├── mention.ts
│ ├── competitor.ts
│ ├── subscription.ts
│ └── api.ts
│
├── utils/ # Utilities
│ ├── formatters.ts # Numbers, dates, percentages
│ ├── validators.ts # Zod schemas
│ ├── colors.ts # Color utility functions
│ ├── chartHelpers.ts # Chart data transformation
│ ├── exportHelpers.ts # CSV / PDF export helpers
│ └── constants.ts # App-wide constants
│
├── styles/
│ ├── globals.css # Tailwind + CSS variables
│ ├── fonts.css # @font-face declarations
│ └── animations.css # Keyframe animations
│
└── __tests__/ # Test utilities
 ├── setup.ts
 ├── test-utils.tsx
 └── fixtures/
 ├── brands.ts
 ├── mentions.ts
 └── reports.ts
```

---

## 3. Component Tree (Page-Level)

### 3.1 App Shell

```
<App>
 <AppShell>
 <Sidebar>
 <SidebarHeader>
 <Logo />
 </SidebarHeader>
 <SidebarNav>
 <NavItem icon="LayoutDashboard" to="/dashboard">Overview</NavItem>
 <NavItem icon="Building2" to="/dashboard/brands">Brands</NavItem>
 <NavItem icon="Users" to="/dashboard/competitors">Competitors</NavItem>
 <NavItem icon="FileText" to="/dashboard/reports">Reports</NavItem>
 <NavItem icon="Users" to="/dashboard/team">Team</NavItem>
 <NavItem icon="Settings" to="/dashboard/settings">Settings</NavItem>
 <NavItem icon="CreditCard" to="/dashboard/billing">Billing</NavItem>
 </SidebarNav>
 <SidebarFooter>
 <HelpLink />
 <ThemeToggle />
 </SidebarFooter>
 </Sidebar>

 <main className="flex-1 overflow-y-auto">
 <TopBar>
 <MobileMenuToggle />
 <SearchBar />
 <NotificationBell />
 <UserMenu />
 </TopBar>
 <Outlet /> {/* React Router renders page here */}
 </main>
 </AppShell>
</App>
```

### 3.2 Dashboard Page

```
<DashboardPage>
 <PageHeader title="Dashboard" subtitle="Agency overview" />
 <KPIGrid>
 <KPICard label="Total Brands" value="8" trend="+2 this month" icon="Building2" />
 <KPICard label="Avg Score" value="72" trend="+5%" positive icon="TrendingUp" />
 <KPICard label="Total Mentions" value="12.4K" trend="+18%" positive icon="MessageSquare" />
 <KPICard label="Active Alerts" value="3" trend="2 new" icon="Bell" />
 </KPIGrid>

 <ChartGrid cols={2}>
 <Card>
 <CardHeader title="Visibility Trends" />
 <LineChart data={visibilityData} brands={brands} />
 </Card>
 <Card>
 <CardHeader title="AI Model Distribution" />
 <DonutChart data={modelDistribution} />
 </Card>
 </ChartGrid>

 <MentionsFeed brandIds={brands} limit={10} />
</DashboardPage>
```

### 3.3 Brand Detail Page

```
<BrandDetailPage brandId={brandId}>
 <PageHeader
 title={brand.name}
 subtitle={brand.industry}
 actions={[<EditButton />, <ExportButton />, <MoreMenu />]}
 />

 <KPIGrid cols={4}>
 <ScoreCard label="Visibility Score" value={score} trend={scoreTrend} />
 <KPICard label="Mentions (30d)" value={mentionCount} trend={mentionTrend} />
 <KPICard label="Sentiment" value={sentimentScore} trend={sentimentTrend} />
 <KPICard label="Industry Rank" value={rank} of={total} />
 </KPIGrid>

 <ChartGrid cols={2}>
 <Card>
 <CardHeader title="Visibility Over Time" />
 <LineChart data={timeSeriesData} />
 </Card>
 <Card>
 <CardHeader title="Mentions by Source" />
 <BarChart data={sourceData} />
 </Card>
 </ChartGrid>

 <ChartGrid cols={2}>
 <Card>
 <CardHeader title="AI Engine Performance" />
 <BarChart data={aiModelData} horizontal />
 </Card>
 <Card>
 <CardHeader title="Sentiment Trend" />
 <StackedAreaChart data={sentimentTrend} />
 </Card>
 </ChartGrid>

 <Card>
 <CardHeader title="Recent Mentions" />
 <MentionsFeed brandId={brandId} limit={20} />
 </Card>

 <CompetitorSection competitors={competitors} />
</BrandDetailPage>
```

### 3.4 Report Viewer Page

```
<ReportViewerPage reportId={reportId}>
 <div className="flex h-full">
 <aside className="w-64 border-r">
 <ReportTableOfContents sections={report.sections} />
 </aside>
 <main className="flex-1 overflow-y-auto">
 <div className="max-w-4xl mx-auto">
 <ReportCover agency={agency} brand={brand} period={report.period} />
 <ReportSection id="summary" title="Executive Summary">
 <ReportSummary findings={report.summary} />
 </ReportSection>
 <ReportSection id="scores" title="Visibility Scores">
 <KPICardGroup metrics={report.kpis} />
 <LineChart data={report.trends} />
 </ReportSection>
 <ReportSection id="mentions" title="Mention Analysis">
 <MentionsTable mentions={report.mentions} />
 <SentimentBreakdown data={report.sentiment} />
 </ReportSection>
 <ReportSection id="competitors" title="Competitor Analysis">
 <CompetitorTable competitors={report.competitors} />
 </ReportSection>
 <ReportSection id="recommendations" title="Recommendations">
 <RecommendationList items={report.recommendations} />
 </ReportSection>
 </div>
 </main>
 </div>
</ReportViewerPage>
```

### 3.5 Reports List Page

```
<ReportsPage>
 <PageHeader title="Reports" actions={[<GenerateButton />]} />
 <FilterBar>
 <SearchInput placeholder="Search reports..." />
 <DateRangeFilter />
 <BrandFilter />
 <StatusFilter />
 </FilterBar>
 <DataTable columns={reportColumns} data={reports}>
 <Column header="Report Name" accessorKey="name" />
 <Column header="Brand" accessorKey="brandName" />
 <Column header="Period" accessorKey="period" />
 <Column header="Generated" accessorKey="createdAt" />
 <Column header="Status" accessorKey="status">
 <StatusBadge status={row.status} />
 </Column>
 <Column header="Actions">
 <ViewButton />
 <DownloadButton />
 <ShareButton />
 </Column>
 </DataTable>
 <Pagination />
</ReportsPage>
```

### 3.6 Settings Page

```
<SettingsPage>
 <TabsList>
 <TabsTrigger value="profile">Profile</TabsTrigger>
 <TabsTrigger value="team">Team</TabsTrigger>
 <TabsTrigger value="integrations">Integrations</TabsTrigger>
 <TabsTrigger value="white-label">White-label</TabsTrigger>
 <TabsTrigger value="api">API</TabsTrigger>
 <TabsTrigger value="notifications">Notifications</TabsTrigger>
 </TabsList>

 <TabsContent value="profile">
 <ProfileSettings />
 </TabsContent>
 <TabsContent value="team">
 <TeamSettings />
 </TabsContent>
 <TabsContent value="integrations">
 <IntegrationSettings />
 </TabsContent>
 <TabsContent value="white-label">
 <WhiteLabelSettings />
 </TabsContent>
 <TabsContent value="api">
 <APISettings />
 </TabsContent>
 <TabsContent value="notifications">
 <NotificationSettings />
 </TabsContent>
</SettingsPage>
```

---

## 4. State Management (Zustand)

### 4.1 Store Architecture

We use **Zustand** for global client state and **TanStack Query** for server state. Zustand handles UI state (modals, sidebar, theme), while TanStack Query handles data fetching, caching, and mutations.

### 4.2 Store Definitions

#### authStore.ts

```typescript
interface AuthState {
 user: User | null;
 agency: Agency | null;
 isAuthenticated: boolean;
 isLoading: boolean;
 mfaRequired: boolean;
 pendingMfaUserId: string | null;

 // Actions
 login: (email: string, password: string) => Promise<void>;
 loginSSO: (provider: 'google' | 'microsoft') => Promise<void>;
 verifyMFA: (code: string) => Promise<void>;
 logout: () => void;
 refreshToken: () => Promise<void>;
 setUser: (user: User) => void;
 setAgency: (agency: Agency) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
 user: null,
 agency: null,
 isAuthenticated: false,
 isLoading: true,
 mfaRequired: false,
 pendingMfaUserId: null,

 login: async (email, password) => {
 // calls /auth/login
 },
 // ... actions
}));
```

#### agencyStore.ts

```typescript
interface AgencyState {
 brands: Brand[];
 selectedBrandId: string | null;
 isLoading: boolean;
 error: string | null;

 // Actions
 fetchBrands: () => Promise<void>;
 addBrand: (data: BrandInput) => Promise<Brand>;
 updateBrand: (id: string, data: Partial<Brand>) => Promise<void>;
 deleteBrand: (id: string) => Promise<void>;
 selectBrand: (id: string | null) => void;
}

export const useAgencyStore = create<AgencyState>((set, get) => ({
 brands: [],
 selectedBrandId: null,
 isLoading: false,
 error: null,

 fetchBrands: async () => {
 set({ isLoading: true });
 // uses TanStack Query internally
 },
 // ... actions
}));
```

#### uiStore.ts

```typescript
interface UIState {
 sidebarOpen: boolean;
 sidebarCollapsed: boolean;
 theme: 'light' | 'dark' | 'system';
 notificationDrawerOpen: boolean;
 mobileSearchOpen: boolean;
 activeModal: string | null;
 toastQueue: Toast[];

 // Actions
 toggleSidebar: () => void;
 setSidebarCollapsed: (collapsed: boolean) => void;
 setTheme: (theme: 'light' | 'dark' | 'system') => void;
 openModal: (name: string) => void;
 closeModal: () => void;
 addToast: (toast: Toast) => void;
 removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
 sidebarOpen: true,
 sidebarCollapsed: false,
 theme: 'system',
 notificationDrawerOpen: false,
 mobileSearchOpen: false,
 activeModal: null,
 toastQueue: [],

 toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
 // ... actions
}));
```

#### reportStore.ts

```typescript
interface ReportState {
 reports: Report[];
 selectedReport: Report | null;
 reportGenerating: boolean;
 generationProgress: number;

 fetchReports: () => Promise<void>;
 generateReport: (config: ReportConfig) => Promise<Report>;
 downloadReport: (reportId: string, format: 'pdf' | 'html') => Promise<void>;
 shareReport: (reportId: string, email: string) => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
 reports: [],
 selectedReport: null,
 reportGenerating: false,
 generationProgress: 0,

 // ... actions
}));
```

### 4.3 Server State (TanStack Query)

We use TanStack Query (`@tanstack/react-query`) for all data fetching:

```typescript
// services/queries/brands.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys
export const brandKeys = {
 all: ['brands'] as const,
 list: (agencyId: string) => [...brandKeys.all, 'list', agencyId] as const,
 detail: (id: string) => [...brandKeys.all, 'detail', id] as const,
};

// Queries
export function useBrands(agencyId: string) {
 return useQuery({
 queryKey: brandKeys.list(agencyId),
 queryFn: () => api.brands.list(agencyId),
 });
}

// Mutations
export function useAddBrand() {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: api.brands.create,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: brandKeys.all });
 },
 });
}
```

**Key principle**: All data flows through TanStack Query. Zustand handles only UI state that does not belong to the server (theme, sidebar, modals, toasts).

---

## 5. shadcn/ui Usage

BrandLens uses **shadcn/ui** as the primary component library. Components are installed into `src/components/ui/` as needed, not all at once.

### 5.1 Core Components Used

| Component | Usage |
|-----------|-------|
| `Button` | Primary CTA, secondary, ghost, destructive variants |
| `Card` | Dashboard widgets, form sections |
| `Dialog` | Brand creation/edit modals, confirm dialogs |
| `DropdownMenu` | User menu, context menus, column toggles |
| `Input` | Text inputs, search |
| `Label` | Form labels |
| `Select` | Dropdown selects (industry, frequency, roles) |
| `Table` | Report lists, brand lists, invoices |
| `Tabs` | Settings page, report viewer TOC |
| `Toast` | Notifications, action confirmations |
| `Tooltip` | Chart labels, icon hints |
| `Badge` | Status indicators, score labels |
| `Skeleton` | Loading placeholders |
| `Switch` | Toggle settings (AI models, notifications) |
| `Slider` | Date range, score thresholds |
| `Avatar` | User avatars, team members |
| `Separator` | Visual dividers in cards |
| `Popover` | Date pickers, filter menus |
| `Sheet` | Mobile sidebar, filter drawers |
| `Command` | Command palette (cmd+k search) |
| `Progress` | Generation progress, onboarding steps |

### 5.2 Installation Pattern

```bash
# Install a shadcn/ui component
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
# etc.
```

Each creates/updates a file in `src/components/ui/`.

### 5.3 Customization

- Override in `src/styles/globals.css` via CSS variables (Tailwind v4 approach)
- Dark mode: shadcn/ui uses CSS variables that swap via `.dark` class
- Custom variants defined in component wrappers (e.g., `src/components/ui/button.tsx`)

---

## 6. Reusable Patterns

### 6.1 Page Layout Wrapper

```tsx
// components/layout/AppShell.tsx
export function AppShell({ children }: { children: ReactNode }) {
 return (
 <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
 <Sidebar />
 <main className="flex-1 flex flex-col overflow-hidden">
 <TopBar />
 <div className="flex-1 overflow-y-auto p-6">
 {children}
 </div>
 </main>
 </div>
 );
}
```

### 6.2 Data Card Pattern

```tsx
// components/shared/Card.tsx
export function Card({ title, subtitle, icon, children, actions }) {
 return (
 <CardComponent className="shadow-sm">
 {(title || actions) && (
 <CardHeader>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 {icon && <IconComponent className="h-5 w-5 text-primary-600" />}
 <CardTitle>{title}</CardTitle>
 {subtitle && <CardDescription>{subtitle}</CardDescription>}
 </div>
 {actions}
 </div>
 </CardHeader>
 )}
 <CardContent>{children}</CardContent>
 </CardComponent>
 );
}
```

### 6.3 Form Pattern

All forms use React Hook Form + Zod:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const brandSchema = z.object({
 name: z.string().min(2, 'Brand name must be at least 2 characters'),
 domain: z.string().url('Enter a valid URL'),
 keywords: z.string().min(3, 'Add at least 3 keywords'),
});

type BrandFormValues = z.infer<typeof brandSchema>;

export function BrandForm({ onSubmit }: { onSubmit: (v: BrandFormValues) => void }) {
 const form = useForm<BrandFormValues>({
 resolver: zodResolver(brandSchema),
 defaultValues: { name: '', domain: '', keywords: '' },
 });

 return (
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
 <FormField name="name" control={form.control} render={({ field }) => (
 <FormItem>
 <FormLabel>Brand Name</FormLabel>
 <FormControl><Input {...field} /></FormControl>
 <FormMessage />
 </FormItem>
 )} />
 {/* more fields */}
 <Button type="submit" loading={form.formState.isSubmitting}>
 Save Brand
 </Button>
 </form>
 </Form>
 );
}
```

---

## 7. Routing Structure

```
/ → Landing page (public)
/login → Login page (public)
/signup → Sign up page (public)
/forgot-password → Password reset (public)

/onboarding → Onboarding wizard (protected)
/dashboard → Agency dashboard (protected)
/dashboard/brands → Brand list (protected)
/dashboard/brands/:brandId → Brand detail (protected)
/dashboard/brands/:brandId/compare → Brand comparison (protected)
/dashboard/competitors → Competitor analysis (protected)
/dashboard/reports → Report library (protected)
/dashboard/reports/:reportId → Report viewer (protected)
/dashboard/reports/generate → Report generator (protected)
/dashboard/team → Team management (protected)
/dashboard/settings → Settings (protected)
/dashboard/billing → Billing (protected)

/404 → Not found
/403 → Unauthorized
```

---

## 8. Error Boundaries & Resilience

```
<ErrorBoundary fallback={<ErrorPage />}>
 <App>
 <Suspense fallback={<LoadingSkeleton />}>
 <Routes />
 </Suspense>
 </App>
</ErrorBoundary>
```

- Each page wrapped in its own `ErrorBoundary` to isolate failures
- TanStack Query `QueryErrorResetBoundary` for fetch errors
- Fallback: skeleton → data, error state → retry button

---

## 9. Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit tests | Vitest + Testing Library | 80% |
| Component tests | Vitest + Testing Library | 75% |
| Hook tests | Vitest + Testing Library | 80% |
| Integration | Vitest | 60% |
| E2E | Playwright | Critical flows |

**Test file pattern**: co-located with source files
```
src/pages/DashboardPage.tsx
src/pages/DashboardPage.test.tsx
```

---

## 10. Performance Budget

| Metric | Target |
|--------|--------|
| Initial bundle (gzipped) | < 200KB |
| Largest Contentful Paint (LCP) | < 2.5s |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Time to Interactive (TTI) | < 3.5s |
| Chart render time | < 500ms |
| Page transition time | < 300ms |

**Optimization strategies**:
- Route-based code splitting (`React.lazy`)
- Component lazy loading for heavy charts
- Virtualized lists for mention feeds (> 100 items)
- TanStack Query stale-while-revalidate caching
- Optimized images (AVIF/WebP, responsive srcset)

---

*Last updated: 2026-09-06*
