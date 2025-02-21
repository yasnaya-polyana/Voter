'use client';

import { NearProvider } from '@/context/NearContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <NearProvider>{children}</NearProvider>;
} 