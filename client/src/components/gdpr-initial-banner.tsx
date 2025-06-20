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
    shareDataForResearch: false,
    allowMarketing: false,
    shareWithHealthProviders: false,
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
      shareDataForResearch: true,
      allowMarketing: true,
      shareWithHealthProviders: true,
    };
    updateConsentMutation.mutate(allConsent);
  };

  const handleSavePreferences = () => {
    updateConsentMutation.mutate(preferences);
  };

  const handleDismiss = () => {
    // Mark banner as shown but with minimal consent
    updateConsentMutation.mutate({
      shareDataForResearch: false,
      allowMarketing: false,
      shareWithHealthProviders: false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white border-2 border-ios-blue shadow-2xl">
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

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 mb-2">Essential Data Collection Notice</p>
                <p className="text-orange-700">
                  Continuing to use YesNoApp means agreeing to our Terms of Service, which include 
                  collecting essential data for app functionality (food analysis, progress tracking, 
                  user authentication). This data is required for the app to work properly.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-ios-text">Optional Data Sharing Preferences</h3>
            <p className="text-sm text-ios-secondary">
              These settings are optional and can be changed anytime in your profile privacy settings.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-ios-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text">Research Data Sharing</h4>
                  <p className="text-sm text-ios-secondary">
                    Share anonymized nutrition data to help improve food recommendations
                  </p>
                </div>
                <Switch
                  checked={preferences.shareDataForResearch}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, shareDataForResearch: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-ios-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text">Marketing Communications</h4>
                  <p className="text-sm text-ios-secondary">
                    Receive emails about new features, tips, and health insights
                  </p>
                </div>
                <Switch
                  checked={preferences.allowMarketing}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, allowMarketing: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-ios-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-ios-text">Health Provider Integration</h4>
                  <p className="text-sm text-ios-secondary">
                    Allow sharing nutrition data with healthcare providers (future feature)
                  </p>
                </div>
                <Switch
                  checked={preferences.shareWithHealthProviders}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, shareWithHealthProviders: checked }))
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