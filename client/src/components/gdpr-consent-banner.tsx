import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, Info, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GDPRConsentBannerProps {
  onComplete: () => void;
}

export default function GDPRConsentBanner({ onComplete }: GDPRConsentBannerProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Required - cannot be disabled
    analytics: true,
    marketing: false,
    aiImprovement: true,
    nutritionEmails: true,
  });

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      aiImprovement: true,
      nutritionEmails: true,
    });
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences);
  };

  const handleRejectOptional = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      aiImprovement: false,
      nutritionEmails: false,
    });
  };

  const saveConsent = async (consentData: any) => {
    setIsSubmitting(true);
    try {
      const consentRecord = {
        ...consentData,
        timestamp: new Date().toISOString(),
        version: "1.0",
        userAgent: navigator.userAgent,
        ipAddress: "client-side", // Would be set server-side in production
      };

      await apiRequest("POST", "/api/user/gdpr-consent", {
        gdprConsent: consentRecord,
      });

      toast({
        title: "Privacy preferences saved",
        description: "You can update these anytime in your profile settings.",
      });

      onComplete();
    } catch (error) {
      console.error("Error saving GDPR consent:", error);
      toast({
        title: "Error",
        description: "Failed to save privacy preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-ios-blue/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-ios-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ios-text">Privacy & Data Consent</h2>
              <p className="text-sm text-ios-secondary">Required to use Veridect</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-ios-blue/5 border border-ios-blue/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-ios-blue mt-0.5" />
                <div>
                  <h3 className="font-semibold text-ios-text mb-2">Your Privacy Matters</h3>
                  <p className="text-sm text-ios-secondary">
                    We collect and process personal data to provide our nutrition analysis service. 
                    Essential data is required for app functionality, while optional data helps us improve your experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-ios-text">Data Processing Preferences</h3>
              
              {/* Essential Data - Always Required */}
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-700">Essential App Data</h4>
                    <p className="text-sm text-gray-500">
                      Account, authentication, and core app functionality
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={true} disabled={true} className="opacity-50" />
                    <span className="text-xs text-gray-500">Required</span>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-ios-text">Usage Analytics</h4>
                    <p className="text-sm text-ios-secondary">
                      Help us understand how you use the app to improve performance
                    </p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, analytics: checked }))
                    }
                  />
                </div>
              </div>

              {/* AI Improvement */}
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-ios-text">AI Model Improvement</h4>
                    <p className="text-sm text-ios-secondary">
                      Share anonymized food analysis data to improve AI accuracy
                    </p>
                  </div>
                  <Switch
                    checked={preferences.aiImprovement}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, aiImprovement: checked }))
                    }
                  />
                </div>
              </div>

              {/* Nutrition Emails */}
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-ios-text">Nutrition Insights Emails</h4>
                    <p className="text-sm text-ios-secondary">
                      Weekly progress reports and nutrition tips
                    </p>
                  </div>
                  <Switch
                    checked={preferences.nutritionEmails}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, nutritionEmails: checked }))
                    }
                  />
                </div>
              </div>

              {/* Marketing */}
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-ios-text">Marketing Communications</h4>
                    <p className="text-sm text-ios-secondary">
                      Product updates, new features, and promotional content
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAcceptAll}
                  disabled={isSubmitting}
                  className="flex-1 bg-ios-blue hover:bg-ios-blue/90 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept All
                </Button>
                <Button
                  onClick={handleAcceptSelected}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1"
                >
                  Save My Preferences
                </Button>
                <Button
                  onClick={handleRejectOptional}
                  disabled={isSubmitting}
                  variant="ghost"
                  className="flex-1"
                >
                  Essential Only
                </Button>
              </div>
              
              <p className="text-xs text-ios-secondary mt-4 text-center">
                You can change these preferences anytime in your profile settings. 
                Read our <a href="/privacy" className="text-ios-blue hover:underline">Privacy Policy</a> for full details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}