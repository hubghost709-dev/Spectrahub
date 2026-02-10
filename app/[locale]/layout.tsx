import './globals.css';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { unstable_setRequestLocale } from 'next-intl/server';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'SpectraHUB – Live Streaming Platform',
    template: '%s | SpectraHUB',
  },
  description:
    'SpectraHUB is a live streaming platform for creators. Watch, chat and support streamers in real time.',
};

export default function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);

  return (
    <html lang={params.locale} suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

