export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const SUPPORTED_EXTENSIONS = [
  '.txt',
  '.md',
  '.json',
  '.srt',
  '.vtt',
  '.pdf',
  '.doc',
  '.docx'
];

export const FILE_TYPE_CONFIG: Record<string, { label: string; icon: string }> =
  {
    '.txt': { label: 'Text File', icon: 'file-text' },
    '.md': { label: 'Markdown', icon: 'file-text' },
    '.json': { label: 'JSON', icon: 'file-code' },
    '.srt': { label: 'Subtitle (SRT)', icon: 'subtitles' },
    '.vtt': { label: 'Subtitle (VTT)', icon: 'subtitles' },
    '.pdf': { label: 'PDF Document', icon: 'file-text' },
    '.doc': { label: 'Word Document', icon: 'file-text' },
    '.docx': { label: 'Word Document', icon: 'file-text' }
  };

export const SUPPORTED_FORMATS_LABEL =
  'TXT, MD, JSON, SRT, VTT, PDF, DOC, DOCX';

export const FILE_TYPE_MIME_TYPES: Record<string, string> = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.json': 'application/json',
  '.srt': 'text/srt',
  '.vtt': 'text/vtt',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};
