# BrandLens — UI / UX Design

Complete design system and page specifications for BrandLens.

---

## 1. Design System Foundations

### 1.1 Brand Identity

| Attribute | Value |
|-----------|-------|
| Product name | BrandLens |
| Tagline | "See what AI says about your brand" |
| Primary personality | Trustworthy, data-driven, modern, clean |
| Visual mood | Professional SaaS with a marketing-data edge |

### 1.2 Color Palette

#### Primary Colors

| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `--color-primary-50` | `#EEF2FF` | 226 100% 97% | Light backgrounds, hover states |
| `--color-primary-100` | `#E0E7FF` | 226 100% 94% | Subtle backgrounds |
| `--color-primary-200` | `#C7D2FE` | 228 96% 89% | Borders on light surfaces |
| `--color-primary-300` | `#A5B4FC` | 230 94% 82% | Disabled states |
| `--color-primary-400` | `#818CF8` | 234 89% 74% | Accents |
| `--color-primary-500` | `#6366F1` | 239 84% 67% | Default primary |
| `--color-primary-600` | `#4F46E5` | 243 75% 59% | **Brand primary** (CTA, links) |
| `--color-primary-700` | `#4338CA` | 245 58% 51% | Hover on primary buttons |
| `--color-primary-800` | `#3730A3` | 244 54% 41% | Active states |
| `--color-primary-900` | `#312E81` | 242 47% 34% | Dark mode accents |

#### Neutrals (Slate)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-slate-50` | `#F8FAFC` | Page background |
| `--color-slate-100` | `#F1F5F9` | Card background, surfaces |
| `--color-slate-200` | `#E2E8F0` | Borders, dividers |
| `--color-slate-300` | `#CBD5E1` | Disabled borders |
| `--color-slate-400` | `#94A3B8` | Placeholder text |
| `--color-slate-500` | `#64748B` | Secondary text |
| `--color-slate-600` | `#475569` | Body text |
| `--color-slate-700` | `#334155` | Strong text |
| `--color-slate-800` | `#1E293B` | Headings |
| `--color-slate-900` | `#0F172A` | Primary text, dark bg |
| `--color-slate-950` | `#020617` | Dark mode base |

#### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#10B981` | Positive trends, success messages |
| `--color-success-bg` | `#D1FAE5` | Success background tints |
| `--color-warning` | `#F59E0B` | Warnings, attention |
| `--color-warning-bg` | `#FEF3C7` | Warning background tints |
| `--color-danger` | `#EF4444` | Errors, negative trends |
| `--color-danger-bg` | `#FEE2E2` | Error background tints |
| `--color-info` | `#3B82F6` | Informational |
| `--color-info-bg` | `#DBEAFE` | Info background tints |

#### Data Visualization Palette

For charts, graphs, and multi-series visualizations:

| Index | Hex | Name |
|-------|-----|------|
| 1 | `#4F46E5` | Indigo |
| 2 | `#10B981` | Emerald |
| 3 | `#F59E0B` | Amber |
| 4 | `#EF4444` | Red |
| 5 | `#3B82F6` | Blue |
| 6 | `#8B5CF6` | Violet |
| 7 | `#EC4899` | Pink |
| 8 | `#14B8A6` | Teal |

#### Sentiment Scale

| Score Range | Color | Hex |
|-------------|-------|-----|
| 80 – 100 (Very Positive) | Strong Green | `#059669` |
| 60 – 79 (Positive) | Green | `#10B981` |
| 40 – 59 (Neutral) | Gray | `#64748B` |
| 20 – 39 (Negative) | Orange | `#F97316` |
| 0 – 19 (Very Negative) | Red | `#DC2626` |

---

### 1.3 Typography

#### Font Families

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Menlo, monospace;
--font-display: 'Inter', sans-serif; /* Same as sans for now */
```

#### Type Scale

| Token | Size | Line Height | Weight | Letter Spacing | Usage |
|-------|------|-------------|--------|----------------|-------|
| `text-xs` | 12px | 16px | 400 | 0.02em | Labels, captions |
| `text-sm` | 14px | 20px | 400 | 0 | Body small, table cells |
| `text-base` | 16px | 24px | 400 | 0 | Default body |
| `text-lg` | 18px | 28px | 500 | 0 | Subheadings |
| `text-xl` | 20px | 28px | 600 | -0.01em | Card titles |
| `text-2xl` | 24px | 32px | 600 | -0.02em | Page sub-titles |
| `text-3xl` | 30px | 36px | 700 | -0.03em | Page titles |
| `text-4xl` | 36px | 40px | 700 | -0.03em | Hero / large titles |
| `text-5xl` | 48px | 48px | 800 | -0.04em | Hero / display |
| `text-display` | 60px | 60px | 800 | -0.05em | Marketing hero |

#### Semantic Type Usage

| Use Case | Token | Example |
|----------|-------|---------|
| H1 Page Title | `text-3xl` bold | "Agency Dashboard" |
| H2 Section | `text-2xl` semibold | "Visibility Trends" |
| H3 Card Title | `text-xl` semibold | "Top Keywords" |
| Body | `text-base` regular | Default paragraph |
| Data Label | `text-sm` medium | Numeric values |
| Helper Text | `text-xs` regular | "Updated 5 min ago" |
| Numeric Display | `text-3xl` tabular-nums | Visibility score: "78" |

---

### 1.4 Spacing System

Based on a 4px grid (Tailwind default).

| Token | Value | Common Use |
|-------|-------|------------|
| `space-0` | 0px | Reset |
| `space-1` | 4px | Tight padding, icon gaps |
| `space-2` | 8px | Inside small elements |
| `space-3` | 12px | Inside medium elements |
| `space-4` | 16px | Default padding |
| `space-5` | 20px | Card padding |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Large section spacing |
| `space-10` | 40px | Page-level spacing |
| `space-12` | 48px | Major sections |
| `space-16` | 64px | Hero spacing |
| `space-20` | 80px | Extra-large spacing |

---

### 1.5 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Small badges |
| `rounded` | 6px | Inputs, buttons |
| `rounded-md` | 8px | Cards |
| `rounded-lg` | 12px | Larger cards, modals |
| `rounded-xl` | 16px | Feature cards |
| `rounded-2xl` | 24px | Hero elements |
| `rounded-full` | 9999px | Pills, avatars, circles |

---

### 1.6 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Default cards |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` | Hover cards |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Modals, popovers |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | Dropdowns |
| `shadow-2xl` | `0 25px 50px rgba(0,0,0,0.25)` | Dialog overlays |

---

### 1.7 Iconography

- **Icon set**: Lucide React (consistent stroke style, open source)
- **Default size**: 20px (within UI), 24px (navigation), 32px (feature illustrations)
- **Stroke width**: 1.5 – 2 px
- **Style**: Outline by default, filled for selected/active states

---

### 1.8 Animation & Motion

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--motion-fast` | 150ms | ease-out | Micro-interactions |
| `--motion-normal` | 250ms | ease-out | Default transitions |
| `--motion-slow` | 400ms | ease-in-out | Page transitions |
| `--motion-data` | 800ms | ease-in-out | Chart animations |

**Principles**:
- Use `transform` and `opacity` for performance.
- Avoid animating `width`, `height`, `top`, `left`.
- Respect `prefers-reduced-motion` (disable animations).

---

## 2. Page Layouts

### 2.1 Landing Page (`/`)

**Purpose**: Convert visitors into trial sign-ups and showcase the platform.

**Sections** (top to bottom):

#### Hero Section

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Features Pricing Case Studies Docs [Login] [Try Free]│
├─────────────────────────────────────────────────────────────┤
│ │
│ SEE WHAT AI SAYS ABOUT YOUR BRAND │
│ │
│ [Massive headline: "Measure Your Brand's │
│ Visibility Across Every AI Engine"] │
│ │
│ [Subheadline: "Track mentions in ChatGPT, Perplexity, │
│ Gemini, and Copilot. Get real-time insights."] │
│ │
│ [Get Started Free] [Watch Demo] │
│ │
│ ✓ No credit card required ✓ 14-day trial ✓ Cancel anytime │
│ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Dashboard screenshot (annotated) │ │
│ │ ┌─────────┬─────────┬─────────┐ │ │
│ │ │ 78 Score│ ↑ 12% │ 1.2K │ │ │
│ │ └─────────┴─────────┴─────────┘ │ │
│ └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

- **Hero text**: text-5xl display weight
- **CTA buttons**: Primary (Indigo 600) + Ghost (with arrow)
- **Background**: Subtle gradient from slate-50 to indigo-50
- **Trust strip below**: Logos of agencies using BrandLens

#### Features Section

- 3-column grid (desktop), 2-col (tablet), 1-col (mobile)
- Each feature: Icon + title + description + "Learn more" link
- 6 features total: Multi-AI Monitoring, Real-time Alerts, Sentiment Analysis, Competitor Tracking, White-label Reports, Team Collaboration

#### Pricing Section

- 3 cards side by side (Starter, Pro, Agency)
- "Most Popular" badge on Pro
- Annual / Monthly toggle (20% off annual)
- Feature comparison table below cards

#### Case Studies Section

- Carousel of 3 customer stories
- Each: Logo + Quote + Stat + Read more
- CTA: "Read all case studies"

#### Final CTA Section

- Centered, full-width indigo background
- "Ready to see your brand through AI's eyes?"
- Primary CTA button (white on indigo)

#### Footer

- 4-column links: Product, Company, Resources, Legal
- Newsletter signup
- Social icons
- Copyright

---

### 2.2 Agency Dashboard (`/dashboard`)

**Purpose**: At-a-glance view of all brands under the agency.

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] [Search] [Notifications] [Help] [👤 User] │
├──────────────┬──────────────────────────────────────────────┤
│ │ Dashboard / Overview │
│ ▸ Overview │ │
│ Brands 8 │ ┌─────────────────────────────────────────┐ │
│ Reports 24│ │ KPI Cards (4) │ │
│ Team 4 │ │ ┌─────────┬─────────┬─────────┬─────────┐│ │
│ Settings │ │ │Total │Avg Score│Mentions │Alerts ││ │
│ Billing │ │ │ 8 Brands│ 72 ▲4% │ 12.4K ▲│ 3 New ││ │
│ │ │ └─────────┴─────────┴─────────┴─────────┘│ │
│ Help │ └─────────────────────────────────────────┘ │
│ │ │
│ │ ┌────────────────────────────┬──────────────┐ │
│ │ │ Visibility Score Trend │ AI Model │ │
│ │ │ (line chart) │ Breakdown │ │
│ │ │ │ (donut) │ │
│ │ │ [Multi-line: all brands] │ ChatGPT 45% │ │
│ │ │ │ Perplexity 28%│ │
│ │ │ │ Gemini 18% │ │
│ │ │ │ Copilot 9% │ │
│ │ └────────────────────────────┴──────────────┘ │
│ │ │
│ │ ┌──────────────────────────────────────────────┐ │
│ │ │ Top Keywords │ │
│ │ │ [Word cloud / bar chart] │ │
│ │ └──────────────────────────────────────────────┘ │
│ │ │
│ │ ┌──────────────────────────────────────────────┐ │
│ │ │ Recent Mentions │ │
│ │ │ ┌──────────────────────────────────────────┐ │ │
│ │ │ │ ChatGPT | positive | "Acme leading..." │ │ │
│ │ │ │ Perplexity| neutral | "Comparing..." │ │ │
│ │ │ │ Gemini | positive | "Top 10..." │ │ │
│ │ │ └──────────────────────────────────────────┘ │ │
│ │ └──────────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────┘
```

**Components**:
- **Top bar**: Logo, search (cmd+k), notifications, user menu
- **Sidebar**: Collapsible navigation
- **KPI cards**: 4 cards in a row (responsive grid)
- **Charts**: Visibility trend (line), Model breakdown (donut)
- **Recent mentions**: List with sentiment indicators

**Color coding**:
- Green arrows/labels for positive trend
- Red for negative
- Gray for neutral
- Sparklines on each KPI card

---

### 2.3 Brand Detail Page (`/dashboard/brands/:brandId`)

**Purpose**: Deep dive into a single brand's visibility.

```
┌─────────────────────────────────────────────────────────────┐
│ [← Back] Acme Corp [Edit] [Export] [⋮] │
│ Track since: Jan 2026 | Industry: SaaS | Status: ● Active │
├─────────────────────────────────────────────────────────────┤
│ │
│ ┌────────────┬────────────┬────────────┬────────────┐ │
│ │ │ │ │ │ │
│ │ 78 │ ↑ 12% │ 1.2K │ #3 of 12│ │
│ │ Visibility │ vs last mo │ Mentions │ Industry rank│ │
│ │ Score │ │ │ │ │
│ │ └────────────┴────────────┴────────────┴────────────┘ │
│ │
│ ┌────────────────────────────────┬────────────────────────┐ │
│ │ │ │ │
│ │ Visibility Over Time │ Mentions by Source │ │
│ │ │ │ │
│ │ [Line chart, last 90 days] │ Web ████████ 45% │ │
│ │ │ Social ████ 25% │ │
│ │ │ News ███ 18% │ │
│ │ │ Reviews ██ 12% │ │
│ │ └────────────────────────────────┴────────────────────────┘ │
│ │
│ ┌────────────────────────────────┬────────────────────────┐ │
│ │ │ │ │
│ │ AI Engine Performance │ Sentiment Trend │ │
│ │ │ │ │
│ │ ChatGPT ████████ 82 │ [Stacked area chart] │ │
│ │ Perplexity ██████ 75 │ Positive: 65% │ │
│ │ Gemini █████ 68 │ Neutral: 25% │ │
│ │ Copilot ████ 55 │ Negative: 10% │ │
│ │ │ │ │
│ └────────────────────────────────┴────────────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Recent Mentions (with full text + AI source) │ │
│ │ ┌────────────────────────────────────────────────────┐ │ │
│ │ │ ChatGPT | 2h ago | [positive] │ │ │
│ │ │ "Acme Corp is widely recognized as a leader in..." │ │ │
│ │ │ Source: chat.openai.com | View context → │ │ │
│ │ ├────────────────────────────────────────────────────┤ │ │
│ │ │ Perplexity | 5h ago | [neutral] │ │ │
│ │ │ "Comparing top 10 SaaS tools, Acme ranks..." │ │ │
│ │ └────────────────────────────────────────────────────┘ │ │
│ │ [Load more...] │ │
│ └──────────────────────────────────────────────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Competitors (3) │ │
│ │ ┌──────────┬──────────┬──────────┐ │ │
│ │ │ Competitor│ Score │ Δ Trend │ │ │
│ │ ├──────────┼──────────┼──────────┤ │ │
│ │ │ BetaCo │ 81 │ ↑ 5% │ │ │
│ │ │ GammaLLC │ 74 │ ↓ 2% │ │ │
│ │ │ DeltaInc │ 69 │ ↑ 8% │ │ │
│ │ └──────────┴──────────┴──────────┘ │ │
│ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Components**:
- **Header**: Brand name, status badge, action buttons
- **Score cards**: 4 key metrics with trend indicators
- **Visualizations**: Time-series charts, competitor comparisons
- **Mentions feed**: Timeline of all AI mentions
- **Competitor table**: Side-by-side comparison

---

### 2.4 Report Viewer (`/dashboard/reports/:reportId`)

**Purpose**: View generated PDF report in-browser.

```
┌─────────────────────────────────────────────────────────────┐
│ [← Reports] Acme Corp — Q3 Visibility Report [⬇ PDF] [Share]│
│ Generated: Sep 6, 2026 | Period: Jul 1 – Sep 30, 2026 │
├──────────┬──────────────────────────────────────────────────┤
│ │ ┌────────────────────────────────────────┐ │
│ TABLE OF │ │ │
│ CONTENTS │ │ [PDF Page 1: Cover] │
│ │ │ │
│ 1. Summary│ │ ┌──────────┐ │
│ 2. Scores │ │ │ AGENCY │ │
│ 3. Trends │ │ │ LOGO │ │
│ 4. AI Models│ │ └──────────┘ │
│ 5. Mentions│ │ │
│ 6. Sentiment│ │ Acme Corp │
│ 7. Competitors│ Q3 2026 Visibility Report │
│ 8. Recommend.│ │
│ │ Prepared by: Your Agency │
│ │ │
│ [Close] │ │
│ │ [Page 2: Executive Summary] │
│ │ │
│ │ ┌─────────────────────────────────────┐ │
│ │ │ Key Findings │ │
│ │ │ • Visibility grew 12% this quarter │ │
│ │ │ • ChatGPT drives 45% of mentions │ │
│ │ │ • Sentiment improved from 68 to 78 │ │
│ │ └─────────────────────────────────────┘ │
│ │ │
│ │ [Page 3: Charts & Visualizations] │
│ │ │
│ │ ... │
│ │ │
│ └────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────┘
```

**Components**:
- **Sticky TOC** (left): Jump to sections
- **PDF viewer** (right): Rendered pages, scrollable
- **Action bar**: Download PDF, share link, schedule recurring
- **Page controls**: Page counter, zoom, fit-width

**Tech**: PDF.js or react-pdf for in-browser rendering.

---

### 2.5 Settings Page (`/dashboard/settings`)

**Purpose**: Manage agency configuration, team, white-label, integrations.

**Tabbed layout** with sections:

| Tab | Contents |
|-----|----------|
| **Profile** | Agency name, logo, contact info |
| **Team** | Member list, invite form, role management |
| **Integrations** | GSC, Bing, social, CRM OAuth connections |
| **White-label** | Branding, domain, email, PDF settings |
| **API** | API keys, webhooks, rate limits |
| **Notifications** | Email preferences, alert thresholds |

```
┌─────────────────────────────────────────────────────────────┐
│ Settings │
├─────────────────────────────────────────────────────────────┤
│ [Profile] [Team] [Integrations] [White-label] [API] [Notif] │
├─────────────────────────────────────────────────────────────┤
│ │
│ Agency Profile │
│ │
│ ┌──────────┐ │
│ │ LOGO │ Upload │
│ └──────────┘ │
│ │
│ Agency Name [Your Agency Name ] │
│ │
│ Contact Email [agency@example.com ] │
│ │
│ Timezone [America/Los_Angeles ▼] │
│ │
│ Address │
│ [Street address ] │
│ [City ] [State ] [ZIP ] │
│ │
│ [Cancel] [Save Changes] │
│ │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Dark Mode

### 3.1 Color Tokens (Dark Mode)

| Token | Light | Dark |
|-------|-------|------|
| `--bg-page` | `#F8FAFC` (slate-50) | `#020617` (slate-950) |
| `--bg-surface` | `#FFFFFF` | `#0F172A` (slate-900) |
| `--bg-card` | `#FFFFFF` | `#1E293B` (slate-800) |
| `--border-default` | `#E2E8F0` (slate-200) | `#334155` (slate-700) |
| `--text-primary` | `#0F172A` (slate-900) | `#F1F5F9` (slate-100) |
| `--text-secondary` | `#475569` (slate-600) | `#CBD5E1` (slate-300) |
| `--text-tertiary` | `#94A3B8` (slate-400) | `#64748B` (slate-500) |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.1)` | `0 1px 3px rgba(0,0,0,0.4)` |

### 3.2 Implementation Strategy

- **CSS variables** defined on `:root`
- Dark mode applies via `.dark` class on `<html>`
- System preference detection via `prefers-color-scheme`
- User override via Settings → Theme toggle (Light / Dark / System)
- Charts auto-adjust palette for dark backgrounds

### 3.3 Contrast & Accessibility

- All text meets **WCAG AA** (4.5:1 ratio for body, 3:1 for large)
- Primary buttons always maintain 4.5:1 against background
- Focus rings: 2px indigo-500 with 2px offset
- Color is never the sole indicator (use icons + text)

---

## 4. Data Visualization Guidelines

### 4.1 Chart Types

| Use Case | Chart Type | Library |
|----------|-----------|---------|
| Trend over time | **Line chart** | Recharts |
| Comparison | **Bar chart** | Recharts |
| Distribution | **Donut / Pie** | Recharts |
| Part-to-whole over time | **Stacked area** | Recharts |
| Frequency of values | **Histogram** | Recharts |
| Geographic distribution | **Choropleth map** | Mapbox GL |
| Relationship matrix | **Heatmap** | Custom D3 / Nivo |
| Single metric change | **Sparkline** | Recharts |
| Word frequency | **Word cloud** | react-wordcloud |
| Funnel / conversion | **Funnel chart** | Recharts |
| KPIs | **Big number + sparkline** | Custom |

### 4.2 Chart Style Standards

#### Lines (Line Charts)
- Stroke width: 2px (data), 1px (gridlines)
- Smooth curves (Recharts `type="monotone"`)
- Interpolation: linear for sparse data, monotone for dense
- Hover: show tooltip with all series values + date

#### Bars (Bar Charts)
- Width: dynamic based on count (auto-fit)
- Gap: 8px between bars
- Color: primary-600 by default, highlight on hover
- Always include data labels for clarity

#### Donuts
- Inner radius: 60% of outer (gives modern donut feel)
- Center label: total value + sub-label
- Hover: lift out segment 4px

#### Heatmaps
- Color scale: sequential (e.g., light → dark indigo)
- Cell labels: show numeric value, white text on dark cells
- Hover: tooltip with breakdown

### 4.3 Visual Best Practices

**DO**:
- Always include a clear title above each chart
- Use the same color for the same metric across all charts
- Show units in axis labels (%, $, count)
- Include data source and "as of" date
- Animate on mount (use Recharts `animationDuration={800}`)

**DON'T**:
- Use 3D effects or unnecessary gradients
- Use more than 7 categories in one chart (group the rest as "Other")
- Use red/green as the only differentiator (colorblind-friendly)
- Use pie charts for > 5 slices (use bar instead)
- Use dual-axis unless absolutely necessary

### 4.4 Empty States

When there's no data:

```
┌─────────────────────────────────┐
│ │
│ [Illustration icon] │
│ │
│ No mentions yet │
│ │
│ Add some keywords or wait for │
│ the next crawl cycle. │
│ │
│ [Refresh] [Add Keywords] │
│ │
└─────────────────────────────────┘
```

### 4.5 Loading States

- Use **skeleton loaders** for cards and charts
- Spinner only for actions (button clicks, form submits)
- Show progress for long-running operations (e.g., "Generating report... 60%")

### 4.6 Key Dashboard Visualizations

#### Visibility Score (Big Number)

```
┌────────────────────────┐
│ Visibility Score │
│ │
│ 78 │
│ ▲ 12% vs last month │
│ │
│ ▁▂▃▄▅▆▇█▇ (sparkline) │
└────────────────────────┘
```

- Number: `text-5xl` tabular-nums
- Trend arrow: green up / red down
- Sparkline: 30-day trend, 80px tall

#### Heatmap (Sentiment by AI Model × Date)

```
 │ Mon Tue Wed Thu Fri Sat Sun
 ┌────┬────┬────┬────┬────┬────┬────┐
ChatGPT│ 82│ 80│ 78│ 81│ 85│ 84│ 86│ ← darker = higher
Perplexity│ 75│ 73│ 72│ 74│ 76│ 78│ 77│
Gemini│ 68│ 70│ 72│ 71│ 73│ 74│ 75│
Copilot│ 55│ 57│ 58│ 60│ 62│ 61│ 63│
 └────┴────┴────┴────┴────┴────┴────┘
```

- Color scale: red (0) → yellow (50) → green (100)
- Cells: 40px × 40px, 2px gap
- Hover: tooltip with exact value + date

---

## 5. Responsive Breakpoints

| Name | Min Width | Sidebar | Cards |
|------|-----------|---------|-------|
| `sm` | 640px | Hidden | 1 col |
| `md` | 768px | Overlay | 2 col |
| `lg` | 1024px | Fixed | 3 col |
| `xl` | 1280px | Fixed | 4 col |
| `2xl` | 1536px | Fixed | 4 col |

---

## 6. Accessibility (a11y) Checklist

- [x] All images have alt text
- [x] Keyboard navigation works throughout
- [x] Focus indicators visible (2px outline)
- [x] ARIA labels on icon-only buttons
- [x] Color contrast meets WCAG AA
- [x] Form fields have labels and error messages
- [x] Modals trap focus and close on Esc
- [x] Live regions for real-time updates
- [x] Respects `prefers-reduced-motion`
- [x] Skip-to-content link for keyboard users

---

*Last updated: 2026-09-06*
