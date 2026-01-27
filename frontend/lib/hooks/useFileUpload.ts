// Custom hook for file upload operations

import { useState } from 'react';
import { FileInfo, UseFileUploadReturn } from '@/types/upload';
import { ingestPDFs } from '@/lib/api/endpoints';
import { validateFiles } from '@/lib/utils/validation';
import { getErrorMessage } from '@/lib/api/client';
import { v4 as uuidv4 } from 'uuid';

export function useFileUpload(): UseFileUploadReturn {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string>();

  const uploadFiles = async (filesToUpload: File[], sessionId: string) => {
    try {
      setError(undefined);

      // Validate files before upload
      const validationError = validateFiles(filesToUpload);
      if (validationError) {
        setError(validationError.message);
        return;
      }

      // Create file entries
      const newFiles: FileInfo[] = filesToUpload.map((file) => ({
        id: uuidv4(),
        name: file.name,
        size: file.size,
        status: 'pending' as const,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      setIsUploading(true);

      // Simulate progress updates (since we can't track actual multipart progress with fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const updated = { ...prev };
          let allComplete = true;

          Object.keys(updated).forEach((key) => {
            if (updated[key] < 90) {
              updated[key] += Math.random() * 30;
              allComplete = false;
            }
          });

          return updated;
        });
      }, 100);

      // Upload files
      await ingestPDFs(sessionId, filesToUpload);

      clearInterval(progressInterval);

      // Update file statuses to success
      setFiles((prev) =>
        prev.map((file) =>
          newFiles.some((f) => f.id === file.id)
            ? { ...file, status: 'success' as const, progress: 100 }
            : file
        )
      );

      // Set progress to 100 for all files
      setUploadProgress((prev) => {
        const updated = { ...prev };
        newFiles.forEach((file) => {
          updated[file.id] = 100;
        });
        return updated;
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);

      // Update file statuses to error
      setFiles((prev) =>
        prev.map((file) =>
          files.some((f) => f.id === file.id)
            ? {
                ...file,
                status: 'error' as const,
                error: errorMessage,
              }
            : file
        )
      );

      console.error('Error uploading files:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setUploadProgress((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
  };

  const clearFiles = () => {
    setFiles([]);
    setUploadProgress({});
    setError(undefined);
  };

  return {
    files,
    uploadFiles,
    removeFile,
    clearFiles,
    isUploading,
    uploadProgress,
    error,
  };
}
