'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Fellow, Meeting, MeetingAnalysis } from '@/generated/prisma';
import type { JsonObject } from '@/generated/prisma/runtime/client';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { Pagination } from '@/components/ui/pagination';
import {
  StatsCardSkeleton,
  TableSkeleton,
  FilterBarSkeleton,
  AnalyticsSkeleton
} from '@/components/ui/loaders';
import { ProgressProvider } from '@/components/ui/progress-bar';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { Notifications } from '@/components/dashboard/notifications';
import { UserMenu } from '@/components/dashboard/user-menu';
import {
  PerformanceBarChart,
  RiskTrendChart,
  SessionStatusPie,
  WeeklyVolumeChart,
  RiskBreakdownChart
} from '@/components/dashboard/charts';
import useSWR from 'swr';
import { Toggle } from '@/components/ui/toggle';
import { BarChart3, List, TrendingUp, PieChart } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

type Analysis = Pick<
  MeetingAnalysis,
  | 'id'
  | 'createdAt'
  | 'riskDetection'
  | 'supervisorStatus'
  | 'contentCoverage'
  | 'facilitationQuality'
  | 'protocolSafety'
>;

interface MeetingWithRelation extends Meeting {
  analyses: Array<Analysis>;
  fellow: Pick<Fellow, 'id' | 'name' | 'email'>;
}

interface FellowStats {
  name: string;
  totalSessions: number;
  avgContentCoverage: number;
  avgFacilitationQuality: number;
  avgProtocolSafety: number;
  riskCount: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [allSessions, setAllSessions] = useState<MeetingWithRelation[]>([]);
  const [fellows, setFellows] = useState<Array<{ id: string; name: string }>>(
    []
  );

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedFellows, setSelectedFellows] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Chart/List toggle states with localStorage persistence
  const [showPerformanceChart, setShowPerformanceChart] = useLocalStorage(
    'dashboard-showPerformanceChart',
    true
  );
  const [showRiskChart, setShowRiskChart] = useLocalStorage(
    'dashboard-showRiskChart',
    true
  );
  const [showStatusChart, setShowStatusChart] = useLocalStorage(
    'dashboard-showStatusChart',
    true
  );

  // Real-time data fetching with SWR
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const {
    data: swrData,
    error: swrError,
    isLoading: swrLoading
  } = useSWR('/api/meetings', fetcher, {
    refreshInterval: 30000, // Poll every 30 seconds
    revalidateOnFocus: true,
    dedupingInterval: 5000
  });

  // Update sessions when SWR data changes
  useEffect(() => {
    if (swrData?.sessions) {
      setAllSessions(swrData.sessions);
    }
  }, [swrData]);

  // Set loading state based on SWR
  useEffect(() => {
    setLoading(swrLoading);
  }, [swrLoading]);

  async function fetchSessions() {
    const loadingToast = toast.loading('Retrieving latest sessions...', {
      duration: Infinity
    });

    try {
      const response = await fetch('/api/meetings');

      if (response.ok) {
        const result = await response.json();
        toast.success('Loaded sessions successfully');
        return result?.sessions;
      } else {
        const error = await response.text();
        toast.error(error);
      }
    } catch (error) {
      console.error('Sessions fetch error:', error);
      toast.error('Failed to fetch sessions: ' + (error as Error).message);
    } finally {
      toast.dismiss(loadingToast);
    }
  }

  // Extract unique fellows from sessions
  useEffect(() => {
    const uniqueFellows = Array.from(
      new Map(
        allSessions.map(s => [
          s.fellow.id,
          { id: s.fellow.id, name: s.fellow.name }
        ])
      ).values()
    );
    setFellows(uniqueFellows);
  }, [allSessions]);

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let result = [...allSessions];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        s =>
          s.transcript.toLowerCase().includes(query) ||
          s.groupId.toLowerCase().includes(query) ||
          s.fellow.name.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (selectedStatuses.length > 0) {
      result = result.filter(s => {
        const riskStatus = (s.analyses[0]?.riskDetection as JsonObject)?.status;
        if (selectedStatuses.includes('RISK') && riskStatus === 'RISK')
          return true;
        if (
          selectedStatuses.includes('SAFE') &&
          riskStatus === 'SAFE' &&
          s.status === 'PROCESSED'
        )
          return true;
        if (selectedStatuses.includes(s.status)) return true;
        return false;
      });
    }

    // Filter by fellow
    if (selectedFellows.length > 0) {
      result = result.filter(s => selectedFellows.includes(s.fellow.id));
    }

    // Filter by date range
    if (dateRange.start) {
      result = result.filter(
        s => new Date(s.date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      result = result.filter(s => new Date(s.date) <= new Date(dateRange.end));
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'fellow':
          comparison = a.fellow.name.localeCompare(b.fellow.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [
    allSessions,
    searchQuery,
    selectedStatuses,
    selectedFellows,
    dateRange,
    sortBy,
    sortOrder
  ]);

  // Paginate
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSessions.slice(start, start + itemsPerPage);
  }, [filteredSessions, currentPage]);

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedStatuses,
    selectedFellows,
    dateRange,
    sortBy,
    sortOrder
  ]);

  // Compute stats
  const stats = useMemo(() => {
    return {
      total: allSessions.length,
      processed: allSessions.filter(
        s => s.status === 'PROCESSED' || s.analyses.length > 0
      ).length,
      risks: allSessions.filter(
        s => (s.analyses[0]?.riskDetection as JsonObject)?.status === 'RISK'
      ).length
    };
  }, [allSessions]);

  // Compute status distribution for pie chart
  const statusDistribution = useMemo(() => {
    return {
      PENDING: allSessions.filter(s => s.status === 'PENDING').length,
      PROCESSED: allSessions.filter(s => s.status === 'PROCESSED').length,
      SAFE: allSessions.filter(s => s.status === 'SAFE').length,
      FLAGGED_FOR_REVIEW: allSessions.filter(
        s => s.status === 'FLAGGED_FOR_REVIEW'
      ).length
    };
  }, [allSessions]);

  // Compute fellow performance stats
  const fellowStats = useMemo((): FellowStats[] => {
    const fellowMap = new Map<string, FellowStats>();

    allSessions.forEach(s => {
      const analysis = s.analyses[0];
      const riskStatus = (analysis?.riskDetection as JsonObject)?.status;

      if (!fellowMap.has(s.fellow.id)) {
        fellowMap.set(s.fellow.id, {
          name: s.fellow.name,
          totalSessions: 0,
          avgContentCoverage: 0,
          avgFacilitationQuality: 0,
          avgProtocolSafety: 0,
          riskCount: 0
        });
      }

      const stats = fellowMap.get(s.fellow.id)!;
      stats.totalSessions++;

      if (analysis) {
        const cc = analysis.contentCoverage as JsonObject;
        const fq = analysis.facilitationQuality as JsonObject;
        const ps = analysis.protocolSafety as JsonObject;

        stats.avgContentCoverage += (cc?.score as number) || 0;
        stats.avgFacilitationQuality += (fq?.score as number) || 0;
        stats.avgProtocolSafety += (ps?.score as number) || 0;
      }

      if (riskStatus === 'RISK') {
        stats.riskCount++;
      }
    });

    return Array.from(fellowMap.values()).map(f => ({
      ...f,
      avgContentCoverage:
        f.totalSessions > 0 ? f.avgContentCoverage / f.totalSessions : 0,
      avgFacilitationQuality:
        f.totalSessions > 0 ? f.avgFacilitationQuality / f.totalSessions : 0,
      avgProtocolSafety:
        f.totalSessions > 0 ? f.avgProtocolSafety / f.totalSessions : 0
    }));
  }, [allSessions]);

  // Risk trend data (last 30 days)
  const riskTrend = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyRisk = new Map<string, number>();

    allSessions
      .filter(s => new Date(s.date) >= thirtyDaysAgo)
      .forEach(s => {
        const dateKey = new Date(s.date).toISOString().split('T')[0];
        const riskStatus = (s.analyses[0]?.riskDetection as JsonObject)?.status;
        if (riskStatus === 'RISK') {
          dailyRisk.set(dateKey, (dailyRisk.get(dateKey) || 0) + 1);
        }
      });

    return Array.from(dailyRisk.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allSessions]);

  // Initial load handled by SWR - no need for separate useEffect
  // SWR handles: refreshInterval: 30000, revalidateOnFocus: true

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSED', label: 'Processed' },
    { value: 'SAFE', label: 'Safe' },
    { value: 'RISK', label: 'Risk' },
    { value: 'FLAGGED_FOR_REVIEW', label: 'Flagged for Review' }
  ];

  const fellowOptions = fellows.map(f => ({ value: f.id, label: f.name }));

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressProvider />
      <Toaster />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-lg font-bold tracking-tighter uppercase font-mono">
              SHAMIRI /// COPILOT
            </h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Notifications />
              {session?.user && <UserMenu user={session.user} />}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Shamiri Supervisor Dashboard
          </h2>
          <p className="text-gray-600">
            Review and analyze therapy sessions conducted by your Fellows.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {loading ? (
            <>
              <StatsCardSkeleton delay={0} />
              <StatsCardSkeleton delay={100} />
              <StatsCardSkeleton delay={200} />
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Session Management</CardTitle>
                  <CardDescription>
                    View and analyze therapy sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.total}
                  </p>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Analysis</CardTitle>
                  <CardDescription>AI-powered session insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.processed}
                  </p>
                  <p className="text-sm text-gray-600">Completed Analyses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Alerts</CardTitle>
                  <CardDescription>
                    Sessions requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.risks}
                  </p>
                  <p className="text-sm text-gray-600">Flagged Sessions</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Analytics Section */}
        {loading ? (
          <div className="mb-8">
            <AnalyticsSkeleton />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Charts Row */}
            {(fellowStats.length > 0 || riskTrend.length > 0) && (
              <div className="grid gap-6 grid-cols-1 mb-8">
                <div className="grid gap-6 grid-cols-2">
                  {riskTrend.length > 0 && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Risk Trend</CardTitle>
                            <CardDescription>
                              Risks detected over time
                            </CardDescription>
                          </div>
                          <Toggle
                            pressed={showRiskChart}
                            onPressedChange={setShowRiskChart}
                            aria-label="Toggle chart view"
                            className="rounded-none"
                          >
                            {showRiskChart ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <List className="h-4 w-4" />
                            )}
                          </Toggle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {showRiskChart ? (
                          <RiskTrendChart data={riskTrend} />
                        ) : (
                          <div className="space-y-2">
                            {riskTrend.slice(-7).map(t => (
                              <div
                                key={t.date}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm text-gray-600">
                                  {new Date(t.date).toLocaleDateString()}
                                </span>
                                <Badge variant="destructive">
                                  {t.count} risk(s)
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Session Status</CardTitle>
                          <CardDescription>
                            Distribution of session statuses
                          </CardDescription>
                        </div>
                        <Toggle
                          pressed={showStatusChart}
                          onPressedChange={setShowStatusChart}
                          aria-label="Toggle chart view"
                          className="rounded-none"
                        >
                          {showStatusChart ? (
                            <PieChart className="h-4 w-4" />
                          ) : (
                            <List className="h-4 w-4" />
                          )}
                        </Toggle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {showStatusChart ? (
                        <SessionStatusPie data={statusDistribution} />
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Pending</span>
                            <Badge variant="secondary">
                              {statusDistribution.PENDING}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Processed</span>
                            <Badge variant="outline">
                              {statusDistribution.PROCESSED}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Safe</span>
                            <Badge className="bg-green-500">
                              {statusDistribution.SAFE}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Flagged</span>
                            <Badge variant="destructive">
                              {statusDistribution.FLAGGED_FOR_REVIEW}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {fellowStats.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Fellow Performance Summary</CardTitle>
                          <CardDescription>
                            Quick overview of fellow metrics
                          </CardDescription>
                        </div>
                        <Toggle
                          pressed={showPerformanceChart}
                          onPressedChange={setShowPerformanceChart}
                          aria-label="Toggle chart view"
                          className="rounded-none"
                        >
                          {showPerformanceChart ? (
                            <BarChart3 className="h-4 w-4" />
                          ) : (
                            <List className="h-4 w-4" />
                          )}
                        </Toggle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {showPerformanceChart ? (
                        <PerformanceBarChart data={fellowStats} />
                      ) : (
                        <div className="space-y-4">
                          {fellowStats.map(f => (
                            <div
                              key={f.name}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium">{f.name}</p>
                                <p className="text-xs text-gray-500">
                                  {f.totalSessions} sessions • {f.riskCount}{' '}
                                  risks
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  CC: {f.avgContentCoverage.toFixed(1)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  FQ: {f.avgFacilitationQuality.toFixed(1)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  PS: {f.avgProtocolSafety.toFixed(1)}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>
                  Therapy sessions conducted by your assigned Fellows
                </CardDescription>
              </div>
            </div>
            <div className="mt-4">
              {loading ? (
                <FilterBarSkeleton />
              ) : (
                <FilterDropdown
                  statusOptions={statusOptions}
                  fellowOptions={fellowOptions}
                  onStatusChange={setSelectedStatuses}
                  onFellowChange={setSelectedFellows}
                  onDateRangeChange={(start, end) =>
                    setDateRange({ start, end })
                  }
                  onSortChange={(sort, order) => {
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  onSearchChange={setSearchQuery}
                  initialSearch={searchQuery}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No sessions found.</p>
                <Button
                  onClick={() =>
                    fetchSessions().then(s => setAllSessions(s || []))
                  }
                >
                  Refresh
                </Button>
              </div>
            ) : (
              <>
                {loading ? (
                  <TableSkeleton />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fellow Name</TableHead>
                        <TableHead>Group ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSessions.map(sessionData => (
                        <TableRow key={sessionData.id}>
                          <TableCell className="font-medium">
                            {sessionData.fellow.name}
                          </TableCell>
                          <TableCell>{sessionData.groupId}</TableCell>
                          <TableCell>
                            {new Date(sessionData.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={sessionData.status}
                              analysis={sessionData.analyses[0]}
                            />
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/sessions/${sessionData.id}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none"
                              >
                                View Details
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredSessions.length
                    )}{' '}
                    of {filteredSessions.length} sessions
                  </p>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function DashboardLoader() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-80" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

type StatusBadgeProps = {
  status: string;
  analysis: Analysis;
};

function StatusBadge({ status, analysis }: StatusBadgeProps) {
  const riskStatus = (analysis?.riskDetection as JsonObject)?.status;

  if (status === 'PENDING') {
    return <Badge variant="secondary">Pending</Badge>;
  }

  if (riskStatus === 'RISK') {
    return <Badge variant="destructive">Risk</Badge>;
  }

  if (analysis?.supervisorStatus === 'REJECTED') {
    return <Badge variant="outline">Review Needed</Badge>;
  }

  if (status === 'PROCESSED' || analysis?.supervisorStatus === 'VALIDATED') {
    return <Badge variant="default">Safe</Badge>;
  }

  return <Badge variant="secondary">{status}</Badge>;
}
