'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';
import {
  Users,
  Mail,
  Calendar,
  Activity,
  Settings,
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface FellowSession {
  id: string;
  groupId: string;
  date: string;
  status: string;
  hasRisk: boolean;
  supervisorStatus: string | null;
}

interface Fellow {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  sessionCount: number;
  sessions: FellowSession[];
}

interface FellowViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fellowId: string;
  onSuccess?: () => void;
}

export function FellowViewDialog({
  open,
  onOpenChange,
  fellowId,
  onSuccess
}: FellowViewDialogProps) {
  const [fellow, setFellow] = useState<Fellow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    const fetchFellow = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/fellows/${fellowId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch fellow');
        }
        const data = await response.json();
        setFellow(data.fellow);
        setEditName(data.fellow.name);
        setEditEmail(data.fellow.email);
        setEditStatus(data.fellow.status);
      } catch (error) {
        console.error('Failed to fetch fellow:', error);
        toast.error('Failed to load fellow details');
      } finally {
        setLoading(false);
      }
    };

    if (open && fellowId) {
      fetchFellow();
    }
  }, [open, fellowId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/fellows/${fellowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          status: editStatus
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update fellow');
      }

      const data = await response.json();
      setFellow(prev => (prev ? { ...prev, ...data.fellow } : null));
      toast.success('Fellow updated successfully');
      onSuccess?.();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/fellows/${fellowId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete fellow');
      }

      toast.success('Fellow deleted successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error('Failed to delete fellow');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const isModified =
    fellow &&
    (editName !== fellow.name ||
      editEmail !== fellow.email ||
      editStatus !== fellow.status);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>
              {loading ? 'Loading...' : fellow?.name || 'Fellow Details'}
            </DialogTitle>
            <DialogDescription>
              View and manage fellow information
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : fellow ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="sessions"
                  className="flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">{fellow.name}</p>
                      <Badge
                        variant={
                          fellow.status === 'ACTIVE' ? 'default' : 'secondary'
                        }
                      >
                        {fellow.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{fellow.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        Added {new Date(fellow.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {fellow.sessionCount} session
                        {fellow.sessionCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sessions">
                {fellow.sessions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fellow.sessions.map(session => (
                        <TableRow key={session.id}>
                          <TableCell>
                            {new Date(session.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{session.groupId}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{session.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {session.hasRisk ? (
                              <Badge variant="destructive">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Risk
                              </Badge>
                            ) : (
                              <span className="text-green-600 text-sm">
                                Safe
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No sessions yet
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="rounded-none"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      className="rounded-none"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-none"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                    className="rounded-none"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Fellow
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={saving || !isModified}
                    className="rounded-none"
                  >
                    {saving && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Failed to load fellow details
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Fellow"
        description={`Are you sure you want to delete ${fellow?.name}? This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
