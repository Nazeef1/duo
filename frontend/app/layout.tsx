'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { useUserStore } from '@/store/useUserStore';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const loadPreferences = useUserStore(state => state.loadPreferences);

  useEffect(() => {
    // Always apply dark theme by default on first load
    if (typeof document !== 'undefined') {
      const savedTheme = localStorage.getItem('pref_theme');
      if (!savedTheme || savedTheme === 'system') {
        // Default to dark mode like real Duolingo
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    }
    loadPreferences();
  }, [loadPreferences]);

  // Hide sidebar on active lesson screen
  const isLessonPage = pathname.startsWith('/lesson');

  return (
    <html lang="en" data-theme="dark">
      <head>
        <title>Duolingo - Learn Spanish</title>
        <meta name="description" content="A premium gamified Duolingo clone for learning Spanish." />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('pref_theme');
                  var theme = 'dark'; // Force dark mode to match perfect reference UI
                  localStorage.setItem('pref_theme', 'dark');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        {isLessonPage ? (
          <main style={{ minHeight: '100vh', width: '100%' }}>{children}</main>
        ) : (
          <div className="app-container">
            <Sidebar />
            <main className={`main-content ${pathname === '/' ? 'has-right-sidebar' : ''}`}>
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}
