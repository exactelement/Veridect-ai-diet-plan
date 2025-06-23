// Instant translation system - replaces text at source during render
const INSTANT_TRANSLATIONS: Record<string, Record<string, string>> = {
  'es': {
    'Home': 'Inicio',
    'Analyze': 'Analizar', 
    'Progress': 'Progreso',
    'Rankings': 'Rankings',
    'Premium': 'Premium',
    'Profile': 'Perfil',
    'Yes': 'Sí',
    'No': 'No',
    'Smart Food Analysis with AI': 'Análisis Inteligente de Alimentos con IA',
    'Start Analyzing Food': 'Comenzar Análisis de Alimentos',
    'Get instant YES/NO/OK verdicts on your food choices. Make healthier decisions with AI-powered nutrition analysis.': 'Obtén veredictos instantáneos SÍ/NO/OK sobre tus elecciones de comida. Toma decisiones más saludables con análisis nutricional impulsado por IA.',
    'Most Popular': 'Más Popular',
    'Current Plan': 'Plan Actual',
    'Choose': 'Elegir',
    'Free': 'Gratis',
    'Basic nutrition analysis': 'Análisis nutricional básico',
    '5 analyses per day': '5 análisis por día',
    'Community leaderboard': 'Tabla de clasificación comunitaria'
  },
  'fr': {
    'Home': 'Accueil',
    'Analyze': 'Analyser',
    'Progress': 'Progrès',
    'Rankings': 'Classements', 
    'Premium': 'Premium',
    'Profile': 'Profil',
    'Yes': 'Oui',
    'No': 'Non',
    'Smart Food Analysis with AI': 'Analyse Intelligente des Aliments avec IA',
    'Start Analyzing Food': 'Commencer l\'Analyse des Aliments',
    'Get instant YES/NO/OK verdicts on your food choices. Make healthier decisions with AI-powered nutrition analysis.': 'Obtenez des verdicts instantanés OUI/NON/OK sur vos choix alimentaires. Prenez des décisions plus saines avec une analyse nutritionnelle alimentée par l\'IA.',
    'Most Popular': 'Le Plus Populaire',
    'Current Plan': 'Plan Actuel',
    'Choose': 'Choisir',
    'Free': 'Gratuit',
    'Basic nutrition analysis': 'Analyse nutritionnelle de base',
    '5 analyses par jour': '5 analyses par jour',
    'Community leaderboard': 'Classement communautaire'
  },
  'de': {
    'Home': 'Startseite',
    'Analyze': 'Analysieren',
    'Progress': 'Fortschritt',
    'Rankings': 'Ranglisten',
    'Premium': 'Premium', 
    'Profile': 'Profil',
    'Yes': 'Ja',
    'No': 'Nein',
    'Smart Food Analysis with AI': 'Intelligente Lebensmittelanalyse mit KI',
    'Start Analyzing Food': 'Lebensmittelanalyse Starten',
    'Get instant YES/NO/OK verdicts on your food choices. Make healthier decisions with AI-powered nutrition analysis.': 'Erhalten Sie sofortige JA/NEIN/OK Urteile über Ihre Lebensmittelwahl. Treffen Sie gesündere Entscheidungen mit KI-gestützter Ernährungsanalyse.',
    'Most Popular': 'Am Beliebtesten',
    'Current Plan': 'Aktueller Plan',
    'Choose': 'Wählen',
    'Free': 'Kostenlos',
    'Basic nutrition analysis': 'Grundlegende Ernährungsanalyse',
    '5 analyses per day': '5 Analysen pro Tag',
    'Community leaderboard': 'Community-Bestenliste'
  }
};

// Get current language from localStorage immediately
export function getCurrentLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  try {
    return localStorage.getItem('veridect-language') || 'en';
  } catch {
    return 'en';
  }
}

// Instant translation function - returns translated text immediately 
export function t(text: string): string {
  if (typeof window === 'undefined') return text;
  
  const currentLang = getCurrentLanguage();
  
  if (currentLang === 'en' || !currentLang) {
    return text;
  }
  
  const translation = INSTANT_TRANSLATIONS[currentLang]?.[text];
  return translation || text;
}

// React component for instant translation
export function T({ children }: { children: string }) {
  return t(children);
}