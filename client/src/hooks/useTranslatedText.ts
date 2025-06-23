import { useTranslation } from '@/components/google-translate';
import { useEffect, useState } from 'react';

export function useTranslatedText(text: string): string {
  const { translateText, currentLanguage, getTranslation } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  
  useEffect(() => {
    if (currentLanguage === 'en' || !text) {
      setTranslatedText(text);
      return;
    }
    
    // Check cache first
    const cached = translateText(text);
    if (cached !== text) {
      setTranslatedText(cached);
    } else {
      // Fetch translation if not cached
      getTranslation(text, currentLanguage).then(translated => {
        setTranslatedText(translated);
      });
    }
  }, [text, currentLanguage, translateText, getTranslation]);
  
  return translatedText;
}

// Simple component for translating text
export function T({ children }: { children: string }) {
  const translatedText = useTranslatedText(children);
  return translatedText;
}