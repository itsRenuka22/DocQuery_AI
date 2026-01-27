'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { ChatInput } from '@/components/chat/ChatInput';
import { FileUploadZone } from '@/components/upload/FileUploadZone';
import { ToastContainer } from '@/components/ui/Toast';
import { useSession } from '@/context/SessionProvider';
import { useChat } from '@/lib/hooks/useChat';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { useToast } from '@/lib/hooks/useToast';
import { initializeApp } from '@/lib/api/endpoints';
import clsx from 'clsx';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const [uploadView, setUploadView] = useState<'zone' | 'history'>('zone');
  const [initialized, setInitialized] = useState(false);
  const [connectionError, setConnectionError] = useState<string>();

  const { sessionId, resetSession } = useSession();
  const { messages, isLoading, error: chatError, sendMessage, clearMessages, setError } = useChat();
  const { files, uploadFiles, removeFile, clearFiles, isUploading, uploadProgress } = useFileUpload();
  const { toasts, showToast, removeToast } = useToast();

  // Initialize app and check backend connection
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await initializeApp();
      if (!isConnected) {
        setConnectionError('Could not connect to backend. Please check your connection.');
        showToast('Backend connection failed', 'error');
      }
      setInitialized(true);
    };

    checkConnection();
  }, []);

  // Handle file upload
  const handleUpload = async () => {
    if (files.length === 0) {
      showToast('Please select files first', 'warning');
      return;
    }

    try {
      const filesToUpload = files
        .filter(f => f.status === 'pending')
        .map(f => new File([f.name], f.name)); // Note: This is a workaround, ideally store File objects

      await uploadFiles(filesToUpload, sessionId);
      showToast(`${files.length} file(s) uploaded successfully`, 'success');
      setShowUpload(false);
      setUploadView('history');
    } catch (err) {
      showToast('Upload failed', 'error');
    }
  };

  // Handle send message
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (files.length === 0 || files.every(f => f.status !== 'success')) {
      setError('Please upload at least one PDF first');
      showToast('Please upload a PDF first', 'info');
      return;
    }

    await sendMessage(sessionId, message);
  };

  // Handle new session
  const handleNewSession = () => {
    resetSession();
    clearMessages();
    clearFiles();
    setShowUpload(true);
    setUploadView('zone');
    setSidebarOpen(false);
    showToast('New session created', 'info');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-slate-950">
      {/* Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          sessionId={sessionId}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewSession={handleNewSession}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Connection Error Banner */}
          {connectionError && (
            <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                ⚠️ {connectionError}
              </p>
            </div>
          )}

          {/* Chat Error */}
          {chatError && (
            <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                ❌ {chatError}
              </p>
            </div>
          )}

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-4 p-4">
            {/* Chat Section */}
            <div className={clsx('flex flex-col flex-1 overflow-hidden', !showUpload && 'w-full')}>
              <ChatHistory messages={messages} isLoading={isLoading} />
              <ChatInput
                value={chatError || ''}
                onChange={(val) => setError(val || undefined)}
                onSubmit={() => handleSendMessage(chatError || '')}
                isLoading={isLoading}
                disabled={files.length === 0 || connectionError !== undefined}
              />
            </div>

            {/* Upload Section */}
            {showUpload && (
              <div className={clsx(
                'bg-gray-50 dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700',
                'lg:w-96 overflow-y-auto'
              )}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {uploadView === 'zone' ? '📤 Upload PDFs' : '📚 Uploaded Files'}
                </h2>

                {uploadView === 'zone' && (
                  <FileUploadZone
                    files={files}
                    isUploading={isUploading}
                    onFilesSelected={(newFiles) => {
                      // Note: In a real implementation, store File objects in state
                      setError(undefined);
                    }}
                    onRemoveFile={removeFile}
                    onUpload={handleUpload}
                  />
                )}

                {uploadView === 'history' && files.length > 0 && (
                  <div className="space-y-2">
                    {files.filter(f => f.status === 'success').map(f => (
                      <div key={f.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg flex items-center gap-2">
                        <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{f.name}</span>
                      </div>
                    ))}
                    <button
                      onClick={() => { setShowUpload(true); setUploadView('zone'); }}
                      className="w-full mt-4 px-3 py-2 text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                    >
                      + Add more PDFs
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat Input (Mobile friendly) */}
          {!showUpload && (
            <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <ChatInput
                value=""
                onChange={() => {}}
                onSubmit={() => {}}
                isLoading={isLoading}
                disabled={files.length === 0 || connectionError !== undefined}
              />
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
