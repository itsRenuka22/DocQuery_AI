import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { Spinner } from '@/components/ui/Spinner';

interface ChatHistoryProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatHistory({ messages, isLoading = false }: ChatHistoryProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-5xl mb-4">💬</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Start a conversation
        </h2>
        <p className="text-gray-400 max-w-sm">
          Upload some PDFs and ask questions to get started. I'll help you find the information you need.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm">
              🤖
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 rounded-lg">
                <Spinner size="sm" />
                <p className="text-sm text-gray-300">Thinking...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
