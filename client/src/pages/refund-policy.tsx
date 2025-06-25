import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Euro, Users, Clock } from "lucide-react";

export default function RefundPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-ios-bg p-4 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="text-ios-blue"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Main Policy Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-ios-text">Refund Policy</CardTitle>
            <p className="text-ios-secondary">
              Last updated: June 25, 2025
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Our Approach */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-ios-text flex items-center">
                <Euro className="w-5 h-5 mr-2 text-ios-blue" />
                Our Refund Approach
              </h2>
              <div className="bg-ios-blue/5 border border-ios-blue/20 rounded-lg p-4">
                <p className="text-ios-text">
                  Given our affordable <strong>€1/month Pro tier</strong> and comprehensive <strong>free tier</strong> 
                  with 5 daily analyses, refunds are typically not provided. Instead, we focus on:
                </p>
                <ul className="mt-3 space-y-2 text-ios-text">
                  <li className="flex items-start">
                    <span className="text-ios-blue mr-2">•</span>
                    Easy cancellation anytime with no commitments
                  </li>
                  <li className="flex items-start">
                    <span className="text-ios-blue mr-2">•</span>
                    Full access until the end of your current billing period
                  </li>
                  <li className="flex items-start">
                    <span className="text-ios-blue mr-2">•</span>
                    Generous free tier to try our features before upgrading
                  </li>
                </ul>
              </div>
            </div>

            {/* Free Tier Alternative */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-ios-text flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Try Before You Subscribe
              </h2>
              <p className="text-ios-text">
                Our <strong>free tier</strong> provides substantial functionality including:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">Free Tier Includes:</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 5 food analyses per day</li>
                    <li>• AI-powered nutrition guidance</li>
                    <li>• Basic gamification features</li>
                    <li>• Community leaderboard access</li>
                  </ul>
                </div>
                <div className="bg-ios-blue/5 border border-ios-blue/20 rounded-lg p-4">
                  <h3 className="font-medium text-ios-blue mb-2">Pro Tier Adds:</h3>
                  <ul className="text-sm text-ios-text space-y-1">
                    <li>• Unlimited daily analyses</li>
                    <li>• Detailed nutritional breakdowns</li>
                    <li>• Advanced AI personalization</li>
                    <li>• Food logging and history</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-ios-text flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-500" />
                Cancellation Policy
              </h2>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 font-medium mb-2">Easy Cancellation Process:</p>
                <ul className="text-orange-700 space-y-2">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">1.</span>
                    Cancel anytime from your account settings
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">2.</span>
                    No questions asked, no fees or penalties
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">3.</span>
                    Keep full Pro access until your billing period ends
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">4.</span>
                    Automatically downgrade to free tier afterward
                  </li>
                </ul>
              </div>
            </div>

            {/* Exceptional Circumstances */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-ios-text">Exceptional Circumstances</h2>
              <p className="text-ios-text">
                In rare cases involving technical issues or billing errors, we may consider refunds on a case-by-case basis. 
                For such situations:
              </p>
              <div className="bg-ios-gray-50 border rounded-lg p-4">
                <p className="text-ios-text mb-2">
                  <strong>Contact us:</strong> <span className="text-ios-blue">info@veridect.com</span>
                </p>
                <p className="text-sm text-ios-secondary">
                  Please include your account email, subscription details, and a description of the issue. 
                  We typically respond within 24-48 hours.
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="border-t pt-4">
              <p className="text-sm text-ios-secondary">
                This policy applies to all Veridect Pro subscriptions. By subscribing, you acknowledge 
                and agree to these terms. We reserve the right to update this policy with notice to users.
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}