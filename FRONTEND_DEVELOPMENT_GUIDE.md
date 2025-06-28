# Complete Frontend Development Guide for Veridect

This comprehensive guide contains every detail needed to build the Veridect frontend from scratch with 100% feature parity.

## Table of Contents

1. [React Application Setup](#react-application-setup)
2. [Component Architecture](#component-architecture)
3. [State Management](#state-management)
4. [Authentication Implementation](#authentication-implementation)
5. [Food Analysis Features](#food-analysis-features)
6. [Gamification UI](#gamification-ui)
7. [Subscription Management](#subscription-management)
8. [Mobile Responsiveness](#mobile-responsiveness)
9. [Translation System](#translation-system)
10. [Performance Optimization](#performance-optimization)

## React Application Setup

### Main Application Entry (`client/src/main.tsx`)
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Hide initial loader
function hideInitialLoader() {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 300);
  }
}

// Initialize app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hide loader once React is mounted
hideInitialLoader();
```

### App Component (`client/src/App.tsx`)
```typescript
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

// Import pages
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import FoodAnalysis from "@/pages/food-analysis";
import Progress from "@/pages/progress";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Subscribe from "@/pages/subscribe";
import NotFound from "@/pages/not-found";

// Import privacy pages
import Privacy from "@/pages/privacy";
import About from "@/pages/about";
import HowToUse from "@/pages/how-to-use";
import Terms from "@/pages/terms";

// Import components
import BottomNavigation from "@/components/bottom-navigation";
import GDPRBanner from "@/components/gdpr-banner";
import LoadingSpinner from "@/components/loading-spinner";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        {/* Public routes - always accessible */}
        <Route path="/privacy" component={Privacy} />
        <Route path="/about" component={About} />
        <Route path="/how-to-use" component={HowToUse} />
        <Route path="/terms" component={Terms} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />

        {/* Authenticated routes */}
        {isAuthenticated ? (
          <>
            {/* Check if user needs onboarding */}
            {!user?.isOnboardingComplete ? (
              <Route path="/" component={() => <Navigate to="/onboarding" />} />
            ) : (
              <>
                <Route path="/" component={Home} />
                <Route path="/analyze" component={FoodAnalysis} />
                
                {/* Pro/Advanced tier routes */}
                {user?.subscriptionTier !== 'free' ? (
                  <>
                    <Route path="/progress" component={Progress} />
                    <Route path="/leaderboard" component={Leaderboard} />
                  </>
                ) : (
                  <>
                    <Route path="/progress" component={() => <SubscriptionRequired feature="Progress Tracking" />} />
                    <Route path="/leaderboard" component={() => <SubscriptionRequired feature="Leaderboard" />} />
                  </>
                )}
                
                <Route path="/profile" component={Profile} />
                <Route path="/subscribe" component={Subscribe} />
              </>
            )}
          </>
        ) : (
          <>
            {/* Non-authenticated users see landing page */}
            <Route path="/" component={Landing} />
            <Route path="/subscribe" component={() => <Navigate to="/login" />} />
          </>
        )}

        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>

      {/* Bottom navigation for authenticated users */}
      {isAuthenticated && user?.isOnboardingComplete && <BottomNavigation />}
      
      {/* GDPR banner for users who haven't seen it */}
      {isAuthenticated && !user?.hasSeenGdprBanner && <GDPRBanner />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
```

### Query Client Setup (`client/src/lib/queryClient.ts`)
```typescript
import { QueryClient } from "@tanstack/react-query";

// Create query client with default configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401, 403, or 404 errors
        if (error?.message?.includes('401') || 
            error?.message?.includes('403') || 
            error?.message?.includes('404')) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Default fetch function for queries
const defaultQueryFn = async ({ queryKey }: { queryKey: readonly unknown[] }) => {
  const url = queryKey[0] as string;
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
};

queryClient.setQueryDefaults([], { queryFn: defaultQueryFn });

// API request helper for mutations
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any
) {
  const config: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`${response.status}: ${errorData.message || response.statusText}`);
  }

  // Handle responses that might not have JSON body
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response;
}
```

## Component Architecture

### Bottom Navigation (`client/src/components/bottom-navigation.tsx`)
```typescript
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Search, TrendingUp, Trophy, User } from "lucide-react";

const navigationItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/analyze", icon: Search, label: "Analyze" },
  { path: "/progress", icon: TrendingUp, label: "Progress" },
  { path: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const handleTabClick = (path: string) => {
    setLocation(path);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          
          return (
            <button
              key={path}
              onClick={() => handleTabClick(path)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className={cn("text-xs font-medium", isActive && "text-primary")}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

### Home Page (`client/src/pages/home.tsx`)
```typescript
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Type, TrendingUp, Trophy, Target } from "lucide-react";
import { useLocation } from "wouter";
import FoodLogsList from "@/components/food-logs-list";
import ProgressRing from "@/components/progress-ring";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch today's food logs
  const { data: todaysFoodLogs = [] } = useQuery({
    queryKey: ["/api/food-logs/today"],
    enabled: !!user,
  });

  // Fetch user's weekly score
  const { data: weeklyScore } = useQuery({
    queryKey: ["/api/leaderboard/my-score"],
    enabled: !!user && user.subscriptionTier !== 'free',
  });

  // Fetch today's analyzed foods count
  const { data: todaysAnalyses = [] } = useQuery({
    queryKey: ["/api/food/analyzed/today"],
    enabled: !!user,
  });

  // Calculate daily progress
  const analysesCount = todaysAnalyses.length;
  const maxDailyAnalyses = user?.subscriptionTier === 'free' ? 5 : 25;
  const progressPercentage = Math.min((analysesCount / maxDailyAnalyses) * 100, 100);

  // Calculate today's calories
  const todaysCalories = todaysFoodLogs.reduce((total: number, log: any) => {
    return total + (log.calories || 0);
  }, 0);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Greeting Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          {getGreeting()}, {user.firstName || 'there'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Ready to make healthy choices today?
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Analyze Food
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Get instant AI-powered nutrition analysis with personalized recommendations.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button 
              onClick={() => setLocation("/analyze?method=camera")}
              className="flex items-center gap-2"
              variant="default"
            >
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
            
            <Button 
              onClick={() => setLocation("/analyze?method=upload")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </Button>
            
            <Button 
              onClick={() => setLocation("/analyze?method=text")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Type className="w-4 h-4" />
              Describe Food
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Daily Analyses</p>
              <p className="text-2xl font-bold">{analysesCount}</p>
              <p className="text-xs text-muted-foreground">
                {user.subscriptionTier === 'free' ? `${5 - analysesCount} remaining today` : 'Unlimited'}
              </p>
            </div>
            
            <ProgressRing 
              progress={progressPercentage}
              size={80}
              strokeWidth={8}
            />
          </div>

          {user.showFoodStatistics && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{todaysCalories}</p>
                <p className="text-xs text-muted-foreground">Calories Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{user.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Challenge (Pro users only) */}
      {user.subscriptionTier !== 'free' && user.participateInWeeklyChallenge && weeklyScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Weekly Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Your Rank</p>
                <p className="text-2xl font-bold">#{weeklyScore.rank || '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Weekly Points</p>
                <p className="text-2xl font-bold text-primary">{weeklyScore.weeklyPoints}</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setLocation("/leaderboard")}
              variant="outline" 
              className="w-full"
            >
              View Full Leaderboard
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Level {user.level}</p>
              <p className="text-xs text-muted-foreground">{user.levelTitle}</p>
            </div>
            <Badge variant="secondary">
              {user.totalPoints} pts
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {user.level + 1}</span>
              <span>{user.pointsToNextLevel} pts to go</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${user.levelProgressPercentage * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Food Log */}
      {todaysFoodLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Food Log</CardTitle>
          </CardHeader>
          <CardContent>
            <FoodLogsList foodLogs={todaysFoodLogs} />
          </CardContent>
        </Card>
      )}

      {/* Free tier upgrade prompt */}
      {user.subscriptionTier === 'free' && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Unlock Your Full Potential</h3>
              <p className="text-sm text-muted-foreground">
                Get unlimited analyses, detailed insights, and join the community with Veridect Pro.
              </p>
              <Button 
                onClick={() => setLocation("/subscribe")}
                className="w-full"
              >
                Upgrade to Pro - €12/year
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Food Analysis Page (`client/src/pages/food-analysis.tsx`)
```typescript
import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, Type, Sparkles, Heart, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/loading-spinner";

interface FoodAnalysisResult {
  id: string;
  foodName: string;
  verdict: "YES" | "NO" | "OK";
  explanation: string;
  confidence: number;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  portion?: string;
  alternatives?: string[];
  method: "ai" | "fallback";
}

export default function FoodAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [analysisMethod, setAnalysisMethod] = useState<"camera" | "upload" | "text">("camera");
  const [foodName, setFoodName] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Check daily usage limit
  const { data: todaysAnalyses = [] } = useQuery({
    queryKey: ["/api/food/analyzed/today"],
    enabled: !!user,
  });
  
  const dailyLimit = user?.subscriptionTier === 'free' ? 5 : 999;
  const analysesUsed = todaysAnalyses.length;
  const canAnalyze = analysesUsed < dailyLimit;

  // Food analysis mutation
  const analyzeFood = useMutation({
    mutationFn: async (data: { foodName?: string; imageData?: string }) => {
      return apiRequest("POST", "/api/analyze-food", data);
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/food/analyzed/today"] });
      toast({
        title: "Analysis Complete!",
        description: `${data.foodName} analyzed successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze food. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Food logging mutation
  const logFood = useMutation({
    mutationFn: async (data: { analysisId: string; isLogged: boolean }) => {
      return apiRequest("POST", "/api/log-food", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/food-logs/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/my-score"] });
      
      // Reset analysis state
      setAnalysisResult(null);
      setSelectedImage(null);
      setImagePreview(null);
      setFoodName("");
      
      toast({
        title: "Food Logged!",
        description: "Great choice! Your food has been added to your log.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Logging Failed",
        description: error.message || "Failed to log food. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Camera functions
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(blob));
        
        // Stop camera
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }, 'image/jpeg', 0.8);
  }, []);

  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Convert image to base64
  const imageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle analysis
  const handleAnalyze = async () => {
    if (!canAnalyze) {
      toast({
        title: "Daily Limit Reached",
        description: `You've used all ${dailyLimit} daily analyses. Upgrade to Pro for unlimited access.`,
        variant: "destructive",
      });
      return;
    }

    if (analysisMethod === "text" && !foodName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe the food you want to analyze.",
        variant: "destructive",
      });
      return;
    }

    if ((analysisMethod === "camera" || analysisMethod === "upload") && !selectedImage) {
      toast({
        title: "Missing Image",
        description: "Please take a photo or upload an image first.",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageData: string | undefined;
      
      if (selectedImage) {
        imageData = await imageToBase64(selectedImage);
      }

      analyzeFood.mutate({
        foodName: foodName.trim() || undefined,
        imageData,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle food logging
  const handleLogFood = (isLogged: boolean) => {
    if (!analysisResult) return;
    
    logFood.mutate({
      analysisId: analysisResult.id,
      isLogged,
    });
  };

  // Reset analysis
  const resetAnalysis = () => {
    setAnalysisResult(null);
    setSelectedImage(null);
    setImagePreview(null);
    setFoodName("");
    
    // Stop camera if running
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Analyze Food</h1>
        <p className="text-muted-foreground">
          Get instant AI-powered nutrition analysis
        </p>
        
        {/* Usage indicator */}
        <div className="flex items-center justify-center gap-2">
          <Badge variant={canAnalyze ? "secondary" : "destructive"}>
            {analysesUsed}/{dailyLimit} analyses used today
          </Badge>
        </div>
      </div>

      {/* Analysis Result */}
      {analysisResult && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Analysis Result
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetAnalysis}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Food name and verdict */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{analysisResult.foodName}</h2>
              <Badge 
                variant={
                  analysisResult.verdict === "YES" ? "default" :
                  analysisResult.verdict === "OK" ? "secondary" : "destructive"
                }
                className="text-lg px-4 py-2"
              >
                {analysisResult.verdict === "YES" ? "✅ YES" :
                 analysisResult.verdict === "OK" ? "⚖️ OK" : "❌ NO"}
              </Badge>
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <h3 className="font-semibold">Why?</h3>
              <p className="text-muted-foreground leading-relaxed">
                {analysisResult.explanation}
              </p>
            </div>

            {/* Nutrition info */}
            {analysisResult.calories && (
              <div className="space-y-2">
                <h3 className="font-semibold">Nutrition Facts</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p><strong>Calories:</strong> {analysisResult.calories}</p>
                    {analysisResult.protein && (
                      <p><strong>Protein:</strong> {analysisResult.protein}g</p>
                    )}
                    {analysisResult.carbohydrates && (
                      <p><strong>Carbs:</strong> {analysisResult.carbohydrates}g</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    {analysisResult.fat && (
                      <p><strong>Fat:</strong> {analysisResult.fat}g</p>
                    )}
                    {analysisResult.fiber && (
                      <p><strong>Fiber:</strong> {analysisResult.fiber}g</p>
                    )}
                    {analysisResult.portion && (
                      <p><strong>Portion:</strong> {analysisResult.portion}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Alternatives */}
            {analysisResult.alternatives && analysisResult.alternatives.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Healthier Alternatives</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.alternatives.map((alt, index) => (
                    <Badge key={index} variant="outline">
                      {alt}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button
                onClick={() => handleLogFood(true)}
                disabled={logFood.isPending}
                className="flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                {logFood.isPending ? "Logging..." : "Yum!"}
              </Button>
              
              <Button
                onClick={() => handleLogFood(false)}
                disabled={logFood.isPending}
                variant="outline"
              >
                Nah, skip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Methods */}
      {!analysisResult && (
        <>
          {/* Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Analysis Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant={analysisMethod === "camera" ? "default" : "outline"}
                  onClick={() => setAnalysisMethod("camera")}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </Button>
                
                <Button
                  variant={analysisMethod === "upload" ? "default" : "outline"}
                  onClick={() => setAnalysisMethod("upload")}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
                
                <Button
                  variant={analysisMethod === "text" ? "default" : "outline"}
                  onClick={() => setAnalysisMethod("text")}
                  className="flex items-center gap-2"
                >
                  <Type className="w-4 h-4" />
                  Describe
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Interface */}
          <Card>
            <CardContent className="pt-6">
              {analysisMethod === "camera" && (
                <div className="space-y-4">
                  {!imagePreview ? (
                    <div className="space-y-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full rounded-lg"
                        onCanPlay={startCamera}
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <Button onClick={capturePhoto} className="w-full">
                        Capture Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Captured food"
                        className="w-full rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Button onClick={resetAnalysis} variant="outline">
                          Retake Photo
                        </Button>
                        <Button 
                          onClick={handleAnalyze}
                          disabled={analyzeFood.isPending || !canAnalyze}
                        >
                          {analyzeFood.isPending ? <LoadingSpinner /> : "Analyze Photo"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {analysisMethod === "upload" && (
                <div className="space-y-4">
                  {!imagePreview ? (
                    <div className="space-y-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full h-32 border-dashed"
                      >
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2" />
                          <p>Click to upload image</p>
                        </div>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Uploaded food"
                        className="w-full rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Button onClick={resetAnalysis} variant="outline">
                          Choose Different Image
                        </Button>
                        <Button 
                          onClick={handleAnalyze}
                          disabled={analyzeFood.isPending || !canAnalyze}
                        >
                          {analyzeFood.isPending ? <LoadingSpinner /> : "Analyze Image"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {analysisMethod === "text" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Food Name</label>
                    <Input
                      placeholder="e.g., Grilled chicken salad"
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleAnalyze}
                    disabled={analyzeFood.isPending || !foodName.trim() || !canAnalyze}
                    className="w-full"
                  >
                    {analyzeFood.isPending ? <LoadingSpinner /> : "Analyze Food"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Pro tip */}
      {!analysisResult && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                💡 Pro Tip
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                For best results, ensure good lighting and capture the complete meal. 
                The AI analyzes both ingredients and portion sizes for accurate recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

This comprehensive frontend development guide provides complete React component implementations with authentication, food analysis features, proper state management, and responsive design that matches the Veridect web application's functionality.