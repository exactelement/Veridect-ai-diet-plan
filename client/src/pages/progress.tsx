import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Target, Award, Zap } from "lucide-react";

export default function Progress() {
  const { data: todaysLogs = [] } = useQuery({
    queryKey: ["/api/food/logs/today"],
  });

  const { data: allLogs = [] } = useQuery({
    queryKey: ["/api/food/logs"],
  });

  const { data: weeklyScore } = useQuery({
    queryKey: ["/api/leaderboard/my-score"],
  });

  // Calculate weekly stats
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  
  const weeklyLogs = allLogs.filter((log: any) => {
    const logDate = new Date(log.createdAt);
    return logDate >= weekStart;
  });

  const weeklyStats = weeklyLogs.reduce(
    (acc: any, log: any) => {
      acc[log.verdict.toLowerCase()]++;
      acc.totalPoints += log.verdict === 'YES' ? 10 : log.verdict === 'OK' ? 5 : 2;
      return acc;
    },
    { yes: 0, ok: 0, no: 0, totalPoints: 0 }
  );

  const todaysStats = todaysLogs.reduce(
    (acc: any, log: any) => {
      acc[log.verdict.toLowerCase()]++;
      return acc;
    },
    { yes: 0, ok: 0, no: 0 }
  );

  const healthScore = todaysLogs.length > 0 
    ? Math.round(((todaysStats.yes * 100 + todaysStats.ok * 50) / (todaysLogs.length * 100)) * 100)
    : 0;

  const weeklyHealthScore = weeklyLogs.length > 0
    ? Math.round(((weeklyStats.yes * 100 + weeklyStats.ok * 50) / (weeklyLogs.length * 100)) * 100)
    : 0;

  // Daily progress for the week
  const dailyProgress = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    
    const dayLogs = allLogs.filter((log: any) => {
      const logDate = new Date(log.createdAt);
      return logDate.toDateString() === date.toDateString();
    });

    const dayStats = dayLogs.reduce(
      (acc: any, log: any) => {
        acc[log.verdict.toLowerCase()]++;
        return acc;
      },
      { yes: 0, ok: 0, no: 0 }
    );

    const dayScore = dayLogs.length > 0
      ? Math.round(((dayStats.yes * 100 + dayStats.ok * 50) / (dayLogs.length * 100)) * 100)
      : 0;

    dailyProgress.push({
      date,
      dayName: date.toLocaleDateString('en', { weekday: 'short' }),
      score: dayScore,
      count: dayLogs.length,
      ...dayStats
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-bg via-white to-ios-gray-50 pt-20 pb-24">
      <div className="container-padding">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-ios-blue to-health-green bg-clip-text text-transparent mb-4">
              Your Progress
            </h1>
            <p className="text-xl text-ios-secondary">Track your nutrition journey and celebrate your wins</p>
          </div>

          {/* Today's Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-health-green/10 to-health-green/5 border-health-green/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ios-secondary">Today's Score</p>
                    <p className="text-3xl font-bold text-health-green">{healthScore}%</p>
                  </div>
                  <Target className="w-8 h-8 text-health-green" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-ios-blue/10 to-ios-blue/5 border-ios-blue/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ios-secondary">Foods Today</p>
                    <p className="text-3xl font-bold text-ios-blue">{todaysLogs.length}</p>
                  </div>
                  <Zap className="w-8 h-8 text-ios-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ios-secondary">Weekly Score</p>
                    <p className="text-3xl font-bold text-purple-500">{weeklyHealthScore}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning-orange/10 to-warning-orange/5 border-warning-orange/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ios-secondary">Total Points</p>
                    <p className="text-3xl font-bold text-warning-orange">{weeklyStats.totalPoints}</p>
                  </div>
                  <Award className="w-8 h-8 text-warning-orange" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-3" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyProgress.map((day, index) => {
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  return (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                      isToday ? 'bg-ios-blue/5 border border-ios-blue/20' : 'bg-ios-gray-50'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 text-center">
                          <div className={`text-sm font-medium ${isToday ? 'text-ios-blue' : 'text-ios-secondary'}`}>
                            {day.dayName}
                          </div>
                          <div className="text-xs text-ios-secondary">
                            {day.date.getDate()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {day.yes > 0 && (
                            <Badge className="bg-health-green/10 text-health-green border-health-green/20">
                              {day.yes} YES
                            </Badge>
                          )}
                          {day.ok > 0 && (
                            <Badge className="bg-warning-orange/10 text-warning-orange border-warning-orange/20">
                              {day.ok} OK
                            </Badge>
                          )}
                          {day.no > 0 && (
                            <Badge className="bg-danger-red/10 text-danger-red border-danger-red/20">
                              {day.no} NO
                            </Badge>
                          )}
                          {day.count === 0 && (
                            <span className="text-ios-secondary text-sm">No analysis</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          day.score >= 80 ? 'text-health-green' :
                          day.score >= 60 ? 'text-warning-orange' :
                          day.score > 0 ? 'text-danger-red' : 'text-ios-secondary'
                        }`}>
                          {day.score > 0 ? `${day.score}%` : '-'}
                        </div>
                        <div className="text-xs text-ios-secondary">
                          {day.count} {day.count === 1 ? 'food' : 'foods'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-3" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border-2 ${
                  allLogs.length >= 1 ? 'bg-health-green/5 border-health-green/20' : 'bg-ios-gray-50 border-ios-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      allLogs.length >= 1 ? 'bg-health-green text-white' : 'bg-ios-gray-200 text-ios-secondary'
                    }`}>
                      🎯
                    </div>
                    <div>
                      <h3 className="font-semibold">First Analysis</h3>
                      <p className="text-sm text-ios-secondary">Analyze your first food</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  weeklyStats.yes >= 5 ? 'bg-health-green/5 border-health-green/20' : 'bg-ios-gray-50 border-ios-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      weeklyStats.yes >= 5 ? 'bg-health-green text-white' : 'bg-ios-gray-200 text-ios-secondary'
                    }`}>
                      🌟
                    </div>
                    <div>
                      <h3 className="font-semibold">Health Champion</h3>
                      <p className="text-sm text-ios-secondary">5 YES choices this week</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  dailyProgress.filter(d => d.count > 0).length >= 7 ? 'bg-health-green/5 border-health-green/20' : 'bg-ios-gray-50 border-ios-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      dailyProgress.filter(d => d.count > 0).length >= 7 ? 'bg-health-green text-white' : 'bg-ios-gray-200 text-ios-secondary'
                    }`}>
                      🔥
                    </div>
                    <div>
                      <h3 className="font-semibold">Week Streak</h3>
                      <p className="text-sm text-ios-secondary">Analyze food every day this week</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}