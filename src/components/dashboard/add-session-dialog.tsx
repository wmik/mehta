'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Upload, FileAudio, FileText, X } from 'lucide-react';

const sessionSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  date: z.string().min(1, 'Date is required'),
  fellowId: z.string().min(1, 'Fellow is required'),
  transcript: z.string().optional()
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

const TEXT_EXTENSIONS = [
  '.txt',
  '.pdf',
  '.doc',
  '.docx',
  '.md',
  '.srt',
  '.vtt',
  '.json'
];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.webm', '.ogg'];
const ALL_EXTENSIONS = [...TEXT_EXTENSIONS, ...AUDIO_EXTENSIONS];

export function AddSessionDialog({
  open,
  onOpenChange,
  onSuccess
}: AddSessionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const parseSrt = (content: string): string => {
    const entries = content.split(/\n\n+/);
    return entries
      .filter(entry => !entry.match(/^\d+$/))
      .map(entry => entry.replace(/^\d+\n.* --> .*\n/, '').replace(/\n/g, ' '))
      .join('\n');
  };

  const parseVtt = (content: string): string => {
    return content
      .replace(/^WEBVTT.*\n?/gm, '')
      .replace(/^\d+\n.* --> .*\n/gm, '')
      .replace(/^NOTE.*\n?/gm, '')
      .trim();
  };

  const parseTextFile = async (file: File): Promise<string> => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (extension === '.json') {
      const text = await file.text();
      const data = JSON.parse(text);
      return typeof data.transcript === 'string'
        ? data.transcript
        : JSON.stringify(data, null, 2);
    }

    if (['.srt', '.vtt'].includes(extension)) {
      const text = await file.text();
      return extension === '.srt' ? parseSrt(text) : parseVtt(text);
    }

    return await file.text();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFileError(null);
    const extension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();

    if (!ALL_EXTENSIONS.includes(extension)) {
      setFileError(
        `Unsupported file type. Supported: ${ALL_EXTENSIONS.join(', ')}`
      );
      return;
    }

    if (AUDIO_EXTENSIONS.includes(extension)) {
      setFile(selectedFile);
      setValue('transcript', `[Audio file: ${selectedFile.name}]`);
      return;
    }

    try {
      const content = await parseTextFile(selectedFile);
      setFile(selectedFile);
      setValue('transcript', content);
    } catch (error) {
      setFileError('Failed to parse file. Please try again.');
      console.error('File parse error:', error);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: SessionFormData) => {
    if (fellows.length === 0) {
      toast.error('No fellows available. Please add a fellow first.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
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
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      clearFile();
    }
    onOpenChange(isOpen);
  };

  const getFileIcon = () => {
    if (!file) return null;
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (AUDIO_EXTENSIONS.includes(extension || '')) {
      return <FileAudio className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle>Add Session</DialogTitle>
          <DialogDescription>
            Create a new therapy session. Upload a transcript file or enter
            manually.
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
              <div className="col-span-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept={ALL_EXTENSIONS.join(',')}
                    onChange={handleFileChange}
                    className="rounded-none cursor-pointer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-none"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {fileError && (
                  <p className="text-sm text-red-500">{fileError}</p>
                )}
                {file && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {getFileIcon()}
                    <span>{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFile}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <textarea
                  {...register('transcript')}
                  placeholder="Or enter transcript manually..."
                  className="rounded-none min-h-[150px] flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
            <Button type="submit" disabled={loading} className="rounded-none">
              {loading ? 'Creating...' : 'Create Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
