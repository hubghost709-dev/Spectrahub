"use client";

import { useTranslations } from 'next-intl';

interface AgeVerificationModalProps {
  onAccept: () => void;
  translations: ReturnType<typeof useTranslations>;
}

export default function AgeVerificationModal({ onAccept, translations }: AgeVerificationModalProps) {
  const handleUnder18 = () => {
    alert(translations('alert'));
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex justify-center items-center z-[9999]">
      <div className="bg-black p-6 rounded-lg shadow-lg text-center max-w-lg mx-4">
        <p className="text-lg font-bold text-white mb-4">
          {translations('title')}
        </p>
        <p className="text-sm text-white mb-4">{translations('description')}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onAccept}
            className="bg-blue-300 text-black px-4 py-2 rounded-lg hover:bg-blue-400 transition-colors"
          >
            {translations('accept')}
          </button>
          <button
            onClick={handleUnder18}
            className="bg-blue-300 text-black px-4 py-2 rounded-lg hover:bg-blue-400 transition-colors"
          >
            {translations('reject')}
          </button>
        </div>
      </div>
    </div>
  );
}
