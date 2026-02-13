'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import { ScrollArea } from '@/components/ui/scroll-area';

interface Session {
  id: string;
  groupId: string;
  date: string;
  status: string;
  transcript: string;
  fellow: {
    name: string;
    email: string;
  };
  analyses: Array<{
    id: string;
    summary: string;
    contentCoverage: Record<string, unknown>;
    facilitationQuality: Record<string, unknown>;
    protocolSafety: Record<string, unknown>;
    riskDetection: Record<string, unknown>;
    supervisorStatus: string | null;
    supervisorNotes: string | null;
    createdAt: string;
  }>;
}

interface AnalysisCard {
  title: string;
  icon: string;
  value: {
    score: number;
    rating: string;
    color: string;
  };
  justification: string;
  isRisk?: boolean;
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`);
      const data = await response.json();
      setSession(data.session);
    } catch (error) {
      console.error('Failed to fetch session:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchSession();
    }
  }, [params.id, fetchSession]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch(`/api/sessions/${params.id}`, {
        method: 'POST'
      });
      const data = await response.json();

      if (data.analysis) {
        // Update session with new analysis
        setSession(prev =>
          prev
            ? {
                ...prev,
                analyses: [data.analysis, ...prev.analyses]
              }
            : null
        );
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please check your AI provider configuration.');
    } finally {
      setAnalyzing(false);
    }
  };

  const validateAnalysis = async (analysisId: string, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/sessions/${params.id}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysisId,
          supervisorStatus: isApproved ? 'VALIDATED' : 'REJECTED'
        })
      });
      const data = await response.json();

      if (data.session) {
        setSession(data.session);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Session Not Found</h2>
            <p className="text-gray-600 mb-4">
              The session you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="rounded-none"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestAnalysis = session.analyses[0];
  const riskStatus = latestAnalysis?.riskDetection?.status;

  const analysisCards: AnalysisCard[] = [
    {
      title: 'Content Coverage',
      icon: '📚',
      value: {
        score: (latestAnalysis?.contentCoverage as any)?.score || 0,
        rating: (latestAnalysis?.contentCoverage as any)?.rating || 'Not Rated',
        color: riskStatus === 'RISK' ? 'text-red-600' : 'text-green-600'
      },
      justification:
        (latestAnalysis?.contentCoverage as any)?.justification ||
        'No analysis available',
      isRisk:
        riskStatus === 'RISK' &&
        (latestAnalysis?.contentCoverage as any)?.score <= 1
    },
    {
      title: 'Facilitation Quality',
      icon: '🎯',
      value: {
        score: (latestAnalysis?.facilitationQuality as any)?.score || 0,
        rating:
          (latestAnalysis?.facilitationQuality as any)?.rating || 'Not Rated',
        color: riskStatus === 'RISK' ? 'text-red-600' : 'text-green-600'
      },
      justification:
        (latestAnalysis?.facilitationQuality as any)?.justification ||
        'No analysis available',
      isRisk:
        riskStatus === 'RISK' &&
        (latestAnalysis?.facilitationQuality as any)?.score <= 1
    },
    {
      title: 'Protocol Safety',
      icon: '🛡️',
      value: {
        score: (latestAnalysis?.protocolSafety as any)?.score || 0,
        rating: (latestAnalysis?.protocolSafety as any)?.rating || 'Not Rated',
        color: riskStatus === 'RISK' ? 'text-red-600' : 'text-green-600'
      },
      justification:
        (latestAnalysis?.protocolSafety as any)?.justification ||
        'No analysis available',
      isRisk:
        riskStatus === 'RISK' &&
        (latestAnalysis?.protocolSafety as any)?.score <= 1
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="rounded-none"
              >
                ← Back to Dashboard
              </Button>
              <div className="text-sm">
                <span className="font-medium">{session.fellow.name}</span>
                <span className="text-gray-500"> • {session.groupId}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={session.status} />
              {latestAnalysis && (
                <Badge
                  variant={
                    latestAnalysis.supervisorStatus === 'VALIDATED'
                      ? 'default'
                      : 'outline'
                  }
                  className={latestAnalysis.supervisorStatus ? '' : 'hidden'}
                >
                  {latestAnalysis.supervisorStatus === 'VALIDATED'
                    ? '✓ Validated'
                    : latestAnalysis.supervisorStatus === 'REJECTED'
                      ? '✗ Rejected'
                      : 'Pending Review'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>
                Therapy session conducted on{' '}
                {new Date(session.date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fellow</p>
                  <p className="font-medium">{session.fellow.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Group ID</p>
                  <p className="font-medium">{session.groupId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div>
                    <StatusBadge status={session.status} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {riskStatus === 'RISK' && latestAnalysis?.riskDetection?.quote ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                <strong>⚠️ RISK DETECTED</strong>
                <p className="mt-2">
                  <strong>Concerning Quote:</strong> &quot;
                  {latestAnalysis.riskDetection as any}&quot;quote&quot;
                </p>
                <p className="mt-2">
                  <strong>Explanation:</strong>{' '}
                  {(latestAnalysis.riskDetection as any).explanation}
                </p>
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">AI Analysis Results</h2>
              <Button
                onClick={runAnalysis}
                disabled={analyzing}
                className="min-w-32 rounded-none"
              >
                {analyzing
                  ? 'Analyzing...'
                  : latestAnalysis
                    ? 'Re-analyze'
                    : 'Analyze Session'}
              </Button>
            </div>

            {latestAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysisCards.map(card => (
                  <AnalysisCard card={card} key={card.title} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-600 mb-4">
                    No AI analysis available for this session yet.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Click &quot;Analyze Session&quot; to generate AI-powered
                    insights from the transcript.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Session Summary */}
          {latestAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Session Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {latestAnalysis.summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Human Review Actions */}
          {latestAnalysis && !latestAnalysis.supervisorStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Supervisor Review</CardTitle>
                <CardDescription>
                  Validate or reject the AI analysis findings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => validateAnalysis(latestAnalysis.id, true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    ✅ Validate Analysis
                  </Button>
                  <Button
                    onClick={() => validateAnalysis(latestAnalysis.id, false)}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    size="lg"
                  >
                    ✗ Reject Analysis
                  </Button>
                </div>
                {latestAnalysis.supervisorNotes && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Supervisor Notes:</strong>{' '}
                      {latestAnalysis.supervisorNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Full Transcript */}
          <Card>
            <CardHeader>
              <CardTitle>Session Transcript</CardTitle>
              <CardDescription>
                Full conversation from the therapy session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full border p-4">
                <div className="text-sm font-mono whitespace-pre-wrap">
                  {session.transcript}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'PENDING':
      return <Badge variant="secondary">Pending</Badge>;
    case 'PROCESSED':
      return <Badge variant="default">Processed</Badge>;
    case 'FLAGGED_FOR_REVIEW':
      return <Badge variant="destructive">Flagged for Review</Badge>;
    case 'SAFE':
      return <Badge variant="default">Safe</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function AnalysisCard({ card }: { card: AnalysisCard }) {
  return (
    <Card className={`${card.isRisk ? 'border-red-200' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{card.title}</CardTitle>
          <div className={`text-2xl ${card.icon}`}>{card.value.score}</div>
        </div>
        <Badge
          variant={card.isRisk ? 'destructive' : 'outline'}
          className="mb-2"
        >
          {card.value.rating}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">{card.justification}</p>
      </CardContent>
    </Card>
  );
}
