import React from 'react';
import clsx from 'clsx';
import { Message } from '@/types/chat';
import { Badge } from '@/components/ui/Badge';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={clsx('flex gap-3 mb-4', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={clsx(
          'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold',
          isUser
            ? 'bg-sky-500'
            : 'bg-purple-500'
        )}
      >
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Message Content */}
      <div className={clsx('flex-1 max-w-xl', isUser && 'flex flex-col items-end')}>
        <div
          className={clsx(
            'px-4 py-3 rounded-lg word-break',
            isUser
              ? 'bg-sky-500 text-white rounded-br-none'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
          )}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>

        {/* Metadata */}
        {!isUser && message.metadata && (
          <div className="mt-2 flex flex-col items-end gap-1">
            {message.metadata.source && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0015.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
                <span className="truncate max-w-xs">
                  {message.metadata.source.split('/').pop()}
                </span>
              </div>
            )}
            {message.metadata.contextChars && (
              <Badge variant="info" size="sm">
                {message.metadata.contextChars.toLocaleString()} chars
              </Badge>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className={clsx('text-xs mt-1', isUser ? 'text-sky-200' : 'text-gray-500 dark:text-gray-400')}>
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
