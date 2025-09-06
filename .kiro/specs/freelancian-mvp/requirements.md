# Requirements Document

## Introduction

Freelancian MVP v0.1 is a proof-of-concept financial tracking application designed specifically for Thai freelancers. The application focuses on delivering exceptional manual entry UX/UI while maintaining architectural foundations for future growth. This MVP prioritizes validating the core value proposition through beautiful, simple workflows rather than feature completeness.

The system will be a single-user application (no authentication) that enables freelancers to track income and expenses with Thai-specific financial calculations (VAT 7%, WHT 3%), import existing data from Notion CSV files, and view basic financial reports and insights.

## Requirements

### Requirement 1

**User Story:** As a freelancer, I want to manually create income and expense entries through a beautiful split-screen form with live preview, so that I can quickly and accurately track my financial transactions.

#### Acceptance Criteria

1. WHEN I access the manual entry form THEN the system SHALL display a split-screen layout with form on the left and live preview on the right
2. WHEN I select entry type (Income/Expense) THEN the system SHALL update the form fields and preview card with smooth animation
3. WHEN I enter data in any form field THEN the system SHALL update the live preview in real-time
4. WHEN I enter gross amount THEN the system SHALL provide auto-calculation options for VAT (7%) and WHT (3%) with toggle controls
5. WHEN I submit a valid entry THEN the system SHALL save the entry with computed totals and show success animation
6. WHEN I submit invalid data THEN the system SHALL display helpful inline validation messages
7. WHEN using mobile devices THEN the system SHALL stack the form and preview vertically for optimal mobile experience

### Requirement 2

**User Story:** As a freelancer, I want to view a comprehensive dashboard with key metrics and recent entries, so that I can quickly understand my current financial status.

#### Acceptance Criteria

1. WHEN I access the dashboard THEN the system SHALL display current month metrics (Total Income, Total Expenses, Net Amount) with animated counters
2. WHEN the dashboard loads THEN the system SHALL show the last 10 recent entries as beautiful cards with hover effects
3. WHEN I hover over entry cards THEN the system SHALL display quick action buttons (edit, delete) with smooth animations
4. WHEN I click "Add Entry" THEN the system SHALL navigate to the manual entry form with transition animation
5. WHEN I click "View Reports" THEN the system SHALL navigate to the reports page
6. WHEN viewing on mobile THEN the system SHALL stack metric cards vertically and maintain touch-friendly interactions

### Requirement 3

**User Story:** As a freelancer, I want to view basic financial reports with charts and trends, so that I can analyze my income and expense patterns over time.

#### Acceptance Criteria

1. WHEN I access the reports page THEN the system SHALL display a monthly income vs expenses chart with smooth animations
2. WHEN I select different time periods THEN the system SHALL update the chart data with transition animations
3. WHEN I hover over chart data points THEN the system SHALL show detailed tooltips with exact amounts
4. WHEN viewing monthly summary THEN the system SHALL display total income, expenses, net profit, and entry count with trend indicators
5. WHEN comparing periods THEN the system SHALL show percentage changes with color-coded arrows (green for positive, red for negative)

### Requirement 4

**User Story:** As a freelancer migrating from Notion, I want to import my existing income and expense data from CSV files, so that I can continue tracking without losing historical data.

#### Acceptance Criteria

1. WHEN I access the import page THEN the system SHALL provide separate upload options for income and expense CSV files
2. WHEN I upload a CSV file THEN the system SHALL preview the data and suggest field mappings based on column headers
3. WHEN I confirm the import THEN the system SHALL process the CSV data and create entries with proper validation
4. WHEN import is complete THEN the system SHALL display a summary showing imported count, skipped count, and any errors
5. WHEN there are import errors THEN the system SHALL provide clear error messages and allow me to fix and retry

### Requirement 5

**User Story:** As a Thai freelancer, I want the system to handle Thai Baht currency with proper VAT and withholding tax calculations, so that my financial records comply with local tax requirements.

#### Acceptance Criteria

1. WHEN I enter financial amounts THEN the system SHALL display and store values in Thai Baht (฿) with proper formatting
2. WHEN calculating income totals THEN the system SHALL compute: price_gross + vat - withholding - commission
3. WHEN calculating expense totals THEN the system SHALL compute: price_gross + vat - withholding
4. WHEN I enable auto-calculation THEN the system SHALL automatically calculate VAT at 7% and WHT at 3% of gross amount
5. WHEN withholding exceeds 3% of gross amount THEN the system SHALL display a warning message
6. WHEN I save entries THEN the system SHALL validate that all amounts are non-negative and dates are not in the future

### Requirement 6

**User Story:** As a freelancer, I want to manage my entries through a comprehensive list view with filtering and search capabilities, so that I can easily find and modify specific transactions.

#### Acceptance Criteria

1. WHEN I access the entries list THEN the system SHALL display all entries with pagination (50 entries per page)
2. WHEN I use the search function THEN the system SHALL filter entries in real-time based on title, client, or vendor name
3. WHEN I apply filters THEN the system SHALL filter by entry type (income/expense), month, and client/vendor
4. WHEN I click edit on an entry THEN the system SHALL open a slide-out edit panel instead of navigating to a new page
5. WHEN I delete an entry THEN the system SHALL show a confirmation dialog before permanent deletion
6. WHEN viewing on mobile THEN the system SHALL maintain touch-friendly interactions and readable card layouts

### Requirement 7

**User Story:** As a user, I want the application to be fast, responsive, and accessible, so that I can use it efficiently across all devices and accessibility needs.

#### Acceptance Criteria

1. WHEN pages load THEN the system SHALL achieve page load times under 2 seconds
2. WHEN animations play THEN the system SHALL maintain 60fps performance
3. WHEN using keyboard navigation THEN the system SHALL provide clear focus indicators and full keyboard support
4. WHEN using screen readers THEN the system SHALL provide proper ARIA labels and semantic HTML structure
5. WHEN user has reduced motion preferences THEN the system SHALL respect the setting and minimize animations
6. WHEN viewing on mobile devices THEN the system SHALL provide responsive design with touch-friendly interactions
7. WHEN color contrast is measured THEN the system SHALL meet WCAG AA compliance standards (4.5:1 minimum ratio)

### Requirement 8

**User Story:** As a freelancer, I want the application to be deployed and accessible online, so that I can use it from anywhere without local installation.

#### Acceptance Criteria

1. WHEN the application is deployed THEN it SHALL be accessible via a public URL on Vercel
2. WHEN using the production application THEN it SHALL use PostgreSQL database for data persistence
3. WHEN errors occur THEN the system SHALL provide user-friendly error messages and graceful error handling
4. WHEN the application starts THEN it SHALL initialize with proper database schema and sample data if needed
5. WHEN multiple users access simultaneously THEN the system SHALL handle concurrent requests properly (future-ready for multi-user)