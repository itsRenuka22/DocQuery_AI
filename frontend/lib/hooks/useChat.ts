// Custom hook for chat operations with API integration

import { useState } from 'react';
import { Message } from '@/types/chat';
import { askQuestion } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/api/client';
import { v4 as uuidv4 } from 'uuid';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error?: string;
  sendMessage: (sessionId: string, question: string) => Promise<void>;
  clearMessages: () => void;
  setError: (error?: string) => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const sendMessage = async (sessionId: string, question: string) => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    try {
      setError(undefined);
      setIsLoading(true);

      // Add user message
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: question,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Call API
      const response = await askQuestion({
        session_id: sessionId,
        question: question,
      });

      // Add assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        metadata: {
          source: response.source,
          contextChars: response.contextChars,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(undefined);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setError,
  };
}
