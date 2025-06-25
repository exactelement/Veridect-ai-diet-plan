import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, Minimize2, Maximize2, X } from 'lucide-react';

// Translation context
interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  translateText: (text: string) => Promise<string>;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};

// Supported languages
const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'da', name: 'Danish', native: 'Dansk' },
  { code: 'no', name: 'Norwegian', native: 'Norsk' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά' },
];

// Translation cache
const CACHE_KEY = 'veridect-translations';
const LANGUAGE_KEY = 'veridect-language';

class TranslationCache {
  private cache: Map<string, string> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load translation cache:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.cache);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save translation cache:', error);
    }
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: string) {
    this.cache.set(key, value);
    this.saveToStorage();
  }

  clear() {
    this.cache.clear();
    localStorage.removeItem(CACHE_KEY);
  }
}

const translationCache = new TranslationCache();

// Translation service using MyMemory API
class TranslationService {
  private static async translateWithMyMemory(text: string, targetLang: string): Promise<string> {
    const cacheKey = `${text}:${targetLang}`;
    const cached = translationCache.get(cacheKey);
    if (cached) return cached;

    try {
      const encodedText = encodeURIComponent(text);
      const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        translationCache.set(cacheKey, translated);
        return translated;
      }
      
      return text; // Fallback to original
    } catch (error) {
      console.warn('Translation failed:', error);
      return text; // Fallback to original
    }
  }

  static async translateText(text: string, targetLang: string): Promise<string> {
    if (targetLang === 'en' || !text.trim() || text.length < 2) return text;
    
    // Don't translate numbers, URLs, or very short text
    if (/^\d+$/.test(text) || /^https?:\/\//.test(text)) return text;
    
    return await this.translateWithMyMemory(text, targetLang);
  }
}

// DOM translation utilities
class DOMTranslator {
  private static originalTexts = new Map<Node, string>();
  private static isTranslating = false;

  static async translatePage(language: string) {
    if (this.isTranslating) return;
    this.isTranslating = true;

    try {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            
            // Skip script, style, and other non-translatable elements
            const skipTags = ['script', 'style', 'code', 'pre', 'noscript'];
            if (skipTags.includes(parent.tagName.toLowerCase())) {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Skip elements with data-no-translate
            if (parent.hasAttribute('data-no-translate')) {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Only translate text with meaningful content
            const text = node.textContent?.trim();
            if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
            
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const textNodes: Text[] = [];
      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node as Text);
      }

      // Process in batches to avoid rate limiting
      const batchSize = 5;
      for (let i = 0; i < textNodes.length; i += batchSize) {
        const batch = textNodes.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (textNode) => {
          const originalText = textNode.textContent || '';
          
          // Store original text if not already stored
          if (!this.originalTexts.has(textNode)) {
            this.originalTexts.set(textNode, originalText);
          }
          
          if (language === 'en') {
            // Restore original text
            const original = this.originalTexts.get(textNode);
            if (original) {
              textNode.textContent = original;
            }
          } else {
            // Translate text
            const translated = await TranslationService.translateText(originalText, language);
            textNode.textContent = translated;
          }
        }));
        
        // Small delay between batches
        if (i + batchSize < textNodes.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } finally {
      this.isTranslating = false;
    }
  }

  static reset() {
    this.originalTexts.clear();
  }
}

// Translation Provider Component
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    // Load saved language preference
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved && saved !== 'en') {
      setCurrentLanguage(saved);
      // Auto-translate on load if non-English is selected
      setTimeout(() => setLanguage(saved), 1000);
    }
  }, []);

  const setLanguage = useCallback(async (lang: string) => {
    setIsTranslating(true);
    setCurrentLanguage(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);

    try {
      await DOMTranslator.translatePage(lang);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const translateText = useCallback(async (text: string): Promise<string> => {
    return await TranslationService.translateText(text, currentLanguage);
  }, [currentLanguage]);

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      setLanguage,
      translateText,
      isTranslating
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

// Translation Widget Component
export function TranslationWidget() {
  const { currentLanguage, setLanguage, isTranslating } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const handleLanguageChange = async (lang: string) => {
    await setLanguage(lang);
    setIsMinimized(true);
  };

  const handleReset = async () => {
    await setLanguage('en');
    DOMTranslator.reset();
    translationCache.clear();
    setIsMinimized(true);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isMinimized ? (
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-ios-blue hover:bg-ios-blue/90 text-white rounded-full p-3 shadow-lg"
          disabled={isTranslating}
        >
          <Languages className="w-5 h-5" />
        </Button>
      ) : (
        <Card className="w-80 shadow-xl border-2 border-ios-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-ios-blue" />
                <h3 className="font-semibold text-gray-800">Translate</h3>
              </div>
              <div className="flex gap-1">
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

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Language
                </label>
                <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.native} ({lang.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  disabled={isTranslating}
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => setIsMinimized(true)}
                  size="sm"
                  disabled={isTranslating}
                  className="flex-1"
                >
                  {isTranslating ? 'Translating...' : 'Done'}
                </Button>
              </div>

              {currentLanguage !== 'en' && (
                <p className="text-xs text-gray-500 text-center">
                  Current: {LANGUAGES.find(l => l.code === currentLanguage)?.native}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}