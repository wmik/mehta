# Contributing to Shamiri Supervisor Copilot

Thank you for your interest in contributing to Cron Builder! This document provides guidelines and workflows for contributing to this project.

## Development Setup

### Prerequisites

- **Bun** runtime (preferred) or Node.js
- Git

### Getting Started

1. **Fork and clone the repository**

   ```bash
   git clone <your-fork-url>
   cd <project-folder>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Git Workflow

### Branch Strategy

This project follows a feature branch workflow:

- **`main`**: Production-ready code
- **Feature branches**: Create descriptive branches for new features or fixes
  - `feat/component-name` for new features
  - `fix/issue-description` for bug fixes
  - `refactor/component-name` for code refactoring
  - `chore/task-description` for maintenance tasks

### Current Branches

- `main`: Production branch

### Commit Message Format

Follow the established commit message format with emoji prefixes and detailed descriptions:

```
<emoji> <type>(<optional scope>): <brief description>

✨ Features Added:
- Feature 1 description
- Feature 2 description

🐛 Issues Fixed:
- Bug 1 description
- Bug 2 description

🔧 Technical improvements:
- Technical change 1
- Technical change 2
```

#### Common Emoji Prefixes

- ✨/🧪 `feat`: New features
- 🐞/🐛 `fix`: Bug fixes
- ♻️/🔁 `refactor`: Code refactoring
- 🧹 `chore`: Maintenance tasks
- 📝/📚 `docs`: Documentation updates
- 💄/🎨 `style`: Code style changes
- ⚡ `perf`: Performance improvements
- ✅/⚗️ `test`: Test additions or updates

#### Examples

```
🧪 feat: enhance UI and fix critical issues

✨ Features implemented:
- Comprehensive Docker multi-stage build configuration
- Enterprise-grade GitHub Actions CI/CD pipeline
- Comprehensive testing infrastructure with Vitest and React Testing Library

🐛 Issues resolved:
- Fixed critical parsing bug with proper day-of-month/day-of-week OR logic
- Enhanced UI with manual execution generation and comprehensive blur effects

🔧 Technical improvements:
- All code formatting and linting properly configured
- Comprehensive error handling and user feedback
```

```
♻️ refactor: larger components into smaller sub components

✨ Features Added:
- Extracted PageHeader component for better code organization
- Separated ScheduleDisplay into dedicated component
- Created preset-selectors for hour and day of week presets
- Modularized theme-toggle for reusable theme switching
- Improved component maintainability and separation of concerns
```

## Development Commands

```bash
# Development
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage

# E2E Testing
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui # Run Playwright E2E tests with UI
```

## Code Quality Standards

### Before Committing

Always run these commands before committing:

```bash
npm run typecheck
npm run lint
npm run test
npm run format:check
```

### Code Style

- **TypeScript**: Strict mode enabled
- **File naming**: kebab-case for all files
- **Components**: PascalCase for component files
- **Imports**: Follow the established order (React → third-party → internal → components)
- **Formatting**: Prettier configuration enforced

### Testing

- Use **Vitest** as the test runner
- **React Testing Library** + **User Event** for component testing
- Write tests for new features and bug fixes
- Maintain test coverage

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── api/             # API routes
│   ├── dashboard/       # Dashboard pages
│   └── login/           # Login page
├── components/          # React components
│   ├── hooks/          # Custom hooks
│   └── ui/             # UI components (shadcn)
├── lib/                # Core library functions
│   ├── auth.ts         # NextAuth configuration
│   ├── prisma.ts       # Prisma client
│   ├── ai-service.ts   # AI SDK service
│   └── schemas.ts      # Zod validation schemas
└── types/              # TypeScript type definitions

__tests__/              # Unit & integration tests
├── lib/                # Library function tests
└── components/         # Component tests

e2e/                    # Playwright E2E tests
```

## Submitting Changes

1. **Create a feature branch** from `main`
2. **Make your changes** following the code style guidelines
3. **Run all quality checks** (typecheck, lint, test, format)
4. **Commit with proper message** following the established format
5. **Push to your fork** and create a pull request

### Pull Request Process

- Provide a clear description of changes
- Link any related issues
- Ensure all CI checks pass
- Request code review from maintainers

## Getting Help

- Check existing issues for similar problems
- Read the AGENTS.md file for detailed development guidelines
- Ask questions in issues or discussions

Thank you for contributing to Shamiri copilot! 🚀
