'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { FileUpload } from '@/components/ui/file-upload';
import {
  SUPPORTED_EXTENSIONS,
  SUPPORTED_FORMATS_LABEL,
  MAX_FILE_SIZE
} from '@/lib/transcript';

const sessionSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  date: z.string().min(1, 'Date is required'),
  fellowId: z.string().min(1, 'Fellow is required')
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface Fellow {
  id: string;
  name: string;
}

interface AddSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddSessionDialog({
  open,
  onOpenChange,
  onSuccess
}: AddSessionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema)
  });

  useEffect(() => {
    if (open) {
      fetchFellows();
    }
  }, [open]);

  const fetchFellows = async () => {
    try {
      const response = await fetch('/api/fellows');
      if (response.ok) {
        const data = await response.json();
        setFellows(data.fellows || []);
      }
    } catch (error) {
      console.error('Failed to fetch fellows:', error);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
  };

  const onSubmit = async (data: SessionFormData) => {
    if (fellows.length === 0) {
      toast.error('No fellows available. Please add a fellow first.');
      return;
    }

    if (!file) {
      toast.error('Please upload a transcript file');
      return;
    }

    setLoading(true);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('groupId', data.groupId);
      formData.append('date', data.date);
      formData.append('fellowId', data.fellowId);
      formData.append('file', file);

      const response = await fetch('/api/meetings', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create session');
      }

      toast.success('Session created successfully');
      reset();
      clearFile();
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      clearFile();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle>Add Session</DialogTitle>
          <DialogDescription>
            Create a new therapy session. Upload a transcript file to begin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="groupId" className="text-right">
                Group ID
              </Label>
              <Input
                id="groupId"
                {...register('groupId')}
                className="col-span-3 rounded-none"
                placeholder="GRP-001"
              />
            </div>
            {errors.groupId && (
              <p className="text-sm text-red-500 col-span-4 text-right">
                {errors.groupId.message}
              </p>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="datetime-local"
                {...register('date')}
                className="col-span-3 rounded-none"
              />
            </div>
            {errors.date && (
              <p className="text-sm text-red-500 col-span-4 text-right">
                {errors.date.message}
              </p>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fellow" className="text-right">
                Fellow
              </Label>
              <Select
                onValueChange={value => setValue('fellowId', value)}
                defaultValue={watch('fellowId')}
              >
                <SelectTrigger className="col-span-3 rounded-none">
                  <SelectValue placeholder="Select a fellow" />
                </SelectTrigger>
                <SelectContent>
                  {fellows.map(fellow => (
                    <SelectItem key={fellow.id} value={fellow.id}>
                      {fellow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.fellowId && (
              <p className="text-sm text-red-500 col-span-4 text-right">
                {errors.fellowId.message}
              </p>
            )}

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Transcript</Label>
              <div className="col-span-3">
                <FileUpload
                  accept={SUPPORTED_EXTENSIONS}
                  maxSize={MAX_FILE_SIZE}
                  onFileSelect={handleFileSelect}
                  label="Upload transcript"
                  hint={`Supported formats: ${SUPPORTED_FORMATS_LABEL}`}
                />
              </div>
            </div>
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
            <Button
              type="submit"
              disabled={loading || !file}
              className="rounded-none"
            >
              {uploading
                ? 'Uploading...'
                : loading
                  ? 'Creating...'
                  : 'Create Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
