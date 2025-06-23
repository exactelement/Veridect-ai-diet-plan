import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.analyze': 'Analyze',
    'nav.progress': 'Progress',
    'nav.leaderboard': 'Leaderboard',
    'nav.profile': 'Profile',
    'nav.about': 'About',
    'nav.howToUse': 'How to Use',
    'nav.privacy': 'Privacy',
    'nav.disclaimer': 'Disclaimer',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Home page
    'home.greeting.morning': 'Good morning',
    'home.greeting.afternoon': 'Good afternoon',
    'home.greeting.evening': 'Good evening',
    'home.quickActions': 'Quick Actions',
    'home.analyzeFoodCamera': 'Analyze Food (Camera)',
    'home.analyzeFoodUpload': 'Analyze Food (Upload)',
    'home.todaysProgress': "Today's Progress",
    'home.weeklyChallenge': 'Weekly Challenge',
    'home.noJunkFoodWeek': 'No Junk Food Week',
    'home.daysRemaining': 'days remaining',
    'home.participate': 'Participate',
    'home.level': 'Level',
    'home.weeklyPoints': 'Weekly Points',
    'home.totalPoints': 'Total Points',
    'home.dayStreak': 'Day Streak',
    'home.calorieGoal': 'Calorie Goal',
    'home.todaysCalories': "Today's Calories",
    'home.recentAnalyses': 'Recent Analyses',
    'home.viewAll': 'View All',
    'home.noAnalysesToday': 'No food analyses today. Start by analyzing your first meal!',
    'home.subscriptionTiers': 'Subscription Tiers',
    'home.currentPlan': 'Current Plan',
    'home.upgrade': 'Upgrade',
    
    // Food Analysis
    'analysis.title': 'Food Analysis',
    'analysis.enterFoodName': 'Enter food name or description',
    'analysis.analyzing': 'Analyzing your food...',
    'analysis.analyze': 'Analyze',
    'analysis.takePhoto': 'Take Photo',
    'analysis.uploadImage': 'Upload Image',
    'analysis.verdict': 'Verdict',
    'analysis.explanation': 'Explanation',
    'analysis.nutritionFacts': 'Nutrition Facts',
    'analysis.calories': 'Calories',
    'analysis.protein': 'Protein',
    'analysis.carbs': 'Carbs',
    'analysis.fat': 'Fat',
    'analysis.fiber': 'Fiber',
    'analysis.sugar': 'Sugar',
    'analysis.sodium': 'Sodium',
    'analysis.confidence': 'Confidence',
    'analysis.addToLog': 'Add to Food Log',
    'analysis.yum': 'Yum!',
    
    // Leaderboard
    'leaderboard.title': 'Weekly Leaderboard',
    'leaderboard.rank': 'Rank',
    'leaderboard.points': 'Points',
    'leaderboard.weeklyChallenge': 'Weekly Challenge',
    'leaderboard.participants': 'participants',
    'leaderboard.avoidJunkFood': 'Avoid junk food for 7 consecutive days',
    'leaderboard.progress': 'Progress',
    'leaderboard.myRank': 'My Rank',
    'leaderboard.myScore': 'My Score',
    
    // Profile
    'profile.title': 'Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.firstName': 'First Name',
    'profile.lastName': 'Last Name',
    'profile.email': 'Email',
    'profile.save': 'Save Changes',
    'profile.preferences': 'Preferences',
    'profile.language': 'Language',
    'profile.english': 'English',
    'profile.spanish': 'Spanish',
    
    // Landing page
    'landing.title': 'Transform Your Health with AI-Powered Nutrition',
    'landing.subtitle': 'Get instant YES/NO/OK verdicts on your food choices with personalized AI analysis',
    'landing.getStarted': 'Get Started',
    'landing.learnMore': 'Learn More',
    'landing.howItWorks': 'How It Works',
    'landing.features.instant': 'Instant Analysis',
    'landing.features.personalized': 'Personalized Results',
    'landing.features.comprehensive': 'Comprehensive Tracking',
    
    // Subscription tiers
    'tiers.free': 'Free',
    'tiers.pro': 'Pro',
    'tiers.medical': 'Medical',
    'tiers.month': 'month',
    'tiers.analyses': 'analyses',
    'tiers.unlimited': 'Unlimited',
    'tiers.basicNutrition': 'Basic nutrition info',
    'tiers.detailedNutrition': 'Detailed nutrition breakdown',
    'tiers.medicalGrade': 'Medical-grade analysis',
    'tiers.prioritySupport': 'Priority support',
    'tiers.selectPlan': 'Select Plan',
    'tiers.currentPlan': 'Current Plan',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.yes': 'YES',
    'common.no': 'NO',
    'common.ok': 'OK',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.analyze': 'Analizar',
    'nav.progress': 'Progreso',
    'nav.leaderboard': 'Clasificación',
    'nav.profile': 'Perfil',
    'nav.about': 'Acerca de',
    'nav.howToUse': 'Cómo Usar',
    'nav.privacy': 'Privacidad',
    'nav.disclaimer': 'Aviso Legal',
    'nav.login': 'Iniciar Sesión',
    'nav.logout': 'Cerrar Sesión',
    
    // Home page
    'home.greeting.morning': 'Buenos días',
    'home.greeting.afternoon': 'Buenas tardes',
    'home.greeting.evening': 'Buenas noches',
    'home.quickActions': 'Acciones Rápidas',
    'home.analyzeFoodCamera': 'Analizar Comida (Cámara)',
    'home.analyzeFoodUpload': 'Analizar Comida (Subir)',
    'home.todaysProgress': 'Progreso de Hoy',
    'home.weeklyChallenge': 'Desafío Semanal',
    'home.noJunkFoodWeek': 'Semana Sin Comida Chatarra',
    'home.daysRemaining': 'días restantes',
    'home.participate': 'Participar',
    'home.level': 'Nivel',
    'home.weeklyPoints': 'Puntos Semanales',
    'home.totalPoints': 'Puntos Totales',
    'home.dayStreak': 'Racha de Días',
    'home.calorieGoal': 'Meta de Calorías',
    'home.todaysCalories': 'Calorías de Hoy',
    'home.recentAnalyses': 'Análisis Recientes',
    'home.viewAll': 'Ver Todo',
    'home.noAnalysesToday': '¡No hay análisis de comida hoy. Comienza analizando tu primera comida!',
    'home.subscriptionTiers': 'Planes de Suscripción',
    'home.currentPlan': 'Plan Actual',
    'home.upgrade': 'Mejorar',
    
    // Food Analysis
    'analysis.title': 'Análisis de Comida',
    'analysis.enterFoodName': 'Ingresa el nombre o descripción de la comida',
    'analysis.analyzing': 'Analizando tu comida...',
    'analysis.analyze': 'Analizar',
    'analysis.takePhoto': 'Tomar Foto',
    'analysis.uploadImage': 'Subir Imagen',
    'analysis.verdict': 'Veredicto',
    'analysis.explanation': 'Explicación',
    'analysis.nutritionFacts': 'Información Nutricional',
    'analysis.calories': 'Calorías',
    'analysis.protein': 'Proteína',
    'analysis.carbs': 'Carbohidratos',
    'analysis.fat': 'Grasa',
    'analysis.fiber': 'Fibra',
    'analysis.sugar': 'Azúcar',
    'analysis.sodium': 'Sodio',
    'analysis.confidence': 'Confianza',
    'analysis.addToLog': 'Agregar al Registro',
    'analysis.yum': '¡Delicioso!',
    
    // Leaderboard
    'leaderboard.title': 'Clasificación Semanal',
    'leaderboard.rank': 'Posición',
    'leaderboard.points': 'Puntos',
    'leaderboard.weeklyChallenge': 'Desafío Semanal',
    'leaderboard.participants': 'participantes',
    'leaderboard.avoidJunkFood': 'Evita la comida chatarra por 7 días consecutivos',
    'leaderboard.progress': 'Progreso',
    'leaderboard.myRank': 'Mi Posición',
    'leaderboard.myScore': 'Mi Puntuación',
    
    // Profile
    'profile.title': 'Perfil',
    'profile.personalInfo': 'Información Personal',
    'profile.firstName': 'Nombre',
    'profile.lastName': 'Apellido',
    'profile.email': 'Correo Electrónico',
    'profile.save': 'Guardar Cambios',
    'profile.preferences': 'Preferencias',
    'profile.language': 'Idioma',
    'profile.english': 'Inglés',
    'profile.spanish': 'Español',
    
    // Landing page
    'landing.title': 'Transforma Tu Salud con Nutrición Basada en IA',
    'landing.subtitle': 'Obtén veredictos instantáneos SÍ/NO/OK sobre tus elecciones alimentarias con análisis personalizado de IA',
    'landing.getStarted': 'Comenzar',
    'landing.learnMore': 'Saber Más',
    'landing.howItWorks': 'Cómo Funciona',
    'landing.features.instant': 'Análisis Instantáneo',
    'landing.features.personalized': 'Resultados Personalizados',
    'landing.features.comprehensive': 'Seguimiento Integral',
    
    // Subscription tiers
    'tiers.free': 'Gratis',
    'tiers.pro': 'Pro',
    'tiers.medical': 'Médico',
    'tiers.month': 'mes',
    'tiers.analyses': 'análisis',
    'tiers.unlimited': 'Ilimitado',
    'tiers.basicNutrition': 'Información nutricional básica',
    'tiers.detailedNutrition': 'Desglose nutricional detallado',
    'tiers.medicalGrade': 'Análisis de grado médico',
    'tiers.prioritySupport': 'Soporte prioritario',
    'tiers.selectPlan': 'Seleccionar Plan',
    'tiers.currentPlan': 'Plan Actual',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.close': 'Cerrar',
    'common.yes': 'SÍ',
    'common.no': 'NO',
    'common.ok': 'OK',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('veridect-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('veridect-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}