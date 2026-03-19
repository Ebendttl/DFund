'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'border-4 border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
          duration: 5000,
        }}
      />
    </QueryClientProvider>
  );
}
