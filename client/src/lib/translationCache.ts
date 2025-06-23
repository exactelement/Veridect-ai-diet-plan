// Pre-populated translations for instant loading
export const PRELOADED_TRANSLATIONS: Record<string, Record<string, string>> = {
  'es': {
    'Home': 'Inicio',
    'Analyze': 'Analizar',
    'Rankings': 'Rankings',
    'Premium': 'Premium',
    'Profile': 'Perfil',
    'Smart Food Analysis with AI': 'Análisis Inteligente de Alimentos con IA',
    'Start Analyzing Food': 'Comenzar Análisis de Alimentos',
    'Get instant YES/NO/OK verdicts on your food choices': 'Obtén veredictos instantáneos SÍ/NO/OK sobre tus elecciones de comida',
    'Most Popular': 'Más Popular',
    'Current Plan': 'Plan Actual',
    'Choose': 'Elegir',
    'Free': 'Gratis'
  },
  'fr': {
    'Home': 'Accueil',
    'Analyze': 'Analyser',
    'Rankings': 'Classements',
    'Premium': 'Premium',
    'Profile': 'Profil',
    'Smart Food Analysis with AI': 'Analyse Intelligente des Aliments avec IA',
    'Start Analyzing Food': 'Commencer l\'Analyse des Aliments',
    'Get instant YES/NO/OK verdicts on your food choices': 'Obtenez des verdicts instantanés OUI/NON/OK sur vos choix alimentaires',
    'Most Popular': 'Le Plus Populaire',
    'Current Plan': 'Plan Actuel',
    'Choose': 'Choisir',
    'Free': 'Gratuit'
  },
  'de': {
    'Home': 'Startseite',
    'Analyze': 'Analysieren',
    'Rankings': 'Ranglisten',
    'Premium': 'Premium',
    'Profile': 'Profil',
    'Smart Food Analysis with AI': 'Intelligente Lebensmittelanalyse mit KI',
    'Start Analyzing Food': 'Lebensmittelanalyse Starten',
    'Get instant YES/NO/OK verdicts on your food choices': 'Erhalten Sie sofortige JA/NEIN/OK Urteile über Ihre Lebensmittelwahl',
    'Most Popular': 'Am Beliebtesten',
    'Current Plan': 'Aktueller Plan',
    'Choose': 'Wählen',
    'Free': 'Kostenlos'
  }
};

export function getPreloadedTranslation(text: string, language: string): string | null {
  return PRELOADED_TRANSLATIONS[language]?.[text] || null;
}