import type { Metadata } from "next";

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
  authors: [{ name: 'SpectraHub' }],
  creator: 'SpectraHub',
  publisher: 'SpectraHub',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        url: '/og-image.jpg', // Crea esta imagen 1200x630
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
    images: ['/twitter-image.jpg'], // 1200x675
    creator: '@spectrahub',
  },
  verification: {
    // google: 'tu-codigo-de-verificacion', // Agregar después de verificar en Google Search Console
  },
  alternates: {
    canonical: 'https://spectrahub.cloud',
    languages: {
      'en': 'https://spectrahub.cloud/en',
      'es': 'https://spectrahub.cloud/es',
    },
  },
};
