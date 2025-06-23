import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, X, Minimize2, Maximize2 } from 'lucide-react';

// Declare global Google Translate types
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

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

export default function GoogleTranslate() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: LANGUAGES.map(lang => lang.code).join(','),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        },
        'google_translate_element'
      );
      setIsLoaded(true);
    };

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const translatePage = (languageCode: string) => {
    if (!window.google || !window.google.translate) return;
    
    // Hide default Google Translate widget
    const googleWidget = document.getElementById('google_translate_element');
    if (googleWidget) {
      googleWidget.style.display = 'none';
    }

    // Find and click the appropriate language option
    const frame = document.querySelector('.goog-te-menu-frame');
    if (frame) {
      const frameDoc = frame.contentDocument || frame.contentWindow?.document;
      if (frameDoc) {
        const languageLink = frameDoc.querySelector(`a[lang="${languageCode}"]`);
        if (languageLink) {
          languageLink.click();
        }
      }
    } else {
      // Fallback: trigger translation programmatically
      const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = languageCode;
        selectElement.dispatchEvent(new Event('change'));
      }
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    translatePage(languageCode);
  };

  const resetTranslation = () => {
    setSelectedLanguage('en');
    translatePage('en');
  };

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
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      
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
                  onClick={resetTranslation}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={!isLoaded}
                >
                  Original
                </Button>
                <Button
                  onClick={() => handleLanguageChange(selectedLanguage)}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!isLoaded}
                >
                  Translate
                </Button>
              </div>

              {!isLoaded && (
                <p className="text-xs text-gray-500 text-center">
                  Loading translator...
                </p>
              )}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}