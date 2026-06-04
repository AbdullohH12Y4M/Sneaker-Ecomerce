'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { Session } from 'next-auth';

function AuthTokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    const token = session?.user?.accessToken;
    if (token) {
      localStorage.setItem('access_token', token);
    }
  }, [session?.user?.accessToken]);

  return null;
}

interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <AuthTokenSync />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
