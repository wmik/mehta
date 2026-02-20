'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileUpload } from '@/components/ui/file-upload';
import { AlertTriangle } from 'lucide-react';
import {
  SUPPORTED_EXTENSIONS,
  SUPPORTED_FORMATS_LABEL,
  MAX_FILE_SIZE
} from '@/lib/transcript';

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
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const hasExistingTranscript = !!existingTranscript;

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
  };

  const onSubmit = async () => {
    if (!file) {
      toast.error('Please upload a transcript file');
      return;
    }

    setLoading(true);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

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
      setUploading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      clearFile();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle>
            {hasExistingTranscript ? 'Update Transcript' : 'Add Transcript'}
          </DialogTitle>
          <DialogDescription>
            Upload a transcript file. Click &quot;Analyze Session&quot; after
            saving to run AI analysis.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {hasExistingTranscript && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">
                Updating the transcript will invalidate the current analysis.
                You will need to re-analyze after saving.
              </p>
            </div>
          )}

          <FileUpload
            accept={SUPPORTED_EXTENSIONS}
            maxSize={MAX_FILE_SIZE}
            onFileSelect={handleFileSelect}
            label="Upload transcript"
            hint={`Supported formats: ${SUPPORTED_FORMATS_LABEL}`}
          />
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
            disabled={loading || !file}
            className="rounded-none"
          >
            {uploading
              ? 'Uploading...'
              : loading
                ? 'Saving...'
                : 'Save Transcript'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
