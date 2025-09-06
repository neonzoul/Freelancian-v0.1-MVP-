# Freelancian MVP v0.1 - Requirements Document

## 1) Scope & Goals

**Goal**: In 1 week, ship a **proof-of-concept MVP** that demonstrates core freelance finance tracking capabilities with excellent UX/UI.

**Target Users**: Thai freelancers who need simple income/expense tracking

**Core MVP Features**:

-   **Manual Entry** - Simple form to add income/expense entries
    -   Left: form; Right: live preview card
    -   Type toggle: **Income | Expense**
-   **Dashboard** - View recent entries and basic insights
-   **Basic Reports** - Monthly income vs expense overview
-   **Data Import** - One-time import from existing Notion CSV data

**Out of scope (v0.1)**:

-   Authentication/user accounts (single user for now)
-   Payment integration
-   AI upload/parsing features
-   Multi-user support
-   Advanced reporting
-   File uploads
-   Drive integration

**Focus Areas**:

-   **UX/UI Excellence** - Canva-simple, Apple-like motion and feel
-   **Manual Workflow** - Streamlined data entry experience
-   **Architecture Foundation** - Scalable structure for future features
-   **Proof of Concept** - Validate core value proposition

---

## 2) Stack & Hosting (Simplified)

-   **Frontend**: Next.js (React + TypeScript), App Router, deployed on **Vercel**
-   **Backend**: Next.js API routes for CRUD operations
-   **DB**: SQLite for development, Postgres for production (Neon/Supabase)
-   **Styling**: Tailwind CSS + Framer Motion for animations
-   **Auth**: None for MVP (single user mode)

---

## 3) Core User Stories (MVP)

1. **Manual Entry**: As a user, I can create Income/Expense entries via a beautiful form and see live preview
2. **Dashboard**: I can see recent entries and a mini chart (Income vs Expense, this month)
3. **Basic Reporting**: I can view monthly/quarterly totals with simple visualizations
4. **Data Import**: I can import my existing Notion data to populate the system
5. **Thai Context**: Fields support VAT 7% and Withholding 3% calculations

---

## 4) Screens & UX (Canva-simple, Apple-feel)

-   **Dashboard**

    -   Hero section with key metrics (Total Income, Total Expenses, Net for current month)
    -   Primary button: **Add Entry**
    -   Recent entries list (beautiful cards)
    -   Mini chart (Income vs Expense trend)

-   **Manual Entry**

    -   Split view: Left form, Right live preview card
    -   Type toggle: **Income | Expense** (smooth animation)
    -   Smart field validation with helpful hints
    -   Auto-calculation of totals with VAT/WHT

-   **Reports (Basic)**
    -   Month/Quarter selector with smooth transitions
    -   Clean charts showing Income vs Expense
    -   Simple totals and basic insights

**Micro-animations**:

-   Hover lift on cards and buttons
-   Soft fade/scale on modals
-   Smooth number counting animations
-   Loading states with pulsing dots

---

## 5) Simplified Data Model

### Core Entities (Single User)

**entries** _(combined income & expense table)_

-   `id (uuid, pk)`
-   `kind (enum: income|expense)`
-   `title (text)` — Description/invoice title
-   `doc_date (date)` — Date from document/invoice
-   `transfer_date (date)` — When money was transferred
-   `client_name (text)` — For income entries
-   `vendor_name (text)` — For expense entries
-   `product_service (text)` — What was sold/bought
-   `account_name (text)` — Bank/payment account

**Financial amounts (THB)**

-   `price_gross_thb (decimal)`
-   `vat_thb (decimal)` — VAT 7%
-   `withholding_thb (decimal)` — WHT 3%
-   `commission_thb (decimal)` — Sales fees
-   `total_net_thb (decimal)` — Computed total

**Metadata**

-   `project (text)` — Project reference
-   `remark (text)` — Additional notes
-   `invoice_no (text)` — Invoice reference
-   `created_at (timestamp)`
-   `updated_at (timestamp)`

---

## 6) API Design (Simplified)

**Core Endpoints**:

-   `GET /api/entries` — List entries with filtering

    -   Query: `?kind=income|expense&month=YYYY-MM&limit=50`
    -   Response: `{ items: Entry[], total: number }`

-   `POST /api/entries` — Create new entry

    -   Body: Entry data (server computes totals)
    -   Response: `{ id: string }`

-   `GET /api/entries/{id}` — Get single entry
-   `PUT /api/entries/{id}` — Update entry
-   `DELETE /api/entries/{id}` — Delete entry

-   `GET /api/reports/summary` — Dashboard metrics

    -   Query: `?month=YYYY-MM`
    -   Response: `{ totalIncome, totalExpenses, netAmount, entryCount }`

-   `POST /api/import/notion` — Import from Notion CSV
    -   Body: CSV data
    -   Response: `{ imported: number, errors: [] }`

---

## 7) Calculations & Validation

**Income total (THB)**: `price_gross + vat - withholding - commission`
**Expense total (THB)**: `price_gross + vat - withholding`

**Validation Rules**:

-   All amounts must be non-negative
-   Withholding cannot exceed 3% of gross amount (warning)
-   VAT is typically 7% (auto-calculate option)
-   Dates cannot be in the future (warning)
-   Required fields: title, amount, date

---

## 8) Data Import from Notion

### Income CSV Mapping

-   `title` ← **List**
-   `transfer_date` ← **Transfer Date**
-   `doc_date` ← **Invoice Date** (fallback: Transfer Date)
-   `client_name` ← **Customers**
-   `product_service` ← **Product/Service**
-   `account_name` ← **Transfer Account**
-   `price_gross_thb` ← **Price ฿**
-   `vat_thb` ← **VAT 7% ฿**
-   `withholding_thb` ← **Withholding 3% ฿**
-   `commission_thb` ← **Sale Cost/Commission**
-   `invoice_no` ← **Invoice No.**

### Expense CSV Mapping

-   `title` ← **List**
-   `transfer_date` ← **Transfer Date**
-   `doc_date` ← **Invoice Date** (fallback: Transfer Date)
-   `vendor_name` ← **Vendor**
-   `account_name` ← **Transfer Account**
-   `price_gross_thb` ← **Expenses ฿**
-   `vat_thb` ← **VAT 7%**
-   `withholding_thb` ← **Withholding 3%**
-   `project` ← **Project**
-   `remark` ← **Remark**

---

## 9) Folder Structure (Clean & Simple)

```
/app
  /dashboard/page.tsx            # Main dashboard
  /entries/new/page.tsx          # Manual entry form
  /entries/[id]/edit/page.tsx    # Edit entry
  /reports/page.tsx              # Basic reports
  /import/page.tsx               # Data import
  /api/entries/route.ts          # CRUD operations
  /api/reports/route.ts          # Analytics
  /api/import/route.ts           # CSV import

/components
  /layouts/MainLayout.tsx
  /features/entries/
    EntryForm.tsx               # Manual entry form
    EntryCard.tsx              # Display entry
    EntryList.tsx              # List entries
  /features/dashboard/
    MetricsCard.tsx            # Summary metrics
    RecentEntries.tsx          # Recent entries list
    MiniChart.tsx              # Small chart
  /features/reports/
    MonthlyChart.tsx           # Monthly view
    SummaryStats.tsx           # Statistics
  /ui/                         # Reusable components
    Button.tsx
    Input.tsx
    Card.tsx
    Chart.tsx

/lib
  db.ts                        # Database client
  calculations.ts              # Total calculations
  validation.ts                # Input validation
  csvImport.ts                 # Import utilities

/types
  Entry.ts
  Report.ts
```

---

## 10) Acceptance Criteria (MVP Definition of Done)

-   [ ] **Manual Entry**: Beautiful form with live preview saves income/expense with correct totals
-   [ ] **Dashboard**: Shows last 30 entries + monthly chart + key metrics
-   [ ] **Calculations**: VAT/WHT calculations work correctly for Thai context
-   [ ] **UX/UI**: Smooth animations, responsive design, Apple-like feel
-   [ ] **Data Import**: Can import existing Notion CSV data without errors
-   [ ] **Basic Reports**: Monthly/quarterly views with simple charts
-   [ ] **Performance**: Fast loading, smooth animations, good Core Web Vitals
-   [ ] **Production Ready**: Deployed on Vercel with proper error handling
-   [ ] **Mobile Friendly**: Responsive design works on mobile devices
-   [ ] **Data Integrity**: All calculations are accurate and validated

---

## 11) Future Architecture Considerations

While this MVP excludes authentication, payments, and AI features, the architecture is designed to easily accommodate:

**v0.2 Features**:

-   User authentication (NextAuth.js)
-   Multi-user support with user scoping
-   Basic file upload (without AI parsing)

**v1.0 Features**:

-   Payment integration (Stripe)
-   AI document parsing (Python service)
-   Advanced reporting and analytics
-   Drive integration

**Technical Debt to Address**:

-   Add proper user model and scoping
-   Implement proper validation middleware
-   Add comprehensive error handling
-   Set up monitoring and logging

This MVP focuses on proving the core value proposition with excellent UX while maintaining a solid foundation for future features.
