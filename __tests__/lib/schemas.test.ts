import { describe, it, expect } from 'vitest';
import { sessionAnalysisSchema } from '@/lib/schemas';

describe('sessionAnalysisSchema', () => {
  describe('Valid cases', () => {
    it('accepts valid analysis with all scores at minimum (1)', () => {
      const validAnalysis = {
        summary: 'Test summary',
        contentCoverage: { score: 1, rating: 'Missed', justification: 'Did not cover content' },
        facilitationQuality: { score: 1, rating: 'Poor', justification: 'Poor delivery' },
        protocolSafety: { score: 1, rating: 'Violation', justification: 'Protocol violation' },
        riskDetection: { status: 'SAFE', explanation: 'No risk detected' }
      };

      expect(() => sessionAnalysisSchema.parse(validAnalysis)).not.toThrow();
    });

    it('accepts valid analysis with all scores at maximum (3)', () => {
      const validAnalysis = {
        summary: 'Test summary',
        contentCoverage: { score: 3, rating: 'Complete', justification: 'Fully covered content' },
        facilitationQuality: { score: 3, rating: 'Excellent', justification: 'Excellent delivery' },
        protocolSafety: { score: 3, rating: 'Adherent', justification: 'Fully adherent' },
        riskDetection: { status: 'SAFE', explanation: 'No risk detected' }
      };

      expect(() => sessionAnalysisSchema.parse(validAnalysis)).not.toThrow();
    });

    it('accepts valid analysis with middle scores (2)', () => {
      const validAnalysis = {
        summary: 'Test summary',
        contentCoverage: { score: 2, rating: 'Partial', justification: 'Partially covered' },
        facilitationQuality: { score: 2, rating: 'Adequate', justification: 'Adequate delivery' },
        protocolSafety: { score: 2, rating: 'Minor Drift', justification: 'Minor drift' },
        riskDetection: { status: 'SAFE', explanation: 'No risk detected' }
      };

      expect(() => sessionAnalysisSchema.parse(validAnalysis)).not.toThrow();
    });

    it('accepts RISK status with quote', () => {
      const validAnalysis = {
        summary: 'Test summary',
        contentCoverage: { score: 3, rating: 'Complete', justification: 'Fully covered' },
        facilitationQuality: { score: 3, rating: 'Excellent', justification: 'Excellent' },
        protocolSafety: { score: 3, rating: 'Adherent', justification: 'Adherent' },
        riskDetection: { status: 'RISK', quote: 'I want to hurt myself', explanation: 'Risk detected' }
      };

      expect(() => sessionAnalysisSchema.parse(validAnalysis)).not.toThrow();
    });
  });

  describe('Score Validation - contentCoverage.score', () => {
    it('rejects score of 0 (below minimum)', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 0, rating: 'Missed', justification: 'test' },
        facilitationQuality: { score: 2, rating: 'Adequate', justification: 'test' },
        protocolSafety: { score: 2, rating: 'Minor Drift', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('rejects score of 4 (above maximum) - THIS CATCHES THE CURRENT BUG', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 4, rating: 'Complete', justification: 'test' },
        facilitationQuality: { score: 2, rating: 'Adequate', justification: 'test' },
        protocolSafety: { score: 2, rating: 'Minor Drift', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('rejects score of 5 (above maximum)', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 5, rating: 'Complete', justification: 'test' },
        facilitationQuality: { score: 2, rating: 'Adequate', justification: 'test' },
        protocolSafety: { score: 2, rating: 'Minor Drift', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });
  });

  describe('Score Validation - facilitationQuality.score', () => {
    it('rejects score of 0 (below minimum)', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 2, rating: 'Partial', justification: 'test' },
        facilitationQuality: { score: 0, rating: 'Poor', justification: 'test' },
        protocolSafety: { score: 2, rating: 'Minor Drift', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('rejects score of 4 (above maximum)', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 2, rating: 'Partial', justification: 'test' },
        facilitationQuality: { score: 4, rating: 'Excellent', justification: 'test' },
        protocolSafety: { score: 2, rating: 'Minor Drift', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('rejects score of 5 (above maximum)', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 2, rating: 'Partial', justification: 'test' },
        facilitationQuality: { score: 5, rating: 'Excellent', justification: 'test' },
        protocolSafety: { score: 2, rating: 'Minor Drift', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });
  });

  describe('Score Validation - protocolSafety.score', () => {
    it('rejects score of 0 (below minimum)', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 2, rating: 'Partial', justification: 'test' },
        facilitationQuality: { score: 2, rating: 'Adequate', justification: 'test' },
        protocolSafety: { score: 0, rating: 'Violation', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('rejects score of 4 (above maximum)', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 2, rating: 'Partial', justification: 'test' },
        facilitationQuality: { score: 2, rating: 'Adequate', justification: 'test' },
        protocolSafety: { score: 4, rating: 'Adherent', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('rejects score of 5 (above maximum)', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 2, rating: 'Partial', justification: 'test' },
        facilitationQuality: { score: 2, rating: 'Adequate', justification: 'test' },
        protocolSafety: { score: 5, rating: 'Adherent', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });
  });

  describe('Enum Validation', () => {
    it('rejects invalid contentCoverage rating', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 3, rating: 'Invalid', justification: 'test' },
        facilitationQuality: { score: 2, rating: 'Adequate', justification: 'test' },
        protocolSafety: { score: 2, rating: 'Minor Drift', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('rejects invalid facilitationQuality rating', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 3, rating: 'Complete', justification: 'test' },
        facilitationQuality: { score: 2, rating: 'Invalid', justification: 'test' },
        protocolSafety: { score: 2, rating: 'Minor Drift', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('rejects invalid protocolSafety rating', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 3, rating: 'Complete', justification: 'test' },
        facilitationQuality: { score: 2, rating: 'Adequate', justification: 'test' },
        protocolSafety: { score: 2, rating: 'Invalid', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('rejects invalid riskDetection status', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 3, rating: 'Complete', justification: 'test' },
        facilitationQuality: { score: 2, rating: 'Adequate', justification: 'test' },
        protocolSafety: { score: 2, rating: 'Minor Drift', justification: 'test' },
        riskDetection: { status: 'INVALID', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });
  });

  describe('Required Fields', () => {
    it('rejects missing summary', () => {
      const invalidAnalysis = {
        contentCoverage: { score: 3, rating: 'Complete', justification: 'test' },
        facilitationQuality: { score: 2, rating: 'Adequate', justification: 'test' },
        protocolSafety: { score: 2, rating: 'Minor Drift', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('rejects missing contentCoverage', () => {
      const invalidAnalysis = {
        summary: 'Test',
        facilitationQuality: { score: 2, rating: 'Adequate', justification: 'test' },
        protocolSafety: { score: 2, rating: 'Minor Drift', justification: 'test' },
        riskDetection: { status: 'SAFE', explanation: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('rejects missing riskDetection', () => {
      const invalidAnalysis = {
        summary: 'Test',
        contentCoverage: { score: 3, rating: 'Complete', justification: 'test' },
        facilitationQuality: { score: 2, rating: 'Adequate', justification: 'test' },
        protocolSafety: { score: 2, rating: 'Minor Drift', justification: 'test' }
      };

      expect(() => sessionAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });
  });
});
