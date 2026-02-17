'use client';

import { useState, useRef } from 'react';
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
import { Upload, FileAudio, FileText, X, AlertTriangle } from 'lucide-react';

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

interface TranscriptUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  existingTranscript?: string;
  onSuccess: (newTranscript: string) => void;
}

export function TranscriptUploadDialog({
  open,
  onOpenChange,
  sessionId,
  existingTranscript,
  onSuccess
}: TranscriptUploadDialogProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState(existingTranscript || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasExistingTranscript = !!existingTranscript;

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
      setTranscript(`[Audio file: ${selectedFile.name}]`);
      return;
    }

    try {
      const content = await parseTextFile(selectedFile);
      setFile(selectedFile);
      setTranscript(content);
    } catch (error) {
      setFileError('Failed to parse file. Please try again.');
      console.error('File parse error:', error);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileError(null);
    setTranscript(hasExistingTranscript ? existingTranscript : '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async () => {
    if (!file && !transcript.trim()) {
      toast.error('Please provide a transcript');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      if (file) {
        formData.append('file', file);
      } else if (transcript.trim()) {
        formData.append('transcript', transcript);
      }

      const response = await fetch(`/api/meetings/${sessionId}`, {
        method: 'PATCH',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update transcript');
      }

      const data = await response.json();
      toast.success('Transcript updated successfully');
      onSuccess(data.session.transcript);
      handleOpenChange(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      clearFile();
      setTranscript(existingTranscript || '');
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
          <DialogTitle>
            {hasExistingTranscript ? 'Update Transcript' : 'Add Transcript'}
          </DialogTitle>
          <DialogDescription>
            Upload a transcript file or enter the transcript manually.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {hasExistingTranscript && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-none">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-800">
                Updating the transcript will invalidate the current analysis.
                You will need to re-analyze after saving.
              </p>
            </div>
          )}

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">File</Label>
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
              {fileError && <p className="text-sm text-red-500">{fileError}</p>}
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
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Or Enter Manually</Label>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Enter transcript text here..."
              className="col-span-3 rounded-none min-h-[200px] flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
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
            onClick={onSubmit}
            disabled={loading || !transcript.trim()}
            className="rounded-none"
          >
            {loading ? 'Saving...' : 'Save Transcript'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
