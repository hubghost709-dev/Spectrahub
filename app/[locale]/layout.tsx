import { auth } from "@clerk/nextjs/server";
import { NextIntlClientProvider } from "next-intl";
import { notFound, redirect } from "next/navigation";
import { ReactNode } from "react";

export const metadata = {
  title: "Spectrahub",
  description: "Live streaming platform",
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  // 🔐 Clerk server-side auth
  const { userId } = auth();

  // 🔸 Protege rutas privadas
  // if (!userId) redirect(`/${locale}/sign-in`);

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


