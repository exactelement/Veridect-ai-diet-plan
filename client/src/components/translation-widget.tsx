import { useState, useEffect, createContext, useContext } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

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

interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  isTranslating: boolean;
  translateText: (text: string) => string;
  translateAsync: (text: string) => Promise<string>;
}

const TranslationContext = createContext<TranslationContextType>({
  currentLanguage: 'en',
  setLanguage: () => {},
  isTranslating: false,
  translateText: (text) => text,
  translateAsync: async (text) => text,
});

export const useTranslation = () => useContext(TranslationContext);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('veridect-language') || 'en';
  });
  const [translations, setTranslations] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('veridect-translations');
    return saved ? JSON.parse(saved) : {};
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [location] = useLocation();

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (targetLang === 'en' || !text.trim()) return text;
    
    const cacheKey = `${text}:${targetLang}`;
    if (translations[cacheKey]) {
      return translations[cacheKey];
    }

    try {
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
    
    return text;
  };

  const translatePage = async (targetLang: string) => {
    if (targetLang === 'en') {
      setCurrentLanguage('en');
      localStorage.setItem('veridect-language', 'en');
      window.location.reload();
      return;
    }

    setIsTranslating(true);
    setCurrentLanguage(targetLang);
    localStorage.setItem('veridect-language', targetLang);
    
    // Find and translate all text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'code'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          if (parent.hasAttribute('data-no-translate')) {
            return NodeFilter.FILTER_REJECT;
          }
          
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

    // Translate in batches
    const batchSize = 5;
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
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setIsTranslating(false);
  };

  // Auto-translate on language change
  useEffect(() => {
    if (currentLanguage !== 'en') {
      const timer = setTimeout(() => {
        translatePage(currentLanguage);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentLanguage]);

  // Retranslate on route change
  useEffect(() => {
    if (currentLanguage !== 'en') {
      const timer = setTimeout(() => {
        translatePage(currentLanguage);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Save translations to localStorage
  useEffect(() => {
    localStorage.setItem('veridect-translations', JSON.stringify(translations));
  }, [translations]);

  const contextValue: TranslationContextType = {
    currentLanguage,
    setLanguage: translatePage,
    isTranslating,
    translateText: (text) => {
      const cacheKey = `${text}:${currentLanguage}`;
      return translations[cacheKey] || text;
    },
    translateAsync: (text) => translateText(text, currentLanguage),
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

export default function TranslationWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { setLanguage, isTranslating, currentLanguage } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        size="icon"
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 rounded-full w-12 h-12 shadow-lg"
      >
        <Languages className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 bg-white border shadow-xl max-w-sm">
      {isMinimized ? (
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Translate</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsMinimized(false)}
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Translate</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
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
                onClick={() => setLanguage(selectedLanguage)}
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
                Translated to {LANGUAGES.find(l => l.code === currentLanguage)?.name}
              </p>
            )}
            
            {isTranslating && (
              <p className="text-xs text-blue-600 text-center">
                Translating content...
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}