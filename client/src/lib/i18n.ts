// Comprehensive internationalization system
import { createContext, useContext } from 'react';

// Language codes and display names
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
];

// Translation keys interface for type safety
export interface TranslationKeys {
  // Navigation
  'nav.home': string;
  'nav.analyze': string;
  'nav.progress': string;
  'nav.rankings': string;
  'nav.premium': string;
  'nav.profile': string;
  
  // Landing page
  'landing.title': string;
  'landing.subtitle': string;
  'landing.cta.primary': string;
  'landing.cta.secondary': string;
  'landing.features.title': string;
  'landing.pricing.title': string;
  'landing.how.title': string;
  'landing.about.title': string;
  
  // Authentication
  'auth.login': string;
  'auth.logout': string;
  'auth.signup': string;
  'auth.get_started': string;
  
  // Subscription tiers
  'subscription.free': string;
  'subscription.pro': string;
  'subscription.medical': string;
  'subscription.most_popular': string;
  'subscription.current_plan': string;
  'subscription.upgrade_to': string;
  'subscription.choose': string;
  'subscription.free.description': string;
  'subscription.pro.description': string;
  'subscription.medical.description': string;
  
  // Features
  'features.basic_analysis': string;
  'features.advanced_insights': string;
  'features.medical_grade': string;
  'features.analyses_per_day': string;
  'features.unlimited_scans': string;
  'features.detailed_reports': string;
  'features.priority_support': string;
  'features.healthcare_integration': string;
  'features.community_leaderboard': string;
  
  // Food analysis
  'analysis.verdict.yes': string;
  'analysis.verdict.no': string;
  'analysis.verdict.ok': string;
  'analysis.uploading': string;
  'analysis.analyzing': string;
  'analysis.error': string;
  'analysis.try_again': string;
  'analysis.take_photo': string;
  'analysis.upload_image': string;
  'analysis.describe_food': string;
  
  // Profile & Settings
  'profile.personal_info': string;
  'profile.health_goals': string;
  'profile.dietary_preferences': string;
  'profile.notifications': string;
  'profile.privacy': string;
  'profile.account': string;
  'profile.save_changes': string;
  'profile.cancel': string;
  
  // Notifications & Messages
  'notification.success': string;
  'notification.error': string;
  'notification.warning': string;
  'notification.info': string;
  'notification.unauthorized': string;
  'notification.logged_out': string;
  
  // Common UI elements
  'common.yes': string;
  'common.no': string;
  'common.ok': string;
  'common.cancel': string;
  'common.save': string;
  'common.edit': string;
  'common.delete': string;
  'common.confirm': string;
  'common.loading': string;
  'common.error': string;
  'common.retry': string;
  'common.close': string;
  'common.back': string;
  'common.next': string;
  'common.previous': string;
  'common.finish': string;
  'common.skip': string;
  
  // Time & Dates
  'time.today': string;
  'time.yesterday': string;
  'time.this_week': string;
  'time.last_week': string;
  'time.this_month': string;
  'time.days_remaining': string;
  'time.week_resets': string;
  
  // Health & Nutrition
  'health.calories': string;
  'health.protein': string;
  'health.carbs': string;
  'health.fat': string;
  'health.fiber': string;
  'health.sugar': string;
  'health.sodium': string;
  'health.vitamins': string;
  'health.minerals': string;
  'health.portion_size': string;
  'health.nutrition_facts': string;
  
  // Progress & Stats
  'stats.total_points': string;
  'stats.weekly_points': string;
  'stats.level': string;
  'stats.rank': string;
  'stats.streak': string;
  'stats.analyses_completed': string;
  'stats.weekly_challenge': string;
  'stats.leaderboard': string;
  
  // Errors & Validation
  'error.required_field': string;
  'error.invalid_email': string;
  'error.password_too_short': string;
  'error.network_error': string;
  'error.server_error': string;
  'error.not_found': string;
  'error.forbidden': string;
  'error.upload_failed': string;
  'error.analysis_failed': string;
}

// Get current language from localStorage
export function getCurrentLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  try {
    return localStorage.getItem('veridect-language') || 'en';
  } catch {
    return 'en';
  }
}

// Set language preference
export function setLanguage(language: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('veridect-language', language);
}

// Translation context
export interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: keyof TranslationKeys, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

export const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  isRTL: false,
});

// Hook to use translations
export function useTranslation() {
  return useContext(I18nContext);
}

// Check if language is RTL
export function isRTLLanguage(language: string): boolean {
  return ['ar', 'he', 'fa', 'ur'].includes(language);
}

// Format translation with parameters
export function formatTranslation(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  
  let formatted = text;
  Object.entries(params).forEach(([key, value]) => {
    formatted = formatted.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });
  
  return formatted;
}