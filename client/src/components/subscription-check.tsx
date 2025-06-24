import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Zap, Shield } from "lucide-react";

interface SubscriptionCheckProps {
  requiredTier: "free" | "pro" | "advanced";
  feature: string;
  onUpgrade: () => void;
}

const tierIcons = {
  free: null,
  pro: <Crown className="w-5 h-5 text-yellow-500" />,
  advanced: <Shield className="w-5 h-5 text-purple-500" />
};

const tierNames = {
  free: "Free",
  pro: "Pro",
  advanced: "Advanced"
};

const tierColors = {
  free: "bg-gray-50 border-gray-200",
  pro: "bg-yellow-50 border-yellow-200",
  advanced: "bg-purple-50 border-purple-200"
};

export function SubscriptionCheck({ requiredTier, feature, onUpgrade }: SubscriptionCheckProps) {
  const { user } = useAuth();
  
  const userTier = user?.subscriptionTier || "free";
  const hasAccess = checkTierAccess(userTier, requiredTier);
  
  if (hasAccess) {
    return null; // User has access, don't show anything
  }

  return (
    <div className="mt-16 pt-8 pb-20">
      <Card className={`${tierColors[requiredTier]} backdrop-blur-sm`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {tierIcons[requiredTier]}
          </div>
          <CardTitle className="text-lg">
            {tierNames[requiredTier]} Feature
          </CardTitle>
          <CardDescription>
            {feature} requires a {tierNames[requiredTier]} subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onUpgrade} className="w-full">
            <Zap className="w-4 h-4 mr-2" />
            Upgrade to {tierNames[requiredTier]}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function checkTierAccess(userTier: string = 'free', requiredTier: string): boolean {
  // Normalize tiers to lowercase for consistent comparison
  const normalizedUserTier = userTier?.toLowerCase() || 'free';
  const normalizedRequiredTier = requiredTier?.toLowerCase() || 'free';
  
  // Advanced tier has access to everything
  if (normalizedUserTier === 'advanced') {
    return true;
  }
  
  // Pro tier has access to pro and free features
  if (normalizedUserTier === 'pro' && (normalizedRequiredTier === 'pro' || normalizedRequiredTier === 'free')) {
    return true;
  }
  
  // Free tier only has access to free features
  if (normalizedRequiredTier === 'free') {
    return true;
  }
  
  // Default deny
  return false;
}