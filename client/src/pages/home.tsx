import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Trophy, Target, TrendingUp, Zap, Star, Award, Calendar } from "lucide-react";
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

  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-bg via-white to-ios-gray-50 pb-24">
      {/* Hero Section */}
      <div className="pt-20 pb-8">
        <div className="container-padding">
          <div className="max-w-6xl mx-auto">
            {/* Greeting Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-sm mb-4">
                <Star className="w-5 h-5 text-health-green" />
                <span className="text-ios-secondary font-medium">{timeGreeting}</span>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-ios-blue to-health-green bg-clip-text text-transparent mb-4">
                Ready to analyze?
              </h1>
              <p className="text-xl text-ios-secondary max-w-2xl mx-auto leading-relaxed">
                Make informed food choices with AI-powered analysis tailored to your health goals
              </p>
            </div>

            {/* Quick Analyze Button */}
            <div className="text-center mb-12">
              <Button
                onClick={() => navigate("/food-analysis")}
                className="bg-gradient-to-r from-health-green to-ios-blue hover:from-health-green/90 hover:to-ios-blue/90 text-white shadow-2xl shadow-health-green/20 px-12 py-6 text-xl font-semibold rounded-2xl transform hover:scale-105 transition-all duration-200"
              >
                <Camera className="w-6 h-6 mr-3" />
                Analyze Food Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="container-padding">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Today's Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-health-green/10 to-health-green/5 border-health-green/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ios-secondary">Health Score</p>
                    <p className="text-3xl font-bold text-health-green">{healthScore}%</p>
                  </div>
                  <div className="w-12 h-12 bg-health-green/10 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-health-green" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-ios-blue/10 to-ios-blue/5 border-ios-blue/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ios-secondary">Foods Analyzed</p>
                    <p className="text-3xl font-bold text-ios-blue">{todaysLogs.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-ios-blue/10 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-ios-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning-orange/10 to-warning-orange/5 border-warning-orange/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ios-secondary">Total Calories</p>
                    <p className="text-3xl font-bold text-warning-orange">{totalCalories}</p>
                  </div>
                  <div className="w-12 h-12 bg-warning-orange/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-warning-orange" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ios-secondary">Weekly Rank</p>
                    <p className="text-3xl font-bold text-purple-500">#{weeklyScore?.rank || '-'}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-r from-white to-ios-gray-50 shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Award className="w-6 h-6 mr-3 text-health-green" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => navigate("/food-analysis")}
                  variant="outline"
                  className="h-20 flex flex-col space-y-2 hover:bg-health-green/5 hover:border-health-green transition-all duration-200"
                >
                  <Camera className="w-8 h-8 text-health-green" />
                  <span className="font-semibold">Analyze Food</span>
                </Button>
                
                <Button
                  onClick={() => navigate("/profile")}
                  variant="outline"
                  className="h-20 flex flex-col space-y-2 hover:bg-ios-blue/5 hover:border-ios-blue transition-all duration-200"
                >
                  <Target className="w-8 h-8 text-ios-blue" />
                  <span className="font-semibold">Update Goals</span>
                </Button>
                
                <Button
                  onClick={() => navigate("/subscription")}
                  variant="outline"
                  className="h-20 flex flex-col space-y-2 hover:bg-purple-500/5 hover:border-purple-500 transition-all duration-200"
                >
                  <Star className="w-8 h-8 text-purple-500" />
                  <span className="font-semibold">Upgrade Plan</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Analysis Breakdown */}
          {todaysLogs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Verdict Breakdown */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-health-green/5 to-ios-blue/5">
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-3" />
                    Today's Choices
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-health-green rounded-full"></div>
                        <span className="font-medium">Great Choices (YES)</span>
                      </div>
                      <Badge variant="secondary" className="bg-health-green/10 text-health-green">
                        {todaysStats.yes}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-warning-orange rounded-full"></div>
                        <span className="font-medium">Okay Choices (OK)</span>
                      </div>
                      <Badge variant="secondary" className="bg-warning-orange/10 text-warning-orange">
                        {todaysStats.ok}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-danger-red rounded-full"></div>
                        <span className="font-medium">Skip Next Time (NO)</span>
                      </div>
                      <Badge variant="secondary" className="bg-danger-red/10 text-danger-red">
                        {todaysStats.no}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Analysis */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-ios-blue/5 to-purple-500/5">
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-3" />
                    Recent Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {todaysLogs.slice(0, 3).map((log: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            log.verdict === 'YES' ? 'bg-health-green' :
                            log.verdict === 'OK' ? 'bg-warning-orange' : 'bg-danger-red'
                          }`}></div>
                          <span className="font-medium truncate">{log.foodName}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            log.verdict === 'YES' ? 'bg-health-green/10 text-health-green' :
                            log.verdict === 'OK' ? 'bg-warning-orange/10 text-warning-orange' :
                            'bg-danger-red/10 text-danger-red'
                          }
                        >
                          {log.verdict}
                        </Badge>
                      </div>
                    ))}
                    {todaysLogs.length === 0 && (
                      <p className="text-ios-secondary text-center py-4">
                        No foods analyzed today. Start by analyzing your first meal!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State for First Time Users */}
          {todaysLogs.length === 0 && (
            <Card className="bg-gradient-to-br from-health-green/5 to-ios-blue/5 border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-health-green to-ios-blue rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Ready to start your health journey?</h3>
                <p className="text-ios-secondary text-lg mb-8 max-w-md mx-auto">
                  Analyze your first food to get personalized health insights and start earning points!
                </p>
                <Button
                  onClick={() => navigate("/food-analysis")}
                  className="bg-gradient-to-r from-health-green to-ios-blue hover:from-health-green/90 hover:to-ios-blue/90 text-white px-8 py-3 text-lg font-semibold rounded-xl"
                >
                  Analyze Your First Food
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}