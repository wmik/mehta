'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

type Analysis = Pick<
  MeetingAnalysis,
  'id' | 'createdAt' | 'riskDetection' | 'supervisorStatus'
>;

interface MeetingWithRelation extends Meeting {
  analyses: Array<Analysis>;
  fellow: Pick<Fellow, 'name' | 'email'>;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<MeetingWithRelation[]>([]);

  async function fetchSessions() {
    setLoading(true);

    const loadingToast = toast.loading('Retrieving latest sessions...', {
      duration: Infinity
    });

    try {
      // For MVP, get the first supervisor
      const response = await fetch('/api/meetings');

      if (response.ok) {
        const result = await response.json();

        setSessions(result?.sessions);
        toast.success('Loaded sessions successfully');
      } else {
        const error = await response.text();
        toast.error(error);
      }
    } catch (error) {
      console.error('Sessions fetch error:', error);
      toast.error('Failed to fetch sessions: ' + (error as Error).message);
    }

    setLoading(false);
    toast.dismiss(loadingToast);
  }

  const stats = {
    total: sessions.length,
    processed: sessions.filter(
      s => s.status === 'PROCESSED' || s.analyses.length > 0
    ).length,
    risks: sessions.filter(
      s => (s.analyses[0]?.riskDetection as JsonObject)?.status === 'RISK'
    ).length
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  if (loading) {
    return <DashboardLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Shamiri Supervisor Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Demo User</span>
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>
                View and analyze therapy sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
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
              <CardDescription>Sessions requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{stats.risks}</p>
              <p className="text-sm text-gray-600">Flagged Sessions</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              Therapy sessions conducted by your assigned Fellows
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No sessions found.</p>
                <Button onClick={() => fetchSessions()}>Refresh</Button>
              </div>
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
                  {sessions.map(sessionData => (
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
                        <Link href={`/dashboard/sessions/${sessionData.id}`}>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function DashboardLoader() {
  return (
    <div className="min-h-screen bg-gray-50">
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
                {[...Array(10)].map((_, i) => (
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
