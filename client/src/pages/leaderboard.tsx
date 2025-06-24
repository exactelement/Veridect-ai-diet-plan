import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award, Crown, TrendingUp, Users, Calendar, Target } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { WeeklyScore } from "@shared/schema";

export default function Leaderboard() {
  const { user } = useAuth();

  // Scroll to top when navigating to leaderboard
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { data: leaderboard = [] } = useQuery<WeeklyScore[]>({
    queryKey: ["/api/leaderboard/weekly"],
  });

  const { data: myScore } = useQuery<WeeklyScore>({
    queryKey: ["/api/leaderboard/my-score"],
  });

  // User interface preferences
  const participateInWeeklyChallenge = (user as any)?.privacySettings?.participateInWeeklyChallenge !== false;

  // Calculate weekly challenge progress based on Madrid timezone (Monday 00:00 reset)
  const getCurrentWeekProgress = () => {
    const now = new Date();
    
    // Get current time in Madrid
    const madridTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Madrid"}));
    
    // Calculate next Monday 00:00 Madrid time
    const nextMonday = new Date(madridTime);
    const dayOfWeek = madridTime.getDay(); // 0 = Sunday, 1 = Monday
    const daysToAdd = dayOfWeek === 0 ? 1 : (8 - dayOfWeek); // Days until next Monday
    nextMonday.setDate(madridTime.getDate() + daysToAdd);
    nextMonday.setHours(0, 0, 0, 0);
    
    // Calculate time remaining
    const timeRemaining = nextMonday.getTime() - madridTime.getTime();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    
    // Calculate progress through current week
    const daysPassed = 7 - daysRemaining;
    const progressPercentage = Math.round((daysPassed / 7) * 100);
    
    return { daysRemaining, progressPercentage };
  };

  const { daysRemaining, progressPercentage } = getCurrentWeekProgress();
  
  // Get total user count for participants
  const { data: allUsers } = useQuery<{count: number}>({
    queryKey: ["/api/users/count"],
  });
  
  const participantCount = allUsers?.count || leaderboard.length;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-ios-secondary" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/10 to-yellow-400/10 border-yellow-500/20";
      case 2:
        return "bg-gradient-to-r from-gray-400/10 to-gray-300/10 border-gray-400/20";
      case 3:
        return "bg-gradient-to-r from-amber-600/10 to-amber-500/10 border-amber-600/20";
      default:
        return "bg-white border-ios-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-bg via-white to-ios-gray-50 pt-20 pb-32">
      <div className="container-padding">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent mb-4">
              Weekly Leaderboard
            </h1>

          </div>

          {/* Weekly Challenge Card */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-2 border-orange-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-orange-800">No Junk Food Week</h3>
                    <div className="flex items-center gap-2 text-orange-700">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{participantCount}</span>
                      <span className="text-sm">participants</span>
                    </div>
                  </div>
                  <p className="text-orange-700 mb-4">Avoid junk food for 7 consecutive days</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-orange-800">{daysRemaining} days remaining</span>
                      </div>
                      <span className="text-lg font-bold text-orange-800">{progressPercentage}%</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Progress value={progressPercentage} className="h-3 bg-orange-200" />
                      <p className="text-sm text-orange-600">You're {progressPercentage}% through!</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Position */}
          {myScore && (
            <Card className="bg-gradient-to-r from-ios-blue/5 to-health-green/5 border-ios-blue/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-ios-blue/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-ios-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Your Position</h3>
                      <p className="text-ios-secondary">This week's performance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-ios-blue">
                      #{leaderboard.findIndex((entry: any) => entry.userId === (user as any)?.id) + 1 || '-'}
                    </div>
                    <div className="text-sm text-ios-secondary">
                      {myScore.weeklyPoints || 0} weekly points
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-3 text-yellow-500" />
                Top Performers This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry: any, index: number) => {
                    const position = index + 1; // Calculate position from array index
                    return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getRankColor(position)} transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 relative">
                            {getRankIcon(position)}
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-gray-200">
                              <span className="text-xs font-bold text-gray-700">#{position}</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {entry.userId === (user as any)?.id ? (
                                <Link href="/profile">
                                  <h3 className="font-semibold text-lg hover:text-ios-blue cursor-pointer transition-colors">
                                    {entry.firstName || 'Anonymous'} {entry.lastName ? entry.lastName[0] + '.' : ''} <span className="text-ios-secondary font-normal">(you)</span>
                                  </h3>
                                </Link>
                              ) : (
                                <h3 className="font-semibold text-lg">
                                  {entry.firstName || 'Anonymous'} {entry.lastName ? entry.lastName[0] + '.' : ''}
                                </h3>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {entry.weeklyPoints} pts
                            </Badge>
                          </div>
                          <div className="text-sm text-ios-secondary">
                            {entry.yesCount}Y • {entry.okCount}O • {entry.noCount}N
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-ios-secondary/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Rankings Yet</h3>
                    <p className="text-ios-secondary">
                      Be the first to analyze foods and claim the top spot!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* How Scoring Works */}
          <Card className="bg-gradient-to-r from-health-green/5 to-ios-blue/5">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-3 text-health-green" />
                How Scoring Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-health-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-health-green">10</span>
                  </div>
                  <h3 className="font-semibold text-health-green mb-2">YES Foods</h3>
                  <p className="text-sm text-ios-secondary">
                    Healthy choices that align with your goals
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-warning-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-warning-orange">5</span>
                  </div>
                  <h3 className="font-semibold text-warning-orange mb-2">OK Foods</h3>
                  <p className="text-sm text-ios-secondary">
                    Moderate choices, good in moderation
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-danger-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-danger-red">2</span>
                  </div>
                  <h3 className="font-semibold text-danger-red mb-2">NO Foods</h3>
                  <p className="text-sm text-ios-secondary">
                    Less healthy options, better to avoid
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white/50 rounded-lg">
                <p className="text-sm text-ios-secondary text-center">
                  Rankings reset every Monday at 00:00 Madrid time. Only foods you choose to log (click "Yum") count toward your score.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bottom spacer to prevent footer overlap */}
          <div className="h-24"></div>

        </div>
      </div>
    </div>
  );
}