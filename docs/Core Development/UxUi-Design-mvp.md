# UX/UI Design - MVP v0.1

## Overview

**Freelancian** - A beautifully simple financial assistant for freelancers. This document outlines the UX/UI design for the MVP focusing on manual entry excellence with Canva-like simplicity and Apple-inspired motion design.

---

## 🎨 Design Philosophy

### Core Principles

**Canva-inspired Simplicity**:

-   Clean, minimal interface with plenty of white space
-   One primary action per screen
-   Clear visual hierarchy with typography and spacing
-   Friendly, approachable design language

**Apple-like Motion & Feel**:

-   Smooth, purposeful animations
-   Tactile interactions with hover states
-   Micro-interactions that provide feedback
-   Fluid transitions between states

**Freelancer-focused**:

-   Professional but not intimidating
-   Quick data entry workflows
-   Clear financial insights at a glance
-   Mobile-friendly for on-the-go updates

---

## 🏠 Page Layouts & Flows

### 1. Dashboard (Landing Page)

**Hero Section**:

```
┌─────────────────────────────────────────────────────┐
│  Welcome back! 👋                                    │
│                                                     │
│  📊 This Month (September 2025)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │ 💰 Income   │ │ 💸 Expenses │ │ 📈 Net      │    │
│  │ ฿45,000     │ │ ฿12,000     │ │ ฿33,000     │    │
│  └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                     │
│  [➕ Add Entry]           [📊 View Reports]         │
└─────────────────────────────────────────────────────┘
```

**Recent Entries Section**:

```
┌─────────────────────────────────────────────────────┐
│  📝 Recent Entries                          [View All] │
│                                                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 🟢 Voice Over Project          ฿7,000   Sep 5  │ │
│  │    ACME Corp • INV-001                         │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 🔴 Office Supplies            ฿1,200   Sep 4   │ │
│  │    OfficeMax • Equipment                       │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Key Interactions**:

-   **Metric cards animate on load** with counting animation
-   **Add Entry button** pulses subtly to draw attention
-   **Entry cards** lift on hover with soft shadow
-   **Quick actions** appear on entry hover (edit, delete)

### 2. Manual Entry Form

**Split Screen Layout**:

```
┌─────────────────────┐ ┌─────────────────────┐
│  📝 Entry Details   │ │  👁️ Live Preview    │
│                     │ │                     │
│  Type: [Income ▼]   │ │  ┌─────────────────┐ │
│                     │ │  │ 💰 Voice Over   │ │
│  Title: [_______]   │ │  │    Project      │ │
│                     │ │  │                 │ │
│  Client: [______]   │ │  │ ACME Corp       │ │
│                     │ │  │ Sep 5, 2025     │ │
│  Date: [_______]    │ │  │                 │ │
│                     │ │  │ ฿7,000.00       │ │
│  Amount: [______]   │ │  │ - WHT: ฿210     │ │
│                     │ │  │ = Net: ฿6,790   │ │
│  💡 VAT Calc        │ │  └─────────────────┘ │
│  [Auto 7%] [Manual] │ │                     │
│                     │ │                     │
│  📊 WHT Calc        │ │                     │
│  [Auto 3%] [Manual] │ │                     │
│                     │ │                     │
│  [Save Entry] 💾    │ │                     │
└─────────────────────┘ └─────────────────────┘
```

**Key Interactions**:

-   **Real-time preview** updates as user types
-   **Auto-calculation toggles** for VAT/WHT with smooth animation
-   **Form validation** with inline helpful messages
-   **Save button** changes color and shows loading state
-   **Success animation** on save completion

### 3. Reports Page

**Monthly Overview**:

```
┌─────────────────────────────────────────────────────┐
│  📊 Financial Reports                               │
│                                                     │
│  📅 [September 2025 ▼]    [Monthly ▼] [Quarterly]  │
│                                                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │        📈 Income vs Expenses                    │ │
│  │    60k │                                        │ │
│  │    50k │     ██████                             │ │
│  │    40k │     ██████   ████                      │ │
│  │    30k │     ██████   ████                      │ │
│  │    20k │     ██████   ████   ██                 │ │
│  │    10k │     ██████   ████   ██                 │ │
│  │     0  └─────────────────────────────────────── │ │
│  │          Jul     Aug     Sep                    │ │
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  📋 Monthly Summary                                 │
│  • Total Income: ฿45,000 (↑ 12% from last month)   │
│  • Total Expenses: ฿12,000 (↓ 5% from last month)  │ │
│  • Net Profit: ฿33,000 (↑ 18% from last month)     │
│  • Entry Count: 20 entries this month              │
└─────────────────────────────────────────────────────┘
```

**Key Interactions**:

-   **Smooth chart animations** on load and filter changes
-   **Period selector** with slide transition
-   **Hover tooltips** on chart data points
-   **Trend indicators** with color-coded arrows

### 4. Entry List (All Entries)

**Filterable List View**:

```
┌─────────────────────────────────────────────────────┐
│  📝 All Entries                                     │
│                                                     │
│  🔍 [Search...] [Income▼] [Sep 2025▼] [Client▼]    │
│                                                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 🟢 Voice Over Project          ฿7,000   Sep 5  │ │
│  │    ACME Corp • Q3 Campaign • INV-001          │ │
│  │    [✏️ Edit] [🗑️ Delete]                        │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 🟢 Website Design              ฿15,000  Sep 3  │ │
│  │    TechStart • Landing Page • INV-002          │ │
│  │    [✏️ Edit] [🗑️ Delete]                        │ │
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  [← Previous] [1] [2] [3] [Next →]                  │
└─────────────────────────────────────────────────────┘
```

**Key Interactions**:

-   **Search with instant filtering**
-   **Multi-select for bulk operations**
-   **Slide-out edit panel** instead of new page
-   **Confirm dialogs** for destructive actions

---

## 🎨 Visual Design System

### Color Palette

```css
/* Primary Colors */
--primary-50: #f0f9ff;
--primary-100: #e0f2fe;
--primary-500: #3b82f6; /* Main brand blue */
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Semantic Colors */
--success-500: #10b981; /* Income/positive */
--danger-500: #ef4444; /* Expense/negative */
--warning-500: #f59e0b; /* Alerts */
--info-500: #3b82f6; /* Information */

/* Neutral Palette */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### Typography Scale

```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Type Scale */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System

```css
/* Spacing Scale (Tailwind-inspired) */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
```

### Border Radius

```css
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem; /* 8px */
--radius-xl: 0.75rem; /* 12px */
--radius-2xl: 1rem; /* 16px */
--radius-3xl: 1.5rem; /* 24px */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## ✨ Animation & Motion Design

### Animation Principles

1. **Purposeful**: Every animation serves a functional purpose
2. **Performant**: Use transform and opacity for 60fps animations
3. **Consistent**: Same duration and easing across similar interactions
4. **Accessible**: Respect `prefers-reduced-motion`

### Timing & Easing

```css
/* Duration Scale */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;

/* Easing Functions */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Animation Examples

**Page Transitions**:

```css
/* Fade in up */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Scale on hover */
.card:hover {
    transform: scale(1.02);
    box-shadow: var(--shadow-lg);
    transition: all var(--duration-normal) var(--ease-out);
}
```

**Number Counting Animation**:

```typescript
// Framer Motion number counter
const NumberCounter = ({ value }) => (
    <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}>
        <CountUp end={value} duration={1} separator="," prefix="฿" />
    </motion.span>
);
```

**Loading States**:

```css
/* Pulsing dots */
@keyframes pulse {
    0%,
    80%,
    100% {
        transform: scale(0);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

.loading-dot {
    animation: pulse 1.4s infinite ease-in-out;
}

.loading-dot:nth-child(1) {
    animation-delay: -0.32s;
}
.loading-dot:nth-child(2) {
    animation-delay: -0.16s;
}
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
--screen-sm: 640px; /* Tablet */
--screen-md: 768px; /* Small laptop */
--screen-lg: 1024px; /* Desktop */
--screen-xl: 1280px; /* Large desktop */
```

### Mobile Adaptations

**Dashboard Mobile**:

```
┌─────────────────────┐
│ 👋 Welcome back!    │
│                     │
│ 📊 This Month       │
│ ┌─────────────────┐ │
│ │ 💰 Income       │ │
│ │ ฿45,000         │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 💸 Expenses     │ │
│ │ ฿12,000         │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 📈 Net          │ │
│ │ ฿33,000         │ │
│ └─────────────────┘ │
│                     │
│ [➕ Add Entry]      │
│ [📊 Reports]        │
└─────────────────────┘
```

**Form Mobile (Stack Layout)**:

```
┌─────────────────────┐
│ 📝 New Entry        │
│                     │
│ Type: [Income ▼]    │
│ Title: [_________]  │
│ Client: [_______]   │
│ Date: [_________]   │
│ Amount: [_______]   │
│                     │
│ 👁️ Preview:         │
│ ┌─────────────────┐ │
│ │ Voice Over      │ │
│ │ ACME Corp       │ │
│ │ ฿7,000 → ฿6,790 │ │
│ └─────────────────┘ │
│                     │
│ [Save Entry] 💾     │
└─────────────────────┘
```

---

## 🎯 Interaction States

### Button States

```css
/* Primary Button */
.btn-primary {
    background: var(--primary-500);
    color: white;
    transition: all var(--duration-normal) var(--ease-out);
}

.btn-primary:hover {
    background: var(--primary-600);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.btn-primary:active {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
}

.btn-primary:disabled {
    background: var(--gray-300);
    transform: none;
    box-shadow: none;
    cursor: not-allowed;
}
```

### Input States

```css
.input {
    border: 2px solid var(--gray-200);
    transition: border-color var(--duration-fast) var(--ease-out);
}

.input:focus {
    border-color: var(--primary-500);
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input:invalid {
    border-color: var(--danger-500);
}
```

### Card States

```css
.card {
    transition: all var(--duration-normal) var(--ease-out);
    cursor: pointer;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.card:active {
    transform: translateY(0);
}
```

---

## 🚀 Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Images and non-critical components
2. **Animation Performance**: Use transform and opacity only
3. **Reduced Motion**: Respect accessibility preferences
4. **Progressive Enhancement**: Core functionality works without JS

### Critical CSS

```css
/* Critical above-the-fold styles */
body {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: var(--gray-900);
    background: var(--gray-50);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-4);
}

/* Prevent layout shift */
.metric-card {
    min-height: 120px;
}

.entry-card {
    min-height: 80px;
}
```

---

## ♿ Accessibility

### Key Requirements

1. **Color Contrast**: WCAG AA compliant (4.5:1 minimum)
2. **Keyboard Navigation**: Full keyboard support
3. **Screen Readers**: Proper ARIA labels and semantic HTML
4. **Focus Management**: Clear focus indicators
5. **Reduced Motion**: Respect user preferences

### Implementation Examples

```jsx
// Accessible button
<button
  className="btn-primary"
  aria-label="Add new income entry"
  aria-describedby="add-entry-help"
>
  <PlusIcon aria-hidden="true" />
  Add Entry
</button>

// Form with proper labels
<label htmlFor="entry-title" className="sr-only">
  Entry title
</label>
<input
  id="entry-title"
  type="text"
  placeholder="Enter description"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="title-error"
/>
{hasError && (
  <p id="title-error" className="error-message" role="alert">
    Title is required
  </p>
)}
```

---

## 🎨 Component Library Preview

### Button Variants

```
[Primary]  [Secondary]  [Outline]  [Ghost]  [Danger]
```

### Input Types

```
[Text Input]
[Number Input] [Currency]
[Date Picker]
[Select Dropdown]
[Textarea]
```

### Cards

```
┌─────────────────┐  ┌─────────────────┐
│ Metric Card     │  │ Entry Card      │
│                 │  │                 │
│ 💰 Income       │  │ 🟢 Project Name │
│ ฿45,000         │  │ Client • Date   │
│ ↑ 12% vs last   │  │ ฿7,000          │
└─────────────────┘  └─────────────────┘
```

This design system provides a comprehensive foundation for building a beautiful, accessible, and performant MVP while maintaining consistency and scalability for future features.
