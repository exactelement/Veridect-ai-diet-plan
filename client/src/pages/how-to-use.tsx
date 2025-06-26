import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Type, Star, Trophy, Target, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function HowToUse() {
  // Scroll to top when navigating
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-ios-bg">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={scrollToTop}>
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/privacy" onClick={scrollToTop}>
                <Button variant="ghost">Privacy</Button>
              </Link>
              <Link href="/about" onClick={scrollToTop}>
                <Button variant="ghost">About</Button>
              </Link>
              <Link href="/login" onClick={scrollToTop}>
                <Button>Log In</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-ios-text mb-4">
              How to Use Veridect
            </h1>
            <p className="text-xl text-ios-secondary">
              Get the most out of your AI-powered nutrition companion
            </p>
          </div>

          {/* Pro Tip */}
          <Card className="mb-8 bg-gradient-to-r from-health-green/10 to-ios-blue/10 border-health-green/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="bg-health-green text-white p-2 rounded-full">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ios-text mb-2">Pro Tip for Best Results</h3>
                  <p className="text-ios-secondary">
                    Take photos in good lighting and capture the complete meal or food item for the most accurate AI analysis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Methods */}
          <div className="grid gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Camera className="w-6 h-6 text-ios-blue" />
                  <span>1. Capture with Camera</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ios-secondary mb-4">
                  Use your device's camera to take a photo of your food in real-time.
                </p>
                <ul className="space-y-2 text-sm text-ios-secondary">
                  <li>• Best for meals you're about to eat</li>
                  <li>• Instant analysis in seconds</li>
                  <li>• Works great in natural lighting</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Upload className="w-6 h-6 text-health-green" />
                  <span>2. Upload from Gallery</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ios-secondary mb-4">
                  Select an existing photo from your device's gallery.
                </p>
                <ul className="space-y-2 text-sm text-ios-secondary">
                  <li>• Perfect for analyzing past meals</li>
                  <li>• Works with screenshots from social media</li>
                  <li>• Great for meal planning</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Type className="w-6 h-6 text-warning-orange" />
                  <span>3. Describe with Text</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ios-secondary mb-4">
                  Simply type what you're eating or planning to eat.
                </p>
                <ul className="space-y-2 text-sm text-ios-secondary">
                  <li>• Quick when you can't take photos</li>
                  <li>• Great for recipes and meal ideas</li>
                  <li>• Works for any food description</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Understanding Results */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Understanding Your Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-health-green text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold">✓</span>
                  </div>
                  <h4 className="font-semibold text-health-green mb-2">YES</h4>
                  <p className="text-sm text-ios-secondary">Great choice! This food aligns well with healthy eating.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-warning-orange text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold">?</span>
                  </div>
                  <h4 className="font-semibold text-warning-orange mb-2">OK</h4>
                  <p className="text-sm text-ios-secondary">Moderate choice. Consider portion size and frequency.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-danger-red text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold">✗</span>
                  </div>
                  <h4 className="font-semibold text-danger-red mb-2">NO</h4>
                  <p className="text-sm text-ios-secondary">Consider healthier alternatives for better nutrition.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gamification Features */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-ios-blue" />
                <span>Track Your Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-health-green" />
                  <div>
                    <h4 className="font-semibold">Points & Levels</h4>
                    <p className="text-sm text-ios-secondary">Earn points for every food analysis and level up your nutrition journey.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-warning-orange" />
                  <div>
                    <h4 className="font-semibold">Daily Challenges</h4>
                    <p className="text-sm text-ios-secondary">Complete daily goals like analyzing 5 foods or maintaining healthy streaks.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-ios-blue" />
                  <div>
                    <h4 className="font-semibold">Weekly Leaderboard</h4>
                    <p className="text-sm text-ios-secondary">Compete with other users and see your weekly ranking.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Tiers */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Subscription Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Free Tier</h4>
                  <ul className="space-y-2 text-sm text-ios-secondary">
                    <li>• 5 analyses per day</li>
                    <li>• Basic nutritional info</li>
                    <li>• Simple yes/no verdicts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Pro Tier (€1/month)</h4>
                  <ul className="space-y-2 text-sm text-ios-secondary">
                    <li>• Unlimited analyses</li>
                    <li>• Detailed nutrition data</li>
                    <li>• Food logging & history</li>
                    <li>• Progress tracking</li>
                    <li>• Weekly challenges</li>
                    <li>• Community leaderboard</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home Button */}
          <div className="text-center">
            <Link href="/login" onClick={scrollToTop}>
              <Button className="bg-ios-blue text-white px-8 py-3">
                Start Analyzing Food
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}