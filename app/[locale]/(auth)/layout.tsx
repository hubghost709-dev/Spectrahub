import { getMessages } from 'next-intl/server';

export default async function AuthLayout({ children, params }) {
  const messages = await getMessages({ locale: params.locale });

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

