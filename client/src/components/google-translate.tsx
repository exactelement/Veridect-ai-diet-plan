import { useState, createContext, useContext, useEffect } from 'react';
import { PRELOADED_TRANSLATIONS } from '@/lib/translationCache';

// Declare global types for window
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
  { code: 'hi', name: 'हिन्दी' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'sv', name: 'Svenska' },
  { code: 'da', name: 'Dansk' },
  { code: 'no', name: 'Norsk' },
  { code: 'fi', name: 'Suomi' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'el', name: 'Ελληνικά' }
];

// Translation Context
interface TranslationContextType {
  currentLanguage: string;
  translations: Record<string, string>;
  translateText: (text: string) => string;
  setLanguage: (language: string) => void;
  isTranslating: boolean;
  getTranslation: (text: string) => Promise<string>;
}

const TranslationContext = createContext<TranslationContextType>({
  currentLanguage: 'en',
  translations: {},
  translateText: (text) => text,
  setLanguage: () => {},
  isTranslating: false,
  getTranslation: async (text) => text,
});

export const useTranslation = () => useContext(TranslationContext);

// Translation Provider Component
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('veridect-language') || 'en';
  });
  const [translations, setTranslations] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('veridect-translations');
    const savedTranslations = saved ? JSON.parse(saved) : {};
    
    // Merge with preloaded translations
    const preloaded: Record<string, string> = {};
    Object.entries(PRELOADED_TRANSLATIONS).forEach(([lang, texts]) => {
      Object.entries(texts).forEach(([original, translated]) => {
        preloaded[`${original}:${lang}`] = translated;
      });
    });
    
    return { ...preloaded, ...savedTranslations };
  });
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (targetLang === 'en' || !text.trim()) return text;
    
    const cacheKey = `${text}:${targetLang}`;
    if (translations[cacheKey]) {
      return translations[cacheKey];
    }

    try {
      // Use a free translation API (MyMemory)
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translatedText = data.responseData.translatedText;
        setTranslations(prev => ({ ...prev, [cacheKey]: translatedText }));
        return translatedText;
      }
    } catch (error) {
      console.warn('Translation failed:', error);
    }
    
    return text; // Fallback to original text
  };

  const translatePage = async (targetLang: string) => {
    setCurrentLanguage(targetLang);
    localStorage.setItem('veridect-language', targetLang);
    
    if (targetLang === 'en') {
      return;
    }
    
    // Find all text nodes and translate them
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          // Skip script, style, and other non-visible elements
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'code'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip if parent has data-no-translate attribute
          if (parent.hasAttribute('data-no-translate')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Only translate nodes with meaningful text
          const text = node.textContent?.trim();
          if (!text || text.length < 2 || /^[\d\s\W]+$/.test(text)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    // Translate in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < textNodes.length; i += batchSize) {
      const batch = textNodes.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (textNode) => {
        const originalText = textNode.textContent || '';
        if (originalText.trim()) {
          const translatedText = await translateText(originalText, targetLang);
          if (translatedText !== originalText) {
            textNode.textContent = translatedText;
          }
        }
      }));
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsTranslating(false);
  };

  // Remove auto-translation effects to prevent refresh loops
  useEffect(() => {
    // Only save translations to localStorage when they change
    if (Object.keys(translations).length > 0) {
      localStorage.setItem('veridect-translations', JSON.stringify(translations));
    }
  }, [translations]);

  // Save translations to localStorage whenever they change
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
    getTranslation: translateText,
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

  // Update selected language when current language changes
  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
        size="sm"
      >
        <Languages className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <>
      {/* Floating Translation Widget */}
      <Card className="fixed bottom-6 right-6 z-50 bg-white border shadow-xl max-w-sm">
        {isMinimized ? (
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Translate</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="h-8 w-8 p-0"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">Translate Page</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="h-8 w-8 p-0"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-8 w-8 p-0"
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
                  <SelectContent>
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={selectedLanguage === 'en' || isTranslating}
                >
                  {isTranslating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
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
                <p className="text-xs text-blue-600 text-center">
                  Translating page content...
                </p>
              )}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}