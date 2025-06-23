import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { FoodLog } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Progress() {
  const { user } = useAuth();

  // Scroll to top when navigating to progress
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const { data: allLogs = [] } = useQuery<FoodLog[]>({
    queryKey: ["/api/food/logs"],
  });

  // Calculate total stats from all logged food
  const totalStats = allLogs.reduce(
    (acc: any, log: FoodLog) => {
      acc[log.verdict.toLowerCase()]++;
      acc.total++;
      return acc;
    },
    { yes: 0, ok: 0, no: 0, total: 0 }
  );

  // Calculate percentages
  const excellentPercentage = totalStats.total > 0 ? Math.round((totalStats.yes / totalStats.total) * 100) : 0;
  const moderatePercentage = totalStats.total > 0 ? Math.round((totalStats.ok / totalStats.total) * 100) : 0;
  const badPercentage = totalStats.total > 0 ? Math.round((totalStats.no / totalStats.total) * 100) : 0;

  // Calculate circle chart segments (for 360 degrees)
  const excellentDegrees = (totalStats.yes / totalStats.total) * 360 || 0;
  const moderateDegrees = (totalStats.ok / totalStats.total) * 360 || 0;
  const badDegrees = (totalStats.no / totalStats.total) * 360 || 0;

  // Create conic gradient based on the data
  const createConicGradient = () => {
    if (totalStats.total === 0) {
      return 'conic-gradient(#e5e7eb 0deg 360deg)'; // Gray when no data
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
    <div className="pt-20 pb-24 container-padding">
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
                    <div className="text-3xl font-bold text-gray-800">{totalStats.total}</div>
                    <div className="text-sm text-gray-500">Total Choices</div>
                  </div>
                </div>
              </div>

              {/* Stats Below Circle */}
              <div className="w-full grid grid-cols-3 gap-6">
                {/* Excellent */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-1">{totalStats.yes}</div>
                  <div className="text-lg font-semibold text-gray-800">Excellent</div>
                  <div className="text-sm text-gray-500">{excellentPercentage}%</div>
                </div>

                {/* Moderate */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-1">{totalStats.ok}</div>
                  <div className="text-lg font-semibold text-gray-800">Moderate</div>
                  <div className="text-sm text-gray-500">{moderatePercentage}%</div>
                </div>

                {/* Bad */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-1">{totalStats.no}</div>
                  <div className="text-lg font-semibold text-gray-800">Bad</div>
                  <div className="text-sm text-gray-500">{badPercentage}%</div>
                </div>
              </div>

              {/* Legend for empty state */}
              {totalStats.total === 0 && (
                <div className="text-center text-gray-500 mt-4">
                  <p className="text-sm">Start analyzing food to see your progress!</p>
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
                      {totalStats.yes >= 3 && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">+50 bonus points!</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-green-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${Math.min((totalStats.yes / 3) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{Math.min(totalStats.yes, 3)}/3</span>
                    </div>
                  </div>
                  
                  {/* 5 YES streak */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-medium">5 YES streak (Health Champion)</span>
                      {totalStats.yes >= 5 && (
                        <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">GOLD BADGE!</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-green-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-yellow-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${Math.min((totalStats.yes / 5) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{Math.min(totalStats.yes, 5)}/5</span>
                    </div>
                  </div>

                  {/* 10 YES perfectionist */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-medium">10 YES perfectionist streak</span>
                      {totalStats.yes >= 10 && (
                        <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">DIAMOND LEVEL!</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-green-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                          style={{ width: `${Math.min((totalStats.yes / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{Math.min(totalStats.yes, 10)}/10</span>
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
                      {totalStats.total >= 5 && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">+25 points!</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-blue-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((totalStats.total / 5) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-blue-700">{Math.min(totalStats.total, 5)}/5</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-700 font-medium">Zero BAD foods today</span>
                      {totalStats.no === 0 && totalStats.total > 0 && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">PERFECT DAY!</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${totalStats.no === 0 && totalStats.total > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm font-semibold text-blue-700">
                        {totalStats.no === 0 && totalStats.total > 0 ? '✓' : '✗'}
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
                      {totalStats.yes >= 15 && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">WEEKLY CHAMPION!</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-orange-200 rounded-full h-3">
                        <div 
                          className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((totalStats.yes / 15) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-orange-700">{Math.min(totalStats.yes, 15)}/15</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-700 font-medium">90% YES+OK ratio this week</span>
                      {totalStats.total > 0 && ((totalStats.yes + totalStats.ok) / totalStats.total) >= 0.9 && (
                        <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">ELITE STATUS!</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-orange-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${totalStats.total > 0 ? Math.min(((totalStats.yes + totalStats.ok) / totalStats.total) * 111, 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-orange-700">
                        {totalStats.total > 0 ? Math.round(((totalStats.yes + totalStats.ok) / totalStats.total) * 100) : 0}%
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
                    totalStats.yes >= 5 ? 'bg-green-50 border-green-300 shadow-md' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${totalStats.yes >= 5 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className={`text-sm font-medium ${totalStats.yes >= 5 ? 'text-green-700' : 'text-gray-600'}`}>
                          Health Rookie
                        </span>
                      </div>
                      {totalStats.yes >= 5 && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">+100 pts</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">5 YES foods</div>
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
                      {totalStats.yes >= 15 && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">+250 pts</span>
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
                      {totalStats.yes >= 30 && (
                        <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">+500 pts</span>
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
                      {totalStats.yes >= 50 && (
                        <span className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded">+1000 pts</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">50 YES foods (Ultimate)</div>
                  </div>
                </div>
              </div>

              {/* Reward Summary */}
              {(totalStats.yes > 0 || totalStats.total > 0) && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-100 rounded-lg p-4 shadow-sm border border-indigo-200">
                  <h3 className="font-semibold text-lg mb-3 text-indigo-800">🎁 Today's Rewards Earned</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-700">
                        {totalStats.yes * 50 + totalStats.ok * 25 + totalStats.total * 10}
                      </div>
                      <div className="text-sm text-indigo-600">Bonus Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-700">
                        {Math.floor(totalStats.yes / 3) + Math.floor(totalStats.yes / 5) + Math.floor(totalStats.yes / 10)}
                      </div>
                      <div className="text-sm text-purple-600">Badges Earned</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}