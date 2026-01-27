'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  generateSessionId,
  getOrCreateSessionId,
  setSessionId,
  clearSessionId,
} from '@/lib/utils/session';

interface SessionContextType {
  sessionId: string;
  setNewSession: () => void;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionIdState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionIdState(id);
    setIsLoading(false);
  }, []);

  const setNewSession = () => {
    const newId = generateSessionId();
    setSessionId(newId);
    setSessionIdState(newId);
  };

  const resetSession = () => {
    clearSessionId();
    setNewSession();
  };

  // Don't render children until session is loaded
  if (isLoading) {
    return null;
  }

  return (
    <SessionContext.Provider value={{ sessionId, setNewSession, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
