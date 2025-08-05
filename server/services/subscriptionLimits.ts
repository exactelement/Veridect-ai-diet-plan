interface TierLimits {
  dailyAnalyses: number;
  detailedNutrition: boolean;
  advancedAI: boolean;
  medicalFeatures: boolean;
  exportData: boolean;
  prioritySupport: boolean;
  unlimitedHistory: boolean;
  foodLogging: boolean;
  personalization: boolean;
  leaderboardAccess: boolean;
  foodHistory: boolean;
  weeklyProgress: boolean;
  challengesAccess: boolean;
  progressTracking: boolean;
  bonusPoints: boolean;
  dietPlanning: boolean;
}

const TIER_LIMITS: Record<string, TierLimits> = {
  free: {
    dailyAnalyses: 5,
    detailedNutrition: false, // Only basic nutritional info for free tier
    advancedAI: false,
    medicalFeatures: false,
    exportData: false,
    prioritySupport: false,
    unlimitedHistory: false,
    foodLogging: false,
    personalization: false,
    leaderboardAccess: false,
    foodHistory: false,
    weeklyProgress: false,
    challengesAccess: false,
    progressTracking: false,
    bonusPoints: false,
    dietPlanning: false,
  },
  pro: {
    dailyAnalyses: -1, // unlimited
    detailedNutrition: true,
    advancedAI: true,
    medicalFeatures: false,
    exportData: true,
    prioritySupport: true,
    unlimitedHistory: true,
    foodLogging: true,
    personalization: true,
    leaderboardAccess: true,
    foodHistory: true,
    weeklyProgress: true,
    challengesAccess: true,
    progressTracking: true,
    bonusPoints: true,
    dietPlanning: true,
  },
  advanced: {
    dailyAnalyses: -1, // unlimited
    detailedNutrition: true,
    advancedAI: true,
    medicalFeatures: true,
    exportData: true,
    prioritySupport: true,
    unlimitedHistory: true,
    foodLogging: true,
    personalization: true,
    leaderboardAccess: true,
    foodHistory: true,
    weeklyProgress: true,
    challengesAccess: true,
    progressTracking: true,
    bonusPoints: true,
    dietPlanning: true,
  },
};

export function getTierLimits(tier: string = "free"): TierLimits {
  return TIER_LIMITS[tier] || TIER_LIMITS.free;
}

export function checkDailyAnalysisLimit(tier: string, todaysCount: number, userEmail?: string): boolean {
  // Admin override - admin emails get unlimited access
  const adminEmails = ['10xr.co@gmail.com', 'yesnolifestyleapp@gmail.com', 'quantaalgo@gmail.com'];
  if (userEmail && adminEmails.includes(userEmail)) {
    return true; // Admin override
  }
  
  // Pro and Advanced tiers have unlimited access
  if (tier === 'pro' || tier === 'advanced') {
    return true;
  }
  
  const limits = getTierLimits(tier);
  
  if (limits.dailyAnalyses === -1) {
    return true; // unlimited
  }
  
  return todaysCount < limits.dailyAnalyses;
}

export function canAccessFeature(tier: string, feature: keyof TierLimits, userEmail?: string): boolean {
  // Admin override - admin emails get access to all features
  const adminEmails = ['10xr.co@gmail.com', 'yesnolifestyleapp@gmail.com', 'quantaalgo@gmail.com'];
  if (userEmail && adminEmails.includes(userEmail)) {
    return true; // Admin override
  }
  
  // Pro and Advanced tiers have access to all features
  if (tier === 'pro' || tier === 'advanced') {
    return true;
  }
  
  const limits = getTierLimits(tier);
  return limits[feature] === true;
}

export function getRemainingAnalyses(tier: string, todaysCount: number, userEmail?: string): number {
  // Admin override - admin emails get unlimited access
  const adminEmails = ['10xr.co@gmail.com', 'yesnolifestyleapp@gmail.com', 'quantaalgo@gmail.com'];
  if (userEmail && adminEmails.includes(userEmail)) {
    return -1; // unlimited for admins
  }
  
  // Pro and Advanced tiers have unlimited access
  if (tier === 'pro' || tier === 'advanced') {
    return -1; // unlimited
  }
  
  const limits = getTierLimits(tier);
  
  if (limits.dailyAnalyses === -1) {
    return -1; // unlimited
  }
  
  return Math.max(0, limits.dailyAnalyses - todaysCount);
}

export interface SubscriptionCheckResult {
  allowed: boolean;
  message?: string;
  remainingAnalyses?: number;
  upgradeRequired?: boolean;
}

export function checkSubscriptionLimits(
  tier: string,
  feature: keyof TierLimits,
  todaysAnalyses?: number,
  userEmail?: string
): SubscriptionCheckResult {
  const limits = getTierLimits(tier);
  
  // Check daily analysis limit
  if (feature === 'dailyAnalyses' && todaysAnalyses !== undefined) {
    const canAnalyze = checkDailyAnalysisLimit(tier, todaysAnalyses, userEmail);
    const remaining = getRemainingAnalyses(tier, todaysAnalyses, userEmail);
    
    return {
      allowed: canAnalyze,
      remainingAnalyses: remaining,
      message: canAnalyze 
        ? undefined 
        : `Great job! You've used all ${limits.dailyAnalyses} of your daily analyses. Ready for unlimited food insights? Upgrade to Pro for just €1/month and keep the momentum going!`,
      upgradeRequired: !canAnalyze && tier === 'free'
    };
  }
  
  // Check feature access
  const hasAccess = canAccessFeature(tier, feature, userEmail);
  
  return {
    allowed: hasAccess,
    message: hasAccess 
      ? undefined 
      : `Unlock this amazing feature with ${getRequiredTierForFeature(feature)} for just €1/month! Join thousands enjoying premium nutrition insights.`,
    upgradeRequired: !hasAccess
  };
}

function getRequiredTierForFeature(feature: keyof TierLimits): string {
  if (feature === 'medicalFeatures') {
    return 'Advanced';
  }
  if (['detailedNutrition', 'advancedAI', 'exportData', 'prioritySupport', 'unlimitedHistory', 
       'foodLogging', 'personalization', 'leaderboardAccess', 'foodHistory', 
       'weeklyProgress', 'challengesAccess', 'progressTracking', 'bonusPoints'].includes(feature)) {
    return 'Pro';
  }
  return 'Free';
}

export const TIER_PRICES = {
  free: 0,
  pro: 12.00, // €12/year (€1 per month)
  advanced: 50.00,
} as const;

export const TIER_NAMES = {
  free: 'Free',
  pro: 'Pro', 
  advanced: 'Advanced',
} as const;