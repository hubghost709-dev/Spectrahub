'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/app/components/theme-provider';
import { Toaster } from 'sonner';
import AuthWrapper from '@/app/components/AuthWrapper';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider>
      <NextIntlClientProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="spectrahub-theme"
        >
          <AuthWrapper>{children}</AuthWrapper>
          <Toaster />
        </ThemeProvider>
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}

