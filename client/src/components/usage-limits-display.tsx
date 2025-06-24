import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Crown, Zap, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function UsageLimitsDisplay() {
  const { user } = useAuth();
  
  const { data: limits } = useQuery({
    queryKey: ['/api/subscriptions/limits'],
    enabled: !!user,
  });

  const userTier = user?.subscriptionTier || 'free';
  
  if (!limits || userTier !== 'free') {
    return null; // Only show for free users
  }

  const { dailyAnalyses } = limits;
  const usagePercentage = dailyAnalyses.unlimited ? 0 : (dailyAnalyses.used / (dailyAnalyses.used + dailyAnalyses.remaining)) * 100;
  const isNearLimit = usagePercentage > 80;
  const isAtLimit = dailyAnalyses.remaining === 0;

  if (dailyAnalyses.used === 0) {
    return null; // Don't show until user has made some analyses
  }

  return (
    <Card className={`mb-4 ${isAtLimit ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {isAtLimit ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : (
            <Zap className="w-4 h-4 text-blue-500" />
          )}
          Daily Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Food Analyses</span>
              <span className={isAtLimit ? 'text-red-600 font-medium' : 'text-ios-secondary'}>
                {dailyAnalyses.used} / {dailyAnalyses.used + dailyAnalyses.remaining}
              </span>
            </div>
            <Progress 
              value={usagePercentage} 
              className={`h-2 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-yellow-500' : '[&>div]:bg-blue-500'}`}
            />
          </div>
          
          {isAtLimit ? (
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">
                Daily limit reached! Upgrade for unlimited analyses.
              </p>
              <Button size="sm" className="w-full" onClick={() => window.location.href = '/subscription'}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro - Only €1/month
              </Button>
            </div>
          ) : isNearLimit ? (
            <div className="text-center">
              <p className="text-sm text-yellow-600 mb-2">
                You're running low on daily analyses.
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/subscription'}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade for unlimited access
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}