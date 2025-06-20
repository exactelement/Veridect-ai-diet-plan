import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X, Shield, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GDPRInitialBannerProps {
  onDismiss: () => void;
}

export default function GDPRInitialBanner({ onDismiss }: GDPRInitialBannerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [preferences, setPreferences] = useState({
    improveAIRecommendations: true,
    nutritionInsightsEmails: true,
    anonymousUsageAnalytics: true,
  });

  const updateConsentMutation = useMutation({
    mutationFn: async (consentData: any) => {
      await apiRequest("POST", "/api/user/gdpr-consent", {
        gdprConsent: {
          ...consentData,
          timestamp: new Date().toISOString(),
          version: "1.0",
        },
        gdprBannerShown: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onDismiss();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAcceptAll = () => {
    const allConsent = {
      improveAIRecommendations: true,
      nutritionInsightsEmails: true,
      anonymousUsageAnalytics: true,
    };
    updateConsentMutation.mutate(allConsent);
  };

  const handleSavePreferences = () => {
    updateConsentMutation.mutate(preferences);
  };

  const handleDismiss = () => {
    // Mark banner as shown but with minimal consent
    updateConsentMutation.mutate({
      improveAIRecommendations: false,
      nutritionInsightsEmails: false,
      anonymousUsageAnalytics: false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl bg-white border-2 border-ios-blue shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-ios-blue/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-ios-blue" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ios-text">Privacy & Data Consent</h2>
                <p className="text-sm text-ios-secondary">First-time setup required</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-ios-secondary hover:text-ios-text"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>



          <div className="space-y-2 mb-3">
            <h3 className="font-semibold text-ios-text">Data Collection Preferences</h3>
            <p className="text-sm text-ios-secondary">
              Essential data is required for app functionality. Optional settings can be changed anytime in your profile.
            </p>

            <div className="space-y-1">
              <div className="flex items-center justify-between p-3 bg-ios-gray-50/50 rounded-lg border-2 border-ios-gray-200">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text/70">Essential App Data Collection</h4>
                  <p className="text-sm text-ios-secondary/70">
                    Food analysis, progress tracking, and authentication - required for app functionality
                  </p>
                </div>
                <Switch
                  checked={true}
                  disabled={true}
                  className="opacity-50"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-ios-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text">Improve AI Food Analysis</h4>
                  <p className="text-sm text-ios-secondary">
                    Help train our AI to give better "Yes/No/OK" verdicts by sharing anonymized food analysis results
                  </p>
                </div>
                <Switch
                  checked={preferences.improveAIRecommendations}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, improveAIRecommendations: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-ios-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text">Weekly Nutrition Insights</h4>
                  <p className="text-sm text-ios-secondary">
                    Receive personalized emails with your progress summary, streak tips, and healthy food suggestions
                  </p>
                </div>
                <Switch
                  checked={preferences.nutritionInsightsEmails}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, nutritionInsightsEmails: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-ios-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text">Anonymous Usage Analytics</h4>
                  <p className="text-sm text-ios-secondary">
                    Share how you use the app (button clicks, feature usage) to help us improve the experience
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

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAcceptAll}
              className="flex-1 bg-ios-blue hover:bg-ios-blue/90 text-white"
              disabled={updateConsentMutation.isPending}
            >
              {updateConsentMutation.isPending ? "Saving..." : "Accept All"}
            </Button>
            <Button
              onClick={handleSavePreferences}
              variant="outline"
              className="flex-1"
              disabled={updateConsentMutation.isPending}
            >
              Save My Preferences
            </Button>
          </div>

          <p className="text-xs text-ios-secondary mt-4 text-center">
            You can update these preferences anytime in your profile settings. 
            View our full <span className="text-ios-blue cursor-pointer hover:underline">Privacy Policy</span> for details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}