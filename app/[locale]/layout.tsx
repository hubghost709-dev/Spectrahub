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

const inter = Inter({ subsets: ['latin'] });

// ✅ SEO mejorado
export const metadata: Metadata = {
  metadataBase: new URL('https://spectrahub.cloud'),
  title: {
    default: 'SpectraHub - Live Webcam Shows & Adult Video Chat',
    template: '%s | SpectraHub'
  },
  description: 'Watch free live webcam shows, private chats & interactive adult entertainment. Join thousands of verified models streaming 24/7. Token rewards & HD quality.',
  keywords: [
    'live webcam',
    'adult chat',
    'cam models',
    'live streaming',
    'video chat',
    'webcam shows',
    'adult entertainment',
    'live cam girls',
    'interactive shows',
    'token system'
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['es_ES'],
    url: 'https://spectrahub.cloud',
    siteName: 'SpectraHub',
    title: 'SpectraHub - Live Webcam Shows & Adult Video Chat',
    description: 'Watch free live webcam shows, private chats & interactive adult entertainment. Join thousands of verified models streaming 24/7.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SpectraHub Live Webcam Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpectraHub - Live Webcam Shows',
    description: 'Watch free live webcam shows & interactive adult entertainment',
    images: ['/twitter-image.jpg'],
  },
  alternates: {
    canonical: 'https://spectrahub.cloud',
    languages: {
      'en': 'https://spectrahub.cloud/en',
      'es': 'https://spectrahub.cloud/es',
    },
  },
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
        {/* ✅ Schema.org JSON-LD */}
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
