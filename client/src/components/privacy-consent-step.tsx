import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PrivacyConsentStepProps {
  onComplete: (preferences: any) => void;
  isSubmitting: boolean;
}

export default function PrivacyConsentStep({ onComplete, isSubmitting }: PrivacyConsentStepProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  // Consent preferences
  const [preferences, setPreferences] = useState({
    essential: true, // Always true and disabled
    analytics: false,
    marketing: false,
    personalization: false,
  });

  const handleConsentSubmission = async (consentType: 'all' | 'essential' | 'custom') => {
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

      console.log("Privacy consent selected:", finalPreferences);

      // Pass preferences to parent component
      onComplete(finalPreferences);
      
    } catch (error) {
      console.error("Error handling privacy consent:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-xl border-2 border-gray-200">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-ios-blue" />
          <CardTitle className="text-2xl font-bold text-gray-900">Privacy & Data Preferences</CardTitle>
        </div>
        <p className="text-gray-600">Your privacy matters to us. Choose how we use your data.</p>
      </CardHeader>

      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  );
}