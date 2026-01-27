'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { FileInfo } from '@/types/upload';
import { formatFileSize } from '@/lib/utils/validation';
import { Badge } from '@/components/ui/Badge';

interface FileUploadZoneProps {
  files: FileInfo[];
  isUploading?: boolean;
  onFilesSelected: (files: File[]) => void;
  onRemoveFile?: (fileId: string) => void;
  onUpload?: () => void;
}

export function FileUploadZone({
  files,
  isUploading = false,
  onFilesSelected,
  onRemoveFile,
  onUpload,
}: FileUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    disabled: isUploading,
  });

  const getStatusIcon = (status: FileInfo['status']) => {
    switch (status) {
      case 'success':
        return (
          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'uploading':
        return <div className="h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return (
          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragActive
            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
            : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
        )}
      >
        <input {...getInputProps()} />
        <svg className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {isDragActive ? 'Drop your PDFs here' : 'Drag PDFs here or click to upload'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Supported format: PDF (max 10MB per file)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(file.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                  {file.progress !== undefined && file.status === 'uploading' && (
                    <div className="mt-2 h-1 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                  {file.error && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{file.error}</p>
                  )}
                </div>
                {file.status === 'pending' && (
                  <button
                    onClick={() => onRemoveFile?.(file.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-500"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {files.some((f) => f.status === 'pending') && (
            <Button
              variant="primary"
              fullWidth
              isLoading={isUploading}
              onClick={onUpload}
            >
              {isUploading ? 'Uploading...' : 'Upload PDFs'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
