// Session management utilities

import { v4 as uuidv4 } from 'uuid';

const SESSION_ID_KEY = 'docquery-session-id';

/**
 * Generate a new session ID
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Get session ID from localStorage or generate new one
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return generateSessionId();
  }

  const stored = localStorage.getItem(SESSION_ID_KEY);
  if (stored) {
    return stored;
  }

  const newId = generateSessionId();
  localStorage.setItem(SESSION_ID_KEY, newId);
  return newId;
}

/**
 * Set session ID in localStorage
 */
export function setSessionId(id: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_ID_KEY, id);
  }
}

/**
 * Clear session ID from localStorage
 */
export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_ID_KEY);
  }
}

/**
 * Get current session ID (returns null if not set)
 */
export function getSessionId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(SESSION_ID_KEY);
}
