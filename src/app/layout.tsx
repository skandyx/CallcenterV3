import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { StreamStatusProvider } from '@/context/stream-status-provider';

export const metadata: Metadata = {
  title: 'Call Center Pulse',
  description: 'Real-time analytics dashboard for call centers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className={cn("font-body antialiased", "bg-background")}>
        <StreamStatusProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </StreamStatusProvider>
        <Toaster />
      </body>
    </html>
  );
}
