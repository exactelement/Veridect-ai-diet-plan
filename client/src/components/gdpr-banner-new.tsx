import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GDPRBannerNew() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    improveAIRecommendations: true,
    nutritionInsightsEmails: true,
    anonymousUsageAnalytics: true,
  });

  // Simple, direct banner display logic
  const shouldShow = !authLoading && 
                    user && 
                    user.onboardingCompleted && 
                    !user.hasSeenPrivacyBanner &&
                    !localStorage.getItem('gdpr-banner-completed');

  // Show banner immediately when conditions are met
  useEffect(() => {
    if (shouldShow) {
      setIsVisible(true);
      console.log('GDPR Banner: Showing for user', user?.id);
    } else {
      setIsVisible(false);
      console.log('GDPR Banner: Hidden', { 
        authLoading, 
        hasUser: !!user,
        onboardingCompleted: user?.onboardingCompleted,
        hasSeenBanner: user?.hasSeenPrivacyBanner,
        localStorage: localStorage.getItem('gdpr-banner-completed')
      });
    }
  }, [shouldShow, user?.id]);

  const handleSavePreferences = async (finalPreferences = preferences) => {
    try {
      console.log('GDPR: Saving preferences', finalPreferences);
      
      await apiRequest("POST", "/api/user/gdpr-consent", {
        gdprConsent: finalPreferences,
        hasSeenPrivacyBanner: true
      });

      // Mark completed permanently
      localStorage.setItem('gdpr-banner-completed', 'true');
      setIsVisible(false);
      
      toast({
        title: "Privacy Preferences Saved",
        description: "Taking you to your personalized experience...",
      });

      // Handle redirects based on onboarding choice
      setTimeout(() => {
        const pendingProUpgrade = localStorage.getItem('pending-pro-upgrade');
        const pendingFreeTier = localStorage.getItem('pending-free-tier');
        
        if (pendingProUpgrade === 'true') {
          localStorage.removeItem('pending-pro-upgrade');
          window.location.href = '/subscription';
        } else if (pendingFreeTier === 'true') {
          localStorage.removeItem('pending-free-tier');
          window.location.href = '/analyze';
        } else {
          window.location.href = '/analyze';
        }
      }, 1000);
      
    } catch (error) {
      console.error('GDPR consent error:', error);
      toast({
        title: "Error saving preferences",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptAll = () => {
    const allConsent = {
      improveAIRecommendations: true,
      nutritionInsightsEmails: true,
      anonymousUsageAnalytics: true,
    };
    setPreferences(allConsent);
    handleSavePreferences(allConsent);
  };

  const handleRejectAll = () => {
    const noConsent = {
      improveAIRecommendations: false,
      nutritionInsightsEmails: false,
      anonymousUsageAnalytics: false,
    };
    setPreferences(noConsent);
    handleSavePreferences(noConsent);
  };

  // Only render if should show and is visible
  if (!shouldShow || !isVisible) {
    return null;
  }

  return (
    <div
      id="gdpr-banner-new"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <Card style={{
        backgroundColor: 'white',
        maxWidth: '640px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Privacy & Cookie Settings
              </h2>
            </div>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">
            We value your privacy and want to be transparent about how we use your data to improve your Veridect experience. 
            Please review and customize your privacy preferences below.
          </p>

          {!showDetails ? (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button onClick={handleAcceptAll} className="flex-1">
                  Accept All
                </Button>
                <Button onClick={handleRejectAll} variant="outline" className="flex-1">
                  Reject All
                </Button>
              </div>
              <Button 
                onClick={() => setShowDetails(true)} 
                variant="ghost" 
                className="w-full"
              >
                Customize Preferences
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Improve AI Recommendations
                    </h3>
                    <p className="text-sm text-gray-600">
                      Help us personalize your food analysis and recommendations.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.improveAIRecommendations}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, improveAIRecommendations: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Nutrition Insights Emails
                    </h3>
                    <p className="text-sm text-gray-600">
                      Receive weekly nutrition insights and personalized recommendations.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.nutritionInsightsEmails}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, nutritionInsightsEmails: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Anonymous Usage Analytics
                    </h3>
                    <p className="text-sm text-gray-600">
                      Help us improve the app by sharing anonymous usage data.
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

              <div className="flex gap-3">
                <Button onClick={() => handleSavePreferences()} className="flex-1">
                  Save Preferences
                </Button>
                <Button onClick={() => setShowDetails(false)} variant="outline">
                  Back
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}