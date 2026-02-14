import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from 'sonner';
import AuthWrapper from './components/AuthWrapper';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  // ... tu metadata actual ...
};

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale;
  const messages = await getMessages({ locale });
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* ✅ Lovense SDK */}
        <Script
          src="https://api.lovense-api.com/cam-extension/static/js-sdk/broadcast.js"
          strategy="beforeInteractive"
        />
        
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "SpectraHub",
              "url": "https://spectrahub.cloud",
              "description": "Live webcam platform for adult entertainment",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://spectrahub.cloud/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ClerkProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              storageKey="spectrahub-theme"
            >
              <AuthWrapper locale={locale}>
                {children}
              </AuthWrapper>
              <Toaster />
            </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
