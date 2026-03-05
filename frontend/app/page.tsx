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
import { initializeApp, getHistory } from '@/lib/api/endpoints';
import clsx from 'clsx';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadView, setUploadView] = useState<'zone' | 'history'>('zone');
  const [initialized, setInitialized] = useState(false);
  const [connectionError, setConnectionError] = useState<string>();
  const [messageInput, setMessageInput] = useState('');

  const { sessionId, resetSession } = useSession();
  const { messages, isLoading, error: chatError, sendMessage, clearMessages, setError, initMessages } = useChat();
  const { files, addFiles, uploadFiles, removeFile, clearFiles, isUploading, uploadProgress } = useFileUpload();
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

  // Fetch and restore conversation history on session load
  useEffect(() => {
    if (!sessionId) return;
    const restoreHistory = async () => {
      try {
        const result = await getHistory(sessionId);
        if (result.history.length > 0) {
          initMessages(result.history);
        }
      } catch (err) {
        // Silently ignore — could be a fresh session or DynamoDB not configured
        console.debug('No history found for session:', sessionId);
      }
    };
    restoreHistory();
  }, [sessionId]);

  // Handle file upload
  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      showToast('Please select files first', 'warning');
      return;
    }

    try {
      const fileIds = pendingFiles.map(f => f.id);
      await uploadFiles(fileIds, sessionId);
      showToast(`${pendingFiles.length} file(s) uploaded successfully`, 'success');
      setUploadView('history');
    } catch (err) {
      showToast('Upload failed', 'error');
    }
  };

  // Handle send message
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) {
      showToast('Please enter a message', 'warning');
      return;
    }

    if (files.length === 0 || files.every(f => f.status !== 'success')) {
      showToast('Please upload at least one PDF first', 'warning');
      return;
    }

    setMessageInput('');
    await sendMessage(sessionId, message);
  };

  // Handle new session
  const handleNewSession = () => {
    resetSession();
    clearMessages();
    clearFiles();
    setUploadView('zone');
    setSidebarOpen(false);
    showToast('New session created', 'info');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950">
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
            <div className="bg-red-900/20 border-b border-red-800 px-4 py-3">
              <p className="text-sm text-red-200">
                ⚠️ {connectionError}
              </p>
            </div>
          )}

          {/* Chat Error */}
          {chatError && (
            <div className="bg-red-900/20 border-b border-red-800 px-4 py-3">
              <p className="text-sm text-red-200">
                ❌ {chatError}
              </p>
            </div>
          )}

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-4 p-4">
            {/* Chat Section */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <ChatHistory messages={messages} isLoading={isLoading} />
              <ChatInput
                value={messageInput}
                onChange={(val) => setMessageInput(val || '')}
                onSubmit={() => handleSendMessage(messageInput)}
                isLoading={isLoading}
                disabled={files.length === 0 || connectionError !== undefined}
              />
            </div>

            {/* Files Panel - Always Visible */}
            <div className={clsx(
              'bg-slate-800 rounded-lg p-6 border border-slate-700',
              'lg:w-96 overflow-y-auto flex flex-col'
            )}>
              <h2 className="text-lg font-semibold text-white mb-4">
                {uploadView === 'zone' ? '📤 Upload PDFs' : '📚 Your Files'}
              </h2>

              {uploadView === 'zone' && (
                <FileUploadZone
                  files={files}
                  isUploading={isUploading}
                  onFilesSelected={addFiles}
                  onRemoveFile={removeFile}
                  onUpload={handleUpload}
                />
              )}

              {uploadView === 'history' && files.length > 0 && (
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {files.filter(f => f.status === 'success').map(f => (
                    <div key={f.id} className="p-3 bg-slate-900 rounded-lg flex items-start gap-3 hover:bg-slate-700 transition-colors cursor-pointer">
                      <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{f.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{f.size ? `${(f.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}</p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => { setUploadView('zone'); }}
                    className="w-full mt-4 px-3 py-2 text-sm font-medium text-sky-400 hover:bg-sky-900/20 rounded-lg transition-colors"
                  >
                    + Add more PDFs
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
