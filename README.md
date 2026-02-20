# Mehta

Mental Health Transcript Analysis - AI-Powered Therapy Session Review System

[![License: UNLICENSED](https://img.shields.io/badge/License-UNLICENSED-red.svg)](#license)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7.4-2D3748)](https://www.prisma.io)

<img src="assets/01_landing.png" width="100%">

## Project Overview

Mehta is a web-based dashboard for analyzing therapy sessions conducted by Fellows (lay providers aged 18-22) delivering group therapy to young people in Kenya and other African contexts.

The application addresses a critical scalability challenge: scaling to serve millions of youths, without the overhead of manually review every session recording. Mehta amplifies their capacity using Generative AI to automatically analyze session transcripts and flag areas requiring human oversight.

## Features

### Core Functionality

- **Session Dashboard**: View all therapy sessions with metadata (Fellow Name, Date, Group ID, Status)
- **AI Analysis Engine**: Automatic transcript analysis using LLMs with structured output (Zod validation)
- **3-Point Quality Index**: Scoring system for Content Coverage, Facilitation Quality, and Protocol Safety
- **Risk Detection**: Binary SAFE/RISK flagging with exact quote extraction for crisis indicators
- **Human-in-the-Loop**: Supervisor validation/rejection workflow with notes
- **Transcript Upload**: File upload to AWS S3 with presigned URLs

### Administration

- **Fellow Management**: Create, edit, and manage Fellow profiles
- **User Management**: Admin panel for user creation and role assignment
- **Session Management**: Manual session creation and status updates
- **Bulk Operations**: Batch session processing

### Analytics & Reporting

- **Session Volume Charts**: Weekly session volume trends
- **Score Distribution**: Analysis scores across all sessions
- **Risk Analytics**: Risk detection trends and breakdown
- **Fellow Performance**: Individual Fellow radar charts
- **Performance Metrics**: Bar charts for comparative analysis

### Developer Experience

- **Real-time Updates**: Live progress tracking for analysis jobs
- **Background Processing**: Trigger.dev for async task handling
- **Error Handling**: Comprehensive error states and retry logic
- **Type Safety**: Full TypeScript with strict mode

### UI/UX

- **Dark/Light Theme**: System preference detection with manual toggle
- **Responsive Design**: Mobile-friendly interface
- **Loading States**: Skeleton loaders and progress indicators
- **Toast Notifications**: User feedback via Sonner

---

## Screenshots

<img src="assets/dashboard/01_dashboard.png" width="100%">
<img src="assets/dashboard/02_dashboard.png" width="100%">
<img src="assets/dashboard/03_dashboard.png" width="100%">
<img src="assets/dashboard/04_session.png" width="100%">
<img src="assets/dashboard/05_session.png" width="100%">
---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Dashboard  │  │  Sessions   │  │   Admin     │  │  Analytics  │     │
│  │    Page     │  │    Page     │  │    Panel    │  │    Charts   │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
└─────────┼────────────────┼────────────────┼────────────────┼─────────────┘
          │                │                │                │
          └────────────────┴────────┬───────┴────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS APP                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        API Routes                                 │  │
│  │  /api/meetings  /api/fellows  /api/users  /api/analytics       │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │                                       │
│  ┌────────────────┐  ┌────────────┴───────────┐  ┌───────────────────┐  │
│  │   NextAuth.js │  │     AWS S3 Client     │  │    AI Service     │  │
│  │   (Auth)      │  │   (File Uploads)      │  │  (OpenAI/Claude)  │  │
│  └───────┬────────┘  └───────────────────────┘  └─────────┬─────────┘  │
│          │                                             │              │
└──────────┼─────────────────────────────────────────────┼──────────────┘
           │                                             │
           ▼                                             ▼
┌─────────────────────┐                    ┌─────────────────────────────┐
│   PostgreSQL        │                    │      Trigger.dev            │
│   (Prisma ORM)      │                    │   ┌─────────────────────┐   │
│                     │                    │   │  analyze-session    │   │
│  - users            │                    │   │  (Background Job)   │   │
│  - fellows          │                    │   └──────────┬──────────┘   │
│  - meetings         │                    │              │               │
│  - meeting_analyses │                    │   ┌──────────┴──────────┐    │
│  - notifications    │                    │   │  Session Analysis   │    │
└─────────────────────┘                    │   │  Queue (2 concurrent)│   │
                                            └─────────────────────────────┘
```

### Data Flow

```
1. Supervisor uploads transcript (or enters S3 URL)
2. Meeting record created with PENDING status
3. Trigger.dev job queued for analysis
4. AI Service fetches transcript, runs analysis
5. Results saved to MeetingAnalysis table
6. Meeting status updated (PROCESSED or FLAGGED_FOR_REVIEW)
7. Notification sent to Supervisor
8. Supervisor reviews and validates/rejects
```

---

## Tech Stack

### Core

| Technology | Version | Purpose                         |
| ---------- | ------- | ------------------------------- |
| Next.js    | 16.1.6  | React framework with App Router |
| TypeScript | 5.x     | Type-safe JavaScript            |
| Prisma     | 7.4     | Database ORM                    |
| PostgreSQL | -       | Primary database                |

### AI & ML

| Technology         | Purpose                         |
| ------------------ | ------------------------------- |
| Vercel AI SDK      | Unified AI provider interface   |
| OpenAI (GPT-4)     | Primary LLM for analysis        |
| Anthropic (Claude) | Secondary LLM provider          |
| Ollama             | Local LLM support               |
| Zod                | Schema validation for AI output |

### Background Jobs

| Technology              | Purpose                    |
| ----------------------- | -------------------------- |
| Trigger.dev             | Async task queue           |
| Trigger.dev SDK         | Task definitions           |
| Trigger.dev React Hooks | Frontend real-time updates |

### UI & Styling

| Technology   | Version | Purpose              |
| ------------ | ------- | -------------------- |
| React        | 19.2.3  | UI library           |
| Tailwind CSS | 4       | Utility-first CSS    |
| shadcn/ui    | -       | Component library    |
| Radix UI     | 1.4.3   | Primitive components |
| Recharts     | 2.15.4  | Analytics charts     |
| Motion       | 12.34.1 | Animations           |
| Lucide React | Icons   |

### Auth & Security

| Technology           | Version | Purpose          |
| -------------------- | ------- | ---------------- |
| NextAuth.js          | 4.24.13 | Authentication   |
| @auth/prisma-adapter | 2.11.1  | Database adapter |
| bcryptjs             | 3.0.3   | Password hashing |

### Cloud & Infrastructure

| Technology | Purpose              |
| ---------- | -------------------- |
| AWS S3     | File storage         |
| Vercel     | Deployment (primary) |
| Sentry     | Error tracking       |
| Mixpanel   | Analytics            |

### Testing

| Technology            | Purpose           |
| --------------------- | ----------------- |
| Vitest                | Unit testing      |
| React Testing Library | Component testing |
| Playwright            | E2E testing       |

## Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **PostgreSQL** database (local or cloud)
- **AWS S3** bucket (optional, for file uploads)
- **AI Provider** API key (OpenAI, Anthropic, or Ollama)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mehta

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Auth
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# AI Providers (at least one required)
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o"
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
OLLAMA_API_URL="http://localhost:11434/api"
OLLAMA_API_KEY=""
OLLAMA_MODEL="phi3"
AI_PROVIDER="openai"  # openai, anthropic, or ollama

# AWS S3 (optional)
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="your-bucket"
AWS_REGION="us-east-1"

# Trigger.dev
TRIGGER_SECRET_KEY="tr_..."

# Monitoring (optional)
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""
SENTRY_ORG=""
SENTRY_PROJECT=""

# Analytics (optional)
NEXT_PUBLIC_MIXPANEL_TOKEN=""
```

### Running the Development Server

```bash
# Start both Next.js and Trigger.dev
npm run dev

# Or start individually
npm run next:dev    # Next.js only
npm run trigger:dev # Trigger.dev only
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed with sample data (optional)
npm run db:seed
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │     Fellow      │
├─────────────────┤       ├─────────────────┤
│ id              │◀──────│ supervisorId    │
│ email           │       │ id              │
│ name            │       │ email           │
│ password        │       │ name            │
│ role            │       │ status          │
│ createdAt       │       │ createdAt       │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │         ┌───────────────┴───────────────┐
         │         │            Meeting            │
         │         ├───────────────────────────────┤
         │         │ id                            │
         │         │ groupId                       │
         │         │ date                          │
         │────────▶│ transcript                    │
         │         │ status                        │
         │         │ fellowId                      │
         │         │ supervisorId                  │
         │         └────────────┬──────────────────┘
         │                      │
         │                      │
         │         ┌────────────┴──────────────────┐
         │         │       MeetingAnalysis         │
         │         ├───────────────────────────────┤
         │         │ id                            │
         │         │ summary                       │
         │         │ contentCoverage (JSON)        │
         │────────▶│ facilitationQuality (JSON)    │
         │         │ protocolSafety (JSON)         │
         │         │ riskDetection (JSON)          │
         │         │ supervisorStatus              │
         │         │ supervisorNotes               │
         │         │ reviewedBy                    │
         │         │ reviewedAt                    │
         │         │ meetingId                     │
         │         └───────────────────────────────┘
         │
         │
┌────────┴────────┐
│  Notification   │
├─────────────────┤
│ id              │
│ title           │
│ description     │
│ isRead          │
│ userId          │
│ createdAt       │
└─────────────────┘
```

### Core Models

#### User

Represents supervisors and administrators.

- `id`: Unique identifier
- `email`: Login email (unique)
- `name`: Display name
- `password`: Bcrypt hashed password
- `role`: "supervisor" or "admin"
- `settings`: JSON for user preferences

#### Fellow

Therapy session providers supervised by users.

- `id`: Unique identifier
- `email`: Contact email (unique)
- `name`: Display name
- `status`: "ACTIVE" or "INACTIVE"
- `supervisorId`: Foreign key to User

#### Meeting

Therapy session records with transcripts.

- `id`: Unique identifier
- `groupId`: Group identifier (e.g., "Group A")
- `date`: Session date
- `transcript`: Full text transcript or S3 URL
- `status`: PENDING, PROCESSED, FLAGGED_FOR_REVIEW
- `fellowId`: Foreign key to Fellow
- `supervisorId`: Foreign key to User
- `runId`: Trigger.dev run identifier

#### MeetingAnalysis

AI-generated analysis results.

- `id`: Unique identifier
- `summary`: 3-sentence session summary
- `contentCoverage`: { score: 1-3, rating, justification }
- `facilitationQuality`: { score: 1-3, rating, justification }
- `protocolSafety`: { score: 1-3, rating, justification }
- `riskDetection`: { status: SAFE|RISK, quote?, explanation }
- `supervisorStatus`: "VALIDATED" or "REJECTED"
- `supervisorNotes`: Supervisor feedback
- `reviewedBy`: Supervisor who validated
- `reviewedAt`: Validation timestamp
- `meetingId`: Foreign key to Meeting

---

## AI Analysis Engine

### The 3-Point Quality Index

The AI analyzes each transcript against three core metrics:

#### 1. Content Coverage

Did the Fellow teach the Growth Mindset concept?

| Score | Rating   | Criteria                                                            |
| ----- | -------- | ------------------------------------------------------------------- |
| 1     | Missed   | Fellow failed to mention "Growth Mindset" or defined it incorrectly |
| 2     | Partial  | Fellow mentioned concept but didn't verify understanding            |
| 3     | Complete | Fellow explained clearly, gave example, asked for thoughts          |

#### 2. Facilitation Quality

How well did the Fellow deliver the content?

| Score | Rating    | Criteria                                                   |
| ----- | --------- | ---------------------------------------------------------- |
| 1     | Poor      | Dominated conversation, interrupted, used confusing jargon |
| 2     | Adequate  | Polite but transactional, stuck to script                  |
| 3     | Excellent | Warm, encouraged quiet members, validated feelings         |

#### 3. Protocol Safety

Did the Fellow stay within expected boundaries?

| Score | Rating      | Criteria                                                      |
| ----- | ----------- | ------------------------------------------------------------- |
| 1     | Violation   | Gave unauthorized medical/relationship advice                 |
| 2     | Minor Drift | Got distracted but returned to topic                          |
| 3     | Adherent    | Stayed focused on curriculum, handled distractions gracefully |

### Risk Detection

Critical safety check for:

- Self-harm indicators
- Suicidal thoughts
- Severe crisis
- Mental health emergencies

Output includes:

- `status`: "SAFE" or "RISK"
- `quote`: Exact quote if risk detected
- `explanation`: Reasoning for decision

### AI Provider Configuration

The system supports multiple AI providers:

```typescript
// Environment
AI_PROVIDER=openai  // or "anthropic" or "ollama"

// Available models (configurable)
OPENAI_MODEL=gpt-4o
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
OLLAMA_MODEL=phi3
```

**Known Limitation**: The current implementation does not automatically switch between AI providers on failure. If the primary provider (e.g., OpenAI) fails, the system attempts fallback to configured secondary providers in code, but there is no dynamic provider switching or automatic retry with alternative models.

## Background Jobs

### Trigger.dev Integration

Mehta uses Trigger.dev for background task processing:

```typescript
// Job: analyze-session
// Location: src/trigger/jobs.ts

export const analyzeSessionJob = task({
  id: 'analyze-session',
  maxDuration: 600, // 10 minutes
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000
  },
  queue: {
    name: 'session-analysis',
    concurrencyLimit: 2
  }
});
```

### Processing Pipeline

1. **Queued**: Meeting created with PENDING status
2. **Starting**: Transcript loaded from database/S3
3. **Analyzing**: AI processes transcript with progress updates
4. **Saving**: Results stored in MeetingAnalysis
5. **Completed**: Meeting status updated, notification sent

### Progress Tracking

The job reports progress through metadata:

- `status`: starting → analyzing → saving → completed
- `progressMessage`: Current processing step
- `meetingId`: Meeting being processed

Frontend can subscribe to job progress via Trigger.dev React hooks.

---

## API Routes

| Endpoint                          | Method             | Description                |
| --------------------------------- | ------------------ | -------------------------- |
| `/api/auth/[...nextauth]`         | \*                 | NextAuth.js authentication |
| `/api/meetings`                   | GET, POST          | List/create meetings       |
| `/api/meetings/[id]`              | GET, PATCH, DELETE | Single meeting operations  |
| `/api/meetings/[id]/validate`     | POST               | Supervisor validation      |
| `/api/meetings/[id]/notes`        | POST               | Add supervisor notes       |
| `/api/meetings/[id]/download-url` | GET                | Presigned S3 URL           |
| `/api/fellows`                    | GET, POST          | List/create fellows        |
| `/api/fellows/[id]`               | GET, PATCH, DELETE | Single fellow operations   |
| `/api/users`                      | GET, POST          | List/create users (admin)  |
| `/api/users/[id]`                 | GET, PATCH, DELETE | Single user operations     |
| `/api/users/profile`              | GET, PATCH         | Current user profile       |
| `/api/users/settings`             | GET, PATCH         | User settings              |
| `/api/users/password`             | POST               | Password change            |
| `/api/statistics`                 | GET                | Dashboard statistics       |
| `/api/analytics/track`            | POST               | Track analytics events     |
| `/api/notifications`              | GET                | List notifications         |
| `/api/export/[id]`                | GET                | Export meeting data        |
| `/api/seed`                       | POST               | Seed database (dev)        |
| `/api/trigger/webhook`            | POST               | Trigger.dev webhooks       |

---

## Project Structure

```
mehta/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (user)/            # Authenticated routes
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   │   ├── page.tsx   # Dashboard overview
│   │   │   │   ├── sessions/  # Session management
│   │   │   │   ├── profile/   # User profile
│   │   │   │   └── settings/  # User settings
│   │   │   └── admin/         # Admin panel
│   │   │       ├── page.tsx   # Admin overview
│   │   │       └── users/     # User management
│   │   ├── api/              # API routes
│   │   ├── login/           # Login page
│   │   └── layout.tsx       # Root layout
│   ├── components/            # React components
│   │   ├── dashboard/        # Dashboard-specific
│   │   │   ├── charts/       # Recharts components
│   │   │   └── *.tsx         # Dialogs, menus, etc.
│   │   ├── providers/       # Context providers
│   │   └── ui/              # shadcn/ui components
│   ├── lib/                  # Core utilities
│   │   ├── ai-service.ts     # AI analysis logic
│   │   ├── auth.ts          # NextAuth config
│   │   ├── prisma.ts        # Prisma client
│   │   ├── s3.ts            # AWS S3 utilities
│   │   ├── schemas.ts       # Zod validation
│   │   └── analytics.ts     # Mixpanel integration
│   ├── trigger/              # Trigger.dev jobs
│   │   └── jobs.ts          # Background job definitions
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript definitions
│   └── config/              # Configuration files
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                   # Static assets
├── __tests__/               # Vitest tests
├── e2e/                     # Playwright tests
├── trigger.config.ts        # Trigger.dev config
├── next.config.ts           # Next.js config
├── tailwind.config.ts      # Tailwind CSS config
├── vitest.config.ts        # Vitest config
├── playwright.config.ts     # Playwright config
└── package.json
```

---

## Development Commands

### Development

```bash
npm run dev              # Start development server (Next.js + Trigger.dev)
npm run build           # Build for production
npm run start           # Start production server
```

### Code Quality

```bash
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run format:check    # Check formatting
```

### Testing

```bash
npm run test            # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:ui        # Run tests with UI
npm run test:coverage  # Run tests with coverage
npm run test:e2e       # Run Playwright E2E tests
npm run test:e2e:ui    # Run E2E tests with UI
```

### Database

```bash
npx prisma studio       # Open Prisma database GUI
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run migrations
npm run db:seed         # Seed database
```

### Trigger.dev

```bash
npm run trigger:dev    # Start Trigger.dev dev server
```

---

## Testing

### Unit Tests (Vitest)

Tests are located in `__tests__/` and use Vitest with React Testing Library.

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# With UI
npm run test:ui

# Coverage
npm run test:coverage
```

### E2E Tests (Playwright)

End-to-end tests are in `e2e/` directory.

```bash
# Run E2E tests
npm run test:e2e

# With UI
npm run test:e2e:ui
```

### Test Structure

```
__tests__/
├── lib/
│   ├── ai-service.test.ts    # AI service tests
│   └── schemas.test.ts        # Schema validation tests
└── components/
    └── *.test.tsx             # Component tests

e2e/
├── dashboard.spec.ts          # Dashboard flows
├── sessions.spec.ts           # Session management
└── admin.spec.ts             # Admin functionality
```

---

## Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add all required environment variables in Vercel dashboard
3. **Framework Preset**: Next.js will be auto-detected
4. **Build Command**: `npm run build`
5. **Output Directory**: `.next`

```bash
# Deploy from CLI (optional)
vercel deploy --prod
```

**Note**: For Trigger.dev, you need to deploy separately or use Vercel integration.

### Netlify

1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18+
3. **Environment Variables**: Add all required variables
4. **Redirects**: Netlify handles Next.js routing automatically

```bash
# Netlify CLI
netlify deploy --prod
```

### Trigger.dev (Background Jobs)

Mehta uses Trigger.dev for background job processing (session analysis, notifications).

#### Cloud Deployment (Recommended)

1. **Connect to Trigger.dev Dashboard**
   - Go to https://cloud.trigger.dev
   - Create a new project or connect existing

2. **Configure Environment**
   Add these in Trigger.dev dashboard → Settings → Environment:

   ```
   DATABASE_URL=<your-database-url>
   OPENAI_API_KEY=<your-openai-key>
   ANTHROPIC_API_KEY=<your-anthropic-key>
   AI_PROVIDER=openai
   AWS_ACCESS_KEY_ID=<your-aws-key>
   AWS_SECRET_ACCESS_KEY=<your-aws-secret>
   AWS_S3_BUCKET=<your-bucket>
   AWS_REGION=us-east-1
   ```

3. **Deploy**
   ```bash
   npx trigger.dev deploy
   ```

#### Local Development

Trigger.dev runs automatically with:

```bash
npm run dev
```

Or separately:

```bash
npm run trigger:dev
```

#### Production Notes

- Use **Hobby** (free) or **Pro** tier for production workloads
- Background jobs run serverless - no container deployment needed
- Configure environment variables in Trigger.dev dashboard
- Monitor job runs via dashboard

### Environment-Specific Notes

#### Development

- Runs locally with `npm run dev`
- Uses localhost database
- Trigger.dev dev server required for background jobs

#### Production

- Use managed PostgreSQL (Neon, Supabase, AWS RDS)
- Configure proper CORS settings
- Set up proper auth secrets
- Enable Sentry for error tracking

## Docker

Mehta includes Docker support for local development and production deployment.

### Prerequisites

- **Docker** 20.10+
- **Docker Compose** 2.0+

### Quick Start (Local Development)

```bash
# 1. Copy environment variables
cp .env.docker .env

# 2. Start all services (PostgreSQL, Redis, Next.js)
npm run docker:up

# 3. Run database migrations
npm run docker:migrate

# 4. Seed database with sample data (optional)
npm run docker:seed

# 5. Open http://localhost:3000
```

### Docker Commands

| Command                   | Description                      |
| ------------------------- | -------------------------------- |
| `npm run docker:up`       | Start all services in background |
| `npm run docker:down`     | Stop all services                |
| `npm run docker:build`    | Rebuild containers               |
| `npm run docker:dev`      | Start app container only         |
| `npm run docker:logs`     | View all logs                    |
| `npm run docker:logs:app` | View app logs only               |
| `npm run docker:clean`    | Remove containers and volumes    |
| `npm run docker:ps`       | List running containers          |
| `npm run docker:restart`  | Restart app container            |
| `npm run docker:migrate`  | Run Prisma migrations            |
| `npm run docker:seed`     | Seed database                    |
| `npm run docker:db`       | Access PostgreSQL CLI            |

### Services

| Service    | Port | Description        |
| ---------- | ---- | ------------------ |
| Next.js    | 3000 | Application server |
| PostgreSQL | 5432 | Database           |
| Redis      | 6379 | Cache & sessions   |

### Production Deployment

```bash
# Build and start production containers
npm run docker:prod:up

# Stop production containers
npm run docker:prod:down
```

**Production Requirements**:

- External PostgreSQL (Neon, Supabase, AWS RDS)
- External Redis (Upstash, Redis Cloud) or self-hosted
- Valid SSL certificates for HTTPS

### Docker Files

| File                      | Purpose                      |
| ------------------------- | ---------------------------- |
| `Dockerfile`              | Production multi-stage build |
| `Dockerfile.dev`          | Development with hot reload  |
| `docker-compose.yml`      | Local development stack      |
| `docker-compose.prod.yml` | Production deployment        |
| `.dockerignore`           | Excluded files               |
| `.env.docker`             | Environment template         |

### Development Workflow

1. **Start services**: `npm run docker:up`
2. **Make code changes**: Files are mounted as volumes
3. **View logs**: `npm run docker:logs:app`
4. **Stop services**: `npm run docker:down`

### Troubleshooting

```bash
# View container logs
docker-compose logs -f app

# Access database
docker-compose exec db psql -U mehta -d mehta

# Access Redis
docker-compose exec cache redis-cli

# Rebuild after dependency changes
docker-compose build --no-cache

# Reset everything
docker-compose down -v
```

---

## Architectural Decisions

### 1. AI Provider Abstraction

**Decision**: Use Vercel AI SDK with multiple provider support.

**Rationale**:

- Allows flexibility in AI provider selection
- Easy to switch providers based on cost/performance
- Structured output validation via Zod

**Trade-off**: Currently limited to one provider at a time without automatic failover.

### 2. Background Processing with Trigger.dev

**Decision**: Use Trigger.dev for async session analysis.

**Rationale**:

- Long-running AI analysis exceeds Next.js API timeout
- Built-in retry logic and progress tracking
- Simple queue configuration with concurrency limits

**Trade-off**: Adds another service to manage; requires separate deployment consideration.

### 3. Prisma ORM with PostgreSQL

**Decision**: Use Prisma as the database abstraction layer.

**Rationale**:

- Type-safe database operations
- Easy migrations and schema management
- Works well with Next.js and serverless

**Trade-off**: Cold start times on serverless; connection pooling needed.

### 4. Session Status State Machine

**Decision**: Implement explicit status states (PENDING → PROCESSED/FLAGGED_FOR_REVIEW).

**Rationale**:

- Clear workflow for supervisors
- Easy filtering and querying
- Deterministic UI states

**Trade-off**: Additional state management; need to handle edge cases.

### 5. JSON Storage for Analysis Scores

**Decision**: Store analysis scores as JSON in PostgreSQL.

**Rationale**:

- Flexible schema for nested analysis data
- Easy to extend with new metrics
- No migration needed for new fields

**Trade-off**: Less type safety at database level; harder to query individual fields.

---

## Known Limitations & Shortcomings

### AI Provider Failures

- **No automatic provider switching**: When the configured AI provider fails, the system attempts fallback in code but there's no dynamic switching or retry with alternative models
- **Limited retry logic**: Failed analysis jobs retry with same provider
- **No circuit breaker**: System doesn't detect persistent provider failures

### Data & Processing

- **No offline support**: All features require internet connection
- **Transcript size limits**: Large transcripts may exceed token limits
- **S3 dependency**: File uploads require AWS S3; no alternative storage

### Features

- **No bulk import**: Sessions must be created one at a time
- **Limited export formats**: Only JSON export available
- **No real-time collaboration**: Multiple supervisors can't simultaneously review
- **No audit logging**: Changes to analysis aren't fully tracked

### UX/UI

- **No keyboard shortcuts**: Power user features missing
- **Limited accessibility**: Some components lack ARIA labels
- **No mobile app**: Responsive design exists but not optimized for mobile

### Infrastructure

- **Cold starts**: Serverless functions may have latency on first request
- **No horizontal scaling**: Currently single-region deployment
- **No caching layer**: Repeated queries hit database directly

---

## Analytics Features

Mehta includes comprehensive analytics for tracking therapy session metrics and supervisor workflows.

### Event Tracking

The system tracks user interactions via Mixpanel:

| Event                  | Description                  |
| ---------------------- | ---------------------------- |
| `session_viewed`       | Supervisor views a session   |
| `analysis_completed`   | AI analysis finishes         |
| `validation_submitted` | Supervisor validates/rejects |
| `transcript_uploaded`  | New transcript uploaded      |
| `fellow_created`       | New fellow added             |

### Dashboard Analytics

#### Session Volume

- Weekly session count trends
- Daily breakdown with bar charts
- Comparison to previous periods

#### Score Distribution

- Histogram of Content Coverage scores
- Facilitation Quality distribution
- Protocol Safety adherence rates

#### Risk Analytics

- Risk detection rate over time
- Breakdown by risk type
- Flagged sessions requiring review

#### Fellow Performance

- Individual Fellow radar charts
- Comparative performance metrics
- Trend analysis per Fellow

### Server-Side Analytics

Analytics events are also tracked server-side for:

- Authentication events
- API usage patterns
- Error tracking via Sentry
- Performance monitoring

### Query Statistics

The `/api/statistics` endpoint provides aggregated metrics:

- Total sessions by status
- Average analysis scores
- Risk detection rates
- Supervisor activity metrics

---

## AI-Assisted Development

This project was developed with significant AI assistance. Here's how:

### Code Generation

- **Component Scaffolding**: AI generated initial component structures for dashboards, dialogs, and UI components
- **API Routes**: REST endpoints were scaffolded with AI assistance
- **Database Schema**: Initial Prisma schema derived from requirements
- **Job Definitions**: Trigger.dev task configurations

### AI Prompt Engineering

- **Analysis Prompt**: Carefully crafted prompts for the 3-Point Quality Index scoring
- **System Prompts**: Context about organization mission and therapy protocols
- **Validation**: Human review of all AI-generated prompts

### Verification

All AI-generated code was verified through:

1. **TypeScript Compilation**: Strict type checking passes
2. **Unit Tests**: Critical paths tested with Vitest
3. **E2E Tests**: Playwright tests verify user flows
4. **Manual Testing**: Developer tested all major features

### Areas of Human-Created Code

- **Security**: Authentication, authorization, password handling
- **Database**: Schema design, migrations, seed data
- **Business Logic**: Validation workflows, status state machine
- **Testing**: Test cases designed by developer
- **Architecture**: System design decisions and trade-offs

### Recommendations for Future Development

- Implement circuit breaker pattern for AI providers
- Add comprehensive audit logging
- Consider real-time collaboration features
- Expand mobile responsiveness

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development setup
- Git workflow and commit format
- Code quality standards
- Testing requirements
- Pull request process

### Quick Start for Contributors

```bash
# Fork and clone
git clone <your-fork-url>
cd mehta

# Create feature branch
git checkout -b feat/your-feature

# Make changes and test
npm run lint
npm run test

# Commit with proper format
git commit -m "feat: add new feature"

# Push and create PR
git push origin feat/your-feature
```

---

## License

This project is **UNLICENSED** - see the [UNLICENSED](LICENSE) file for details.

All rights reserved. This codebase is proprietary and not available for public use without explicit permission.

---

## Acknowledgments

- [Shamiri Health](https://shamirihealth.com)/[Shamiri](https://shamiri.co) for the inspiring mission
- [Next.js](https://nextjs.org) team
- [Trigger.dev](https://trigger.dev) for background job infrastructure
- [Vercel](https://vercel.com) for AI SDK and deployment
- [shadcn/ui](https://ui.shadcn.com) for the beautiful component library
