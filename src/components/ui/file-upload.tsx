'use client';

import { useCallback, useState, DragEvent, ChangeEvent, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, FileCode, Subtitles, X } from 'lucide-react';
import { FILE_TYPE_CONFIG, MAX_FILE_SIZE } from '@/lib/transcript';

interface FileUploadProps {
  accept: string[];
  maxSize?: number;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
  className?: string;
}

type UploadState = 'idle' | 'validating' | 'ready' | 'error';

export function FileUpload({
  accept,
  maxSize = MAX_FILE_SIZE,
  onFileSelect,
  disabled,
  label,
  hint,
  className
}: FileUploadProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!accept.includes(extension)) {
        return `Invalid file type. Supported: ${accept
          .map(e => e.replace('.', '').toUpperCase())
          .join(', ')}`;
      }
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        return `File too large. Maximum size is ${maxSizeMB}MB`;
      }
      return null;
    },
    [accept, maxSize]
  );

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      setState('validating');
      setProgress(30);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setState('error');
        return;
      }

      setProgress(60);
      setSelectedFile(file);
      setState('ready');
      setProgress(100);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      const file = event.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    setState('idle');
    setProgress(0);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = '.' + fileName.split('.').pop()?.toLowerCase();
    const config = FILE_TYPE_CONFIG[extension];
    const iconName = config?.icon || 'file-text';

    switch (iconName) {
      case 'file-code':
        return <FileCode className="h-5 w-5 text-blue-500" />;
      case 'subtitles':
        return <Subtitles className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      {selectedFile ? (
        <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
          {getFileIcon(selectedFile.name)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={clearFile}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors',
            'hover:border-muted-foreground hover:bg-muted/30',
            isDragging && 'border-primary bg-primary/5',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-destructive'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept.join(',')}
            onChange={handleChange}
            className="hidden"
            disabled={disabled}
          />
          <div
            onClick={handleClick}
            className="flex flex-col items-center gap-2"
          >
            <div className="rounded-full bg-muted p-3">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-sm">
              <span className="font-medium">Click to upload</span>
              <span className="text-muted-foreground"> or drag and drop</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {accept.map(e => e.replace('.', '').toUpperCase()).join(', ')}{' '}
              (max {maxSize / (1024 * 1024)}MB)
            </p>
          </div>
        </div>
      )}

      {state === 'validating' && <Progress value={progress} className="h-2" />}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <span>{error}</span>
        </div>
      )}

      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
