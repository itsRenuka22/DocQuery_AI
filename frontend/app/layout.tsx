import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/context/SessionProvider';
import { ChatProvider } from '@/context/ChatProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DocQuery AI - Chat with Your PDFs',
  description: 'An intelligent document Q&A system powered by Google Gemini',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-gray-50`}>
        <SessionProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
