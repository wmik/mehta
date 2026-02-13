# Shamiri Supervisor Copilot - Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the Shamiri Supervisor Copilot application. The strategy prioritizes unit and integration tests with Playwright for E2E testing, following the project's commitment to code quality and reliability.

---

## Current State

### Existing Infrastructure
- **Framework**: Next.js 16.1.6 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v4
- **AI Integration**: Vercel AI SDK v6
- **UI**: React 19 with shadcn/ui components

### Testing Gap
- No test runner installed
- No existing tests
- No test infrastructure

---

## Testing Philosophy

### Guiding Principles
1. **Test behavior, not implementation** - Focus on user-facing functionality
2. **Fast feedback loop** - Unit tests should run in milliseconds
3. **Meaningful coverage** - Aim for quality over quantity
4. **Mock external dependencies** - Database, AI services, auth
5. **Fail fast, recover faster** - Tests should catch issues before production

### Testing Pyramid

```
        /\
       /E2E\          ← Playwright (few, critical paths)
      /------\
     /Integration\     ← API route tests (more)
    /--------------\
   /   Unit Tests   \  ← Vitest (most numerous)
  /------------------\
```

---

## Test Infrastructure

### Technology Stack

| Category | Tool | Version | Purpose |
|----------|------|---------|---------|
| Test Runner | Vitest | ^3.x | Fast unit & integration testing |
| UI Testing | React Testing Library | ^19.x | Component testing |
| E2E Testing | Playwright | ^1.50 | Browser automation |
| Mocking | Jest-compatible mocks | - | External dependencies |
| Coverage | Vitest coverage | v8 | Code coverage reports |

### Dependencies to Install

```bash
# Core testing dependencies
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom

# Playwright for E2E
npm install -D @playwright/test

# Utilities
npm install -D @vitest/coverage-v8
```

---

## Test Structure

### Directory Layout

```
shamiri-dashboard/
├── __tests__/                    # Unit & Integration tests
│   ├── setup.ts                  # Global test setup & mocks
│   ├── lib/
│   │   ├── schemas.test.ts    # Zod schema validation
│   │   └── utils.test.ts      # Utility functions
│   ├── api/
│   │   ├── meetings.test.ts   # Meetings API routes
│   │   └── validate.test.ts   # Validation API
│   └── components/
│       ├── LoginPage.test.tsx # Login form
│       └── Dashboard.test.tsx # Dashboard page
├── e2e/                        # Playwright E2E tests
│   ├── login.spec.ts
│   └── session.spec.ts
├── vitest.config.ts            # Vitest configuration
├── playwright.config.ts         # Playwright configuration
└── package.json                 # Updated with test scripts
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Test Categories & Priority

### Priority 1: Schema Validation (Critical)

**File**: `__tests__/lib/schemas.test.ts`

Tests the Zod schemas that validate AI output - critical for catching issues like out-of-range scores.

```typescript
describe('sessionAnalysisSchema', () => {
  describe('Score Validation', () => {
    it('accepts score of 1', () => {
      // Valid
    });
    
    it('accepts score of 2', () => {
      // Valid
    });
    
    it('accepts score of 3', () => {
      // Valid
    });
    
    it('rejects score of 0', () => {
      // Below minimum
    });
    
    it('rejects score of 4', () => {
      // Above maximum - THIS CATCHES THE CURRENT BUG
    });
    
    it('rejects score of 5', () => {
      // Above maximum
    });
  });
  
  describe('Enum Validation', () => {
    it('accepts valid ratings for contentCoverage', () => {
      // Missed, Partial, Complete
    });
    
    it('rejects invalid rating', () => {
      // Invalid enum value
    });
  });
  
  describe('Risk Detection', () => {
    it('accepts SAFE status', () => {});
    it('accepts RISK status with quote', () => {});
    it('rejects invalid risk status', () => {});
  });
});
```

### Priority 2: Utility Functions

**File**: `__tests__/lib/utils.test.ts`

```typescript
describe('cn (className utility)', () => {
  it('merges classNames', () => {});
  it('handles conditional classes', () => {});
  it('resolves tailwind conflicts', () => {});
});
```

### Priority 3: API Routes

**File**: `__tests__/api/meetings.test.ts`

```typescript
describe('GET /api/meetings', () => {
  it('returns 401 without authentication', () => {});
  it('returns meetings for authenticated supervisor', () => {});
  it('includes fellow data in response', () => {});
  it('orders by date descending', () => {});
});

describe('POST /api/meetings', () => {
  it('returns 401 without authentication', () => {});
  it('creates sample meetings successfully', () => {});
});
```

### Priority 4: Components

**File**: `__tests__/components/LoginPage.test.tsx`

```typescript
describe('LoginPage', () => {
  it('renders login form', () => {});
  it('shows validation errors for empty fields', () => {});
  it('shows error on invalid credentials', () => {});
  it('redirects on successful login', () => {});
  it('shows loading state during submission', () => {});
});
```

---

## Mock Strategy

### External Dependencies

| Module | Mock Approach | Tool |
|--------|---------------|------|
| NextAuth | Mock getServerSession | vitest-fake-timers + manual mock |
| Prisma Client | Mock entire client | Manual mock with vi.mock |
| AI SDK | Mock generateText | Manual mock with preset responses |
| Next.js Router | Mock useRouter, useParams | vi.spyOn |

### Mock Example: Prisma

```typescript
// __tests__/setup.ts
const mockMeetings = [
  {
    id: '1',
    groupId: 'GRP-001',
    date: new Date(),
    status: 'PENDING',
    transcript: 'Test transcript',
    supervisorId: 'supervisor-1',
    fellowId: 'fellow-1',
    fellow: { name: 'John Doe', email: 'john@example.com' },
    analyses: []
  }
];

vi.mock('@/lib/prisma', () => ({
  prisma: {
    meeting: {
      findMany: vi.fn().mockResolvedValue(mockMeetings),
      findFirst: vi.fn().mockResolvedValue(mockMeetings[0]),
      create: vi.fn().mockResolvedValue(mockMeetings[0]),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }),
    }
  }
}));
```

### Mock Example: AI Service

```typescript
vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({
    output: {
      summary: 'Test summary',
      contentCoverage: { score: 3, rating: 'Complete', justification: '...' },
      facilitationQuality: { score: 2, rating: 'Adequate', justification: '...' },
      protocolSafety: { score: 3, rating: 'Adherent', justification: '...' },
      riskDetection: { status: 'SAFE', explanation: 'No risk detected' }
    }
  })
}));
```

---

## Test Setup Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts', 'src/app/api/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### __tests__/setup.ts

```typescript
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: { user: { id: '1', email: 'test@example.com' } },
    status: 'authenticated'
  })),
  signIn: vi.fn(),
  signOut: vi.fn()
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: '1', email: 'test@example.com' }
  })
}));

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
```

---

## Playwright E2E Tests

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### e2e/login.spec.ts

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('successful login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'supervisor@shamiri.org');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('failed login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Run Playwright tests
        run: npm run test:e2e
```

---

## Implementation Roadmap

### Phase 1: Setup (Foundation)
- [ ] Install Vitest and testing libraries
- [ ] Create vitest.config.ts
- [ ] Create __tests__/setup.ts
- [ ] Update package.json test scripts

### Phase 2: Unit Tests
- [ ] Zod schema validation tests
- [ ] Utility function tests

### Phase 3: Integration Tests
- [ ] API route tests (meetings)
- [ ] API route tests (validation)

### Phase 4: Component Tests
- [ ] LoginPage component tests
- [ ] DashboardPage component tests

### Phase 5: E2E Setup
- [ ] Install Playwright
- [ ] Create playwright.config.ts
- [ ] Login flow E2E test
- [ ] Session workflow E2E test

---

## Key Test Cases Summary

### Critical Tests (Must Pass)

| ID | Test | Purpose |
|----|------|---------|
| SCH-001 | Score range validation (1-3) | Catch AI score violations |
| SCH-002 | Enum validation | Ensure valid ratings |
| API-001 | 401 without auth | Security check |
| API-002 | Authenticated access | Functionality |
| E2E-001 | Login flow | User journey |
| E2E-002 | Session analysis | Core feature |

---

## Maintenance

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Adding New Tests

1. Follow naming convention: *.test.ts or *.test.tsx
2. Place in appropriate directory under __tests__/
3. Use existing mocks from setup.ts
4. Follow AAA pattern: Arrange, Act, Assert

---

## References

- Vitest Documentation: https://vitest.dev/
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Playwright Documentation: https://playwright.dev/docs/intro
- Testing Library Cheat Sheet: https://testing-library.com/docs/dom-testing-library/cheatsheet

---

Last Updated: February 2026
Version: 1.0
