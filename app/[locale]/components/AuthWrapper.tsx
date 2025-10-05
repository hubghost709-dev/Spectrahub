"use client";

import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import AgeVerificationModal from './AgeVerificationModal';

interface AuthWrapperProps {
  children: React.ReactNode;
  locale: string;
}

export default function AuthWrapper({ children, locale }: AuthWrapperProps) {
  const { isSignedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('ageModal');

  useEffect(() => {
    if (isSignedIn === null) return; // Espera a que Clerk cargue el estado

    const isHomePage = pathname === '/' || /^\/[a-z]{2}(\/)?$/.test(pathname);
    setShowModal(!isSignedIn && isHomePage);
  }, [isSignedIn, pathname]);

  return (
    <>
      {showModal && (
        <AgeVerificationModal
          onAccept={() => setShowModal(false)}
          translations={t}
        />
      )}
      {children}
    </>
  );
}