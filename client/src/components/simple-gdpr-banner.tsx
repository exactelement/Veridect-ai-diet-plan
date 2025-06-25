import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SimpleGDPRBannerProps {
  onComplete: () => void;
}

export default function SimpleGDPRBanner({ onComplete }: SimpleGDPRBannerProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: true,
    aiImprovement: true,
    nutritionEmails: true,
  });

  const saveConsent = async (consentData: any) => {
    try {
      setIsSubmitting(true);
      
      // Map GDPR banner preferences to unified format
      const gdprData = {
        essential: consentData.essential,
        analytics: consentData.analytics,
        marketing: consentData.marketing,
        aiImprovement: consentData.aiImprovement,
        nutritionEmails: consentData.nutritionEmails,
        // Map to profile page field names for consistency
        nutritionInsightsEmails: consentData.nutritionEmails,
        improveAIRecommendations: consentData.aiImprovement,
        anonymousUsageAnalytics: consentData.analytics,
        timestamp: new Date().toISOString(),
        version: "1.0"
      };

      await apiRequest("POST", "/api/user/gdpr-consent", { 
        consent: gdprData,
        hasSeenGdprBanner: true
      });
      
      toast({
        title: "Privacy preferences saved",
        description: "Your privacy choices have been recorded.",
      });
      onComplete();
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      aiImprovement: true,
      nutritionEmails: true,
    });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <Card className="w-full max-w-md bg-white shadow-xl mb-20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Privacy Preferences</h3>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            We value your privacy. Please choose your preferences for data usage.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Essential cookies</span>
              <Switch checked={true} disabled />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Analytics & performance</span>
              <Switch 
                checked={preferences.analytics}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, analytics: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">AI improvement</span>
              <Switch 
                checked={preferences.aiImprovement}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, aiImprovement: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Nutrition emails</span>
              <Switch 
                checked={preferences.nutritionEmails}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, nutritionEmails: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Marketing communications</span>
              <Switch 
                checked={preferences.marketing}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketing: checked }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSavePreferences}
              disabled={isSubmitting}
              variant="outline"
              className="flex-1"
            >
              Save Preferences
            </Button>
            <Button 
              onClick={handleAcceptAll}
              disabled={isSubmitting}
              className="flex-1"
            >
              Accept All
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-3 text-center">
            Contact <a href="mailto:info@veridect.com" className="text-blue-600">info@veridect.com</a> for questions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}