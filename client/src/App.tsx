import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import Profile from "@/pages/profile";
import FoodAnalysis from "@/pages/food-analysis";
import Progress from "@/pages/progress";
import Leaderboard from "@/pages/leaderboard";
import Subscription from "@/pages/subscription";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import HowToUse from "@/pages/how-to-use";

import About from "@/pages/about";
import Investor from "@/pages/investor";
import Disclaimer from "@/pages/disclaimer";
import AdminEmailPreferences from "@/pages/admin-email-preferences";
import Unsubscribe from "@/pages/unsubscribe";
import RefundPolicy from "@/pages/refund-policy";
import Navigation from "@/components/navigation";
import TopHeader from "@/components/top-header";

import { ErrorBoundary } from "@/components/error-boundary";
import { TranslationProvider, TranslationWidget } from "@/components/translation-widget";
import GDPRConsentBanner from "@/components/gdpr-consent-banner";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location] = useLocation();
  const [showGdprBanner, setShowGdprBanner] = useState(false);
  const queryClient = useQueryClient();

  // Check if GDPR banner should be shown - TEMPORARILY DISABLED
  useEffect(() => {
    // GDPR banner temporarily disabled
    setShowGdprBanner(false);
    // if (isAuthenticated && user && !(user as any).hasSeenGdprBanner && !(user as any).onboardingCompleted) {
    //   setShowGdprBanner(true);
    // }
  }, [isAuthenticated, user]);

  const handleGdprComplete = () => {
    setShowGdprBanner(false);
    // Refresh user data to get updated GDPR status
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-ios-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ios-bg">
      {isAuthenticated && user && (user as any).onboardingCompleted && <TopHeader />}
      
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/terms" component={Terms} />
            <Route path="/how-to-use" component={HowToUse} />
            <Route path="/about" component={About} />
            <Route path="/investor" component={Investor} />
            <Route path="/disclaimer" component={Disclaimer} />
            <Route path="/unsubscribe" component={Unsubscribe} />
            <Route path="/refund-policy" component={RefundPolicy} />
            <Route path="/admin/email-preferences" component={AdminEmailPreferences} />
          </>
        ) : user && (user as any).onboardingCompleted ? (
          <>
            <Route path="/" component={FoodAnalysis} />
            <Route path="/home" component={Home} />
            <Route path="/food-analysis" component={FoodAnalysis} />
            <Route path="/progress" component={Progress} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/profile" component={Profile} />
            <Route path="/subscription" component={Subscription} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/terms" component={Terms} />
            <Route path="/refund-policy" component={RefundPolicy} />
            <Route path="/how-to-use" component={HowToUse} />
            <Route path="/about" component={About} />
            <Route path="/investor" component={Investor} />
            <Route path="/disclaimer" component={Disclaimer} />
            <Route path="/unsubscribe" component={Unsubscribe} />
            <Route path="/admin/email-preferences" component={AdminEmailPreferences} />
          </>
        ) : (
          <Route path="*" component={Onboarding} />
        )}
        <Route component={NotFound} />
      </Switch>
      
      {isAuthenticated && user && (user as any).onboardingCompleted && <Navigation />}
      {/* GDPR Banner temporarily disabled */}
      {/* {showGdprBanner && <GDPRConsentBanner onComplete={handleGdprComplete} />} */}

    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TranslationProvider>
          <TooltipProvider>
            <Router />
            <TranslationWidget />
            <Toaster />
          </TooltipProvider>
        </TranslationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
