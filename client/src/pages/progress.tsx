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
      </div>
    </div>
  );
}