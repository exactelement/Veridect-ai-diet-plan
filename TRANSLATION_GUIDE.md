# Veridect Translation System Guide

## Overview

Veridect features a comprehensive in-app translation system that supports 20+ languages with real-time text replacement. The system persists user language preferences across all pages and provides seamless multilingual experience.

## Architecture

### Components

1. **TranslationProvider** (`client/src/components/google-translate.tsx`)
   - React Context provider for global translation state
   - Manages language selection and translation cache
   - Handles localStorage persistence

2. **TranslateWidget** (`client/src/components/google-translate.tsx`)
   - Floating UI widget positioned bottom-right
   - Language selection dropdown with 20+ options
   - Minimize/maximize functionality

3. **Translation Engine**
   - Uses MyMemory Translation API (free tier)
   - Intelligent caching system with localStorage
   - DOM mutation observer for dynamic content

## Supported Languages

- English (en) - Default
- Spanish (es) - Español
- French (fr) - Français
- German (de) - Deutsch
- Italian (it) - Italiano
- Portuguese (pt) - Português
- Russian (ru) - Русский
- Japanese (ja) - 日本語
- Korean (ko) - 한국어
- Chinese (zh) - 中文
- Arabic (ar) - العربية
- Hindi (hi) - हिन्दी
- Dutch (nl) - Nederlands
- Polish (pl) - Polski
- Swedish (sv) - Svenska
- Danish (da) - Dansk
- Norwegian (no) - Norsk
- Finnish (fi) - Suomi
- Turkish (tr) - Türkçe
- Greek (el) - Ελληνικά

## Technical Implementation

### Translation Process

1. **Text Detection**
   - DOM TreeWalker scans for text nodes
   - Filters out scripts, styles, and non-translatable content
   - Respects `data-no-translate` attribute

2. **API Integration**
   - Batch processing (10 texts per batch)
   - Rate limiting with 100ms delays between batches
   - Fallback to original text on API failures

3. **Caching Strategy**
   - Cache key format: `${originalText}:${targetLanguage}`
   - localStorage persistence for offline access
   - Translation memory for consistent results

### Route-Based Translation

```typescript
// Auto-retranslation on route changes
useEffect(() => {
  if (currentLanguage !== 'en') {
    const timer = setTimeout(() => {
      setLanguage(currentLanguage);
    }, 800);
    return () => clearTimeout(timer);
  }
}, [location, currentLanguage, setLanguage]);
```

### DOM Monitoring

```typescript
// Monitor DOM changes for dynamic content
const observer = new MutationObserver((mutations) => {
  // Debounced retranslation for new content
});
```

## Usage Guidelines

### For Developers

1. **Marking Non-Translatable Content**
   ```html
   <div data-no-translate>Don't translate this</div>
   ```

2. **Accessing Translation Context**
   ```typescript
   import { useTranslation } from '@/components/google-translate';
   
   function MyComponent() {
     const { currentLanguage, translateText } = useTranslation();
     // Component logic
   }
   ```

3. **Translation-Aware Components**
   - Design components to handle text length variations
   - Use flexible layouts for different language text sizes
   - Consider RTL languages (Arabic) for UI adjustments

### For Users

1. **Accessing Translation**
   - Click the blue floating button (bottom-right)
   - Select desired language from dropdown
   - Click "Translate" to apply globally

2. **Language Persistence**
   - Selected language persists across all pages
   - Auto-translation on page navigation
   - Settings saved in browser localStorage

3. **Resetting Language**
   - Click "Reset" button to return to English
   - Clears translation state globally

## Performance Considerations

### Optimization Strategies

1. **Translation Caching**
   - Reduces API calls for repeated content
   - localStorage limits: ~5MB typical browser limit
   - Cache eviction: Manual clearing only

2. **Batch Processing**
   - Groups text nodes for efficient API usage
   - Prevents API rate limiting issues
   - Improves translation speed

3. **Debounced Retranslation**
   - 300ms delay for DOM changes
   - Prevents excessive API calls
   - Smooth user experience

### API Limitations

- **MyMemory Free Tier**: 1000 words/day
- **Rate Limiting**: Built-in delays between requests
- **Fallback Strategy**: Returns original text on failures

## Configuration

### Environment Variables

No environment variables required - uses public MyMemory API.

### localStorage Keys

- `veridect-language`: Current language code
- `veridect-translations`: Translation cache object

### Browser Compatibility

- Modern browsers with localStorage support
- MutationObserver API (IE11+)
- ES6+ features via Vite transpilation

## Troubleshooting

### Common Issues

1. **Translation Not Persisting**
   - Check localStorage is enabled
   - Verify browser doesn't clear storage
   - Ensure JavaScript is enabled

2. **Some Text Not Translating**
   - Check for `data-no-translate` attributes
   - Verify text length > 2 characters
   - Ensure text is not in excluded elements

3. **API Errors**
   - Check network connectivity
   - Verify MyMemory service status
   - Review browser console for errors

### Debug Mode

Enable verbose logging by setting:
```javascript
window.veridectDebugTranslation = true;
```

## Future Enhancements

### Planned Features

1. **Professional Translation Service**
   - Google Translate API integration
   - Improved accuracy for technical terms
   - Higher rate limits

2. **Language Detection**
   - Auto-detect user's browser language
   - Smart default language selection
   - Geolocation-based suggestions

3. **Translation Quality**
   - Context-aware translations
   - Food-specific terminology database
   - User feedback on translation quality

4. **Performance Improvements**
   - Service worker caching
   - Predictive translation loading
   - Optimized DOM scanning

## Maintenance

### Regular Tasks

1. **Cache Management**
   - Monitor localStorage usage
   - Implement cache size limits
   - Periodic cache cleanup

2. **API Monitoring**
   - Track MyMemory API usage
   - Monitor error rates
   - Plan for API upgrades

3. **Translation Quality**
   - Review user feedback
   - Update language mappings
   - Improve text detection rules

### Updates

- Translation system version: 1.0
- Last updated: June 23, 2025
- Next review: Monthly maintenance cycle