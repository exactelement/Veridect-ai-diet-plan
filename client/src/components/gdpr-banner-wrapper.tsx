import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import GDPRConsentBanner from "./gdpr-consent-banner";

export default function GDPRBannerWrapper() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [location] = useLocation();
  const [showGdprBanner, setShowGdprBanner] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only run once when conditions are right and haven't checked yet
    if (isLoading || hasChecked) return;
    
    try {
      // Early returns to prevent errors
      if (!isAuthenticated || !user) {
        return;
      }

      // Mark as checked to prevent re-runs
      setHasChecked(true);

      // Safe property access with defaults
      const hasSeenBanner = Boolean((user as any)?.hasSeenGdprBanner);
      const onboardingComplete = Boolean((user as any)?.onboardingCompleted);
      
      // Check if we're on the main route (including query params)
      const isMainRoute = location === '/' || (location && location.startsWith('/?'));
      
      // Show banner only when all conditions are met
      if (!hasSeenBanner && onboardingComplete && isMainRoute) {
        // Small delay to ensure app is fully loaded
        setTimeout(() => setShowGdprBanner(true), 500);
      }
    } catch (error) {
      console.warn('GDPR banner check failed:', error);
      setShowGdprBanner(false);
    }
  }, [isAuthenticated, user, location, isLoading, hasChecked]);

  const handleGdprComplete = useCallback(() => {
    try {
      setShowGdprBanner(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error) {
      console.warn('GDPR completion failed:', error);
      setShowGdprBanner(false);
    }
  }, [queryClient]);

  // Don't render anything if conditions aren't met or still loading
  if (!showGdprBanner || isLoading) {
    return null;
  }

  // Wrap in error boundary equivalent
  try {
    return <GDPRConsentBanner onComplete={handleGdprComplete} />;
  } catch (error) {
    console.warn('GDPR banner render failed:', error);
    return null;
  }
}