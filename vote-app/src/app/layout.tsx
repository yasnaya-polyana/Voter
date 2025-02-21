'use client';

import { AuthProvider } from '../context/AuthContext';
import { NearProvider } from '../context/NearContext';
import { NearAuthGuard } from '@/components/NearAuthGuard';
import Navbar from '../components/Navbar';
import '../styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NearProvider>
            <NearAuthGuard>
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </NearAuthGuard>
          </NearProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
