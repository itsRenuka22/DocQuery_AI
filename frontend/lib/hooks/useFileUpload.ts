// Custom hook for file upload operations

import { useState, useEffect } from 'react';
import { FileInfo, UseFileUploadReturn } from '@/types/upload';
import { ingestPDFs } from '@/lib/api/endpoints';
import { validateFiles } from '@/lib/utils/validation';
import { getErrorMessage } from '@/lib/api/client';
import { v4 as uuidv4 } from 'uuid';

const FILES_STORAGE_KEY = 'uploaded_files';

export function useFileUpload(): UseFileUploadReturn {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [fileMap, setFileMap] = useState<Map<string, File>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string>();

  // Load files from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FILES_STORAGE_KEY);
      if (stored) {
        const parsedFiles = JSON.parse(stored) as FileInfo[];
        setFiles(parsedFiles);
      }
    } catch (err) {
      console.error('Error loading files from localStorage:', err);
    }
  }, []);

  // Persist files to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
    } catch (err) {
      console.error('Error saving files to localStorage:', err);
    }
  }, [files]);

  // Handle new file selection
  const addFiles = (newFilesToAdd: File[]) => {
    // Validate files before adding
    const validationError = validateFiles(newFilesToAdd);
    if (validationError) {
      setError(validationError.message);
      return;
    }

    // Create file entries with IDs
    const newFileInfos: FileInfo[] = newFilesToAdd.map((file) => ({
      id: uuidv4(),
      name: file.name,
      size: file.size,
      status: 'pending' as const,
      progress: 0,
    }));

    // Store actual File objects in map
    const newMap = new Map(fileMap);
    newFileInfos.forEach((fileInfo, index) => {
      newMap.set(fileInfo.id, newFilesToAdd[index]);
    });

    setFileMap(newMap);
    setFiles((prev) => [...prev, ...newFileInfos]);
    setError(undefined);
  };

  const uploadFiles = async (fileIds: string[], sessionId: string) => {
    try {
      setError(undefined);

      // Get actual File objects from map
      const filesToUpload: File[] = [];
      fileIds.forEach((id) => {
        const file = fileMap.get(id);
        if (file) {
          filesToUpload.push(file);
        }
      });

      if (filesToUpload.length === 0) {
        setError('No files to upload');
        return;
      }

      // Mark selected files as uploading
      setFiles((prev) =>
        prev.map((file) =>
          fileIds.includes(file.id)
            ? { ...file, status: 'uploading' as const }
            : file
        )
      );

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
          fileIds.includes(file.id)
            ? { ...file, status: 'success' as const, progress: 100 }
            : file
        )
      );

      // Set progress to 100 for all uploaded files
      setUploadProgress((prev) => {
        const updated = { ...prev };
        fileIds.forEach((id) => {
          updated[id] = 100;
        });
        return updated;
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);

      // Update file statuses to error
      setFiles((prev) =>
        prev.map((file) =>
          fileIds.includes(file.id)
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
    setFileMap((prev) => {
      const updated = new Map(prev);
      updated.delete(fileId);
      return updated;
    });
  };

  const clearFiles = () => {
    setFiles([]);
    setUploadProgress({});
    setFileMap(new Map());
    setError(undefined);
    try {
      localStorage.removeItem(FILES_STORAGE_KEY);
    } catch (err) {
      console.error('Error clearing files from localStorage:', err);
    }
  };

  return {
    files,
    addFiles,
    uploadFiles,
    removeFile,
    clearFiles,
    isUploading,
    uploadProgress,
    error,
  };
}
