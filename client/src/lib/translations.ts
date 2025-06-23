// Complete translation dictionaries for all languages
import type { TranslationKeys } from './i18n';

export const translations: Record<string, TranslationKeys> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.analyze': 'Analyze',
    'nav.progress': 'Progress',
    'nav.rankings': 'Rankings',
    'nav.premium': 'Premium',
    'nav.profile': 'Profile',
    
    // Landing page
    'landing.title': 'Smart Food Analysis with AI',
    'landing.subtitle': 'Transform complex nutritional decisions into simple, AI-powered verdicts. Get instant health guidance that adapts to your goals and lifestyle.',
    'landing.cta.primary': 'Try It Free',
    'landing.cta.secondary': 'Watch Demo',
    'landing.features.title': 'Features',
    'landing.pricing.title': 'Pricing',
    'landing.how.title': 'How It Works',
    'landing.about.title': 'About',
    
    // Authentication
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.signup': 'Sign Up',
    'auth.get_started': 'Get Started',
    
    // Subscription tiers
    'subscription.free': 'Free',
    'subscription.pro': 'Pro',
    'subscription.medical': 'Medical',
    'subscription.most_popular': 'Most Popular',
    'subscription.current_plan': 'Current Plan',
    'subscription.upgrade_to': 'Upgrade to',
    'subscription.choose': 'Choose',
    'subscription.free.description': 'Basic nutrition analysis for everyday use',
    'subscription.pro.description': 'Advanced AI insights for health enthusiasts',
    'subscription.medical.description': 'Medical-grade analysis for healthcare professionals',
    
    // Features
    'features.basic_analysis': 'Basic nutrition analysis',
    'features.advanced_insights': 'Advanced AI insights',
    'features.medical_grade': 'Medical-grade analysis',
    'features.analyses_per_day': '{{count}} analyses per day',
    'features.unlimited_scans': 'Unlimited food scans',
    'features.detailed_reports': 'Detailed nutrition reports',
    'features.priority_support': 'Priority support',
    'features.healthcare_integration': 'Healthcare integration',
    'features.community_leaderboard': 'Community leaderboard',
    
    // Food analysis
    'analysis.verdict.yes': 'YES',
    'analysis.verdict.no': 'NO',
    'analysis.verdict.ok': 'OK',
    'analysis.uploading': 'Uploading...',
    'analysis.analyzing': 'Analyzing...',
    'analysis.error': 'Analysis failed',
    'analysis.try_again': 'Try Again',
    'analysis.take_photo': 'Take Photo',
    'analysis.upload_image': 'Upload Image',
    'analysis.describe_food': 'Describe Food',
    
    // Profile & Settings
    'profile.personal_info': 'Personal Information',
    'profile.health_goals': 'Health Goals',
    'profile.dietary_preferences': 'Dietary Preferences',
    'profile.notifications': 'Notifications',
    'profile.privacy': 'Privacy',
    'profile.account': 'Account',
    'profile.save_changes': 'Save Changes',
    'profile.cancel': 'Cancel',
    
    // Notifications & Messages
    'notification.success': 'Success',
    'notification.error': 'Error',
    'notification.warning': 'Warning',
    'notification.info': 'Information',
    'notification.unauthorized': 'You are logged out. Logging in again...',
    'notification.logged_out': 'You have been logged out',
    
    // Common UI elements
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.finish': 'Finish',
    'common.skip': 'Skip',
    
    // Time & Dates
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.this_week': 'This Week',
    'time.last_week': 'Last Week',
    'time.this_month': 'This Month',
    'time.days_remaining': '{{count}} days remaining',
    'time.week_resets': 'Week resets',
    
    // Health & Nutrition
    'health.calories': 'Calories',
    'health.protein': 'Protein',
    'health.carbs': 'Carbohydrates',
    'health.fat': 'Fat',
    'health.fiber': 'Fiber',
    'health.sugar': 'Sugar',
    'health.sodium': 'Sodium',
    'health.vitamins': 'Vitamins',
    'health.minerals': 'Minerals',
    'health.portion_size': 'Portion Size',
    'health.nutrition_facts': 'Nutrition Facts',
    
    // Progress & Stats
    'stats.total_points': 'Total Points',
    'stats.weekly_points': 'Weekly Points',
    'stats.level': 'Level',
    'stats.rank': 'Rank',
    'stats.streak': 'Streak',
    'stats.analyses_completed': 'Analyses Completed',
    'stats.weekly_challenge': 'Weekly Challenge',
    'stats.leaderboard': 'Leaderboard',
    
    // Errors & Validation
    'error.required_field': 'This field is required',
    'error.invalid_email': 'Invalid email address',
    'error.password_too_short': 'Password must be at least 8 characters',
    'error.network_error': 'Network error. Please check your connection.',
    'error.server_error': 'Server error. Please try again later.',
    'error.not_found': 'Not found',
    'error.forbidden': 'Access denied',
    'error.upload_failed': 'Upload failed',
    'error.analysis_failed': 'Analysis failed',
  },

  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.analyze': 'Analizar',
    'nav.progress': 'Progreso',
    'nav.rankings': 'Rankings',
    'nav.premium': 'Premium',
    'nav.profile': 'Perfil',
    
    // Landing page
    'landing.title': 'Análisis Inteligente de Alimentos con IA',
    'landing.subtitle': 'Transforma decisiones nutricionales complejas en veredictos simples impulsados por IA. Obtén orientación de salud instantánea que se adapta a tus objetivos y estilo de vida.',
    'landing.cta.primary': 'Pruébalo Gratis',
    'landing.cta.secondary': 'Ver Demo',
    'landing.features.title': 'Características',
    'landing.pricing.title': 'Precios',
    'landing.how.title': 'Cómo Funciona',
    'landing.about.title': 'Acerca de',
    
    // Authentication
    'auth.login': 'Iniciar Sesión',
    'auth.logout': 'Cerrar Sesión',
    'auth.signup': 'Registrarse',
    'auth.get_started': 'Comenzar',
    
    // Subscription tiers
    'subscription.free': 'Gratis',
    'subscription.pro': 'Pro',
    'subscription.medical': 'Médico',
    'subscription.most_popular': 'Más Popular',
    'subscription.current_plan': 'Plan Actual',
    'subscription.upgrade_to': 'Actualizar a',
    'subscription.choose': 'Elegir',
    'subscription.free.description': 'Análisis nutricional básico para uso diario',
    'subscription.pro.description': 'Conocimientos avanzados de IA para entusiastas de la salud',
    'subscription.medical.description': 'Análisis de grado médico para profesionales de la salud',
    
    // Features
    'features.basic_analysis': 'Análisis nutricional básico',
    'features.advanced_insights': 'Conocimientos avanzados de IA',
    'features.medical_grade': 'Análisis de grado médico',
    'features.analyses_per_day': '{{count}} análisis por día',
    'features.unlimited_scans': 'Escaneos de comida ilimitados',
    'features.detailed_reports': 'Informes nutricionales detallados',
    'features.priority_support': 'Soporte prioritario',
    'features.healthcare_integration': 'Integración sanitaria',
    'features.community_leaderboard': 'Tabla de clasificación comunitaria',
    
    // Food analysis
    'analysis.verdict.yes': 'SÍ',
    'analysis.verdict.no': 'NO',
    'analysis.verdict.ok': 'OK',
    'analysis.uploading': 'Subiendo...',
    'analysis.analyzing': 'Analizando...',
    'analysis.error': 'Análisis fallido',
    'analysis.try_again': 'Intentar de Nuevo',
    'analysis.take_photo': 'Tomar Foto',
    'analysis.upload_image': 'Subir Imagen',
    'analysis.describe_food': 'Describir Comida',
    
    // Profile & Settings
    'profile.personal_info': 'Información Personal',
    'profile.health_goals': 'Objetivos de Salud',
    'profile.dietary_preferences': 'Preferencias Dietéticas',
    'profile.notifications': 'Notificaciones',
    'profile.privacy': 'Privacidad',
    'profile.account': 'Cuenta',
    'profile.save_changes': 'Guardar Cambios',
    'profile.cancel': 'Cancelar',
    
    // Notifications & Messages
    'notification.success': 'Éxito',
    'notification.error': 'Error',
    'notification.warning': 'Advertencia',
    'notification.info': 'Información',
    'notification.unauthorized': 'Has sido desconectado. Iniciando sesión de nuevo...',
    'notification.logged_out': 'Has cerrado sesión',
    
    // Common UI elements
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.confirm': 'Confirmar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.retry': 'Reintentar',
    'common.close': 'Cerrar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.finish': 'Finalizar',
    'common.skip': 'Saltar',
    
    // Time & Dates
    'time.today': 'Hoy',
    'time.yesterday': 'Ayer',
    'time.this_week': 'Esta Semana',
    'time.last_week': 'Semana Pasada',
    'time.this_month': 'Este Mes',
    'time.days_remaining': '{{count}} días restantes',
    'time.week_resets': 'La semana se reinicia',
    
    // Health & Nutrition
    'health.calories': 'Calorías',
    'health.protein': 'Proteína',
    'health.carbs': 'Carbohidratos',
    'health.fat': 'Grasa',
    'health.fiber': 'Fibra',
    'health.sugar': 'Azúcar',
    'health.sodium': 'Sodio',
    'health.vitamins': 'Vitaminas',
    'health.minerals': 'Minerales',
    'health.portion_size': 'Tamaño de Porción',
    'health.nutrition_facts': 'Información Nutricional',
    
    // Progress & Stats
    'stats.total_points': 'Puntos Totales',
    'stats.weekly_points': 'Puntos Semanales',
    'stats.level': 'Nivel',
    'stats.rank': 'Rango',
    'stats.streak': 'Racha',
    'stats.analyses_completed': 'Análisis Completados',
    'stats.weekly_challenge': 'Desafío Semanal',
    'stats.leaderboard': 'Tabla de Clasificación',
    
    // Errors & Validation
    'error.required_field': 'Este campo es obligatorio',
    'error.invalid_email': 'Dirección de correo inválida',
    'error.password_too_short': 'La contraseña debe tener al menos 8 caracteres',
    'error.network_error': 'Error de red. Por favor verifica tu conexión.',
    'error.server_error': 'Error del servidor. Por favor intenta más tarde.',
    'error.not_found': 'No encontrado',
    'error.forbidden': 'Acceso denegado',
    'error.upload_failed': 'Carga fallida',
    'error.analysis_failed': 'Análisis fallido',
  },

  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.analyze': 'Analyser',
    'nav.progress': 'Progrès',
    'nav.rankings': 'Classements',
    'nav.premium': 'Premium',
    'nav.profile': 'Profil',
    
    // Landing page
    'landing.title': 'Analyse Intelligente des Aliments avec IA',
    'landing.subtitle': 'Transformez les décisions nutritionnelles complexes en verdicts simples alimentés par l\'IA. Obtenez des conseils de santé instantanés qui s\'adaptent à vos objectifs et à votre mode de vie.',
    'landing.cta.primary': 'Essayez Gratuitement',
    'landing.cta.secondary': 'Voir la Démo',
    'landing.features.title': 'Fonctionnalités',
    'landing.pricing.title': 'Tarifs',
    'landing.how.title': 'Comment Ça Marche',
    'landing.about.title': 'À Propos',
    
    // Authentication
    'auth.login': 'Connexion',
    'auth.logout': 'Déconnexion',
    'auth.signup': 'S\'inscrire',
    'auth.get_started': 'Commencer',
    
    // Subscription tiers
    'subscription.free': 'Gratuit',
    'subscription.pro': 'Pro',
    'subscription.medical': 'Médical',
    'subscription.most_popular': 'Le Plus Populaire',
    'subscription.current_plan': 'Plan Actuel',
    'subscription.upgrade_to': 'Passer à',
    'subscription.choose': 'Choisir',
    'subscription.free.description': 'Analyse nutritionnelle de base pour un usage quotidien',
    'subscription.pro.description': 'Analyses IA avancées pour les passionnés de santé',
    'subscription.medical.description': 'Analyse de qualité médicale pour les professionnels de santé',
    
    // Features
    'features.basic_analysis': 'Analyse nutritionnelle de base',
    'features.advanced_insights': 'Analyses IA avancées',
    'features.medical_grade': 'Analyse de qualité médicale',
    'features.analyses_per_day': '{{count}} analyses par jour',
    'features.unlimited_scans': 'Scans alimentaires illimités',
    'features.detailed_reports': 'Rapports nutritionnels détaillés',
    'features.priority_support': 'Support prioritaire',
    'features.healthcare_integration': 'Intégration santé',
    'features.community_leaderboard': 'Classement communautaire',
    
    // Food analysis
    'analysis.verdict.yes': 'OUI',
    'analysis.verdict.no': 'NON',
    'analysis.verdict.ok': 'OK',
    'analysis.uploading': 'Téléchargement...',
    'analysis.analyzing': 'Analyse...',
    'analysis.error': 'Analyse échouée',
    'analysis.try_again': 'Réessayer',
    'analysis.take_photo': 'Prendre une Photo',
    'analysis.upload_image': 'Télécharger une Image',
    'analysis.describe_food': 'Décrire la Nourriture',
    
    // Profile & Settings
    'profile.personal_info': 'Informations Personnelles',
    'profile.health_goals': 'Objectifs de Santé',
    'profile.dietary_preferences': 'Préférences Alimentaires',
    'profile.notifications': 'Notifications',
    'profile.privacy': 'Confidentialité',
    'profile.account': 'Compte',
    'profile.save_changes': 'Sauvegarder les Modifications',
    'profile.cancel': 'Annuler',
    
    // Notifications & Messages
    'notification.success': 'Succès',
    'notification.error': 'Erreur',
    'notification.warning': 'Avertissement',
    'notification.info': 'Information',
    'notification.unauthorized': 'Vous êtes déconnecté. Reconnexion...',
    'notification.logged_out': 'Vous avez été déconnecté',
    
    // Common UI elements
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.ok': 'OK',
    'common.cancel': 'Annuler',
    'common.save': 'Sauvegarder',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.confirm': 'Confirmer',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.retry': 'Réessayer',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.finish': 'Terminer',
    'common.skip': 'Passer',
    
    // Time & Dates
    'time.today': 'Aujourd\'hui',
    'time.yesterday': 'Hier',
    'time.this_week': 'Cette Semaine',
    'time.last_week': 'Semaine Dernière',
    'time.this_month': 'Ce Mois',
    'time.days_remaining': '{{count}} jours restants',
    'time.week_resets': 'La semaine se remet à zéro',
    
    // Health & Nutrition
    'health.calories': 'Calories',
    'health.protein': 'Protéines',
    'health.carbs': 'Glucides',
    'health.fat': 'Lipides',
    'health.fiber': 'Fibres',
    'health.sugar': 'Sucre',
    'health.sodium': 'Sodium',
    'health.vitamins': 'Vitamines',
    'health.minerals': 'Minéraux',
    'health.portion_size': 'Taille de Portion',
    'health.nutrition_facts': 'Valeurs Nutritionnelles',
    
    // Progress & Stats
    'stats.total_points': 'Points Totaux',
    'stats.weekly_points': 'Points Hebdomadaires',
    'stats.level': 'Niveau',
    'stats.rank': 'Rang',
    'stats.streak': 'Série',
    'stats.analyses_completed': 'Analyses Terminées',
    'stats.weekly_challenge': 'Défi Hebdomadaire',
    'stats.leaderboard': 'Classement',
    
    // Errors & Validation
    'error.required_field': 'Ce champ est obligatoire',
    'error.invalid_email': 'Adresse email invalide',
    'error.password_too_short': 'Le mot de passe doit contenir au moins 8 caractères',
    'error.network_error': 'Erreur réseau. Vérifiez votre connexion.',
    'error.server_error': 'Erreur serveur. Réessayez plus tard.',
    'error.not_found': 'Non trouvé',
    'error.forbidden': 'Accès refusé',
    'error.upload_failed': 'Téléchargement échoué',
    'error.analysis_failed': 'Analyse échouée',
  },

  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.analyze': 'Analysieren',
    'nav.progress': 'Fortschritt',
    'nav.rankings': 'Ranglisten',
    'nav.premium': 'Premium',
    'nav.profile': 'Profil',
    
    // Landing page
    'landing.title': 'Intelligente Lebensmittelanalyse mit KI',
    'landing.subtitle': 'Verwandeln Sie komplexe Ernährungsentscheidungen in einfache, KI-gestützte Urteile. Erhalten Sie sofortige Gesundheitsberatung, die sich an Ihre Ziele und Ihren Lebensstil anpasst.',
    'landing.cta.primary': 'Kostenlos Testen',
    'landing.cta.secondary': 'Demo Ansehen',
    'landing.features.title': 'Funktionen',
    'landing.pricing.title': 'Preise',
    'landing.how.title': 'Wie Es Funktioniert',
    'landing.about.title': 'Über Uns',
    
    // Authentication
    'auth.login': 'Anmelden',
    'auth.logout': 'Abmelden',
    'auth.signup': 'Registrieren',
    'auth.get_started': 'Loslegen',
    
    // Subscription tiers
    'subscription.free': 'Kostenlos',
    'subscription.pro': 'Pro',
    'subscription.medical': 'Medizinisch',
    'subscription.most_popular': 'Am Beliebtesten',
    'subscription.current_plan': 'Aktueller Plan',
    'subscription.upgrade_to': 'Upgrade auf',
    'subscription.choose': 'Wählen',
    'subscription.free.description': 'Grundlegende Ernährungsanalyse für den täglichen Gebrauch',
    'subscription.pro.description': 'Erweiterte KI-Einblicke für Gesundheitsenthusiasten',
    'subscription.medical.description': 'Medizinische Analyse für Gesundheitsfachkräfte',
    
    // Features
    'features.basic_analysis': 'Grundlegende Ernährungsanalyse',
    'features.advanced_insights': 'Erweiterte KI-Einblicke',
    'features.medical_grade': 'Medizinische Analyse',
    'features.analyses_per_day': '{{count}} Analysen pro Tag',
    'features.unlimited_scans': 'Unbegrenzte Lebensmittel-Scans',
    'features.detailed_reports': 'Detaillierte Ernährungsberichte',
    'features.priority_support': 'Prioritärer Support',
    'features.healthcare_integration': 'Gesundheitswesen-Integration',
    'features.community_leaderboard': 'Community-Bestenliste',
    
    // Food analysis
    'analysis.verdict.yes': 'JA',
    'analysis.verdict.no': 'NEIN',
    'analysis.verdict.ok': 'OK',
    'analysis.uploading': 'Hochladen...',
    'analysis.analyzing': 'Analysieren...',
    'analysis.error': 'Analyse fehlgeschlagen',
    'analysis.try_again': 'Erneut Versuchen',
    'analysis.take_photo': 'Foto Aufnehmen',
    'analysis.upload_image': 'Bild Hochladen',
    'analysis.describe_food': 'Essen Beschreiben',
    
    // Profile & Settings
    'profile.personal_info': 'Persönliche Informationen',
    'profile.health_goals': 'Gesundheitsziele',
    'profile.dietary_preferences': 'Ernährungsvorlieben',
    'profile.notifications': 'Benachrichtigungen',
    'profile.privacy': 'Datenschutz',
    'profile.account': 'Konto',
    'profile.save_changes': 'Änderungen Speichern',
    'profile.cancel': 'Abbrechen',
    
    // Notifications & Messages
    'notification.success': 'Erfolg',
    'notification.error': 'Fehler',
    'notification.warning': 'Warnung',
    'notification.info': 'Information',
    'notification.unauthorized': 'Sie sind abgemeldet. Anmeldung...',
    'notification.logged_out': 'Sie wurden abgemeldet',
    
    // Common UI elements
    'common.yes': 'Ja',
    'common.no': 'Nein',
    'common.ok': 'OK',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.edit': 'Bearbeiten',
    'common.delete': 'Löschen',
    'common.confirm': 'Bestätigen',
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.retry': 'Wiederholen',
    'common.close': 'Schließen',
    'common.back': 'Zurück',
    'common.next': 'Weiter',
    'common.previous': 'Vorherige',
    'common.finish': 'Beenden',
    'common.skip': 'Überspringen',
    
    // Time & Dates
    'time.today': 'Heute',
    'time.yesterday': 'Gestern',
    'time.this_week': 'Diese Woche',
    'time.last_week': 'Letzte Woche',
    'time.this_month': 'Dieser Monat',
    'time.days_remaining': '{{count}} Tage verbleibend',
    'time.week_resets': 'Woche wird zurückgesetzt',
    
    // Health & Nutrition
    'health.calories': 'Kalorien',
    'health.protein': 'Protein',
    'health.carbs': 'Kohlenhydrate',
    'health.fat': 'Fett',
    'health.fiber': 'Ballaststoffe',
    'health.sugar': 'Zucker',
    'health.sodium': 'Natrium',
    'health.vitamins': 'Vitamine',
    'health.minerals': 'Mineralien',
    'health.portion_size': 'Portionsgröße',
    'health.nutrition_facts': 'Nährwerte',
    
    // Progress & Stats
    'stats.total_points': 'Gesamtpunkte',
    'stats.weekly_points': 'Wöchentliche Punkte',
    'stats.level': 'Level',
    'stats.rank': 'Rang',
    'stats.streak': 'Serie',
    'stats.analyses_completed': 'Abgeschlossene Analysen',
    'stats.weekly_challenge': 'Wöchentliche Herausforderung',
    'stats.leaderboard': 'Bestenliste',
    
    // Errors & Validation
    'error.required_field': 'Dieses Feld ist erforderlich',
    'error.invalid_email': 'Ungültige E-Mail-Adresse',
    'error.password_too_short': 'Passwort muss mindestens 8 Zeichen haben',
    'error.network_error': 'Netzwerkfehler. Überprüfen Sie Ihre Verbindung.',
    'error.server_error': 'Serverfehler. Versuchen Sie es später erneut.',
    'error.not_found': 'Nicht gefunden',
    'error.forbidden': 'Zugriff verweigert',
    'error.upload_failed': 'Upload fehlgeschlagen',
    'error.analysis_failed': 'Analyse fehlgeschlagen',
  }
};

// Get translation for specific language and key
export function getTranslation(language: string, key: keyof TranslationKeys, params?: Record<string, string | number>): string {
  const languageTranslations = translations[language] || translations.en;
  const text = languageTranslations[key] || translations.en[key] || key;
  
  if (params) {
    let formatted = text;
    Object.entries(params).forEach(([paramKey, value]) => {
      formatted = formatted.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
    });
    return formatted;
  }
  
  return text;
}