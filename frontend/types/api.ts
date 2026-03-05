// API Request and Response Types

export interface HealthResponse {
  ok: boolean;
  bucket?: string;
  table?: string;
}

export interface IngestResponse {
  session_id: string;
  files: string[];
}

export interface AskResponse {
  answer: string;
  source: string;
  contextChars: number;
}

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  session_id: string;
  question: string;
  history: HistoryMessage[];
}

export interface HistoryResponse {
  history: HistoryMessage[];
}

export interface IngestRequest {
  session_id: string;
  files: File[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  status?: number;
}

// API Client configuration
export interface FetchOptions extends RequestInit {
  timeout?: number;
}
