import { useTranslation } from '@/components/google-translate';
import { useMemo } from 'react';

export function useTranslatedText(text: string): string {
  const { translateText, currentLanguage, translations } = useTranslation();
  
  return useMemo(() => {
    if (currentLanguage === 'en' || !text) {
      return text;
    }
    
    // Check for exact cached translation first
    const cacheKey = `${text}:${currentLanguage}`;
    const cached = translations[cacheKey];
    
    if (cached) {
      return cached;
    }
    
    // Return original text if no translation available
    return text;
  }, [text, currentLanguage, translations]);
}

// Enhanced T component with better caching
export function T({ children }: { children: string }) {
  const translatedText = useTranslatedText(children);
  return translatedText;
}