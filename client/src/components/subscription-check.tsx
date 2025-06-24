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
    <div className="pb-20">
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

export function checkTierAccess(userTier: string, requiredTier: string): boolean {
  // Pro and Advanced have access to everything
  if (userTier === 'pro' || userTier === 'advanced') {
    return true;
  }
  
  // Free tier only has access to free features
  if (requiredTier === 'free') {
    return true;
  }
  
  // Free tier cannot access pro/advanced features
  return false;
}