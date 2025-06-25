import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Mail, Settings, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Unsubscribe() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [preferences, setPreferences] = useState({
    nutritionInsightsEmails: false,
    improveAIRecommendations: true,
    anonymousUsageAnalytics: true,
  });

  // Extract email from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const token = params.get('token');
    
    if (email) {
      setUserEmail(decodeURIComponent(email));
    }
    
    // If there's a token, automatically unsubscribe
    if (token && email) {
      handleQuickUnsubscribe(email, token);
    }
  }, []);

  const handleQuickUnsubscribe = async (email: string, token: string) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/unsubscribe", {
        email,
        token,
        unsubscribeAll: true
      });
      
      setIsUnsubscribed(true);
      setPreferences({
        nutritionInsightsEmails: false,
        improveAIRecommendations: false,
        anonymousUsageAnalytics: false,
      });
      
      toast({
        title: "Successfully Unsubscribed",
        description: "You have been unsubscribed from all emails.",
      });
    } catch (error: any) {
      toast({
        title: "Unsubscribe Failed", 
        description: error.message || "Failed to unsubscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      await apiRequest("POST", "/api/unsubscribe", {
        email: userEmail,
        token,
        preferences
      });
      
      setIsUnsubscribed(true);
      toast({
        title: "Preferences Updated",
        description: "Your email preferences have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ios-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-ios-secondary">Processing your request...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isUnsubscribed) {
    return (
      <div className="min-h-screen bg-ios-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-ios-text">Successfully Updated</h1>
            <p className="text-ios-secondary">
              Your email preferences have been updated. You can always change these settings by logging into your account.
            </p>
            <div className="space-y-2 pt-4">
              <Button 
                onClick={() => setLocation("/")}
                className="w-full bg-ios-blue text-white"
              >
                Return to Veridect
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/login")}
                className="w-full"
              >
                Sign In to Your Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ios-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-6 h-6 text-ios-blue" />
            <span>Email Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {userEmail && (
            <div className="bg-ios-gray-50 p-4 rounded-lg">
              <p className="text-sm text-ios-secondary">
                Managing email preferences for: <span className="font-medium text-ios-text">{userEmail}</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-medium text-ios-text">Choose what you'd like to receive:</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text">Weekly Nutrition Insights</h4>
                  <p className="text-sm text-ios-secondary">
                    Weekly progress and nutrition tips
                  </p>
                </div>
                <Switch
                  checked={preferences.nutritionInsightsEmails}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, nutritionInsightsEmails: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text">AI Improvement Program</h4>
                  <p className="text-sm text-ios-secondary">
                    Help improve AI accuracy (anonymous data only)
                  </p>
                </div>
                <Switch
                  checked={preferences.improveAIRecommendations}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, improveAIRecommendations: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text">Usage Analytics</h4>
                  <p className="text-sm text-ios-secondary">
                    Anonymous usage data to improve app experience
                  </p>
                </div>
                <Switch
                  checked={preferences.anonymousUsageAnalytics}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, anonymousUsageAnalytics: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleCustomUnsubscribe}
              className="w-full bg-ios-blue text-white"
              disabled={isLoading}
            >
              <Settings className="w-4 h-4 mr-2" />
              Update My Preferences
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setLocation("/")}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Veridect
            </Button>
          </div>

          <div className="text-xs text-ios-secondary text-center space-y-1">
            <p>Having trouble? Contact us at info@veridect.com</p>
            <p>This unsubscribe link is unique to your email address.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}