import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X, Shield, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GDPRBanner() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const mountedRef = useRef(true);
  const [preferences, setPreferences] = useState({
    improveAIRecommendations: true,
    nutritionInsightsEmails: true,
    anonymousUsageAnalytics: true,
  });

  // Determine if banner should show - LIFETIME ONCE ONLY
  const shouldShowBanner = useMemo(() => {
    if (authLoading || !user) {
      return false;
    }
    
    // CRITICAL: Banner shows only if user has NEVER seen it AND completed onboarding
    const hasSeenBanner = user.hasSeenPrivacyBanner;
    const onboardingDone = user.onboardingCompleted;
    
    // Check localStorage first to prevent flashing
    const localStorageCheck = localStorage.getItem('gdpr-banner-shown');
    if (localStorageCheck === 'true') {
      return false;
    }
    
    const shouldShow = !hasSeenBanner && onboardingDone;
    
    return shouldShow;
  }, [user?.hasSeenPrivacyBanner, user?.onboardingCompleted, authLoading]);

  // Handle banner visibility
  useEffect(() => {
    mountedRef.current = true;
    
    console.log('GDPR Effect:', { shouldShowBanner, authLoading, user: !!user });
    
    if (shouldShowBanner) {
      // Clear any localStorage blocking
      localStorage.removeItem('gdpr-banner-shown');
      console.log('Setting GDPR banner visible - clearing localStorage');
      setIsVisible(true);
    } else {
      console.log('Setting GDPR banner hidden');
      setIsVisible(false);
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [shouldShowBanner]);

  const handleAcceptAll = () => {
    const allConsent = {
      improveAIRecommendations: true,
      nutritionInsightsEmails: true,
      anonymousUsageAnalytics: true,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
    
    setPreferences(allConsent);
    handleSavePreferences(allConsent);
  };

  const handleRejectAll = () => {
    const noConsent = {
      improveAIRecommendations: false,
      nutritionInsightsEmails: false,
      anonymousUsageAnalytics: false,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
    
    setPreferences(noConsent);
    handleSavePreferences(noConsent);
  };

  const handleSavePreferences = async (finalPreferences = preferences) => {
    if (!mountedRef.current) return;
    
    try {
      console.log('Saving GDPR preferences:', finalPreferences);
      
      await apiRequest("POST", "/api/user/gdpr-consent", {
        gdprConsent: finalPreferences,
        hasSeenPrivacyBanner: true
      });

      // Mark permanently - banner will NEVER show again for this user
      localStorage.setItem('gdpr-banner-shown', 'true');
      
      toast({
        title: "Privacy Preferences Saved",
        description: "Taking you to your personalized experience...",
      });

      // Get redirect paths set during onboarding
      const pendingProUpgrade = localStorage.getItem('pending-pro-upgrade');
      const pendingFreeTier = localStorage.getItem('pending-free-tier');

      // Animate out
      const banner = document.getElementById('gdpr-banner');
      if (banner) {
        banner.classList.add('animate-slide-down');
        setTimeout(() => {
          if (!mountedRef.current) return;
          setIsVisible(false);
          // After GDPR completion, redirect based on user's choice
          if (pendingProUpgrade === 'true') {
            localStorage.removeItem('pending-pro-upgrade');
            window.location.href = '/subscription';
          } else if (pendingFreeTier === 'true') {
            localStorage.removeItem('pending-free-tier');
            window.location.href = '/analyze';
          } else {
            // Default redirect to analyze tab for completed onboarding users
            window.location.href = '/analyze';
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
          window.location.href = '/analyze';
        } else {
          // Default redirect to analyze tab for completed onboarding users
          window.location.href = '/analyze';
        }
      }
      
    } catch (error) {
      console.error('Error saving GDPR preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save privacy preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Simplified render logic - render when should show banner
  if (!shouldShowBanner || !isVisible) {
    return null;
  }

  return (
    <div
      id="gdpr-banner"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex !important',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        visibility: 'visible',
        opacity: 1
      }}
    >
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Privacy & Cookie Settings
              </h2>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            We value your privacy and want to be transparent about how we use your data to improve your Veridect experience. 
            Please review and customize your privacy preferences below.
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Improve AI Recommendations
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help us personalize your food analysis and recommendations by learning from your preferences.
                </p>
              </div>
              <Switch
                checked={preferences.improveAIRecommendations}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, improveAIRecommendations: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Nutrition Insights Emails
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive weekly nutrition insights, tips, and personalized recommendations via email.
                </p>
              </div>
              <Switch
                checked={preferences.nutritionInsightsEmails}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, nutritionInsightsEmails: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Anonymous Usage Analytics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help us improve Veridect by sharing anonymous usage patterns and app performance data.
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

          {showDetails && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How We Protect Your Data
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• All data is encrypted in transit and at rest</li>
                <li>• We never sell your personal information to third parties</li>
                <li>• You can update these preferences anytime in your account settings</li>
                <li>• Anonymous data is aggregated and cannot be traced back to individuals</li>
                <li>• We comply with GDPR, CCPA, and other privacy regulations</li>
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Info className="h-4 w-4 mr-2" />
              {showDetails ? 'Hide' : 'More'} Details
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRejectAll}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Reject All
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Accept All
              </Button>
              <Button
                onClick={() => handleSavePreferences()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}