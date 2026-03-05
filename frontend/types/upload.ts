// File Upload-related Types

export type FileStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  status: FileStatus;
  progress?: number;
  error?: string;
}

export interface UploadState {
  files: FileInfo[];
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  uploadedFiles: string[];
  error?: string;
}

export interface UseFileUploadReturn {
  files: FileInfo[];
  addFiles: (files: File[]) => void;
  uploadFiles: (fileIds: string[], sessionId: string) => Promise<void>;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  error?: string;
}

export interface FileValidationError {
  type: 'invalid_type' | 'invalid_size' | 'unknown';
  message: string;
}
