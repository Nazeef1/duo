'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Hide sidebar on active lesson screen
  const isLessonPage = pathname.startsWith('/lesson');

  return (
    <html lang="en">
      <head>
        <title>Duolingo - Learn Spanish</title>
        <meta name="description" content="A premium gamified Duolingo clone for learning Spanish." />
      </head>
      <body>
        {isLessonPage ? (
          <main style={{ minHeight: '100vh', width: '100%' }}>{children}</main>
        ) : (
          <div className="app-container">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
        )}
      </body>
    </html>
  );
}
