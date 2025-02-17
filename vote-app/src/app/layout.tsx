'use client';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { NearProvider } from '../context/NearContext';

import Navbar from '../components/Navbar';
import ClientProviders from '../components/ClientProviders';
import '../styles/globals.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ClientProviders>
            <Layout>{children}</Layout>
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
