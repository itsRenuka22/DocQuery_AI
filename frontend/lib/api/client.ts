// API Client with error handling and request management

import { ApiError, FetchOptions } from '@/types/api';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  }

  /**
   * Fetch with timeout support
   */
  private async fetchWithTimeout(
    url: string,
    options: FetchOptions = {}
  ): Promise<Response> {
    const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleError(error: unknown): never {
    if (error instanceof TypeError) {
      if (error.message.includes('abort')) {
        throw new Error('Request timeout. Please check your connection and try again.');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Failed to connect to the server. Please check your connection.');
      }
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('An unexpected error occurred');
  }

  /**
   * GET request
   */
  async get<T>(
    path: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      if (!response.ok) {
        throw await this.parseErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * POST request with JSON body
   */
  async post<T>(
    path: string,
    data?: unknown,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      if (!response.ok) {
        throw await this.parseErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * POST request with FormData (for file uploads)
   */
  async postFormData<T>(
    path: string,
    formData: FormData,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: formData,
        ...options,
      });

      if (!response.ok) {
        throw await this.parseErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Parse error response and create meaningful error
   */
  private async parseErrorResponse(response: Response): Promise<Error> {
    try {
      const data = await response.json();
      const errorMessage = data.detail || data.message || 'An error occurred';
      return new Error(errorMessage);
    } catch {
      return new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Helper function to get error message
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
