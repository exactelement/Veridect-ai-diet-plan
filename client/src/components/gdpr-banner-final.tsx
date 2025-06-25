import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function GDPRBannerFinal() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Consent preferences
  const [preferences, setPreferences] = useState({
    essential: true, // Always true and disabled
    analytics: false,
    marketing: false,
    personalization: false,
  });

  // Check if banner should be visible
  useEffect(() => {
    console.log("GDPR Banner Check:", {
      authLoading,
      hasUser: !!user,
      onboardingCompleted: user?.onboardingCompleted,
      hasSeenBanner: user?.hasSeenPrivacyBanner,
      localStorage: localStorage.getItem('gdpr-banner-shown')
    });

    // Show banner if:
    // 1. User is authenticated and loaded
    // 2. Onboarding is completed
    // 3. User hasn't seen banner yet (database check)
    // 4. No localStorage flag set
    if (!authLoading && 
        user && 
        user.onboardingCompleted && 
        !user.hasSeenPrivacyBanner && 
        !localStorage.getItem('gdpr-banner-shown')) {
      
      console.log("GDPR Banner: SHOWING");
      setIsVisible(true);
    } else {
      console.log("GDPR Banner: HIDDEN");
      setIsVisible(false);
    }
  }, [authLoading, user]);

  const handleConsentSubmission = async (consentType: 'all' | 'essential' | 'custom') => {
    setIsSubmitting(true);
    
    try {
      let finalPreferences = { ...preferences };
      
      if (consentType === 'all') {
        finalPreferences = {
          essential: true,
          analytics: true,
          marketing: true,
          personalization: true,
        };
      } else if (consentType === 'essential') {
        finalPreferences = {
          essential: true,
          analytics: false,
          marketing: false,
          personalization: false,
        };
      }
      // For 'custom', use current preferences state

      console.log("Submitting GDPR consent:", finalPreferences);

      // Save to database
      await apiRequest("PUT", "/api/user/gdpr-consent", {
        gdprConsent: finalPreferences,
        hasSeenPrivacyBanner: true
      });

      // Set localStorage flag to prevent re-showing
      localStorage.setItem('gdpr-banner-shown', 'true');
      
      // Hide banner immediately
      setIsVisible(false);

      toast({
        title: "Privacy Preferences Saved",
        description: "Taking you to your personalized experience...",
      });

      // Handle redirects based on onboarding choice
      setTimeout(() => {
        const pendingProUpgrade = localStorage.getItem('pending-pro-upgrade');
        
        if (pendingProUpgrade === 'true') {
          // User chose "Upgrade to Pro" in onboarding step 4
          localStorage.removeItem('pending-pro-upgrade');
          localStorage.removeItem('pending-free-tier');
          console.log("Redirecting to subscription page");
          window.location.href = '/subscription';
        } else {
          // User chose "Free Plan" in onboarding step 4 OR any other case
          localStorage.removeItem('pending-free-tier');
          localStorage.removeItem('pending-pro-upgrade');
          console.log("Redirecting to food analysis");
          window.location.href = '/';
        }
      }, 1000);
      
    } catch (error) {
      console.error("Error saving GDPR consent:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl border-2 border-gray-200">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-ios-blue" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Privacy & Data Preferences</h2>
              <p className="text-gray-600">Your privacy matters to us. Choose how we use your data.</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Essential Data - Always Required */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="text-base font-semibold text-blue-800">Essential Data Collection</Label>
                    <p className="text-sm text-blue-700 mt-1">Required for core app functionality, user authentication, and food analysis features.</p>
                  </div>
                </div>
                <Switch 
                  checked={true} 
                  disabled={true}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
              <p className="text-xs text-blue-600 mt-2 ml-8">
                This includes your profile data, food analysis history, and account preferences necessary to provide our service.
              </p>
            </div>

            {/* Expandable Optional Preferences */}
            <div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-800">Optional Data Preferences</span>
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>

              {isExpanded && (
                <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Analytics & Performance</Label>
                      <p className="text-xs text-gray-600">Help us improve the app with usage analytics</p>
                    </div>
                    <Switch 
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, analytics: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Marketing Communications</Label>
                      <p className="text-xs text-gray-600">Receive updates about new features and tips</p>
                    </div>
                    <Switch 
                      checked={preferences.marketing}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketing: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Enhanced Personalization</Label>
                      <p className="text-xs text-gray-600">Personalized recommendations and content</p>
                    </div>
                    <Switch 
                      checked={preferences.personalization}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, personalization: checked }))}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => handleConsentSubmission('all')}
                disabled={isSubmitting}
                className="flex-1 bg-ios-blue hover:bg-blue-600"
              >
                {isSubmitting ? "Saving..." : "Accept All"}
              </Button>
              
              <Button
                onClick={() => handleConsentSubmission('essential')}
                disabled={isSubmitting}
                variant="outline"
                className="flex-1"
              >
                {isSubmitting ? "Saving..." : "Essential Only"}
              </Button>
              
              {isExpanded && (
                <Button
                  onClick={() => handleConsentSubmission('custom')}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1"
                >
                  {isSubmitting ? "Saving..." : "Save Custom"}
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center">
              You can change these preferences at any time in your account settings. 
              Essential data collection is required to use Veridect and cannot be disabled.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}