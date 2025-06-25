import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, lazy, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import FoodAnalysis from "@/pages/food-analysis";
import Onboarding from "@/pages/onboarding";

// Lazy load heavy components
const Home = lazy(() => import("@/pages/home"));
const Profile = lazy(() => import("@/pages/profile"));
const Progress = lazy(() => import("@/pages/progress"));
const Leaderboard = lazy(() => import("@/pages/leaderboard"));
const Subscription = lazy(() => import("@/pages/subscription"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const HowToUse = lazy(() => import("@/pages/how-to-use"));
const About = lazy(() => import("@/pages/about"));
const Investor = lazy(() => import("@/pages/investor"));
const Disclaimer = lazy(() => import("@/pages/disclaimer"));
const AdminEmailPreferences = lazy(() => import("@/pages/admin-email-preferences"));
const Unsubscribe = lazy(() => import("@/pages/unsubscribe"));
const RefundPolicy = lazy(() => import("@/pages/refund-policy"));

import Navigation from "@/components/navigation";
import TopHeader from "@/components/top-header";
import { ErrorBoundary } from "@/components/error-boundary";
import { TranslationProvider, TranslationWidget } from "@/components/translation-widget";
import GDPRBannerWrapper from "@/components/gdpr-banner-wrapper";

// Loading component for lazy routes
const LazyPageLoader = () => (
  <div className="min-h-screen bg-ios-bg flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location] = useLocation();
  // GDPR banner completely disabled until blank page issue resolved



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
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
      {/* GDPR banner disabled - causes infinite auth loop */}

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
