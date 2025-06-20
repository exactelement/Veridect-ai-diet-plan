import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
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
import Navigation from "@/components/navigation";
import TopHeader from "@/components/top-header";
import GDPRBanner from "@/components/gdpr-banner";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ios-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ios-bg">
      {isAuthenticated && <Navigation />}
      
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/terms" component={Terms} />
            <Route path="/how-to-use" component={HowToUse} />
            <Route path="/about" component={About} />
          </>
        ) : user && (user as any).onboardingCompleted ? (
          <>
            <TopHeader />
            <Route path="/" component={Home} />
            <Route path="/food-analysis" component={FoodAnalysis} />
            <Route path="/progress" component={Progress} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/profile" component={Profile} />
            <Route path="/subscription" component={Subscription} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/terms" component={Terms} />
            <Route path="/how-to-use" component={HowToUse} />
            <Route path="/about" component={About} />
            <Route path="/investor" component={Investor} />
            <Route path="/disclaimer" component={Disclaimer} />
            <Navigation />
          </>
        ) : (
          <Route path="*" component={Onboarding} />
        )}
        <Route component={NotFound} />
      </Switch>

      {isAuthenticated && <GDPRBanner />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
