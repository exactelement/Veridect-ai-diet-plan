import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Trophy, Target, TrendingUp, Zap, Star, Award, Calendar, Heart, Brain, Shield, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionCheck, checkTierAccess } from "@/components/subscription-check";

interface FoodLog {
  id: number;
  foodName: string;
  verdict: "YES" | "NO" | "OK";
  calories?: number;
  protein?: number;
  confidence: number;
  createdAt: string;
}

interface WeeklyScore {
  score: number;
  rank: number;
  weeklyChange: number;
}

export default function Home() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const userTier = (user as any)?.subscriptionTier || 'free';
  const [timeGreeting, setTimeGreeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  });

  // Update greeting every time user opens the app/page
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    const newGreeting = currentHour < 12 
      ? "Good morning" 
      : currentHour < 18 
      ? "Good afternoon" 
      : "Good evening";
    
    setTimeGreeting(newGreeting);
  }, []);

  // Only fetch data if user has Pro or Advanced tier access (including admin override)
  const hasProAccess = checkTierAccess(userTier, 'pro', (user as any)?.email);
  
  const { data: todaysLogs = [] } = useQuery<FoodLog[]>({
    queryKey: ["/api/food/logs/today"],
    enabled: hasProAccess,
  });

  // Get ALL logged food for weekly calculations
  const { data: allLogs = [] } = useQuery<FoodLog[]>({
    queryKey: ["/api/food/logs"],
    enabled: hasProAccess,
  });

  const { data: weeklyScore } = useQuery<WeeklyScore>({
    queryKey: ["/api/leaderboard/my-score"],
    enabled: hasProAccess,
  });

  // Calculate today's stats
  const todaysStats = todaysLogs.reduce(
    (acc: any, log: FoodLog) => {
      acc[log.verdict.toLowerCase()]++;
      return acc;
    },
    { yes: 0, ok: 0, no: 0 }
  );

  const totalCalories = todaysLogs.reduce(
    (acc: number, log: FoodLog) => acc + (log.calories || 0),
    0
  );

  const calorieGoal = (user as any)?.calorieGoal || 2000;
  const calorieProgress = (totalCalories / calorieGoal) * 100;
  const isOverGoal = totalCalories > calorieGoal;

  // Calculate THIS WEEK'S stats for Weekly Progress section (resets Monday)
  const weeklyStats = (() => {
    // Use Madrid timezone for consistent weekly reset behavior (Monday midnight)
    const madridNow = new Date();
    madridNow.setTime(madridNow.getTime() + (2 * 60 * 60 * 1000)); // Madrid timezone offset UTC+2 (CEST)
    
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

  // Weekly Health Score for "Weekly Progress" section (resets Monday)
  const weeklyHealthScore = weeklyStats.total > 0 
    ? Math.round(((weeklyStats.yes * 10 + weeklyStats.ok * 5 + weeklyStats.no * 2) / (weeklyStats.total * 10)) * 100)
    : 0;

  const currentStreak = (user as any)?.currentStreak || 0;
  const currentLevel = (user as any)?.currentLevel || 1;
  
  // Lifetime points for level calculation (1000 points per level)
  const totalLifetimePoints = (user as any)?.totalPoints || 0;
  const pointsToNextLevel = Math.max(0, ((currentLevel * 1000) - totalLifetimePoints));
  const levelProgress = Math.min(100, ((totalLifetimePoints % 1000) / 1000) * 100);

  // Weekly points from the weekly score API (same calculation as lifetime points)
  const weeklyPoints = (weeklyScore as any)?.weeklyPoints || 0;

  // User interface preferences from profile settings (stored in privacySettings)
  const privacySettings = (user as any)?.privacySettings || {};
  const showCalorieCounter = privacySettings.showCalorieCounter !== false; // Default to true
  const participateInWeeklyChallenge = privacySettings.participateInWeeklyChallenge !== false; // Default to true
  const showFoodStats = privacySettings.showFoodStats !== false; // Default to true

  return (
    <div className="min-h-screen bg-ios-bg pb-24">
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ios-text mb-2">
              {timeGreeting}, {(user as any)?.fullName || (user as any)?.email?.split('@')[0] || 'there'}! 👋
            </h1>
            <p className="text-ios-secondary">Ready to continue your healthy journey?</p>
          </div>

          {/* Quick Action Button */}
          <div className="text-center mb-8">
            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-ios-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Camera className="w-6 h-6 mr-2" />
              Analyze Food Now
            </Button>
          </div>

          {/* Stats Cards */}
          {hasProAccess ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Today's Summary */}
              {showFoodStats && (
                <Card className="ios-shadow border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-ios-text flex items-center gap-2">
                      <Target className="w-5 h-5 text-ios-blue" />
                      Today's Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-ios-secondary">Analyzed</span>
                      <span className="font-semibold text-ios-text">{todaysLogs.length} items</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-ios-secondary flex items-center gap-1">
                        <div className="w-3 h-3 bg-health-green rounded-full"></div>
                        Good choices
                      </span>
                      <span className="font-semibold text-health-green">{todaysStats.yes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-ios-secondary flex items-center gap-1">
                        <div className="w-3 h-3 bg-warning-orange rounded-full"></div>
                        Okay choices
                      </span>
                      <span className="font-semibold text-warning-orange">{todaysStats.ok}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-ios-secondary flex items-center gap-1">
                        <div className="w-3 h-3 bg-danger-red rounded-full"></div>
                        Poor choices
                      </span>
                      <span className="font-semibold text-danger-red">{todaysStats.no}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Calorie Counter */}
              {showCalorieCounter && (
                <Card className="ios-shadow border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-ios-text flex items-center gap-2">
                      <Target className="w-5 h-5 text-ios-blue" />
                      Calorie Tracker
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-ios-secondary">Today</span>
                      <span className={`font-semibold ${isOverGoal ? 'text-danger-red' : 'text-ios-text'}`}>
                        {totalCalories} / {calorieGoal} cal
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(calorieProgress, 100)} 
                      className="h-2"
                    />
                    <p className="text-xs text-ios-secondary">
                      {isOverGoal 
                        ? `${totalCalories - calorieGoal} calories over goal` 
                        : `${calorieGoal - totalCalories} calories remaining`
                      }
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Weekly Progress */}
              {participateInWeeklyChallenge && (
                <Card className="ios-shadow border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-ios-text flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-ios-blue" />
                      Weekly Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-ios-secondary">Health Score</span>
                      <span className="font-semibold text-ios-text">{weeklyHealthScore}%</span>
                    </div>
                    <Progress value={weeklyHealthScore} className="h-2" />
                    <div className="flex justify-between text-xs text-ios-secondary">
                      <span>This week: {weeklyStats.total} items</span>
                      <span>Rank: #{(weeklyScore as any)?.rank || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Free tier upgrade prompt */
            <div className="mb-8">
              {/* Free tier stats placeholder */}
              <Card className="ios-shadow border-0">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-ios-text mb-2">Unlock Advanced Stats</h3>
                  <p className="text-ios-secondary text-sm mb-4">
                    Get detailed progress tracking, food logs, and weekly challenges with Pro
                  </p>
                  <Button 
                    onClick={() => navigate('/subscription')}
                    className="bg-ios-blue hover:bg-blue-600 text-white"
                  >
                    Upgrade to Pro
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Today's Food Logs */}
          {hasProAccess && (
            <Card className="ios-shadow border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-lg text-ios-text flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-ios-blue" />
                  Today's Food Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaysLogs.length > 0 ? (
                  <div className="space-y-3">
                    {todaysLogs.slice(0, 5).map((log: FoodLog) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-ios-bg rounded-lg">
                        <div className="flex items-center gap-3">
                          {log.verdict === 'YES' && <CheckCircle className="w-5 h-5 text-health-green" />}
                          {log.verdict === 'OK' && <AlertCircle className="w-5 h-5 text-warning-orange" />}
                          {log.verdict === 'NO' && <XCircle className="w-5 h-5 text-danger-red" />}
                          <div>
                            <div className="font-medium text-ios-text">{log.foodName}</div>
                            <div className="text-sm text-ios-secondary">
                              {log.calories && log.calories > 0 ? `${log.calories} cal` : "N/A cal"}
                              {' • '}
                              {log.protein && log.protein > 0 ? `${log.protein}g protein` : "N/A protein"}
                            </div>
                          </div>
                        </div>
                        <Badge 
                          className={
                            log.verdict === "YES" ? "bg-health-green text-white font-medium" :
                            log.verdict === "OK" ? "bg-warning-orange text-white font-medium" :
                            "bg-danger-red text-white font-medium"
                          }
                        >
                          {log.verdict}
                        </Badge>
                      </div>
                    ))}
                    {todaysLogs.length > 5 && (
                      <div className="text-center pt-3">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate('/progress')}
                          className="text-ios-blue hover:text-blue-700"
                        >
                          View all {todaysLogs.length} items →
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-ios-secondary">
                    <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-2">No food analyzed today</p>
                    <Button 
                      onClick={() => navigate('/')}
                      size="sm"
                      className="bg-ios-blue hover:bg-blue-600 text-white"
                    >
                      Start Analyzing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Subscription Tiers */}
          {!hasProAccess && (
            <div className="mb-8">
              <Card className="ios-shadow border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-ios-text flex items-center gap-2">
                    <Star className="w-5 h-5 text-ios-blue" />
                    Upgrade to Pro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-800">Free</span>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 5 analyses per day</li>
                          <li>• Basic nutritional info</li>
                          <li>• Simple yes/no verdicts</li>
                        </ul>
                      </div>
                      <div className="p-4 border-2 border-ios-blue rounded-lg bg-blue-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-ios-blue" />
                          <span className="font-medium text-ios-blue">Pro - €1/month</span>
                          <Badge className="bg-ios-blue text-white text-xs">Popular</Badge>
                        </div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Unlimited analyses</li>
                          <li>• Food logging & progress tracking</li>
                          <li>• Challenges and bonus points</li>
                          <li>• Leaderboard access</li>
                          <li>• Personalized AI analysis</li>
                        </ul>
                        <Button 
                          onClick={() => navigate('/subscription')}
                          className="w-full mt-3 bg-ios-blue hover:bg-blue-600 text-white"
                        >
                          Upgrade Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}