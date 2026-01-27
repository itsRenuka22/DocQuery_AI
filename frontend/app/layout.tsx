import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeProvider';
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-50`}>
        <ThemeProvider>
          <SessionProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
