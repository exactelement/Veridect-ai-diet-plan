import { useState, createContext, useContext, useEffect } from 'react';

declare global {
  interface Window {
    translationTimeout?: number;
  }
}

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'sv', name: 'Svenska' },
  { code: 'pl', name: 'Polski' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'th', name: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'cs', name: 'Čeština' },
  { code: 'da', name: 'Dansk' },
  { code: 'fi', name: 'Suomi' },
  { code: 'no', name: 'Norsk' },
  { code: 'hu', name: 'Magyar' }
];

interface TranslationContextType {
  currentLanguage: string;
  translations: Record<string, string>;
  translateText: (text: string) => string;
  setLanguage: (language: string) => void;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType>({
  currentLanguage: 'en',
  translations: {},
  translateText: (text) => text,
  setLanguage: () => {},
  isTranslating: false,
});

export const useTranslation = () => useContext(TranslationContext);

async function translateTextAPI(text: string, targetLanguage: string): Promise<string> {
  if (targetLanguage === 'en') return text;
  
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`);
    const data = await response.json();
    
    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    return text;
  } catch (error) {
    console.warn('Translation failed:', error);
    return text;
  }
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('veridect-language') || 'en';
  });
  const [translations, setTranslations] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('veridect-translations');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isTranslating, setIsTranslating] = useState(false);

  const translatePage = async (language: string) => {
    if (language === 'en') {
      setCurrentLanguage('en');
      localStorage.setItem('veridect-language', 'en');
      location.reload();
      return;
    }

    setIsTranslating(true);
    setCurrentLanguage(language);
    localStorage.setItem('veridect-language', language);

    const elementsToTranslate = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, label, a');
    const textsToTranslate = new Set<string>();

    elementsToTranslate.forEach(element => {
      const text = element.textContent?.trim();
      if (text && text.length > 1 && !/^[\d\s\W]*$/.test(text)) {
        textsToTranslate.add(text);
      }
    });

    const newTranslations = { ...translations };
    
    for (const text of Array.from(textsToTranslate)) {
      const cacheKey = `${text}:${language}`;
      if (!newTranslations[cacheKey]) {
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          const translated = await translateTextAPI(text, language);
          newTranslations[cacheKey] = translated;
        } catch (error) {
          console.warn('Translation failed for:', text);
        }
      }
    }

    setTranslations(newTranslations);
    
    elementsToTranslate.forEach(element => {
      const originalText = element.textContent?.trim();
      if (originalText) {
        const cacheKey = `${originalText}:${language}`;
        if (newTranslations[cacheKey]) {
          element.textContent = newTranslations[cacheKey];
        }
      }
    });

    setIsTranslating(false);
  };

  useEffect(() => {
    if (currentLanguage !== 'en') {
      const observer = new MutationObserver(() => {
        clearTimeout(window.translationTimeout);
        window.translationTimeout = window.setTimeout(() => {
          const newElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, label, a');
          newElements.forEach(element => {
            const text = element.textContent?.trim();
            if (text) {
              const cacheKey = `${text}:${currentLanguage}`;
              if (translations[cacheKey]) {
                element.textContent = translations[cacheKey];
              }
            }
          });
        }, 300);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
        clearTimeout(window.translationTimeout);
      };
    }
  }, [currentLanguage, translations]);

  useEffect(() => {
    localStorage.setItem('veridect-translations', JSON.stringify(translations));
  }, [translations]);

  const contextValue: TranslationContextType = {
    currentLanguage,
    translations,
    translateText: (text) => {
      const cacheKey = `${text}:${currentLanguage}`;
      return translations[cacheKey] || text;
    },
    setLanguage: translatePage,
    isTranslating,
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

export default function TranslateWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { setLanguage, isTranslating, currentLanguage } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleTranslate = () => {
    setLanguage(selectedLanguage);
  };

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return (
      <Button
        onClick={() => setLanguage(currentLanguage === 'en' ? 'es' : 'en')}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 rounded-full p-3 shadow-lg"
        size="sm"
      >
        <Languages className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <>
      {!isVisible && (
        <Button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          size="lg"
        >
          <Languages className="w-6 h-6 text-white" />
        </Button>
      )}

      {isVisible && (
        <Card className="fixed bottom-6 right-6 z-50 bg-white border shadow-xl max-w-sm">
          {isMinimized ? (
            <div 
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" 
              onClick={() => setIsMinimized(false)}
            >
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Translate</span>
              </div>
              <div className="flex items-center gap-1">
                <Maximize2 className="w-4 h-4 text-gray-500" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVisible(false);
                  }}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 w-80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Translate Page</h3>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(true)}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Select Language
                  </label>
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose language" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 overflow-y-auto">
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setLanguage('en')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={currentLanguage === 'en' || isTranslating}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleTranslate}
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    disabled={selectedLanguage === 'en' || selectedLanguage === currentLanguage || isTranslating}
                  >
                    {isTranslating ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      'Translate'
                    )}
                  </Button>
                </div>

                {currentLanguage !== 'en' && (
                  <p className="text-xs text-green-600 text-center">
                    Page translated to {LANGUAGES.find(l => l.code === currentLanguage)?.name}
                  </p>
                )}
                
                {isTranslating && (
                  <p className="text-xs text-blue-600 text-center flex items-center justify-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Translating page content...
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </>
  );
}