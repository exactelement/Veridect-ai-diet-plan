import { useState, useEffect, createContext, useContext } from 'react';
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
  { code: 'pl', name: 'Polski' }
];

// Simple translation context
interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType>({
  currentLanguage: 'en',
  setLanguage: () => {},
  isTranslating: false,
});

export const useTranslation = () => useContext(TranslationContext);

export function SimpleTranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('veridect-language') || 'en';
  });
  const [isTranslating, setIsTranslating] = useState(false);

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

    try {
      // Use Google Translate to translate the entire page
      const googleTranslateUrl = `https://translate.google.com/translate?sl=en&tl=${targetLang}&u=${encodeURIComponent(window.location.href)}`;
      
      // Open in the same window
      window.location.href = googleTranslateUrl;
    } catch (error) {
      console.error('Translation failed:', error);
      setIsTranslating(false);
    }
  };

  const contextValue: TranslationContextType = {
    currentLanguage,
    setLanguage: translatePage,
    isTranslating,
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

export default function SimpleTranslator() {
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
                Original
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

            <p className="text-xs text-gray-500 text-center">
              Uses Google Translate for the entire page
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}