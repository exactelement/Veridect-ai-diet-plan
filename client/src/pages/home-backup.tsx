import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Trophy, Target, TrendingUp, Zap, Star, Award, Calendar, Clock, Heart, Brain, Shield, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

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

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  color: string;
}

export default function Home() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: todaysLogs = [] } = useQuery<FoodLog[]>({
    queryKey: ["/api/food/logs/today"],
  });

  const { data: weeklyScore } = useQuery<WeeklyScore>({
    queryKey: ["/api/leaderboard/my-score"],
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard/weekly"],
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

  const healthScore = todaysLogs.length > 0 
    ? Math.round(((todaysStats.yes * 10 + todaysStats.ok * 5 + todaysStats.no * 2) / (todaysLogs.length * 10)) * 100)
    : 0;

  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  // Subscription tiers
  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      description: "Get started with basic food analysis",
      features: [
        "5 analyses per day",
        "Basic nutritional info",
        "Simple yes/no verdicts",
        "Weekly progress tracking"
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "from-gray-400 to-gray-600"
    },
    {
      id: "pro",
      name: "Pro",
      price: 19.99,
      description: "Advanced nutrition tracking for health enthusiasts",
      features: [
        "Unlimited analyses",
        "Detailed nutrition breakdown",
        "Personalized recommendations",
        "Progress analytics",
        "Export data",
        "Priority support"
      ],
      icon: <Star className="w-6 h-6" />,
      popular: true,
      color: "from-blue-500 to-purple-600"
    },
    {
      id: "medical",
      name: "Medical",
      price: 49.99,
      description: "Professional-grade nutrition analysis",
      features: [
        "Everything in Pro",
        "Medical-grade accuracy",
        "Allergy & condition alerts",
        "Healthcare provider reports",
        "API access",
        "Dedicated account manager"
      ],
      icon: <Shield className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-bg via-white to-ios-gray-50 pb-24">
      {/* Hero Section */}
      <div className="pt-20 pb-8">
        <div className="container-padding">
          <div className="max-w-6xl mx-auto">
            {/* Greeting Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {timeGreeting}, {(user as any)?.firstName || 'there'}!
              </h1>
              <p className="text-gray-600">Ready to make healthy food choices today?</p>
            </div>

            {/* Daily Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">{todaysStats.yes}</div>
                  <div className="text-sm text-green-600">Yes Foods</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-700">{todaysStats.ok}</div>
                  <div className="text-sm text-yellow-600">OK Foods</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-4 text-center">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-700">{todaysStats.no}</div>
                  <div className="text-sm text-red-600">No Foods</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4 text-center">
                  <Heart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">{healthScore}%</div>
                  <div className="text-sm text-blue-600">Health Score</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Action Button */}
            <div className="text-center mb-8">
              <Button 
                onClick={() => navigate('/food-analysis')}
                className="bg-gradient-to-r from-ios-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Camera className="w-6 h-6 mr-2" />
                Analyze Food Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Food Logs */}
      <div className="container-padding mb-8">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border border-ios-separator shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-ios-blue" />
                Today's Food Log
                <Badge variant="secondary" className="ml-auto">
                  {todaysLogs.length} {todaysLogs.length === 1 ? 'item' : 'items'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysLogs.length > 0 ? (
                <div className="space-y-3">
                  {todaysLogs.slice(0, 5).map((log: FoodLog) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {log.verdict === 'YES' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {log.verdict === 'OK' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                        {log.verdict === 'NO' && <XCircle className="w-5 h-5 text-red-600" />}
                        <div>
                          <div className="font-medium text-gray-800">{log.foodName}</div>
                          <div className="text-sm text-gray-600">
                            {log.calories && `${log.calories} cal`}
                            {log.calories && log.protein && ' • '}
                            {log.protein && `${log.protein}g protein`}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={log.verdict === 'YES' ? 'default' : log.verdict === 'OK' ? 'secondary' : 'destructive'}
                        className="font-medium"
                      >
                        {log.verdict}
                      </Badge>
                    </div>
                  ))}
                  {todaysLogs.length > 5 && (
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/progress')}
                      className="w-full mt-4"
                    >
                      View All {todaysLogs.length} Items
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No food analyzed yet today</p>
                  <Button 
                    onClick={() => navigate('/food-analysis')}
                    className="bg-ios-blue hover:bg-blue-600 text-white"
                  >
                    Start Analyzing
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="container-padding mb-8">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border border-ios-separator shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-ios-blue" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Health Score</span>
                    <span className="text-sm font-bold text-gray-800">{healthScore}%</span>
                  </div>
                  <Progress value={healthScore} className="h-2 mb-4" />
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Weekly Rank</span>
                    <span className="text-sm font-bold text-gray-800">#{weeklyScore?.rank || '-'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Total Score</span>
                    <span className="text-sm font-bold text-gray-800">{weeklyScore?.score || 0} pts</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <Award className="w-16 h-16 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-4">Keep going! You're making great progress.</p>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/leaderboard')}
                    className="w-full"
                  >
                    View Leaderboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Features */}
      <div className="container-padding mb-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-ios-separator shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600 text-sm">Advanced AI analyzes your food with medical-grade accuracy and personalized recommendations.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-ios-separator shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Personalized Goals</h3>
                <p className="text-gray-600 text-sm">Set and track your health goals with customized nutrition plans tailored to your lifestyle.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-ios-separator shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Progress Tracking</h3>
                <p className="text-gray-600 text-sm">Monitor your nutrition journey with detailed analytics, trends, and achievement badges.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Subscription Tiers */}
      <div className="container-padding mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Plan</h2>
            <p className="text-gray-600">Unlock advanced features to supercharge your nutrition journey</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {subscriptionTiers.map((tier) => (
              <Card 
                key={tier.id} 
                className={`relative bg-white/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-200 ${
                  tier.popular ? 'border-blue-300 ring-2 ring-blue-200' : 'border-ios-separator'
                } ${(user as any)?.subscriptionTier === tier.id ? 'ring-2 ring-green-200 border-green-300' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${tier.color} text-white mb-4 mx-auto`}>
                    {tier.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">{tier.name}</CardTitle>
                  <div className="text-3xl font-bold text-gray-800">
                    ${tier.price}
                    {tier.price > 0 && <span className="text-base font-normal text-gray-600">/month</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{tier.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      (user as any)?.subscriptionTier === tier.id 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : tier.popular 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    } text-white`}
                    onClick={() => {
                      if ((user as any)?.subscriptionTier !== tier.id) {
                        navigate('/subscription');
                      }
                    }}
                    disabled={(user as any)?.subscriptionTier === tier.id}
                  >
                    {(user as any)?.subscriptionTier === tier.id ? 'Current Plan' : tier.price === 0 ? 'Get Started' : 'Upgrade Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}