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
  Mic,
  Upload,
  FileText
} from 'lucide-react';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { Notifications } from '@/components/dashboard/notifications';
import { UserMenu } from '@/components/dashboard/user-menu';
import { TranscriptUploadDialog } from '@/components/dashboard/transcript-upload-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
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
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [jobStatus, setJobStatus] = useState<
    'idle' | 'queued' | 'processing' | 'completed' | 'failed'
  >('idle');
  const [notes, setNotes] = useState('');

  // Speech recognition
  const {
    interimTranscript,
    currentSegment,
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

  // Transcript upload dialog state
  const [transcriptDialogOpen, setTranscriptDialogOpen] = useState(false);

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
    'Evaluating content coverage...',
    'Assessing facilitation quality...',
    'Checking protocol safety...',
    'Detecting risk indicators...',
    'Finalizing analysis...'
  ];

  const runAnalysis = async () => {
    setAnalyzing(true);
    setJobStatus('queued');
    setAnalysisStatus('Analysis queued...');

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

      if (data.status === 'queued') {
        setJobStatus('processing');

        // Poll for job completion
        await pollForAnalysis();
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setJobStatus('failed');
      setAnalysisStatus('');
      toast.error(
        'Analysis failed. Please check your AI provider configuration.'
      );
    } finally {
      clearInterval(progressInterval);
      setAnalyzing(false);
    }
  };

  const pollForAnalysis = async () => {
    const maxAttempts = 60; // Poll for up to 60 seconds
    let attempts = 0;

    const poll = async () => {
      attempts++;

      try {
        const response = await fetch(`/api/meetings/${params.id}`);
        const data = await response.json();

        if (data.session) {
          const hasNewAnalysis =
            session && data.session.analyses.length > session.analyses.length;

          if (hasNewAnalysis || data.session.status === 'PROCESSED') {
            // New analysis completed
            setSession(data.session);
            setJobStatus('completed');
            setAnalysisStatus('');
            toast.success('Analysis completed!');
            return true;
          }

          // Check if meeting status indicates processing
          if (data.session.status === 'PROCESSING') {
            setJobStatus('processing');
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }

      return false;
    };

    // Initial wait before polling
    await new Promise(resolve => setTimeout(resolve, 3000));

    while (attempts < maxAttempts) {
      const completed = await poll();
      if (completed) break;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (attempts >= maxAttempts) {
      setJobStatus('failed');
      setAnalysisStatus('');
      toast.error('Analysis timed out. Please try again.');
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

  const handleTranscriptDownload = async () => {
    if (!session?.transcript) return;

    try {
      const response = await fetch(`/api/meetings/${session.id}/download-url`);

      if (response.ok) {
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('text/plain')) {
          const text = await response.text();
          const blob = new Blob([text], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `transcript-${session.id}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          const { url } = await response.json();
          window.open(url, '_blank');
        }
      } else if (response.status === 410) {
        toast.error('Transcript file not found. Please re-upload.');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download transcript');
      }
    } catch (error) {
      console.error('Failed to download transcript:', error);
      toast.error('Failed to download transcript. Please try again.');
    }
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
    <TooltipProvider>
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
        <TranscriptUploadDialog
          open={transcriptDialogOpen}
          onOpenChange={setTranscriptDialogOpen}
          sessionId={params.id as string}
          existingTranscript={session?.transcript}
          onSuccess={newTranscript => {
            setSession(prev =>
              prev
                ? {
                    ...prev,
                    transcript: newTranscript,
                    analyses: []
                  }
                : null
            );
            toast.info('Transcript updated. Please re-analyze the session.');
          }}
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
                      className={
                        latestAnalysis.supervisorStatus ? '' : 'hidden'
                      }
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
                    onClick={() => setTranscriptDialogOpen(true)}
                    className="rounded-none"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {session?.transcript
                      ? 'Update Transcript'
                      : 'Add Transcript'}
                  </Button>
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <StatusBadge status={session?.status} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Transcript</p>
                        {session?.transcript ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={handleTranscriptDownload}
                                className="flex items-center gap-1 text-blue-600 hover:underline font-medium cursor-pointer"
                              >
                                <FileText className="w-4 h-4" />
                                Transcript
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Click to download transcript</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1 text-amber-600 font-medium cursor-help">
                                <AlertTriangle className="w-4 h-4" />
                                Missing
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>No transcript uploaded for this session</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
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
                    disabled={analyzing || loading || !session?.transcript}
                    className="min-w-32 rounded-none"
                  >
                    {analyzing ? (
                      <span className="flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        {jobStatus === 'queued'
                          ? 'Queued...'
                          : jobStatus === 'processing'
                            ? 'Analyzing...'
                            : 'Processing...'}
                      </span>
                    ) : latestAnalysis ? (
                      'Re-analyze'
                    ) : (
                      'Analyze Session'
                    )}
                  </Button>
                </div>
              </div>

              {analysisStatus && analyzing && (
                <div className="mb-4">
                  <p className="text-sm text-amber-600 animate-pulse">
                    {analysisStatus}
                  </p>
                </div>
              )}

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
                          (latestAnalysis.facilitationQuality as any)?.score ||
                          0,
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
                                statsData?.teamAverages?.facilitationQuality ||
                                0,
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
                            <div className="flex items-center justify-between p-2 rounded-none hover:bg-gray-50 border transition-colors">
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
                                  (s.analyses[0].riskDetection as any)
                                    .status === 'RISK' && (
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
                            onClick={
                              isListening ? stopListening : startListening
                            }
                            className={
                              isListening
                                ? 'animate-pulse rounded-none'
                                : 'rounded-none'
                            }
                          >
                            <Mic
                              className={`w-4 h-4 mr-1 ${isListening ? 'animate-pulse' : ''}`}
                            />
                            {isListening ? 'Recording...' : 'Voice'}
                          </Button>
                          {currentSegment &&
                            latestAnalysis?.supervisorStatus !== 'VALIDATED' &&
                            latestAnalysis?.supervisorStatus !== 'REJECTED' && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const loadingToast = toast.loading(
                                    'Saving notes...',
                                    { duration: Infinity }
                                  );
                                  const transcriptToAdd = currentSegment;
                                  const updatedNotes =
                                    notes +
                                    (notes ? ' ' : '') +
                                    transcriptToAdd;

                                  try {
                                    const response = await fetch(
                                      `/api/meetings/${params.id}/notes`,
                                      {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                          notes: updatedNotes
                                        })
                                      }
                                    );

                                    toast.dismiss(loadingToast);

                                    if (response.ok) {
                                      setNotes(updatedNotes);
                                      resetTranscript();
                                      toast.success('Notes saved');
                                    } else {
                                      toast.error('Failed to save notes');
                                    }
                                  } catch (error) {
                                    console.error(
                                      'Failed to save notes:',
                                      error
                                    );
                                    toast.error('Failed to save notes');
                                  }
                                }}
                                className="ml-2 rounded-none"
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
                          isListening
                            ? interimTranscript || currentSegment || ''
                            : currentSegment || notes
                        }
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setNotes(e.target.value)
                        }
                        className="flex min-h-20 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="rounded-none flex-1 bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Validate Analysis
                    </Button>
                    <Button
                      onClick={() => handleValidateClick('reject')}
                      variant="outline"
                      className="rounded-none flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      size="lg"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject Analysis
                    </Button>
                    {riskStatus === 'RISK' && (
                      <Button
                        onClick={() => handleValidateClick('override')}
                        variant="outline"
                        className="rounded-none flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
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
          </div>
        </main>
      </div>
    </TooltipProvider>
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
