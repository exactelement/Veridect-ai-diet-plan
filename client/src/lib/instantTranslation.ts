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
    'Transform complex nutritional decisions into simple, AI-powered verdicts.': 'Transforma decisiones nutricionales complejas en veredictos simples impulsados por IA.',
    'Just snap a photo or describe your food, and get instant guidance.': 'Solo toma una foto o describe tu comida, y obtén orientación instantánea.',
    'Most Popular': 'Más Popular',
    'Current Plan': 'Plan Actual',
    'Choose': 'Elegir',
    'Free': 'Gratis',
    'Pro': 'Pro',
    'Medical': 'Médico',
    'Basic nutrition analysis': 'Análisis nutricional básico',
    'Advanced AI insights': 'Conocimientos avanzados de IA',
    'Medical-grade analysis': 'Análisis de grado médico',
    '5 analyses per day': '5 análisis por día',
    'Unlimited food scans': 'Escaneos de comida ilimitados',
    'Detailed nutrition reports': 'Informes nutricionales detallados',
    'Priority support': 'Soporte prioritario',
    'Healthcare integration': 'Integración sanitaria',
    'Community leaderboard': 'Tabla de clasificación comunitaria',
    'Get Started': 'Comenzar',
    'Login': 'Iniciar Sesión',
    'Features': 'Características',
    'Pricing': 'Precios',
    'How It Works': 'Cómo Funciona',
    'About': 'Acerca de',
    'Upgrade to': 'Actualizar a',
    'Try It Free': 'Pruébalo Gratis',
    'Watch Demo': 'Ver Demo'
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
    'Transform complex nutritional decisions into simple, AI-powered verdicts.': 'Transformez les décisions nutritionnelles complexes en verdicts simples alimentés par l\'IA.',
    'Just snap a photo or describe your food, and get instant guidance.': 'Prenez simplement une photo ou décrivez votre nourriture, et obtenez des conseils instantanés.',
    'Most Popular': 'Le Plus Populaire',
    'Current Plan': 'Plan Actuel',
    'Choose': 'Choisir',
    'Free': 'Gratuit',
    'Pro': 'Pro',
    'Medical': 'Médical',
    'Basic nutrition analysis': 'Analyse nutritionnelle de base',
    'Advanced AI insights': 'Analyses IA avancées',
    'Medical-grade analysis': 'Analyse de qualité médicale',
    '5 analyses per day': '5 analyses par jour',
    'Unlimited food scans': 'Scans alimentaires illimités',
    'Detailed nutrition reports': 'Rapports nutritionnels détaillés',
    'Priority support': 'Support prioritaire',
    'Healthcare integration': 'Intégration santé',
    'Community leaderboard': 'Classement communautaire',
    'Get Started': 'Commencer',
    'Login': 'Connexion',
    'Features': 'Fonctionnalités',
    'Pricing': 'Tarifs',
    'How It Works': 'Comment Ça Marche',
    'About': 'À Propos',
    'Upgrade to': 'Passer à',
    'Try It Free': 'Essayez Gratuitement',
    'Watch Demo': 'Voir la Démo'
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
    'Transform complex nutritional decisions into simple, AI-powered verdicts.': 'Verwandeln Sie komplexe Ernährungsentscheidungen in einfache, KI-gestützte Urteile.',
    'Just snap a photo or describe your food, and get instant guidance.': 'Machen Sie einfach ein Foto oder beschreiben Sie Ihr Essen und erhalten Sie sofortige Beratung.',
    'Most Popular': 'Am Beliebtesten',
    'Current Plan': 'Aktueller Plan',
    'Choose': 'Wählen',
    'Free': 'Kostenlos',
    'Pro': 'Pro',
    'Medical': 'Medizinisch',
    'Basic nutrition analysis': 'Grundlegende Ernährungsanalyse',
    'Advanced AI insights': 'Erweiterte KI-Einblicke',
    'Medical-grade analysis': 'Medizinische Analyse',
    '5 analyses per day': '5 Analysen pro Tag',
    'Unlimited food scans': 'Unbegrenzte Lebensmittel-Scans',
    'Detailed nutrition reports': 'Detaillierte Ernährungsberichte',
    'Priority support': 'Prioritärer Support',
    'Healthcare integration': 'Gesundheitswesen-Integration',
    'Community leaderboard': 'Community-Bestenliste',
    'Get Started': 'Loslegen',
    'Login': 'Anmelden',
    'Features': 'Funktionen',
    'Pricing': 'Preise',
    'How It Works': 'Wie Es Funktioniert',
    'About': 'Über Uns',
    'Upgrade to': 'Upgrade auf',
    'Try It Free': 'Kostenlos Testen',
    'Watch Demo': 'Demo Ansehen'
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