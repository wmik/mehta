import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: {
      user: {
        id: '1',
        email: 'supervisor@shamiri.org',
        name: 'Test Supervisor',
        role: 'supervisor'
      }
    },
    status: 'authenticated'
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn().mockResolvedValue({
    user: {
      id: '1',
      email: 'supervisor@shamiri.org',
      name: 'Test Supervisor',
      role: 'supervisor'
    }
  })
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: {
      id: '1',
      email: 'supervisor@shamiri.org',
      name: 'Test Supervisor',
      role: 'supervisor'
    }
  }),
  AuthOptions: {}
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    meeting: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      count: vi.fn().mockResolvedValue(0)
    },
    meetingAnalysis: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({})
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({
        id: '1',
        email: 'supervisor@shamiri.org',
        name: 'Test Supervisor',
        password: 'hashedpassword',
        role: 'supervisor'
      }),
      findFirst: vi.fn().mockResolvedValue({
        id: '1',
        email: 'supervisor@shamiri.org',
        name: 'Test Supervisor',
        password: 'hashedpassword',
        role: 'supervisor'
      })
    },
    fellow: {
      findFirst: vi.fn().mockResolvedValue({
        id: 'fellow-1',
        name: 'John Doe',
        email: 'john@example.com',
        supervisorId: '1'
      }),
      findMany: vi.fn().mockResolvedValue([])
    }
  }
}));

vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({
    output: {
      summary: 'Test summary',
      contentCoverage: {
        score: 3,
        rating: 'Complete',
        justification: 'Well delivered'
      },
      facilitationQuality: {
        score: 2,
        rating: 'Adequate',
        justification: 'Standard delivery'
      },
      protocolSafety: {
        score: 3,
        rating: 'Adherent',
        justification: 'On protocol'
      },
      riskDetection: { status: 'SAFE', explanation: 'No risk detected' }
    }
  }),
  Output: {
    object: vi.fn().mockReturnValue({})
  }
}));

process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
