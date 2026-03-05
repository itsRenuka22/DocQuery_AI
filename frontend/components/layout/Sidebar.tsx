'use client';

import React from 'react';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface SidebarProps {
  sessionId: string;
  isOpen?: boolean;
  onClose?: () => void;
  onNewSession?: () => void;
}

export function Sidebar({ sessionId, isOpen = true, onClose, onNewSession }: SidebarProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-16 bottom-0 w-72 bg-slate-900 border-r border-slate-700 overflow-y-auto transition-transform duration-200 z-40 lg:sticky lg:top-0 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6">
          {/* Session Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white mb-2">
                Session ID
              </h2>
              <div className="flex items-start gap-2">
                <code className="flex-1 text-xs bg-slate-800 text-gray-300 p-2 rounded font-mono break-all">
                  {sessionId}
                </code>
                <button
                  onClick={handleCopySessionId}
                  className="flex-shrink-0 p-2 hover:bg-slate-800 rounded transition-colors"
                  title="Copy session ID"
                >
                  {copied ? (
                    <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011 1v2h2V4a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 11-2 0V5h-3v2a1 1 0 11-2 0V5H9v5a1 1 0 11-2 0V4a1 1 0 010-1z" />
                      <path d="M5 9a1 1 0 00-1 1v5a1 1 0 001 1h5a1 1 0 001-1v-5a1 1 0 00-1-1H5zm0 2h5v5H5v-5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Badge variant="info" size="md">
              Persistent Session
            </Badge>

            <p className="text-xs text-gray-400">
              Your session ID persists across refreshes. Share it to continue a conversation elsewhere.
            </p>
          </div>

          {/* Divider */}
          <div className="my-6 h-px bg-slate-700" />

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="outline"
              fullWidth
              onClick={onNewSession}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
              </svg>
              New Session
            </Button>
          </div>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-900/20 rounded-lg">
            <h3 className="text-xs font-semibold text-blue-200 mb-2">
              💡 Tip
            </h3>
            <p className="text-xs text-blue-300">
              Upload multiple PDFs and ask questions about any of them. Your chat history is saved per session.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
