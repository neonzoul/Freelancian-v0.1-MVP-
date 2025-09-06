# Demo Data and User Onboarding Setup

## Overview

This document outlines the demo data setup and user onboarding flow for Freelancian MVP. The demo data provides realistic examples that help new users understand the application's capabilities.

## Demo Data Strategy

### Data Categories

1. **Income Entries** (8 entries across 3 months)
   - Voice over projects
   - Content writing
   - Consulting services
   - Design work
   - Translation services

2. **Expense Entries** (6 entries across 3 months)
   - Equipment purchases
   - Software subscriptions
   - Office expenses
   - Professional services
   - Marketing costs

3. **Variety in Data**
   - Different client types (agencies, startups, corporations)
   - Various project sizes (฿2,000 - ฿25,000)
   - Different tax scenarios (with/without VAT, WHT)
   - Multiple months

## Demo Data Implementation

### Seed Data Structure

The demo data is implemented in `prisma/seed.ts` and includes:

#### Income Entries (8 entries)

```typescript
const incomeEntries = [
  {
    kind: 'income',
    title: 'Voice Over - Commercial Campaign',
    docDate: new Date('2024-01-15'),
    transferDate: new Date('2024-01-20'),
    clientName: 'Creative Agency Bangkok',
    productService: 'Voice Over Services',
    accountName: 'Business Account',
    priceGrossThb: 7000.00,
    vatThb: 490.00,
    withholdingThb: 210.00,
    commissionThb: 0.00,
    project: 'Toyota Commercial',
    remark: '30-second commercial in Thai and English',
    invoiceNo: 'INV-2024-001'
  },
  {
    kind: 'income',
    title: 'Content Writing - Blog Series',
    docDate: new Date('2024-01-22'),
    transferDate: new Date('2024-01-25'),
    clientName: 'Tech Startup Co.',
    productService: 'Content Writing',
    accountName: 'Business Account',
    priceGrossThb: 12000.00,
    vatThb: 840.00,
    withholdingThb: 360.00,
    commissionThb: 0.00,
    project: 'SEO Blog Content',
    remark: '10 articles, 1000 words each',
    invoiceNo: 'INV-2024-002'
  },
  // ... additional income entries
];
```

#### Expense Entries (6 entries)

```typescript
const expenseEntries = [
  {
    kind: 'expense',
    title: 'Adobe Creative Suite Subscription',
    docDate: new Date('2024-01-01'),
    transferDate: new Date('2024-01-01'),
    vendorName: 'Adobe Systems',
    productService: 'Software Subscription',
    accountName: 'Business Account',
    priceGrossThb: 1680.00,
    vatThb: 117.60,
    withholdingThb: 0.00,
    commissionThb: 0.00,
    project: 'Business Tools',
    remark: 'Monthly subscription for design work',
    invoiceNo: 'ADOBE-2024-01'
  },
  // ... additional expense entries
];
```

### Running Demo Data Setup

#### Development Environment

```bash
# Reset database and seed with demo data
npm run db:reset

# Or just seed existing database
npm run db:seed
```

#### Production Environment

```bash
# Generate Prisma client for production
npx prisma generate

# Push schema to production database
npx prisma db push

# Seed production database (optional)
npx prisma db seed
```

### Demo Data Features

#### 1. Realistic Financial Scenarios
- **VAT Calculations**: Proper 7% VAT on applicable transactions
- **Withholding Tax**: 3% WHT on income entries from larger clients
- **Commission Handling**: Platform fees and agent commissions
- **Mixed Tax Scenarios**: Some entries with/without taxes

#### 2. Diverse Client Portfolio
- **Creative Agency Bangkok**: Regular voice over client
- **Tech Startup Co.**: Content writing and consulting
- **International Corp**: High-value consulting projects
- **Local Restaurant**: Small business design work
- **E-commerce Platform**: Translation services

#### 3. Varied Project Types
- **Voice Over Work**: ฿7,000 - ฿15,000 per project
- **Content Writing**: ฿12,000 - ฿18,000 per series
- **Consulting Services**: ฿25,000 - ฿35,000 per engagement
- **Design Projects**: ฿8,000 - ฿12,000 per project
- **Translation Work**: ฿5,000 - ฿10,000 per project

#### 4. Business Expenses
- **Software Subscriptions**: Adobe, Figma, hosting services
- **Equipment**: Microphone, camera, computer accessories
- **Office Expenses**: Co-working space, utilities
- **Professional Services**: Accounting, legal consultation
- **Marketing**: Website maintenance, business cards

## User Onboarding Flow

### First-Time User Experience

#### 1. Welcome Dashboard
When users first access the application:
- **Empty State with Demo Data Option**: "Would you like to load sample data to explore the features?"
- **Quick Tour**: Highlight key features and navigation
- **Getting Started Guide**: Link to user documentation

#### 2. Guided Entry Creation
For first manual entry:
- **Form Field Explanations**: Tooltips explaining each field
- **Auto-calculation Helpers**: Demonstrate VAT/WHT toggles
- **Live Preview**: Show how the preview updates in real-time
- **Success Animation**: Celebrate first entry creation

#### 3. Feature Discovery
Progressive disclosure of features:
- **Dashboard Metrics**: Explain income, expenses, net calculations
- **Reports Page**: Show trend analysis and charts
- **Import Feature**: Demonstrate CSV import capability
- **Search and Filter**: Show how to find specific entries

### Onboarding Components

#### 1. Welcome Modal Component

```typescript
// src/components/onboarding/WelcomeModal.tsx
export function WelcomeModal() {
  return (
    <Modal>
      <div className="text-center">
        <h2>Welcome to Freelancian!</h2>
        <p>Your financial tracking companion for Thai freelancers</p>
        
        <div className="space-y-4">
          <Button onClick={loadDemoData}>
            Load Sample Data
          </Button>
          <Button variant="outline" onClick={startTour}>
            Take a Quick Tour
          </Button>
          <Button variant="ghost" onClick={startFresh}>
            Start Fresh
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

#### 2. Feature Tooltips

```typescript
// src/components/onboarding/FeatureTooltip.tsx
export function FeatureTooltip({ 
  children, 
  content, 
  placement = 'top' 
}) {
  return (
    <Tooltip content={content} placement={placement}>
      {children}
    </Tooltip>
  );
}
```

#### 3. Progress Indicators

```typescript
// src/components/onboarding/OnboardingProgress.tsx
export function OnboardingProgress({ 
  currentStep, 
  totalSteps 
}) {
  return (
    <div className="flex items-center space-x-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "w-2 h-2 rounded-full",
            index <= currentStep ? "bg-blue-500" : "bg-gray-300"
          )}
        />
      ))}
    </div>
  );
}
```

### Onboarding Steps

#### Step 1: Dashboard Overview (30 seconds)
- **Highlight metrics cards**: "These show your monthly financial summary"
- **Point to recent entries**: "Your latest transactions appear here"
- **Show action buttons**: "Add new entries or view detailed reports"

#### Step 2: Create First Entry (2 minutes)
- **Navigate to entry form**: "Let's create your first financial entry"
- **Explain form fields**: "Title describes your work, client is who paid you"
- **Demonstrate live preview**: "Watch the preview update as you type"
- **Show auto-calculations**: "Toggle these for automatic tax calculations"

#### Step 3: Explore Reports (1 minute)
- **Navigate to reports**: "See your financial trends over time"
- **Explain chart**: "Income vs expenses with trend indicators"
- **Show period selector**: "Change time periods to analyze different ranges"

#### Step 4: Import Data (Optional, 2 minutes)
- **Show import feature**: "Already have data? Import from CSV files"
- **Demonstrate file upload**: "Drag and drop or click to select files"
- **Explain field mapping**: "We'll help match your columns to our fields"

### Demo Data Benefits

#### 1. Immediate Value Demonstration
- Users see populated dashboard immediately
- Charts and reports show meaningful data
- Search and filter functionality is testable
- All features are immediately explorable

#### 2. Learning Through Examples
- **Realistic scenarios** help users understand use cases
- **Proper tax calculations** demonstrate Thai-specific features
- **Varied entry types** show application flexibility
- **Professional formatting** demonstrates output quality

#### 3. Confidence Building
- Users can experiment without fear of breaking anything
- Clear examples of proper data entry
- Understanding of expected workflows
- Familiarity with interface before entering real data

### Implementation Checklist

#### Demo Data Setup
- [x] **Seed file created** with realistic Thai freelancer data
- [x] **Database seeding** working in development and production
- [x] **Variety in entries** covering different scenarios
- [x] **Proper calculations** with correct Thai tax rates
- [x] **Multiple months** of data for trend analysis

#### Onboarding Components
- [ ] **Welcome modal** for first-time users
- [ ] **Feature tooltips** for guided discovery
- [ ] **Progress indicators** for onboarding steps
- [ ] **Demo data toggle** in settings
- [ ] **Onboarding state management** with localStorage

#### User Experience
- [ ] **Empty state handling** with helpful messaging
- [ ] **Progressive disclosure** of advanced features
- [ ] **Success celebrations** for milestone achievements
- [ ] **Help documentation** easily accessible
- [ ] **Reset functionality** to start over with demo data

### Maintenance and Updates

#### Regular Demo Data Updates
- **Quarterly review** of demo data relevance
- **Update amounts** to reflect current market rates
- **Add new project types** as features expand
- **Refresh client names** to maintain realism

#### Onboarding Optimization
- **Track completion rates** for each onboarding step
- **A/B test** different onboarding flows
- **Collect feedback** on onboarding experience
- **Iterate based** on user behavior analytics

### Technical Implementation

#### Demo Data Loading

```typescript
// src/lib/demo-data.ts
export async function loadDemoData() {
  try {
    // Clear existing data (optional)
    await prisma.entry.deleteMany();
    
    // Load demo entries
    await prisma.entry.createMany({
      data: [...incomeEntries, ...expenseEntries]
    });
    
    return { success: true, count: 14 };
  } catch (error) {
    console.error('Failed to load demo data:', error);
    return { success: false, error: error.message };
  }
}
```

#### Onboarding State Management

```typescript
// src/lib/hooks/use-onboarding.ts
export function useOnboarding() {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const completeStep = (stepNumber: number) => {
    setStep(stepNumber + 1);
    localStorage.setItem('onboarding-step', String(stepNumber + 1));
  };
  
  const completeOnboarding = () => {
    setCompleted(true);
    localStorage.setItem('onboarding-completed', 'true');
  };
  
  return {
    step,
    completed,
    completeStep,
    completeOnboarding,
  };
}
```

This comprehensive demo data and onboarding setup ensures new users can immediately understand and explore Freelancian's capabilities while learning proper usage patterns for their own financial tracking needs.