import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Calendar, TrendingUp, Target, Award, Zap, CheckCircle, XCircle, AlertCircle, Star, Trophy, Flame } from "lucide-react";
import type { FoodLog, User, WeeklyScore } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Progress() {
  const { user } = useAuth();
  
  const { data: todaysLogs = [] } = useQuery<FoodLog[]>({
    queryKey: ["/api/food/logs/today"],
  });

  const { data: allLogs = [] } = useQuery<FoodLog[]>({
    queryKey: ["/api/food/logs"],
  });

  const { data: weeklyScore } = useQuery<WeeklyScore>({
    queryKey: ["/api/leaderboard/my-score"],
  });

  // Calculate weekly stats
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  
  const weeklyLogs = allLogs.filter((log: FoodLog) => {
    const logDate = new Date(log.createdAt);
    return logDate >= weekStart;
  });

  const weeklyStats = weeklyLogs.reduce(
    (acc: any, log: FoodLog) => {
      acc[log.verdict.toLowerCase()]++;
      acc.totalPoints += log.verdict === 'YES' ? 10 : log.verdict === 'OK' ? 5 : 2;
      return acc;
    },
    { yes: 0, ok: 0, no: 0, totalPoints: 0 }
  );

  const todaysStats = todaysLogs.reduce(
    (acc: any, log: FoodLog) => {
      acc[log.verdict.toLowerCase()]++;
      acc.totalCalories += log.calories || 0;
      return acc;
    },
    { yes: 0, ok: 0, no: 0, totalCalories: 0 }
  );

  // User progress data
  const currentStreak = (user as any)?.currentStreak || 0;
  const longestStreak = (user as any)?.longestStreak || 0;
  const currentLevel = (user as any)?.currentLevel || 1;
  const totalPoints = (user as any)?.totalPoints || 0;
  const calorieGoal = (user as any)?.calorieGoal || 2000;
  
  const pointsToNextLevel = ((currentLevel * 100) - totalPoints);
  const levelProgress = ((totalPoints % 100) / 100) * 100;
  const calorieProgress = (todaysStats.totalCalories / calorieGoal) * 100;
  const isOverCalorieGoal = todaysStats.totalCalories > calorieGoal;

  const healthScore = todaysLogs.length > 0 
    ? Math.round(((todaysStats.yes * 10 + todaysStats.ok * 5 + todaysStats.no * 2) / (todaysLogs.length * 10)) * 100)
    : 0;

  const weeklyHealthScore = weeklyLogs.length > 0
    ? Math.round(((weeklyStats.yes * 10 + weeklyStats.ok * 5 + weeklyStats.no * 2) / (weeklyLogs.length * 10)) * 100)
    : 0;

  // Calculate monthly stats
  const monthStart = new Date();
  monthStart.setDate(1);
  
  const monthlyLogs = allLogs.filter((log: FoodLog) => {
    const logDate = new Date(log.createdAt);
    return logDate >= monthStart;
  });

  const monthlyStats = monthlyLogs.reduce(
    (acc: any, log: FoodLog) => {
      acc[log.verdict.toLowerCase()]++;
      acc.totalCalories += log.calories || 0;
      return acc;
    },
    { yes: 0, ok: 0, no: 0, totalCalories: 0 }
  );

  return (
    <div className="pt-20 pb-24 container-padding">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Progress Tracking</h1>
          <p className="text-xl text-gray-600">Monitor your health journey and achievements</p>
        </div>

        {/* Level & Streak Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Level {currentLevel}</h3>
                  <p className="text-sm text-gray-600">{totalPoints} total points</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress to Level {currentLevel + 1}</span>
                  <span>{pointsToNextLevel > 0 ? pointsToNextLevel : 0} points to go</span>
                </div>
                <ProgressBar value={levelProgress} className="h-3 bg-purple-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="w-8 h-8 text-orange-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Day Streak</h3>
                  <p className="text-sm text-gray-600">Days without "No" foods</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-700">{currentStreak}</div>
                  <div className="text-xs text-gray-600">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{longestStreak}</div>
                  <div className="text-xs text-gray-600">Best</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Calorie Progress */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-800">Daily Calories</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-700">
                  {todaysStats.totalCalories} / {calorieGoal}
                </div>
                <div className="text-sm text-gray-600">
                  {isOverCalorieGoal 
                    ? `${Math.round((todaysStats.totalCalories - calorieGoal))} over goal` 
                    : `${Math.round(calorieGoal - todaysStats.totalCalories)} remaining`
                  }
                </div>
              </div>
            </div>
            <ProgressBar 
              value={Math.min(calorieProgress, 100)} 
              className={`h-4 ${isOverCalorieGoal ? 'bg-red-100' : 'bg-blue-100'}`}
            />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>0</span>
              <span className={isOverCalorieGoal ? 'text-red-600 font-semibold' : 'text-blue-600'}>
                {Math.round(calorieProgress)}% {isOverCalorieGoal ? '(Over Goal)' : 'of goal'}
              </span>
              <span>{calorieGoal}</span>
            </div>
          </CardContent>
        </Card>

        {/* Today's Food Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{todaysStats.yes}</div>
                <div className="text-sm text-green-600">Yes Foods</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-700">{todaysStats.ok}</div>
                <div className="text-sm text-yellow-600">OK Foods</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-700">{todaysStats.no}</div>
                <div className="text-sm text-red-600">No Foods</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">{healthScore}%</div>
                <div className="text-sm text-blue-600">Health Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              This Week's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">{weeklyStats.yes}</div>
                <div className="text-sm text-green-600">Yes Foods</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">{weeklyStats.ok}</div>
                <div className="text-sm text-yellow-600">OK Foods</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-700">{weeklyStats.no}</div>
                <div className="text-sm text-red-600">No Foods</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-700">{weeklyStats.totalPoints}</div>
                <div className="text-sm text-purple-600">Points Earned</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{weeklyHealthScore}%</div>
                <div className="text-sm text-blue-600">Health Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Monthly Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">{monthlyStats.yes}</div>
                <div className="text-sm text-green-600">Yes Foods</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">{monthlyStats.ok}</div>
                <div className="text-sm text-yellow-600">OK Foods</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-700">{monthlyStats.no}</div>
                <div className="text-sm text-red-600">No Foods</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{Math.round(monthlyStats.totalCalories)}</div>
                <div className="text-sm text-blue-600">Total Calories</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Leaderboard Position */}
        {weeklyScore && (
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-700">#{(weeklyScore as any).rank || 'N/A'}</div>
                  <div className="text-sm text-amber-600">Your Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-700">{(weeklyScore as any).score || 0}</div>
                  <div className="text-sm text-amber-600">Weekly Score</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${(weeklyScore as any).weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(weeklyScore as any).weeklyChange > 0 ? '+' : ''}{(weeklyScore as any).weeklyChange || 0}
                  </div>
                  <div className="text-sm text-amber-600">Weekly Change</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Food Logs */}
        {todaysLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Food Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysLogs.slice(0, 5).map((log: FoodLog) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {log.verdict === "YES" && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {log.verdict === "OK" && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                      {log.verdict === "NO" && <XCircle className="w-5 h-5 text-red-600" />}
                      <div>
                        <div className="font-medium">{log.foodName}</div>
                        <div className="text-sm text-gray-600">
                          {log.calories && `${log.calories} cal`}
                          {log.protein && ` • ${log.protein}g protein`}
                        </div>
                      </div>
                    </div>
                    <Badge variant={
                      log.verdict === "YES" ? "default" : 
                      log.verdict === "OK" ? "secondary" : "destructive"
                    }>
                      {log.verdict}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}