import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress as ProgressBar } from "@/components/ui/progress";
import type { FoodLog } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionCheck, checkTierAccess } from "@/components/subscription-check";
import { useLocation } from "wouter";
import { Flame, Zap, Trophy, Medal, Star, Target } from "lucide-react";

export default function Progress() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const userTier = (user as any)?.subscriptionTier || 'free';
  const hasAccess = checkTierAccess(userTier, 'pro', (user as any)?.email);

  // Scroll to top when navigating to progress
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch all data needed for comprehensive challenge system
  const { data: todaysAnalyses = [] } = useQuery({
    queryKey: ["/api/food/analyzed/today"],
    enabled: hasAccess,
  });

  const { data: weeklyYesData } = useQuery({
    queryKey: ["/api/food/weekly-yes-count"],
    enabled: hasAccess,
  });

  const { data: streakData } = useQuery({
    queryKey: ["/api/food/yes-streak"],
    enabled: hasAccess,
  });

  const { data: completedChallenges = [] } = useQuery({
    queryKey: ["/api/challenges/completed"],
    enabled: hasAccess,
  });

  const { data: weeklyScore } = useQuery({
    queryKey: ["/api/leaderboard/my-score"],
    enabled: hasAccess,
  });

  // Calculate challenge progress
  const todaysAnalysisCount = Array.isArray(todaysAnalyses) ? todaysAnalyses.length : 0;
  const weeklyYesCount = (weeklyYesData as any)?.weeklyYesCount || 0;
  const consecutiveYes = (streakData as any)?.consecutiveYesStreak || 0;
  const bonusPointsEarned = Array.isArray(completedChallenges) ? 
    completedChallenges.reduce((sum: number, challenge: any) => sum + (challenge.points || 0), 0) : 0;
  const badgesEarned = Array.isArray(completedChallenges) ? completedChallenges.length : 0;
  const totalPoints = (user as any)?.totalPoints || 0;
  const weeklyPoints = (weeklyScore as any)?.weeklyPoints || 0;

  // For free tier users, show upgrade prompt
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-ios-bg pb-20">
        <div className="max-w-md mx-auto px-4 py-6 space-y-6 mt-16">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="text-center p-6 space-y-4">
              <div className="text-yellow-600 text-lg font-semibold">
                Upgrade to Pro for Full Progress Tracking
              </div>
              <p className="text-yellow-700 text-sm">
                Free tier users get basic food analysis. Upgrade to Pro (€1/month billed annually) for:
              </p>
              <ul className="text-left text-sm space-y-1 text-yellow-700">
                <li>• Unlimited daily analyses</li>
                <li>• Full progress tracking & charts</li>
                <li>• Food logging history</li>
                <li>• Leaderboard access</li>
                <li>• Bonus points & challenges</li>
              </ul>
              <Button 
                onClick={() => navigate('/subscription')}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Upgrade to Pro - €1/month billed annually
              </Button>
              <p className="text-xs text-yellow-600">
                You can still use your 5 daily analyses on the home page!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ios-bg pb-20">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6 mt-16">
        
        {/* Header with Rewards Summary */}
        <Card className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Your Progress</h1>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{totalPoints}</div>
                <div className="text-xs opacity-90">Total Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{weeklyPoints}</div>
                <div className="text-xs opacity-90">Weekly Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{badgesEarned}</div>
                <div className="text-xs opacity-90">Badges Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Earned Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-yellow-500" />
              Rewards Earned
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-600">{weeklyPoints}</div>
                <div className="text-xs text-gray-600">Weekly Points</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{totalPoints}</div>
                <div className="text-xs text-gray-600">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">{bonusPointsEarned}</div>
                <div className="text-xs text-gray-600">Bonus Points</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{badgesEarned}</div>
              <div className="text-xs text-gray-600">Badges Earned</div>
            </div>
          </CardContent>
        </Card>

        {/* 🔥 YES Streak Challenges */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-red-500" />
              YES Streak Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* 3 YES Streak */}
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔥</div>
                <div>
                  <div className="font-semibold text-sm">3 YES in a row</div>
                  <div className="text-xs text-gray-600">+50 bonus points</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-red-600">{Math.min(consecutiveYes, 3)}/3</div>
                <div className="text-xs text-gray-500">
                  {consecutiveYes >= 3 ? "✓ Completed" : "In Progress"}
                </div>
              </div>
            </div>

            {/* 5 YES Streak */}
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔥</div>
                <div>
                  <div className="font-semibold text-sm">5 YES in a row</div>
                  <div className="text-xs text-gray-600">+100 bonus points</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-orange-600">{Math.min(consecutiveYes, 5)}/5</div>
                <div className="text-xs text-gray-500">
                  {consecutiveYes >= 5 ? "✓ Completed" : "In Progress"}
                </div>
              </div>
            </div>

            {/* 10 YES Streak */}
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔥</div>
                <div>
                  <div className="font-semibold text-sm">10 YES in a row</div>
                  <div className="text-xs text-gray-600">+200 bonus points</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-yellow-600">{Math.min(consecutiveYes, 10)}/10</div>
                <div className="text-xs text-gray-500">
                  {consecutiveYes >= 10 ? "✓ Completed" : "In Progress"}
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ⚡ Daily Power Challenges */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-blue-500" />
              Daily Power Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* 5 Analyses Today */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <div className="font-semibold text-sm">Analyze 5 foods today</div>
                  <div className="text-xs text-gray-600">+25 bonus points</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-blue-600">{Math.min(todaysAnalysisCount, 5)}/5</div>
                <div className="text-xs text-gray-500">
                  {todaysAnalysisCount >= 5 ? "✓ Completed" : "In Progress"}
                </div>
              </div>
            </div>

            {/* 10 Analyses Today */}
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <div className="font-semibold text-sm">Analyze 10 foods today</div>
                  <div className="text-xs text-gray-600">+50 bonus points</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-indigo-600">{Math.min(todaysAnalysisCount, 10)}/10</div>
                <div className="text-xs text-gray-500">
                  {todaysAnalysisCount >= 10 ? "✓ Completed" : "In Progress"}
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* 🏆 Weekly Competitions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Weekly Competitions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* 15 YES This Week */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <div className="font-semibold text-sm">15 YES foods this week</div>
                  <div className="text-xs text-gray-600">+75 bonus points</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-600">{Math.min(weeklyYesCount, 15)}/15</div>
                <div className="text-xs text-gray-500">
                  {weeklyYesCount >= 15 ? "✓ Completed" : "In Progress"}
                </div>
              </div>
            </div>

            {/* 25 YES This Week */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <div className="font-semibold text-sm">25 YES foods this week</div>
                  <div className="text-xs text-gray-600">+150 bonus points</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-600">{Math.min(weeklyYesCount, 25)}/25</div>
                <div className="text-xs text-gray-500">
                  {weeklyYesCount >= 25 ? "✓ Completed" : "In Progress"}
                </div>
              </div>
            </div>

            {/* 35 YES This Week */}
            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <div className="font-semibold text-sm">35 YES foods this week</div>
                  <div className="text-xs text-gray-600">+250 bonus points</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-teal-600">{Math.min(weeklyYesCount, 35)}/35</div>
                <div className="text-xs text-gray-500">
                  {weeklyYesCount >= 35 ? "✓ Completed" : "In Progress"}
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* 🎖️ Milestone Rewards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Medal className="h-5 w-5 text-purple-500" />
              Milestone Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Health Rookie */}
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎖️</div>
                <div>
                  <div className="font-semibold text-sm">Health Rookie</div>
                  <div className="text-xs text-gray-600">5 YES foods this week</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-purple-600">
                  {weeklyYesCount >= 5 ? "✓ Earned" : `${weeklyYesCount}/5`}
                </div>
                <div className="text-xs text-gray-500">+25 pts</div>
              </div>
            </div>

            {/* Health Expert */}
            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎖️</div>
                <div>
                  <div className="font-semibold text-sm">Health Expert</div>
                  <div className="text-xs text-gray-600">15 YES foods this week</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-pink-600">
                  {weeklyYesCount >= 15 ? "✓ Earned" : `${weeklyYesCount}/15`}
                </div>
                <div className="text-xs text-gray-500">+250 pts</div>
              </div>
            </div>

            {/* Nutrition Master */}
            <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg border border-violet-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎖️</div>
                <div>
                  <div className="font-semibold text-sm">Nutrition Master</div>
                  <div className="text-xs text-gray-600">50 YES foods this week</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-violet-600">
                  {weeklyYesCount >= 50 ? "✓ Earned" : `${weeklyYesCount}/50`}
                </div>
                <div className="text-xs text-gray-500">+500 pts</div>
              </div>
            </div>

            {/* Streak Champion */}
            <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg border border-rose-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎖️</div>
                <div>
                  <div className="font-semibold text-sm">Streak Champion</div>
                  <div className="text-xs text-gray-600">20 YES foods in a row</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-rose-600">
                  {consecutiveYes >= 20 ? "✓ Earned" : `${consecutiveYes}/20`}
                </div>
                <div className="text-xs text-gray-500">+1000 pts</div>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}