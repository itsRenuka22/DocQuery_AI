// API Endpoints and request functions

import { apiClient } from './client';
import {
  HealthResponse,
  IngestResponse,
  AskResponse,
  ChatRequest,
  HistoryResponse,
} from '@/types/api';

/**
 * Health check endpoint
 * Verifies backend connectivity and AWS resource configuration
 */
export async function checkHealth(): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>('/health');
}

/**
 * Ingest PDFs endpoint
 * Uploads PDF files to S3 for the given session
 */
export async function ingestPDFs(
  sessionId: string,
  files: File[]
): Promise<IngestResponse> {
  const formData = new FormData();
  formData.append('session_id', sessionId);

  files.forEach((file) => {
    formData.append('files', file);
  });

  return apiClient.postFormData<IngestResponse>('/ingest', formData);
}

/**
 * Ask question endpoint
 * Sends a question and receives an AI-generated answer based on uploaded PDFs
 */
export async function askQuestion(request: ChatRequest): Promise<AskResponse> {
  return apiClient.post<AskResponse>('/ask', request);
}

/**
 * Get conversation history endpoint
 * Retrieves the full conversation history for a given session
 */
export async function getHistory(sessionId: string): Promise<HistoryResponse> {
  return apiClient.get<HistoryResponse>(`/history/${sessionId}`);
}

/**
 * Health check with error handling
 * Used for initialization checks
 */
export async function initializeApp(): Promise<boolean> {
  try {
    await checkHealth();
    return true;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
}
