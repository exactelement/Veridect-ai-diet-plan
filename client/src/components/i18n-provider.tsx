import React, { useState, useEffect, ReactNode } from 'react';
import { I18nContext, getCurrentLanguage, setLanguage as setStoredLanguage, isRTLLanguage } from '@/lib/i18n';
import { getTranslation } from '@/lib/translations';
import type { TranslationKeys } from '@/lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState(() => getCurrentLanguage());
  const [isRTL, setIsRTL] = useState(() => isRTLLanguage(getCurrentLanguage()));

  useEffect(() => {
    setIsRTL(isRTLLanguage(language));
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [language, isRTL]);

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    setStoredLanguage(newLanguage);
    setIsRTL(isRTLLanguage(newLanguage));
  };

  const t = (key: keyof TranslationKeys, params?: Record<string, string | number>) => {
    return getTranslation(language, key, params);
  };

  return (
    <I18nContext.Provider 
      value={{
        language,
        setLanguage: changeLanguage,
        t,
        isRTL,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}