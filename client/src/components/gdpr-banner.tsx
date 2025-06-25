import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X, Shield, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GDPRBanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    improveAIRecommendations: true,
    nutritionInsightsEmails: true,
    anonymousUsageAnalytics: true,
  });

  useEffect(() => {
    // Only show banner for authenticated users who haven't seen it before
    // Also ensure they've completed onboarding to avoid conflicts
    // Double-check localStorage to prevent multiple showings
    const hasSeenBefore = localStorage.getItem('gdpr-banner-shown');
    
    if (user && !user.hasSeenPrivacyBanner && user.onboardingCompleted && !hasSeenBefore) {
      setIsVisible(true);
    }
  }, [user]);

  const handleAcceptAll = () => {
    const allConsent = {
      improveAIRecommendations: true,
      nutritionInsightsEmails: true,
      anonymousUsageAnalytics: true,
    };
    savePrefencesAndDismiss(allConsent);
  };

  const handleSavePreferences = () => {
    savePrefencesAndDismiss(preferences);
  };

  const handleDeclineOptional = () => {
    const minimalConsent = {
      improveAIRecommendations: false,
      nutritionInsightsEmails: false,
      anonymousUsageAnalytics: false,
    };
    savePrefencesAndDismiss(minimalConsent);
  };

  const savePrefencesAndDismiss = async (consentData: any) => {
    try {
      // Mark as shown immediately to prevent multiple submissions
      localStorage.setItem('gdpr-banner-shown', 'true');
      
      // Save GDPR consent to server and mark banner as seen
      const response = await apiRequest("POST", "/api/user/gdpr-consent", {
        gdprConsent: {
          ...consentData,
          timestamp: new Date().toISOString(),
          version: "1.0",
        },
        hasSeenPrivacyBanner: true
      });

      // Save preferences to localStorage as backup
      localStorage.setItem('gdpr-consents', JSON.stringify(consentData));
      
      // Check what the user was planning to do after GDPR
      const pendingProUpgrade = localStorage.getItem('pending-pro-upgrade');
      const pendingFreeTier = localStorage.getItem('pending-free-tier');
      
      // Animate out
      const banner = document.getElementById('gdpr-banner');
      if (banner) {
        banner.classList.add('animate-slide-down');
        setTimeout(() => {
          setIsVisible(false);
          // After GDPR completion, redirect based on user's choice
          if (pendingProUpgrade === 'true') {
            localStorage.removeItem('pending-pro-upgrade');
            window.location.href = '/subscription';
          } else if (pendingFreeTier === 'true') {
            localStorage.removeItem('pending-free-tier');
            window.location.href = '/food-analysis';
          }
        }, 300);
      } else {
        setIsVisible(false);
        // After GDPR completion, redirect based on user's choice
        if (pendingProUpgrade === 'true') {
          localStorage.removeItem('pending-pro-upgrade');
          window.location.href = '/subscription';
        } else if (pendingFreeTier === 'true') {
          localStorage.removeItem('pending-free-tier');
          window.location.href = '/food-analysis';
        }
      }
    } catch (error) {
      console.error('Error saving privacy preferences:', error);
      
      // Remove localStorage marker if server save failed
      localStorage.removeItem('gdpr-banner-shown');
      
      toast({
        title: "Error",
        description: "Failed to save privacy preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div
      id="gdpr-banner"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <Card className="w-full max-w-2xl bg-white border-2 border-ios-blue shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-ios-blue/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-ios-blue" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ios-text">Privacy & Data Consent</h2>
                <p className="text-sm text-ios-secondary">Required for app usage</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeclineOptional}
              className="text-ios-secondary hover:text-ios-text"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-1 mb-6">
            <h3 className="font-semibold text-ios-text">Data Collection Preferences</h3>
            <p className="text-sm text-ios-secondary">
              Essential data is required for app functionality. Optional settings can be changed anytime in your profile.
            </p>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between p-2 bg-ios-gray-50/50 rounded-lg border-2 border-ios-gray-200">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text/70">Essential App Data Collection</h4>
                  <p className="text-sm text-ios-secondary/70">
                    Required for app functionality
                  </p>
                </div>
                <Switch
                  checked={true}
                  disabled={true}
                  className="opacity-50"
                />
              </div>
              
              <div className="flex items-center justify-between p-2 bg-ios-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text">Improve AI Food Analysis</h4>
                  <p className="text-sm text-ios-secondary">
                    Share anonymized data to improve AI verdicts
                  </p>
                </div>
                <Switch
                  checked={preferences.improveAIRecommendations}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, improveAIRecommendations: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-ios-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text">Weekly Nutrition Insights</h4>
                  <p className="text-sm text-ios-secondary">
                    Weekly progress emails and nutrition tips
                  </p>
                </div>
                <Switch
                  checked={preferences.nutritionInsightsEmails}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, nutritionInsightsEmails: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-ios-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text">Anonymous Usage Analytics</h4>
                  <p className="text-sm text-ios-secondary">
                    Help improve app experience with usage data
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
            >
              Accept All
            </Button>
            <Button
              onClick={handleSavePreferences}
              variant="outline"
              className="flex-1"
            >
              Save My Preferences
            </Button>
          </div>

          <p className="text-xs text-ios-secondary mt-4 text-center">
            You can update these preferences anytime in your profile settings. 
            View our full <a href="/privacy" className="text-ios-blue hover:underline">Privacy Policy</a> for details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
