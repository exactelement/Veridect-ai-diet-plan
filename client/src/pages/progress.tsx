import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { FoodLog } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Progress() {
  const { user } = useAuth();
  
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
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Achievement Challenges</h2>
            
            <div className="space-y-4">
              {/* Daily Challenges */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-lg mb-3 text-gray-800">Daily Challenges</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Analyze 3 foods today</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((totalStats.total / 3) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{Math.min(totalStats.total, 3)}/3</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Make 2 excellent choices</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((totalStats.yes / 2) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{Math.min(totalStats.yes, 2)}/2</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Challenges */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-lg mb-3 text-gray-800">Weekly Challenges</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Analyze 20 foods this week</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((totalStats.total / 20) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{Math.min(totalStats.total, 20)}/20</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Maintain 80% excellent/moderate ratio</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${totalStats.total > 0 ? Math.min(((totalStats.yes + totalStats.ok) / totalStats.total) * 125, 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {totalStats.total > 0 ? Math.round(((totalStats.yes + totalStats.ok) / totalStats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestone Achievements */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-lg mb-3 text-gray-800">Milestone Achievements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border-2 ${totalStats.total >= 10 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${totalStats.total >= 10 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm font-medium ${totalStats.total >= 10 ? 'text-green-700' : 'text-gray-600'}`}>
                        First 10 Foods
                      </span>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg border-2 ${totalStats.total >= 50 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${totalStats.total >= 50 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm font-medium ${totalStats.total >= 50 ? 'text-blue-700' : 'text-gray-600'}`}>
                        Health Explorer (50)
                      </span>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg border-2 ${totalStats.yes >= 25 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${totalStats.yes >= 25 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm font-medium ${totalStats.yes >= 25 ? 'text-yellow-700' : 'text-gray-600'}`}>
                        Excellence Master (25)
                      </span>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg border-2 ${totalStats.total >= 100 ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${totalStats.total >= 100 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm font-medium ${totalStats.total >= 100 ? 'text-purple-700' : 'text-gray-600'}`}>
                        Century Club (100)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}