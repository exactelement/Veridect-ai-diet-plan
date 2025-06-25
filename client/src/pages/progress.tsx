import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { FoodLog } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionCheck, checkTierAccess } from "@/components/subscription-check";
import { useLocation } from "wouter";

export default function Progress() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const userTier = user?.subscriptionTier || 'free';
  const hasAccess = checkTierAccess(userTier, 'pro', user?.email);

  // Scroll to top when navigating to progress
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // For free tier users, show a limited progress view instead of blocking entirely
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
  
  const { data: allLogs = [] } = useQuery<FoodLog[]>({
    queryKey: ["/api/food/logs"],
  });

  // Get ALL analyzed foods today for today's challenges
  const { data: todaysAnalyzedFoods = [] } = useQuery<FoodLog[]>({
    queryKey: ["/api/food/analyzed/today"],
  });

  // Get today's logged food for the progress wheel (resets daily)
  const { data: todaysLoggedFoods = [] } = useQuery<FoodLog[]>({
    queryKey: ["/api/food/logs/today"],
  });

  // Get weekly score data for bonus points calculation
  // Get all-time challenge completions for badge counting
  const { data: allChallenges = [] } = useQuery<FoodLog[]>({
    queryKey: ["/api/challenges/completed"],
    enabled: !!user,
  });
  
  // Get weekly score data for bonus points calculation
  const { data: myWeeklyScore } = useQuery({
    queryKey: ['/api/leaderboard/my-score'],
  });

  // Get current consecutive YES streak
  const { data: yesStreakData } = useQuery({
    queryKey: ['/api/food/yes-streak'],
  });
  const consecutiveYesStreak = yesStreakData?.consecutiveYesStreak || 0;

  // Calculate TODAY'S LOGGED stats for the progress wheel (resets daily at Madrid midnight)
  const todaysLoggedStats = todaysLoggedFoods.reduce(
    (acc: any, log: FoodLog) => {
      acc[log.verdict.toLowerCase()]++;
      acc.total++;
      return acc;
    },
    { yes: 0, ok: 0, no: 0, total: 0 }
  );

  // Calculate total stats from all logged food (for historical reference)
  const totalStats = allLogs.reduce(
    (acc: any, log: FoodLog) => {
      acc[log.verdict.toLowerCase()]++;
      acc.total++;
      return acc;
    },
    { yes: 0, ok: 0, no: 0, total: 0 }
  );

  // Calculate TODAY'S challenge stats from ALL analyzed foods (not just logged)
  const todaysStats = todaysAnalyzedFoods.reduce(
    (acc: any, log: FoodLog) => {
      acc[log.verdict.toLowerCase()]++;
      acc.total++;
      return acc;
    },
    { yes: 0, ok: 0, no: 0, total: 0 }
  );

  // Calculate THIS WEEK'S stats from all logged food (for weekly challenges)
  // Uses Madrid timezone for consistent weekly reset behavior (Monday midnight)
  const weeklyStats = (() => {
    // Create Madrid timezone date for current week calculation
    const madridNow = new Date();
    madridNow.setTime(madridNow.getTime() + (1 * 60 * 60 * 1000)); // Madrid timezone offset
    
    const currentWeekStart = new Date(madridNow);
    const day = currentWeekStart.getDay();
    const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    currentWeekStart.setDate(diff);
    currentWeekStart.setHours(0, 0, 0, 0);

    return allLogs
      .filter(log => new Date(log.createdAt) >= currentWeekStart)
      .reduce(
        (acc: any, log: FoodLog) => {
          acc[log.verdict.toLowerCase()]++;
          acc.total++;
          return acc;
        },
        { yes: 0, ok: 0, no: 0, total: 0 }
      );
  })();

  // Calculate percentages for TODAY'S progress wheel (resets daily)
  const excellentPercentage = todaysLoggedStats.total > 0 ? Math.round((todaysLoggedStats.yes / todaysLoggedStats.total) * 100) : 0;
  const moderatePercentage = todaysLoggedStats.total > 0 ? Math.round((todaysLoggedStats.ok / todaysLoggedStats.total) * 100) : 0;
  const badPercentage = todaysLoggedStats.total > 0 ? Math.round((todaysLoggedStats.no / todaysLoggedStats.total) * 100) : 0;

  // Calculate circle chart segments for TODAY'S data (for 360 degrees)
  const excellentDegrees = (todaysLoggedStats.yes / todaysLoggedStats.total) * 360 || 0;
  const moderateDegrees = (todaysLoggedStats.ok / todaysLoggedStats.total) * 360 || 0;
  const badDegrees = (todaysLoggedStats.no / todaysLoggedStats.total) * 360 || 0;

  // Create conic gradient based on TODAY'S data (resets daily)
  const createConicGradient = () => {
    if (todaysLoggedStats.total === 0) {
      return 'conic-gradient(#e5e7eb 0deg 360deg)'; // Gray when no data today
    }

    let gradient = 'conic-gradient(';
    let currentDegree = 0;

    if (excellentDegrees > 0) {
      gradient += `#10b981 ${currentDegree}deg ${currentDegree + excellentDegrees}deg, `;
      currentDegree += excellentDegrees;
    }

    if (moderateDegrees > 0) {
      gradient += `#f59e0b ${currentDegree}deg ${currentDegree + moderateDegrees}deg, `;
      currentDegree += moderateDegrees;
    }

    if (badDegrees > 0) {
      gradient += `#ef4444 ${currentDegree}deg ${currentDegree + badDegrees}deg`;
    }

    // Remove trailing comma and space if present
    gradient = gradient.replace(/, $/, '');
    gradient += ')';

    return gradient;
  };

  return (
    <div className="pt-20 pb-24 bg-gradient-to-br from-ios-background via-blue-50 to-purple-50 min-h-screen">
      <div className="container-padding">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Progress</h1>
          <p className="text-xl text-gray-600">Your food choice tracking</p>
        </div>

        {/* Circular Progress Chart */}
        <Card className="bg-white">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-8">
              {/* Circle Chart */}
              <div className="relative">
                <div 
                  className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center"
                  style={{
                    background: createConicGradient(),
                  }}
                >
                  <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                    <div className="text-3xl font-bold text-gray-800">{todaysLoggedStats.total}</div>
                    <div className="text-sm text-gray-500">Today's Choices</div>
                  </div>
                </div>
              </div>

              {/* Stats Below Circle - TODAY'S DATA (resets daily) */}
              <div className="w-full grid grid-cols-3 gap-6">
                {/* Excellent */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-1">{todaysLoggedStats.yes}</div>
                  <div className="text-lg font-semibold text-gray-800">Excellent</div>
                  <div className="text-sm text-gray-500">{excellentPercentage}%</div>
                </div>

                {/* Moderate */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-1">{todaysLoggedStats.ok}</div>
                  <div className="text-lg font-semibold text-gray-800">Moderate</div>
                  <div className="text-sm text-gray-500">{moderatePercentage}%</div>
                </div>

                {/* Bad */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-1">{todaysLoggedStats.no}</div>
                  <div className="text-lg font-semibold text-gray-800">Bad</div>
                  <div className="text-sm text-gray-500">{badPercentage}%</div>
                </div>
              </div>

              {/* Legend for empty state */}
              {todaysLoggedStats.total === 0 && (
                <div className="text-center text-gray-500 mt-4">
                  <p className="text-sm">Start logging food to see today's progress!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievement Challenge Section */}
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Daily Challenges & Rewards</h2>
            
            <div className="space-y-4">
              {/* YES Streak Challenges - Most Addictive */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg p-4 shadow-sm border border-green-200">
                <h3 className="font-semibold text-lg mb-3 text-green-800">🔥 YES Streak Challenges</h3>
                <div className="space-y-3">
                  {/* 3 YES in a row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-medium">3 YES foods in a row</span>
                      {consecutiveYesStreak >= 3 ? (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">✓ Completed</span>
                      ) : (
                        <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded-full">{consecutiveYesStreak}/3</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-green-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${Math.min((consecutiveYesStreak / 3) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{Math.min(consecutiveYesStreak, 3)}/3</span>
                    </div>
                  </div>
                  
                  {/* 5 YES streak */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-medium">5 YES streak (Health Champion)</span>
                      {consecutiveYesStreak >= 5 && (
                        <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">GOLD BADGE!</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-green-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-yellow-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${Math.min((consecutiveYesStreak / 5) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{Math.min(consecutiveYesStreak, 5)}/5</span>
                    </div>
                  </div>

                  {/* 10 YES perfectionist */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-medium">10 YES perfectionist streak</span>
                      {consecutiveYesStreak >= 10 && (
                        <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">DIAMOND LEVEL!</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-green-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                          style={{ width: `${Math.min((consecutiveYesStreak / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{Math.min(consecutiveYesStreak, 10)}/10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Power Challenges */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-100 rounded-lg p-4 shadow-sm border border-blue-200">
                <h3 className="font-semibold text-lg mb-3 text-blue-800">⚡ Daily Power Challenges</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-700 font-medium">Analyze 5 foods today</span>
                      {todaysStats.total >= 5 ? (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">✓ Completed</span>
                      ) : (
                        <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded-full">{todaysStats.total}/5</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-blue-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((todaysStats.total / 5) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-blue-700">{Math.min(todaysStats.total, 5)}/5</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-700 font-medium">Analyze 10 foods today</span>
                      {todaysStats.total >= 10 ? (
                        <span className="text-xs bg-indigo-500 text-white px-2 py-1 rounded-full">✓ Completed</span>
                      ) : (
                        <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded-full">{todaysStats.total}/10</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-indigo-200 rounded-full h-3">
                        <div 
                          className="bg-indigo-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((todaysStats.total / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-indigo-700">{Math.min(todaysStats.total, 10)}/10</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-700 font-medium">Zero BAD foods today</span>
                      {todaysStats.no === 0 && todaysStats.total > 0 && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">PERFECT DAY!</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${todaysStats.no === 0 && todaysStats.total > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm font-semibold text-blue-700">
                        {todaysStats.no === 0 && todaysStats.total > 0 ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitive Challenges */}
              <div className="bg-gradient-to-r from-orange-50 to-red-100 rounded-lg p-4 shadow-sm border border-orange-200">
                <h3 className="font-semibold text-lg mb-3 text-orange-800">🏆 Weekly Competitions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-700 font-medium">15 YES foods this week</span>
                      {weeklyStats.yes >= 15 && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">WEEKLY CHAMPION!</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-orange-200 rounded-full h-3">
                        <div 
                          className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((weeklyStats.yes / 15) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-orange-700">{Math.min(weeklyStats.yes, 15)}/15</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-700 font-medium">90% YES+OK ratio this week</span>
                      {weeklyStats.total > 0 && ((weeklyStats.yes + weeklyStats.ok) / weeklyStats.total) >= 0.9 && (
                        <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">ELITE STATUS!</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-orange-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${weeklyStats.total > 0 ? Math.min(((weeklyStats.yes + weeklyStats.ok) / weeklyStats.total) * 111, 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-orange-700">
                        {weeklyStats.total > 0 ? Math.round(((weeklyStats.yes + weeklyStats.ok) / weeklyStats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exclusive Milestone Rewards */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-100 rounded-lg p-4 shadow-sm border border-yellow-200">
                <h3 className="font-semibold text-lg mb-3 text-yellow-800">🎖️ Exclusive Milestone Rewards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                    weeklyStats.yes >= 5 ? 'bg-green-50 border-green-300 shadow-md' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${weeklyStats.yes >= 5 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className={`text-sm font-medium ${weeklyStats.yes >= 5 ? 'text-green-700' : 'text-gray-600'}`}>
                          Health Rookie
                        </span>
                      </div>
                      {weeklyStats.yes >= 5 ? (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">✓ Earned</span>
                      ) : (
                        <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">{weeklyStats.yes}/5</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">5 YES foods this week</div>
                  </div>
                  
                  <div className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                    totalStats.yes >= 15 ? 'bg-blue-50 border-blue-300 shadow-md' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${totalStats.yes >= 15 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <span className={`text-sm font-medium ${totalStats.yes >= 15 ? 'text-blue-700' : 'text-gray-600'}`}>
                          Health Expert
                        </span>
                      </div>
                      {totalStats.yes >= 15 ? (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">+250 pts</span>
                      ) : (
                        <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">{totalStats.yes}/15</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">15 YES foods</div>
                  </div>
                  
                  <div className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                    totalStats.yes >= 30 ? 'bg-purple-50 border-purple-300 shadow-md' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${totalStats.yes >= 30 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                        <span className={`text-sm font-medium ${totalStats.yes >= 30 ? 'text-purple-700' : 'text-gray-600'}`}>
                          Health Master
                        </span>
                      </div>
                      {totalStats.yes >= 30 ? (
                        <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">+500 pts</span>
                      ) : (
                        <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">{totalStats.yes}/30</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">30 YES foods</div>
                  </div>
                  
                  <div className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                    totalStats.yes >= 50 ? 'bg-gradient-to-r from-yellow-50 to-orange-100 border-yellow-300 shadow-lg' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${totalStats.yes >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gray-300'}`}></div>
                        <span className={`text-sm font-medium ${totalStats.yes >= 50 ? 'text-orange-700' : 'text-gray-600'}`}>
                          Health Legend
                        </span>
                      </div>
                      {totalStats.yes >= 50 ? (
                        <span className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded">✓ Earned</span>
                      ) : (
                        <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">{totalStats.yes}/50</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">50 YES foods (Ultimate)</div>
                  </div>
                </div>
              </div>

              {/* Today's Rewards Earned - Shows actual bonus points from challenges */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-100 rounded-lg p-4 shadow-sm border border-indigo-200">
                <h3 className="font-semibold text-lg mb-3 text-indigo-800">🎁 Rewards Earned</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-700">
                      {(() => {
                        // Show actual bonus points from database (weekly_points - food_points)
                        if (!myWeeklyScore) return 0;
                        
                        const foodPoints = (myWeeklyScore.yesCount || 0) * 10 + 
                                         (myWeeklyScore.okCount || 0) * 5 + 
                                         (myWeeklyScore.noCount || 0) * 2;
                        const bonusPoints = (myWeeklyScore.weeklyPoints || 0) - foodPoints;
                        
                        return Math.max(0, bonusPoints);
                      })()}
                    </div>
                    <div className="text-sm text-indigo-600">Bonus Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {(() => {
                        // Count completed challenges from database (each challenge = 1 badge)
                        if (!allChallenges || !Array.isArray(allChallenges)) return 0;
                        
                        // Count BONUS_ entries (each represents a completed challenge)
                        const badges = allChallenges.filter((food: any) => 
                          food.foodName && food.foodName.startsWith('BONUS_')
                        ).length;
                        
                        return badges;
                      })()}
                    </div>
                    <div className="text-sm text-purple-600">Badges Earned</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Bottom spacer to prevent footer overlap */}
        <div className="h-20"></div>
        </div>
      </div>
    </div>
  );
}