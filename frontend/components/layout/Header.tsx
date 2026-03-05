'use client';

import React from 'react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-900">
      <div className="flex items-center px-4 py-4 sm:px-6">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-slate-800 rounded-lg lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg
              className="h-6 w-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">📄 DocQuery AI</h1>
            <p className="text-xs text-gray-400">Chat with your PDFs</p>
          </div>
        </div>
      </div>
    </header>
  );
}
