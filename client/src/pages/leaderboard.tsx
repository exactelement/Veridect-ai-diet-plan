import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown, TrendingUp } from "lucide-react";

export default function Leaderboard() {
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard/weekly"],
  });

  const { data: myScore } = useQuery({
    queryKey: ["/api/leaderboard/my-score"],
  });

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
    <div className="min-h-screen bg-gradient-to-br from-ios-bg via-white to-ios-gray-50 pt-20 pb-24">
      <div className="container-padding">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent mb-4">
              Weekly Leaderboard
            </h1>
            <p className="text-xl text-ios-secondary">See how you stack up against other health champions</p>
          </div>

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
                      #{myScore.rank || '-'}
                    </div>
                    <div className="text-sm text-ios-secondary">
                      {myScore.score || 0} points
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
                  leaderboard.map((entry: any, index: number) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getRankColor(entry.rank)} transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12">
                            {getRankIcon(entry.rank)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {entry.firstName || 'Anonymous'} {entry.lastName ? entry.lastName[0] + '.' : ''}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-health-green/10 text-health-green border-health-green/20">
                                {entry.yesCount} YES
                              </Badge>
                              <Badge className="bg-warning-orange/10 text-warning-orange border-warning-orange/20">
                                {entry.okCount} OK
                              </Badge>
                              <Badge className="bg-danger-red/10 text-danger-red border-danger-red/20">
                                {entry.noCount} NO
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            entry.rank === 1 ? 'text-yellow-500' :
                            entry.rank === 2 ? 'text-gray-400' :
                            entry.rank === 3 ? 'text-amber-600' :
                            'text-ios-text'
                          }`}>
                            {entry.score}
                          </div>
                          <div className="text-sm text-ios-secondary">points</div>
                        </div>
                      </div>
                    </div>
                  ))
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
                  Rankings reset every Sunday. Only foods you choose to log (click "Yum") count toward your score.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Challenge */}
          <Card className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="w-5 h-5 mr-3 text-purple-500" />
                This Week's Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">🥗 Veggie Victory Week</h3>
                <p className="text-ios-secondary mb-4">
                  Focus on vegetables and plant-based foods to earn bonus points and climb the leaderboard!
                </p>
                <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                  Challenge Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}