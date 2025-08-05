import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Shield, ExternalLink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface GDPRBannerProps {
  onClose: () => void;
}

export default function GDPRBanner({ onClose }: GDPRBannerProps) {
  const [consent, setConsent] = useState({
    necessary: true, // Always true, cannot be unchecked
    analytics: false,
    marketing: false,
    aiImprovement: false
  });

  const consentMutation = useMutation({
    mutationFn: async (consentData: any) => {
      const response = await apiRequest("POST", "/api/user/gdpr-consent", {
        consent: consentData,
        hasSeenGdprBanner: true
      });
      return response.json();
    },
    onSuccess: () => {
      onClose();
    }
  });

  const handleAcceptAll = () => {
    const fullConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      aiImprovement: true
    };
    consentMutation.mutate(fullConsent);
  };

  const handleAcceptSelected = () => {
    consentMutation.mutate(consent);
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      aiImprovement: false
    };
    consentMutation.mutate(minimalConsent);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl animate-slide-up sm:animate-fade-in">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Privacy & Cookie Settings</h2>
                <p className="text-sm text-gray-600 mt-1">We value your privacy</p>
              </div>
            </div>
            <button
              onClick={handleRejectAll}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Content */}
          <div className="space-y-4 mb-6">
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar technologies to help personalize content, tailor and measure ads, 
              and provide a better experience. By clicking accept, you agree to this, as outlined in our{" "}
              <a href="/privacy" className="text-purple-600 hover:underline inline-flex items-center gap-1">
                Privacy Policy
                <ExternalLink className="w-3 h-3" />
              </a>.
            </p>

            {/* Cookie Categories */}
            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
              {/* Necessary Cookies - Always On */}
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={true} 
                  disabled 
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Necessary Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Essential for the website to function properly. These cannot be disabled.
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={consent.analytics}
                  onCheckedChange={(checked) => 
                    setConsent({ ...consent, analytics: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={consent.marketing}
                  onCheckedChange={(checked) => 
                    setConsent({ ...consent, marketing: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Used to deliver relevant advertisements and track campaign performance.
                  </p>
                </div>
              </div>

              {/* AI Improvement */}
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={consent.aiImprovement}
                  onCheckedChange={(checked) => 
                    setConsent({ ...consent, aiImprovement: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">AI Improvement</h4>
                  <p className="text-sm text-gray-600">
                    Allow us to use your data to improve our AI food analysis accuracy.
                  </p>
                </div>
              </div>
            </div>

            {/* GDPR Notice */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>Your Rights:</strong> Under GDPR, you have the right to access, rectify, 
                port and delete your personal data. You can manage these settings at any time in 
                your profile.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRejectAll}
              variant="outline"
              className="flex-1"
              disabled={consentMutation.isPending}
            >
              Reject All
            </Button>
            <Button
              onClick={handleAcceptSelected}
              variant="outline"
              className="flex-1 border-purple-600 text-purple-600 hover:bg-purple-50"
              disabled={consentMutation.isPending}
            >
              Accept Selected
            </Button>
            <Button
              onClick={handleAcceptAll}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={consentMutation.isPending}
            >
              Accept All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}