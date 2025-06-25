import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Shield, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GDPRBanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consents, setConsents] = useState({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    research: false,
  });

  useEffect(() => {
    // Only show banner for authenticated users who haven't seen it before
    // Also ensure they've completed onboarding to avoid conflicts
    if (user && !user.hasSeenPrivacyBanner && user.onboardingCompleted) {
      setIsVisible(true);
    }
  }, [user]);

  const handleAcceptAll = () => {
    setConsents({
      essential: true,
      analytics: true,
      marketing: true,
      research: true,
    });
    savePrefencesAndDismiss();
  };

  const handleAcceptSelected = () => {
    savePrefencesAndDismiss();
  };

  const handleDeclineOptional = () => {
    setConsents({
      essential: true,
      analytics: false,
      marketing: false,
      research: false,
    });
    savePrefencesAndDismiss();
  };

  const savePrefencesAndDismiss = async () => {
    try {
      // Save GDPR consent to server and mark banner as seen
      await apiRequest("PATCH", "/api/auth/gdpr-consent", {
        gdprConsent: consents,
        hasSeenPrivacyBanner: true
      });

      // Save preferences to localStorage as backup
      localStorage.setItem('gdpr-consents', JSON.stringify(consents));
      
      // Animate out
      const banner = document.getElementById('gdpr-banner');
      if (banner) {
        banner.classList.add('animate-slide-down');
        setTimeout(() => setIsVisible(false), 300);
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error saving privacy preferences:', error);
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
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up"
      style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Card className="max-w-6xl mx-auto bg-white/95 backdrop-blur-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-ios-blue flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Your Privacy Matters</h3>
                <p className="text-sm text-ios-secondary">
                  We use cookies and similar technologies to enhance your experience and improve our services.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!showDetails ? (
            <div className="space-y-4">
              <p className="text-sm text-ios-text">
                We respect your privacy and are committed to protecting your personal data. 
                You can choose which types of cookies and data processing you're comfortable with.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAcceptAll}
                  className="bg-ios-blue text-white hover:bg-ios-blue/90"
                >
                  Accept All
                </Button>
                <Button
                  onClick={handleDeclineOptional}
                  variant="outline"
                  className="border-ios-blue text-ios-blue hover:bg-ios-blue/5"
                >
                  Essential Only
                </Button>
                <Button
                  onClick={() => setShowDetails(true)}
                  variant="ghost"
                  className="text-ios-secondary hover:text-ios-text"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Customize Settings
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Essential Cookies</h4>
                    <p className="text-sm text-ios-secondary">
                      Required for basic site functionality, security, and user authentication. These cannot be disabled.
                    </p>
                  </div>
                  <Checkbox checked={true} disabled className="mt-1" />
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Analytics & Performance</h4>
                    <p className="text-sm text-ios-secondary">
                      Help us understand how you use the app to improve performance and user experience.
                    </p>
                  </div>
                  <Checkbox
                    checked={consents.analytics}
                    onCheckedChange={(checked) => 
                      setConsents(prev => ({ ...prev, analytics: checked as boolean }))
                    }
                    className="mt-1"
                  />
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Marketing & Communications</h4>
                    <p className="text-sm text-ios-secondary">
                      Personalized content, recommendations, and communication about new features.
                    </p>
                  </div>
                  <Checkbox
                    checked={consents.marketing}
                    onCheckedChange={(checked) => 
                      setConsents(prev => ({ ...prev, marketing: checked as boolean }))
                    }
                    className="mt-1"
                  />
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Research & Development</h4>
                    <p className="text-sm text-ios-secondary">
                      Anonymous data to improve our AI and contribute to nutrition research (helps everyone!).
                    </p>
                  </div>
                  <Checkbox
                    checked={consents.research}
                    onCheckedChange={(checked) => 
                      setConsents(prev => ({ ...prev, research: checked as boolean }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t">
                <Button
                  onClick={handleAcceptSelected}
                  className="bg-ios-blue text-white hover:bg-ios-blue/90"
                >
                  Save Preferences
                </Button>
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="outline"
                >
                  Back
                </Button>
              </div>

              <p className="text-xs text-ios-secondary">
                You can change these preferences anytime in your account settings. 
                For more information, see our{" "}
                <a href="/privacy" className="text-ios-blue hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
