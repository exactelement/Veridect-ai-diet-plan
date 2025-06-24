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
  },
};

export function getTierLimits(tier: string = "free"): TierLimits {
  return TIER_LIMITS[tier] || TIER_LIMITS.free;
}

export function checkDailyAnalysisLimit(tier: string, todaysCount: number): boolean {
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

export function canAccessFeature(tier: string, feature: keyof TierLimits): boolean {
  // Pro and Advanced tiers have access to all features
  if (tier === 'pro' || tier === 'advanced') {
    return true;
  }
  
  const limits = getTierLimits(tier);
  return limits[feature] === true;
}

export function getRemainingAnalyses(tier: string, todaysCount: number): number {
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
  todaysAnalyses?: number
): SubscriptionCheckResult {
  const limits = getTierLimits(tier);
  
  // Check daily analysis limit
  if (feature === 'dailyAnalyses' && todaysAnalyses !== undefined) {
    const canAnalyze = checkDailyAnalysisLimit(tier, todaysAnalyses);
    const remaining = getRemainingAnalyses(tier, todaysAnalyses);
    
    return {
      allowed: canAnalyze,
      remainingAnalyses: remaining,
      message: canAnalyze 
        ? undefined 
        : `Daily analysis limit reached. Upgrade to Pro for unlimited analyses.`,
      upgradeRequired: !canAnalyze && tier === 'free'
    };
  }
  
  // Check feature access
  const hasAccess = canAccessFeature(tier, feature);
  
  return {
    allowed: hasAccess,
    message: hasAccess 
      ? undefined 
      : `This feature requires a ${getRequiredTierForFeature(feature)} subscription.`,
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
  pro: 1.00, // Promotional price (normally 10.00)
  advanced: 50.00,
} as const;

export const TIER_NAMES = {
  free: 'Free',
  pro: 'Pro', 
  advanced: 'Advanced',
} as const;