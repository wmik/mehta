'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setDeletingId(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-lg font-bold tracking-tighter uppercase font-mono">
              SHAMIRI /// ADMIN
            </h1>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="rounded-none">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              User Management
            </h2>
            <p className="text-gray-600">
              Manage supervisor accounts and permissions.
            </p>
          </div>
          <Link href="/admin/users/new">
            <Button className="rounded-none">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              All registered supervisors in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No users found.</p>
                <Link href="/admin/users/new">
                  <Button className="rounded-none">Create First User</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || '-'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === 'admin' ? 'default' : 'secondary'
                          }
                          className="rounded-none"
                        >
                          {user.role === 'admin' && (
                            <Shield className="h-3 w-3 mr-1" />
                          )}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-none"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          {user.id !== session?.user?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingId === user.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
