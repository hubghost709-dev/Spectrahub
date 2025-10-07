import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from 'sonner';
import AuthWrapper from './components/AuthWrapper';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  const messages = await getMessages({ locale }); // ✅ FIX

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="spectrahub-theme"
        >
          <ClerkProvider>
           <NextIntlClientProvider locale={locale} messages={messages}>
              <AuthWrapper locale={locale}>
                {children}
              </AuthWrapper>
              <Toaster />
            </NextIntlClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
