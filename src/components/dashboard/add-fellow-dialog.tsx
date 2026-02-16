'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const fellowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address')
});

type FellowFormData = z.infer<typeof fellowSchema>;

interface AddFellowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddFellowDialog({
  open,
  onOpenChange,
  onSuccess
}: AddFellowDialogProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FellowFormData>({
    resolver: zodResolver(fellowSchema)
  });

  const onSubmit = async (data: FellowFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/fellows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create fellow');
      }

      toast.success('Fellow created successfully');
      reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Fellow</DialogTitle>
          <DialogDescription>
            Create a new fellow account. They will be assigned to your
            supervision.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                {...register('name')}
                className="col-span-3 rounded-none"
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-500 col-span-4 text-right">
                {errors.name.message}
              </p>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="col-span-3 rounded-none"
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 col-span-4 text-right">
                {errors.email.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-none">
              {loading ? 'Creating...' : 'Create Fellow'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
