import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Type, Star, Trophy, Target, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";

export default function HowToUse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              How to Use Veridect
            </h1>
            <Link href="/login">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How to Use Veridect
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get the most out of your AI-powered nutrition companion. Learn how to analyze food, earn points, and achieve your health goals.
            </p>
          </div>

          {/* Getting Started */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="w-6 h-6 text-green-600" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">1. Complete Your Profile</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Set up your health goals, dietary preferences, and allergies in your profile. This helps our AI provide personalized nutrition advice.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">2. Choose Your Plan</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Start with our Free plan (5 analyses/day) or upgrade to Pro (€1/month) for unlimited analyses and advanced features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Analyze Food */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Camera className="w-6 h-6 text-blue-600" />
                Analyzing Your Food
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Camera */}
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Take a Photo</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Use your camera to capture food. Ensure good lighting and show the complete meal for best results.
                  </p>
                </div>

                {/* Upload */}
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Upload Image</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Upload photos from your gallery. Perfect for sharing meals or analyzing photos you took earlier.
                  </p>
                </div>

                {/* Text */}
                <div className="text-center">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Type className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Describe Food</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Simply type what you're eating. Great for quick checks or when photos aren't convenient.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Pro Tip</h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  For the most accurate analysis, ensure good lighting and capture your complete meal. Our AI considers your personal health goals and dietary preferences when providing verdicts.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Understanding Verdicts */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Star className="w-6 h-6 text-yellow-600" />
                Understanding Your Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 mb-3 text-lg px-4 py-2">
                    YES
                  </Badge>
                  <h3 className="font-semibold text-lg mb-2">Great Choice!</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    This food aligns perfectly with your health goals. Keep up the excellent work!
                  </p>
                  <p className="text-green-600 font-medium text-sm mt-2">+10 Points</p>
                </div>

                <div className="text-center">
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 mb-3 text-lg px-4 py-2">
                    OK
                  </Badge>
                  <h3 className="font-semibold text-lg mb-2">Moderate Choice</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Not bad, but there might be healthier alternatives. Consider our suggestions!
                  </p>
                  <p className="text-yellow-600 font-medium text-sm mt-2">+5 Points</p>
                </div>

                <div className="text-center">
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 mb-3 text-lg px-4 py-2">
                    NO
                  </Badge>
                  <h3 className="font-semibold text-lg mb-2">Consider Alternatives</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    This might not align with your goals. Check our suggestions for better options.
                  </p>
                  <p className="text-red-600 font-medium text-sm mt-2">+2 Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Food Logging */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Food Logging & Points</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Log Your Meals</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    After analysis, click "Yum" to log the food to your daily diary. This tracks your nutrition and earns points for your progress.
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Build your daily food history</li>
                    <li>• Track calories and nutrition</li>
                    <li>• Monitor your progress over time</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Earn Points & Badges</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Every logged food earns points. Complete challenges and streaks for bonus rewards!
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• 3 YES streak: +50 bonus points</li>
                    <li>• 5 analyses in a day: +25 bonus points</li>
                    <li>• 5 YES foods today: +100 bonus points</li>
                    <li>• Health milestones: up to +1000 points</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pro Features */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="w-6 h-6 text-yellow-600" />
                Pro Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Unlimited Access</h3>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                    <li>• Unlimited daily food analyses</li>
                    <li>• Detailed nutritional breakdowns</li>
                    <li>• Advanced AI personalization</li>
                    <li>• Food alternatives and suggestions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Community & Progress</h3>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                    <li>• Weekly leaderboard competition</li>
                    <li>• Advanced progress tracking</li>
                    <li>• Challenge participation</li>
                    <li>• Achievement badges</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Special Launch Offer</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Upgrade to Pro for just €1/month (normally €10/month) during our promotional launch period. All the features you need to achieve your health goals.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tips for Success */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Tips for Success</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Photography Tips</h3>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                    <li>• Use good lighting (natural light works best)</li>
                    <li>• Capture the complete meal, not just parts</li>
                    <li>• Keep the camera steady and focused</li>
                    <li>• Include drinks and sides in your photo</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Maximizing Results</h3>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                    <li>• Keep your profile updated with current goals</li>
                    <li>• Log foods consistently for better tracking</li>
                    <li>• Participate in weekly challenges</li>
                    <li>• Review your progress regularly</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
              <CardContent className="py-8">
                <h2 className="text-2xl font-bold mb-4">Ready to Start Your Health Journey?</h2>
                <p className="text-lg mb-6 text-green-50">
                  Join thousands of users already improving their nutrition with Veridect's AI-powered guidance.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-green-100">
                    Navigate to the Analyze tab to begin analyzing your first meal
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}