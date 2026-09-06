# BrandLens — App Flow

Complete user flow diagrams and step-by-step flows for every major journey in BrandLens.

---

## 1. Agency Onboarding Flow

### Diagram

```mermaid
flowchart TD
 A["User lands on brandlens.ai"] --> B{"Has account?"}
 B -->|No| C["Click 'Start Free Trial'"]
 B -->|Yes| Z["Redirect to Dashboard"]

 C --> D["Sign Up\n(Email + Password or SSO)"]
 D --> E["Email Verification\n(send magic link)"]
 E --> F{"Verified?"}
 F -->|No| G["Resend verification email"]
 G --> E
 F -->|Yes| H["Organization Setup\n- Agency name\n- Industry\n- Team size\n- Country/Timezone"]

 H --> I["Role Selection\n- Agency Owner\n- Account Manager\n- Analyst\n- Viewer"]

 I --> J["Invite Team Members\n(optional at this stage)"]
 J --> K["Connect Integrations\n- Google Search Console\n- Bing Webmaster\n- Social accounts\n- CRM (optional)"]

 K --> L["Onboarding Complete"]
 L --> M["Redirect to Agency Dashboard"]

 style A fill:#4F46E5,color:#fff
 style L fill:#059669,color:#fff
 style Z fill:#059669,color:#fff
```

### Step-by-Step

| Step | Screen | Key Actions | Validation |
|------|--------|-------------|------------|
| 1 | Landing → Sign Up | Email, password, agree to TOS | Email format, password strength (min 8 chars) |
| 2 | Email Verification | Click magic link in inbox | Token expiry 24h |
| 3 | Organization Setup | Agency name, industry, size, timezone | Required fields, unique org name |
| 4 | Role Selection | Choose role from dropdown | None |
| 5 | Team Invites | Enter emails, assign roles | Valid email format, max 10 per batch |
| 6 | Integrations | OAuth connect to GSC, Bing, social | OAuth callback, token storage |
| 7 | Dashboard Redirect | Auto-redirect after 2s delay | None |

---

## 2. Brand Setup Flow

### Diagram

```mermaid
flowchart TD
 A["Dashboard → 'Add Brand' button"] --> B["Brand Name Input\n(display name)"]
 B --> C["Website Domain\n(e.g., acme.com)"]
 C --> D["Brand Keywords\n(comma-separated)"]
 D --> E["Industry Vertical\n(dropdown)"]
 E --> F["Competitor Domains\n(optional)"]
 F --> G["AI Models to Monitor\n(SearchGPT, Perplexity, Gemini, Copilot)"]
 G --> H["Tracking Frequency\n(daily / weekly / monthly)"]
 H --> I["Data Sources\n- Web\n- Social\n- News\n- Reviews"]
 I --> J["Notification Settings\n- Email digest\n- Alert threshold\n- Recipients"]
 J --> K["Review & Confirm"]
 K --> L["System: Crawl & Index brand mentions"]
 L --> M["Initial Visibility Score\nCalculated"]
 M --> N["Brand Dashboard\nReady"]

 style A fill:#4F46E5,color:#fff
 style N fill:#059669,color:#fff
```

### Step-by-Step

| Step | Screen | Key Actions | Validation |
|------|--------|-------------|------------|
| 1 | Add Brand Modal | Brand name (required) | Min 2 chars |
| 2 | Domain | Website URL | Valid URL format |
| 3 | Keywords | Comma-separated keywords | Min 3 keywords, max 50 |
| 4 | Industry | Select from predefined list | Required |
| 5 | Competitors | Optional competitor URLs | Valid URL format if entered |
| 6 | AI Models | Toggle models on/off | At least 1 required |
| 7 | Frequency | Daily / Weekly / Monthly | Required |
| 8 | Data Sources | Checkboxes for source types | At least 1 required |
| 9 | Notifications | Configure alerts | Optional |
| 10 | Review | Summary of all inputs | Edit any section |
| 11 | Processing | Loading spinner, progress bar | None (system processing) |
| 12 | Brand Dashboard | Navigate to brand detail | None |

---

## 3. Dashboard Navigation Flow

### Diagram

```mermaid
flowchart TD
 A["Agency Dashboard"] --> B["Sidebar Navigation"]
 B --> C["Overview\n(Agency-level metrics)"]
 B --> D["Brands\n(List of all brands)"]
 B --> E["Competitors\n(Cross-brand comparison)"]
 B --> F["Reports\n(Generated & scheduled)"]
 B --> G["Team\n(Member management)"]
 B --> H["Settings\n(Agency config)"]
 B --> I["Billing\n(Subscription & invoices)"]

 C --> C1["Visibility Score Trend"]
 C --> C2["Mention Volume"]
 C --> C3["Top Keywords"]
 C --> C4["AI Model Breakdown"]
 C --> C5["Recent Alerts"]

 D --> D1["Brand List View"]
 D --> D2["Add New Brand"]
 D1 --> D3["Brand Detail Page"]

 E --> E1["Competitor Matrix"]
 E --> E2["Gap Analysis"]
 E --> E3["Market Share"]

 F --> F1["Report Library"]
 F --> F2["Generate New Report"]
 F1 --> F3["Report Viewer"]

 style A fill:#4F46E5,color:#fff
 style D3 fill:#059669,color:#fff
 style F3 fill:#059669,color:#fff
```

### Navigation Structure

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] BrandLens [Search] [Notifications] [👤] │
├──────────┬──────────────────────────────────────────────┤
│ │ MAIN CONTENT AREA │
│ SIDEBAR │ │
│ │ │
│ Overview│ │
│ Brands │ │
│Competitors│ │
│ Reports │ │
│ Team │ │
│ Settings │ │
│ Billing │ │
│ │ │
│ Help │ │
│ │ │
├──────────┴──────────────────────────────────────────────┤
│ [Status bar: last updated | data sources | next crawl] │
└─────────────────────────────────────────────────────────┘
```

### Responsive Behavior

| Breakpoint | Sidebar | Content | Actions |
|-----------|---------|---------|---------|
| Desktop (>= 1024px) | Fixed left, 260px | Full width remaining | Full navigation visible |
| Tablet (768px – 1023px) | Collapsible overlay | Full width | Hamburger toggle |
| Mobile (< 768px) | Bottom tab bar | Full width | Bottom nav, simplified cards |

---

## 4. Report Generation Flow

### Diagram

```mermaid
flowchart TD
 A["Reports Page → 'Generate Report'"] --> B["Report Type Selection"]
 B --> B1["Visibility Report"]
 B --> B2["Competitor Analysis"]
 B --> B3["Mention Sentiment"]
 B --> B4["Custom / White-label"]

 B1 --> C["Configure Report"]
 B2 --> C
 B3 --> C
 B4 --> C

 C --> C1["Select Brand(s)"]
 C --> C2["Date Range"]
 C --> C3["Include Sections\n- Overview\n- Visibility Scores\n- Mentions\n- Competitors\n- Recommendations"]
 C --> C4["Comparison Brands\n(optional)"]
 C --> C5["White-label Settings\n(agency plan only)"]

 C1 --> D["Preview Report"]
 C2 --> D
 C3 --> D
 C4 --> D
 C5 --> D

 D --> E{"Satisfied?"}
 E -->|No| F["Edit Configuration"]
 F --> C
 E -->|Yes| G["Generate Report"]

 G --> H["System: Compile data\nGenerate charts\nRender PDF"]
 H --> I["Report Ready Notification"]
 I --> J["Actions"]
 J --> J1["View in Browser"]
 J --> J2["Download PDF"]
 J --> J3["Share via Link"]
 J --> J4["Schedule Recurring"]

 style A fill:#4F46E5,color:#fff
 style I fill:#F59E0B,color:#fff
 style J fill:#059669,color:#fff
```

### Report Configuration Options

| Option | Values | Default | Notes |
|--------|--------|---------|-------|
| Date Range | 7d, 30d, 90d, 1y, Custom | 30d | Custom via date picker |
| Brand Selection | Single / Multiple / All | All active | Multi-select dropdown |
| Comparison Brands | None / Selected | None | Adds competitor section |
| Sections | Toggle each section | All on | Can reorder via drag |
| Format | PDF / HTML / CSV data | PDF | PDF for sharing, HTML for embed |
| White-label | On / Off | Off | Agency/Enterprise only |
| Recurrence | None / Weekly / Monthly | None | Sends to configured recipients |

---

## 5. White-Label Configuration Flow

### Diagram

```mermaid
flowchart TD
 A["Settings → White-label"] --> B{"Plan supports\nwhite-label?"}
 B -->|No| C["Upgrade Prompt\n(Show Agency plan)"]
 B -->|Yes| D["White-label Dashboard"]

 D --> E["Branding Tab"]
 D --> F["Domain Tab"]
 D --> G["Email Tab"]
 D --> H["Report Tab"]
 D --> I["Client Access Tab"]

 E --> E1["Logo Upload\n(primary + favicon)"]
 E --> E2["Brand Name\n(display name)"]
 E --> E3["Primary Color\n(color picker)"]
 E --> E4["Accent Color\n(color picker)"]
 E --> E5["Font Family\n(dropdown)"]

 F --> F1["Custom Domain\n(e.g., reports.youragency.com)"]
 F --> F2["DNS Configuration\n(CNAME instructions)"]
 F --> F3["SSL Certificate\n(auto-provisioned)"]
 F --> F4["Domain Verification\n(DNS TXT record)"]

 G --> G1["From Name\n(e.g., 'Your Agency Reports')"]
 G --> G2["From Email\n(e.g., reports@yourdomain.com)"]
 G --> G3["Email Template\n- Header\n- Footer\n- Disclaimer"]

 H --> H1["PDF Header\n(logo + agency name)"]
 H --> H2["PDF Footer\n(copyright + contact)"]
 H --> H3["Cover Page\n(customizable sections)"]
 H --> H4["Watermark\n(optional)"]

 I --> I1["Client Login URL\n(custom subdomain)"]
 I --> I2["SSO Configuration\n(SAML / OIDC)"]
 I --> I3["Access Control\n(per-brand permissions)"]

 E1 --> J["Preview"]
 E2 --> J
 E3 --> J
 E4 --> J
 E5 --> J
 F1 --> J
 G1 --> J
 H1 --> J

 J --> K{"Looks good?"}
 K -->|No| L["Adjust settings"]
 L --> E
 K -->|Yes| M["Save & Publish"]
 M --> N["Changes applied\n(propagation ~5 min)"]

 style B fill:#F59E0B,color:#fff
 style M fill:#059669,color:#fff
 style N fill:#059669,color:#fff
```

### White-label Feature Matrix

| Feature | Starter | Pro | Agency | Enterprise |
|---------|---------|-----|--------|------------|
| Custom Logo | — | — | ✓ | ✓ |
| Custom Colors | — | — | ✓ | ✓ |
| Custom Domain | — | — | ✓ | ✓ |
| Custom Email From | — | — | ✓ | ✓ |
| PDF White-labeling | — | — | ✓ | ✓ |
| Client SSO | — | — | — | ✓ |
| Remove BrandLens branding | — | — | — | ✓ |
| Dedicated Infrastructure | — | — | — | ✓ |

---

## 6. Billing / Subscription Flow

### Diagram

```mermaid
flowchart TD
 A["Settings → Billing"] --> B["Current Plan Overview"]
 B --> C["Usage This Period\n- Brands: 3 / 10\n- Reports: 12 / 50\n- Team seats: 4 / 5"]

 C --> D{"Need to change plan?"}
 D -->|No| E["View Invoices"]
 D -->|Yes| F["Plan Selection"]

 F --> F1["Starter - $49/mo"]
 F --> F2["Pro - $149/mo"]
 F --> F3["Agency - $399/mo"]
 F --> F4["Enterprise - Custom"]

 F1 --> G["Review Changes"]
 F2 --> G
 F3 --> G
 F4 --> G

 G --> G1["Proration Summary"]
 G --> G2["New Monthly Total"]
 G --> G3["Effective Date"]

 G1 --> H{"Confirm?"}
 G2 --> H
 G3 --> H

 H -->|No| F
 H -->|Yes| I{"Upgrade or Downgrade?"}

 I -->|Upgrade| J["Immediate Access\nProrated credit applied"]
 I -->|Downgrade| K["Changes at period end\nCurrent plan active until then"]

 J --> L["Payment Processed"]
 K --> L
 L --> M["Confirmation Email"]
 M --> N["Updated Dashboard"]

 E --> E1["Invoice List\n(CSV export)"]
 E --> E2["Payment Methods"]
 E --> E3["Billing Address"]

 style A fill:#4F46E5,color:#fff
 style J fill:#059669,color:#fff
 style K fill:#F59E0B,color:#fff
 style N fill:#059669,color:#fff
```

### Subscription States

| State | Description | User Can |
|-------|-------------|----------|
| **Active** | Plan is current, payment succeeded | Full access |
| **Past Due** | Payment failed, grace period (3 days) | Full access, retry prompt |
| **Canceled** | Scheduled for end of period | Read-only access to data |
| **Expired** | Period ended, no renewal | View-only, cannot generate reports |
| **Trialing** | Free trial in progress | Full access, upgrade prompts |

### Billing Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Billing & Subscription │
├─────────────────────────────────────────────────────────┤
│ │
│ Current Plan: Pro [$149/mo] [Change Plan] │
│ Status: Active | Renews: Oct 6, 2026 │
│ │
│ Usage This Period │
│ ┌──────────┬──────────┬──────────┬──────────┐ │
│ │ Brands │ Reports │ Team │ API Calls│ │
│ │ 6 / 25 │ 18 / 100 │ 3 / 10 │ 4.2K/10K │ │
│ │ [====---]│ [===-----]│ [==------]│ [==-----]│ │
│ └──────────┴──────────┴──────────┴──────────┘ │
│ │
│ Payment Method │
│ Visa ending in 4242 [Update] │
│ Billing: Acme Corp, 123 Main St, SF, CA │
│ │
│ Invoices │
│ ┌────┬──────────┬────────┬────────┐ │
│ │ # │ Date │ Amount │ Status │ │
│ ├────┼──────────┼────────┼────────┤ │
│ │1234│ Sep 6 │ $149 │ Paid │ │
│ │1233│ Aug 6 │ $149 │ Paid │ │
│ │1232│ Jul 6 │ $149 │ Paid │ │
│ └────┴──────────┴────────┴────────┘ │
│ │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Authentication & Authorization Flow

### Diagram

```mermaid
flowchart TD
 A["User visits any page"] --> B{"Auth token present?"}
 B -->|No| C["Redirect to /login"]
 B -->|Yes| D{"Token valid?"}
 D -->|No| E["Redirect to /login\n(show expired session)"]
 D -->|Yes| F{"Route protected?"}
 F -->|No| G["Render page"]
 F -->|Yes| H{"User has required\npermission?"}
 H -->|No| I["403 Forbidden\n(Access denied page)"]
 H -->|Yes| G

 C --> J["Login Page"]
 J --> J1["Email + Password"]
 J --> J2["SSO (Google / Microsoft)"]
 J1 --> K["POST /auth/login"]
 J2 --> K
 K --> L{"MFA enabled?"}
 L -->|Yes| M["MFA Challenge"]
 L -->|No| N["Issue JWT tokens\n(access + refresh)"]
 M --> M1["Enter code\nor approve push"]
 M1 --> N
 N --> O["Redirect to intended page\n(or Dashboard)"]

 style C fill:#F59E0B,color:#fff
 style I fill:#EF4444,color:#fff
 style O fill:#059669,color:#fff
```

### Permission Matrix

| Role | Brands (CRUD) | Reports (CRUD) | Team (Manage) | Billing | White-label | Settings |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| Owner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Account Manager | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| Analyst | ✓ (read) | ✓ | — | — | — | — |
| Viewer | Read only | Read only | — | — | — | — |

---

## 8. Real-Time Data Flow

### Diagram

```mermaid
flowchart LR
 A["Crawl Scheduler\n(cron / queue)"] --> B["Data Collector\n(web, social, news)"]
 B --> C["AI Engine\n(sentiment, relevance)"]
 C --> D["Indexer\n(search-ready)"]
 D --> E["API Server"]

 E --> F["WebSocket Server\n(live updates)"]
 E --> G["REST API\n(polling fallback)"]

 F --> H["Client Dashboard\n(real-time updates)"]
 G --> H

 H --> I["React Query\n(cache + refetch)"]
 I --> J["Zustand Store\n(client state)"]
 J --> K["UI Render"]

 style A fill:#4F46E5,color:#fff
 style K fill:#059669,color:#fff
```

### Update Triggers

| Trigger | Action | UI Response |
|---------|--------|-------------|
| New mention crawled | Push via WebSocket | Toast notification + badge update |
| Visibility score change | Push via WebSocket | Score animation + trend arrow |
| Scheduled report ready | Email + in-app notification | Bell icon badge + modal |
| Team member action | Polling (30s) | Presence indicator |
| Billing event | Email + in-app | Banner notification |

---

## 9. Error & Edge-Case Flows

### Payment Failure

```mermaid
flowchart TD
 A["Payment fails"] --> B["Mark subscription Past Due"]
 B --> C["Email: Payment failed\n(support link)"]
 C --> D["In-app banner: Payment issue"]
 D --> E["3-day grace period\n(access continues)"]
 E --> F{"Payment resolved?"}
 F -->|Yes| G["Restore Active status"]
 F -->|No| H["Downgrade to Free tier"]
 H --> I["Notify user of limitations"]
```

### Report Generation Failure

```mermaid
flowchart TD
 A["Report generation fails"] --> B["Log error + notify user"]
 B --> C["Email: Report generation failed"]
 C --> D["In-app: Error banner on Reports page"]
 D --> E["Auto-retry (3 attempts, 5min apart)"]
 E --> F{"Retry succeeds?"}
 F -->|Yes| G["Notify: Report ready"]
 F -->|No| H["Support ticket created\n(manual intervention)"]
```

---

## 10. Mobile App Flow (Future)

### Diagram

```mermaid
flowchart TD
 A["Mobile App Launch"] --> B{"Authenticated?"}
 B -->|No| C["Login Screen"]
 B -->|Yes| D["Dashboard Home"]

 D --> E["Bottom Tab Bar"]
 E --> E1["Home\n(Score overview)"]
 E --> E2["Brands\n(Quick list)"]
 E --> E3["Reports\n(Recent + download)"]
 E --> E4["Alerts\n(Notifications)"]
 E --> E5["Profile\n(Settings)"]

 E1 --> F["Pull to refresh\nlatest scores"]
 E2 --> G["Swipe to brand detail"]
 E3 --> H["Tap to download PDF"]
 E4 --> I["Push notifications\nfor new alerts"]
 E5 --> J["Account settings\n+ logout"]

 style A fill:#4F46E5,color:#fff
 style D fill:#059669,color:#fff
```

---

*Last updated: 2026-09-06*
