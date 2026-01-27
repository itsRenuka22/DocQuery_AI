// File validation utilities

import { FileValidationError } from '@/types/upload';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['application/pdf'];

/**
 * Validate a file before upload
 */
export function validateFile(file: File): FileValidationError | null {
  // Check file type
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return {
      type: 'invalid_type',
      message: `File "${file.name}" is not a PDF. Please upload PDF files only.`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = Math.round(file.size / 1024 / 1024);
    return {
      type: 'invalid_size',
      message: `File "${file.name}" is ${sizeMB}MB. Maximum file size is 10MB.`,
    };
  }

  return null;
}

/**
 * Validate multiple files
 */
export function validateFiles(files: File[]): FileValidationError | null {
  for (const file of files) {
    const error = validateFile(file);
    if (error) {
      return error;
    }
  }
  return null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if value is a valid string
 */
export function isValidString(value: unknown, minLength = 1): value is string {
  return typeof value === 'string' && value.trim().length >= minLength;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
