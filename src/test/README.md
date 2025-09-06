# Testing Suite Documentation

This document outlines the comprehensive testing suite implemented for the Freelancian MVP application.

## Test Structure

### Unit Tests (`src/lib/__tests__/`)
- **calculations.test.ts**: Tests for financial calculation functions
- **currency.test.ts**: Tests for Thai Baht currency formatting and validation
- **transformers.test.ts**: Tests for data transformation utilities
- **utils.test.ts**: Tests for general utility functions
- **validations.test.ts**: Tests for Zod validation schemas

### Component Tests (`src/components/**/__tests__/`)
- **Button.test.tsx**: Tests for button component variants and interactions
- **Input.test.tsx**: Tests for input component with validation states
- **CurrencyInput.test.tsx**: Tests for specialized currency input component
- **EntryForm.test.tsx**: Tests for the main entry form component

### Hook Tests (`src/lib/hooks/__tests__/`)
- **use-entries.test.ts**: Tests for React Query hooks for entry management

### Integration Tests (`src/test/integration/`)
- **entry-workflow.test.tsx**: Tests for complete entry management workflows
- **csv-import.test.tsx**: Tests for CSV import functionality

### End-to-End Tests (`src/test/e2e/`)
- **entry-workflow.spec.ts**: E2E tests for entry management user flows
- **accessibility.spec.ts**: Automated accessibility testing with axe-core

### API Tests (`src/app/api/__tests__/`)
- **entries.test.ts**: Tests for REST API endpoints

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)
- Environment: jsdom for DOM testing
- Coverage: v8 provider with 80% thresholds
- Setup files for mocking and utilities

### Playwright Configuration (`playwright.config.ts`)
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile device testing
- Accessibility testing integration

### Test Utilities (`src/test/`)
- **setup.ts**: Global test setup and mocking
- **test-utils.tsx**: Custom render functions and mock factories
- **README.md**: This documentation

## Test Scripts

```bash
# Run all unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run all tests
npm run test:all
```

## Coverage Targets

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Categories

### 1. Unit Tests (70% of test suite)
- Pure function testing
- Component isolation testing
- Validation logic testing
- Calculation accuracy testing

### 2. Integration Tests (20% of test suite)
- Component interaction testing
- API integration testing
- User workflow testing
- Data flow testing

### 3. End-to-End Tests (10% of test suite)
- Complete user journeys
- Cross-browser compatibility
- Accessibility compliance
- Mobile responsiveness

## Accessibility Testing

Automated accessibility testing includes:
- WCAG AA compliance checking
- Keyboard navigation testing
- Screen reader compatibility
- Color contrast validation
- Focus management testing

## Mock Strategy

### API Mocking
- Fetch API mocked globally
- Response factories for consistent test data
- Error scenario simulation

### Component Mocking
- Next.js components (Image, Router)
- Framer Motion animations
- React Query providers
- Prisma database client

### Test Data Factories
- Mock entry data generation
- API response templates
- Error response templates

## Best Practices Implemented

1. **Arrange-Act-Assert Pattern**: Clear test structure
2. **Test Isolation**: Each test is independent
3. **Mock Minimization**: Only mock external dependencies
4. **Descriptive Names**: Clear test descriptions
5. **Edge Case Coverage**: Testing boundary conditions
6. **Accessibility First**: Built-in a11y testing
7. **Performance Aware**: Testing loading states and optimizations

## Continuous Integration

Tests are designed to run in CI environments with:
- Headless browser support
- Parallel test execution
- Coverage reporting
- Accessibility compliance checking

## Future Enhancements

1. **Visual Regression Testing**: Screenshot comparison
2. **Performance Testing**: Core Web Vitals monitoring
3. **Load Testing**: API endpoint stress testing
4. **Security Testing**: Input validation and XSS prevention
5. **Internationalization Testing**: Multi-language support

## Troubleshooting

### Common Issues
1. **Component Not Found**: Ensure component is properly exported
2. **Mock Failures**: Check mock setup in test-utils.tsx
3. **Async Test Failures**: Use proper waitFor patterns
4. **Accessibility Failures**: Check ARIA labels and semantic HTML

### Debug Commands
```bash
# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```