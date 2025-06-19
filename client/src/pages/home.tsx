import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Trophy, Target, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  const { data: todaysLogs = [] } = useQuery({
    queryKey: ["/api/food/logs/today"],
  });

  const { data: weeklyScore } = useQuery({
    queryKey: ["/api/leaderboard/my-score"],
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard/weekly"],
  });

  const todaysStats = todaysLogs.reduce(
    (acc: any, log: any) => {
      acc[log.verdict.toLowerCase()]++;
      return acc;
    },
    { yes: 0, ok: 0, no: 0 }
  );

  const totalCalories = todaysLogs.reduce(
    (acc: number, log: any) => acc + (log.calories || 0),
    0
  );

  const healthScore = todaysLogs.length > 0 
    ? Math.round(((todaysStats.yes * 100 + todaysStats.ok * 50) / (todaysLogs.length * 100)) * 100)
    : 0;

  return (
    <div className="pt-20 pb-8 container-padding">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Your Health Dashboard</h1>
          <p className="text-ios-secondary">Track your nutrition journey and make better choices</p>
        </div>

        {/* Quick Action */}
        <Card className="bg-gradient-to-br from-ios-blue to-health-green text-white">
          <CardContent className="p-8 text-center">
            <Camera className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ready to Analyze?</h2>
            <p className="text-white/90 mb-6">Take a photo or describe your food to get an instant health verdict</p>
            <Button 
              onClick={() => navigate("/analyze")}
              className="bg-white text-ios-blue hover:bg-white/90 px-8 py-3 rounded-full font-medium"
            >
              Start Analysis
            </Button>
          </CardContent>
        </Card>

        {/* Today's Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-health-green mb-2">{todaysStats.yes}</div>
              <div className="text-sm text-ios-secondary">Yes Choices</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-warning-orange mb-2">{todaysStats.ok}</div>
              <div className="text-sm text-ios-secondary">OK Choices</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-danger-red mb-2">{todaysStats.no}</div>
              <div className="text-sm text-ios-secondary">No Choices</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-ios-blue mb-2">{totalCalories}</div>
              <div className="text-sm text-ios-secondary">Total Calories</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Today's Health Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-health-green"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${healthScore}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{healthScore}%</span>
                  </div>
                </div>
                <p className="text-ios-secondary">
                  {healthScore >= 80 ? "Excellent!" : healthScore >= 60 ? "Good job!" : "Room for improvement"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Weekly Leaderboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyScore && (
                <div className="mb-4 p-3 bg-ios-blue/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Your Rank</span>
                    <Badge variant="secondary">#{weeklyScore.rank || 'N/A'}</Badge>
                  </div>
                  <div className="text-sm text-ios-secondary mt-1">
                    Score: {weeklyScore.totalScore}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((user: any, index: number) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{user.firstName || 'Anonymous'}</span>
                    </div>
                    <span className="text-sm text-ios-secondary">{user.totalScore}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Food Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Today's Food Log</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysLogs.length === 0 ? (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-ios-secondary mb-4">No food logged today</p>
                <Button onClick={() => navigate("/analyze")} className="bg-ios-blue text-white">
                  Log Your First Meal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysLogs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        log.verdict === 'YES' ? 'bg-health-green' :
                        log.verdict === 'OK' ? 'bg-warning-orange' :
                        'bg-danger-red'
                      }`}>
                        {log.verdict === 'YES' ? '✓' : log.verdict === 'OK' ? '~' : '✗'}
                      </div>
                      <div>
                        <div className="font-medium">{log.foodName}</div>
                        <div className="text-sm text-ios-secondary">
                          {log.calories ? `${log.calories} cal` : 'No calorie info'} • 
                          Confidence: {log.confidence}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-ios-secondary">
                        {new Date(log.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {todaysLogs.length > 5 && (
                  <div className="text-center">
                    <Button variant="outline" onClick={() => navigate("/profile")}>
                      View All Logs
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
