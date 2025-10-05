'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';

const locales = {
  en: {
    label: 'En',
    flag: '/flags/en.svg',
  },
  es: {
    label: 'Es',
    flag: '/flags/es.svg',
  },
} as const;

type Locale = keyof typeof locales;

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;

  const switchLocale = () => {
    const newLocale: Locale = currentLocale === 'en' ? 'es' : 'en';
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const { flag, label } = locales[currentLocale];

  return (
    <button onClick={switchLocale} className="flex items-center gap-2 hover:opacity-80 transition">
      <Image
        src={flag}
        alt={label}
        width={24}
        height={24}
        className="rounded-full"
      />
      <span className="hidden sm:inline text-sm">{label}</span>
    </button>
  );
}