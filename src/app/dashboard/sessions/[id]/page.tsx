'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import {
  SessionInfoSkeleton,
  AnalysisCardSkeleton,
  TranscriptSkeleton,
  AIAnalysisLoader
} from '@/components/ui/loaders';
import { ProgressProvider } from '@/components/ui/progress-bar';
import { FellowRadarChart } from '@/components/dashboard/charts';
import useSWR from 'swr';
import { Toggle } from '@/components/ui/toggle';
import {
  Users,
  BarChart3,
  BookOpen,
  Target,
  Shield,
  ArrowLeft,
  Check,
  X,
  Download,
  AlertTriangle,
  Loader,
  CheckCircle,
  XCircle,
  Mic
} from 'lucide-react';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { Notifications } from '@/components/dashboard/notifications';
import { UserMenu } from '@/components/dashboard/user-menu';
import { useSession } from 'next-auth/react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

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
  icon: ReactNode;
  value: {
    score: number;
    rating: string;
    color: string;
  };
  justification: string;
  isRisk?: boolean;
}

export default function SessionDetailPage() {
  const { data: auth } = useSession();
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [notes, setNotes] = useState('');
  const [analysisStatus, setAnalysisStatus] = useState('');

  // Speech recognition
  const {
    interimTranscript,
    liveTranscript,
    isListening,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    'validate' | 'reject' | 'override' | null
  >(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');

  // Radar chart state
  const [showComparison, setShowComparison] = useState(true);

  // Fetch team statistics
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: statsData } = useSWR('/api/statistics', fetcher, {
    revalidateOnFocus: false
  });

  // Get fellow's other sessions
  const [fellowSessions, setFellowSessions] = useState<Session[]>([]);

  const fetchFellowSessions = useCallback(async () => {
    if (!session?.fellow?.email) return;
    try {
      const response = await fetch('/api/meetings');
      const data = await response.json();
      if (data.sessions) {
        const otherSessions = data.sessions
          .filter(
            (s: Session) =>
              s.fellow.email === session.fellow.email && s.id !== session.id
          )
          .slice(0, 5);
        setFellowSessions(otherSessions);
      }
    } catch (error) {
      console.error('Failed to fetch fellow sessions:', error);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchFellowSessions();
    }
  }, [session, fetchFellowSessions]);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/meetings/${params.id}`);
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

  const ANALYSIS_PROGRESS_MESSAGES = [
    'Analyzing transcript...',
    'Evaluating content coverage...',
    'Assessing facilitation quality...',
    'Checking protocol safety...',
    'Detecting risk indicators...',
    'Finalizing analysis...'
  ];

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisStatus(ANALYSIS_PROGRESS_MESSAGES[0]);

    let progressIndex = 0;
    const progressInterval = setInterval(() => {
      progressIndex++;
      if (progressIndex < ANALYSIS_PROGRESS_MESSAGES.length) {
        setAnalysisStatus(ANALYSIS_PROGRESS_MESSAGES[progressIndex]);
      }
    }, 2000);

    try {
      const response = await fetch(`/api/meetings/${params.id}`, {
        method: 'POST'
      });
      const data = await response.json();

      if (data.analysis) {
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
      clearInterval(progressInterval);
      setAnalyzing(false);
      setAnalysisStatus('');
    }
  };

  const validateAnalysis = async (
    analysisId: string,
    action: 'validate' | 'reject' | 'override'
  ) => {
    const statusMap = {
      validate: 'VALIDATED',
      reject: 'REJECTED',
      override: 'VALIDATED'
    } as const;

    const overrideRisk = action === 'override';

    try {
      const response = await fetch(`/api/meetings/${params.id}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysisId,
          supervisorStatus: statusMap[action],
          supervisorNotes: notes,
          overrideRisk
        })
      });
      const data = await response.json();

      if (data.analysis) {
        await fetchSession();

        // Show success toast
        if (action === 'validate') {
          toast.success('Analysis validated successfully');
        } else if (action === 'reject') {
          toast.success('Analysis rejected');
        } else if (action === 'override') {
          toast.success('Risk flag overridden - session marked as safe');
        }
      }
    } catch (error) {
      console.error('Validation failed:', error);
      toast.error('Failed to validate analysis. Please try again.');
    }
  };

  const handleValidateClick = (action: 'validate' | 'reject' | 'override') => {
    const config = {
      validate: {
        title: 'Validate Analysis',
        description:
          'Are you sure you want to validate this AI analysis? This will mark the session as reviewed and approved.',
        confirmLabel: 'Validate'
      },
      reject: {
        title: 'Reject Analysis',
        description:
          'Are you sure you want to reject this AI analysis? This will flag the session for further review.',
        confirmLabel: 'Reject'
      },
      override: {
        title: 'Override Risk Flag',
        description:
          'Are you sure you want to override the AI risk assessment? This will mark the session as safe despite the detected risk.',
        confirmLabel: 'Override'
      }
    };

    setConfirmAction(action);
    setConfirmTitle(config[action].title);
    setConfirmDescription(config[action].description);
    setConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction && latestAnalysis) {
      validateAnalysis(latestAnalysis.id, confirmAction);
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  if (!session && !loading) {
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

  const latestAnalysis = session?.analyses[0];
  const riskStatus = latestAnalysis?.riskDetection?.status;

  const analysisCards: AnalysisCard[] = [
    {
      title: 'Content Coverage',
      icon: <BookOpen className="w-5 h-5" />,
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
      icon: <Target className="w-5 h-5" />,
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
      icon: <Shield className="w-5 h-5" />,
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
      <ProgressProvider />
      <Toaster />
      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={
          confirmAction === 'reject'
            ? 'Reject'
            : confirmAction === 'override'
              ? 'Override'
              : 'Validate'
        }
        variant={confirmAction === 'reject' ? 'destructive' : 'default'}
        onConfirm={handleConfirmAction}
      />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="rounded-none"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="text-sm">
                <span className="font-medium">{session?.fellow.name}</span>
                <span className="text-gray-500"> • {session?.groupId}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Notifications />
              {auth?.user && <UserMenu user={auth.user} />}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {loading ? (
            <SessionInfoSkeleton />
          ) : session ? (
            <>
              <div className="flex items-center space-x-2 ml-auto w-fit">
                {/* <StatusBadge status={session?.status ?? 'Risk'} /> */}
                {latestAnalysis && (
                  <Badge
                    variant={
                      latestAnalysis.supervisorStatus === 'VALIDATED'
                        ? 'default'
                        : 'outline'
                    }
                    className={latestAnalysis.supervisorStatus ? '' : 'hidden'}
                  >
                    {latestAnalysis.supervisorStatus === 'VALIDATED' ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Validated
                      </>
                    ) : latestAnalysis.supervisorStatus === 'REJECTED' ? (
                      <>
                        <X className="w-3 h-3 mr-1" />
                        Rejected
                      </>
                    ) : (
                      'Pending Review'
                    )}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(`/api/export/${session?.id}`, '_blank')
                  }
                  className="rounded-none"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Session Information</CardTitle>
                  <CardDescription>
                    Therapy session conducted on{' '}
                    {new Date(session?.date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Fellow</p>
                      <p className="font-medium">{session?.fellow.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Group ID</p>
                      <p className="font-medium">{session?.groupId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div>
                        <StatusBadge status={session?.status} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}

          {riskStatus === 'RISK' && latestAnalysis?.riskDetection?.quote ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <AlertDescription className="text-red-800">
                <strong>RISK DETECTED</strong>
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
              <div className="flex flex-col items-end gap-1">
                {analyzing && analysisStatus && (
                  <span className="text-xs text-amber-600 animate-pulse">
                    {analysisStatus}
                  </span>
                )}
                <Button
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className="min-w-32 rounded-none"
                >
                  {analyzing ? (
                    <span className="flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </span>
                  ) : latestAnalysis ? (
                    'Re-analyze'
                  ) : (
                    'Analyze Session'
                  )}
                </Button>
              </div>
            </div>

            {analyzing ? (
              <AIAnalysisLoader />
            ) : latestAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysisCards.map(card => (
                  <AnalysisCard card={card} key={card.title} />
                ))}
              </div>
            ) : loading ? (
              <AnalysisCardSkeleton />
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

          {/* Radar Chart and Fellow Sessions - 2 Column Layout */}
          {session && latestAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Radar Chart */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Fellow Performance</CardTitle>
                      <CardDescription>
                        {session.fellow.name}&apos;s metrics overview
                      </CardDescription>
                    </div>
                    <Toggle
                      pressed={showComparison}
                      onPressedChange={setShowComparison}
                      aria-label="Toggle comparison view"
                      className="rounded-none"
                    >
                      {showComparison ? (
                        <BarChart3 className="h-4 w-4" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                    </Toggle>
                  </div>
                </CardHeader>
                <CardContent>
                  <FellowRadarChart
                    data={{
                      fellowName: session.fellow.name,
                      contentCoverage:
                        (latestAnalysis.contentCoverage as any)?.score || 0,
                      facilitationQuality:
                        (latestAnalysis.facilitationQuality as any)?.score || 0,
                      protocolSafety:
                        (latestAnalysis.protocolSafety as any)?.score || 0,
                      sessionCount: fellowSessions.length + 1,
                      riskRate:
                        (fellowSessions.filter(s => {
                          const analysis = s.analyses[0];
                          return (
                            analysis?.riskDetection &&
                            (analysis.riskDetection as any).status === 'RISK'
                          );
                        }).length /
                          (fellowSessions.length + 1)) *
                        100,
                      validationRate:
                        (fellowSessions.filter(s => {
                          const analysis = s.analyses[0];
                          return analysis?.supervisorStatus === 'VALIDATED';
                        }).length /
                          (fellowSessions.length + 1)) *
                        100
                    }}
                    teamAverages={
                      showComparison
                        ? {
                            fellowName: 'Team Average',
                            contentCoverage:
                              statsData?.teamAverages?.contentCoverage || 0,
                            facilitationQuality:
                              statsData?.teamAverages?.facilitationQuality || 0,
                            protocolSafety:
                              statsData?.teamAverages?.protocolSafety || 0,
                            sessionCount:
                              statsData?.summary?.totalSessions || 0,
                            riskRate: statsData?.summary?.riskCount
                              ? (statsData.summary.riskCount /
                                  statsData.summary.totalSessions) *
                                100
                              : 0,
                            validationRate: 0
                          }
                        : undefined
                    }
                  />
                </CardContent>
              </Card>

              {/* Fellow's Other Sessions */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Other Sessions</CardTitle>
                  <CardDescription>
                    Recent sessions by {session.fellow.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fellowSessions.length > 0 ? (
                    <div className="space-y-2">
                      {fellowSessions.map(s => (
                        <Link
                          key={s.id}
                          href={`/dashboard/sessions/${s.id}`}
                          className="block"
                        >
                          <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 border transition-colors">
                            <div className="text-sm">
                              <p className="font-medium">
                                {new Date(s.date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {s.groupId}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={s.status} />
                              {s.analyses[0]?.riskDetection &&
                                (s.analyses[0].riskDetection as any).status ===
                                  'RISK' && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Risk
                                  </Badge>
                                )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No other sessions found
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
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
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 mr-auto">
                      Supervisor Notes (optional)
                    </label>
                    {speechSupported && (
                      <>
                        <Button
                          type="button"
                          variant={isListening ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={isListening ? stopListening : startListening}
                          className={isListening ? 'animate-pulse' : ''}
                        >
                          <Mic
                            className={`w-4 h-4 mr-1 ${isListening ? 'animate-pulse' : ''}`}
                          />
                          {isListening ? 'Recording...' : 'Voice'}
                        </Button>
                        {!isListening &&
                          liveTranscript &&
                          latestAnalysis?.supervisorStatus !== 'VALIDATED' &&
                          latestAnalysis?.supervisorStatus !== 'REJECTED' && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNotes(
                                  notes + (notes ? ' ' : '') + liveTranscript
                                );
                                resetTranscript();
                              }}
                              className="ml-2"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Add to Notes
                            </Button>
                          )}
                      </>
                    )}
                  </div>
                  <div className="relative">
                    <textarea
                      placeholder="Add notes about this analysis or session?..."
                      value={
                        notes +
                        (liveTranscript ? ' ' + liveTranscript : '') +
                        (interimTranscript ? ' ' + interimTranscript : '')
                      }
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setNotes(e.target.value)
                      }
                      className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                    />
                    {isListening && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1">
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-xs text-red-500 font-medium">
                          Listening...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => handleValidateClick('validate')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Validate Analysis
                  </Button>
                  <Button
                    onClick={() => handleValidateClick('reject')}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    size="lg"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject Analysis
                  </Button>
                  {riskStatus === 'RISK' && (
                    <Button
                      onClick={() => handleValidateClick('override')}
                      variant="outline"
                      className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                      size="lg"
                    >
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Mark as Safe (Override)
                    </Button>
                  )}
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
          {loading ? (
            <TranscriptSkeleton />
          ) : session ? (
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
                    {session?.transcript}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : null}
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
          <CardTitle className="text-lg flex items-center gap-2">
            {card.icon}
            {card.title}
          </CardTitle>
          <div className={`text-2xl font-bold ${card.value.color}`}>
            {card.value.score}
          </div>
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
