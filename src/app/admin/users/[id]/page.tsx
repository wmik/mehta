'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const userSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  role: z.enum(['supervisor', 'admin'])
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export default function EditUserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      role: 'supervisor'
    }
  });

  const selectedRole = watch('role');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setValue('name', data.user.name || '');
          setValue('email', data.user.email);
          setValue('role', data.user.role as 'supervisor' | 'admin');
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to fetch user');
          router.push('/admin');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to fetch user');
        router.push('/admin');
      } finally {
        setFetching(false);
      }
    };

    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchUser();
    }
  }, [status, session, router, userId, setValue]);

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      const updateData: {
        name?: string | null;
        email?: string;
        role?: string;
        password?: string;
      } = {
        name: data.name || null,
        role: data.role
      };

      if (data.email && data.email !== user?.email) {
        updateData.email = data.email;
      }

      if (data.password) {
        updateData.password = data.password;
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        toast.success('User updated successfully');
        router.push('/admin');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (session?.user?.role !== 'admin' || !user) {
    return null;
  }

  const isOwnProfile = session.user.id === userId;

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="bg-background shadow-sm border-b">
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4 rounded-none">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Edit User</CardTitle>
            <CardDescription>
              {isOwnProfile ? 'Edit your profile' : 'Update user details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  className="rounded-none"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="rounded-none"
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  New Password {isOwnProfile && '(leave blank to keep current)'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="rounded-none"
                  placeholder="Minimum 8 characters"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {!isOwnProfile && (
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={value =>
                      setValue('role', value as 'supervisor' | 'admin')
                    }
                  >
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-500">
                      {errors.role.message}
                    </p>
                  )}
                </div>
              )}

              {isOwnProfile && (
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={user.role}
                    disabled
                    className="rounded-none bg-muted"
                  />
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Link href="/admin">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-none"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-none"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
