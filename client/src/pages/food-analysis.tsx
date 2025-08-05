import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Type, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { checkTierAccess } from "@/components/subscription-check";
import { useLocation, useRoute } from "wouter";
import SimpleGDPRBanner from "@/components/simple-gdpr-banner";
import { ShareCard } from "@/components/ShareCard";

interface AnalysisResult {
  foodName: string;
  verdict: "YES" | "NO" | "OK";
  explanation: string;
  calories?: number;
  protein?: number;
  confidence: number;
  portion?: string;
  nutritionFacts?: any;
  alternatives?: string[];
  method?: string;
}

export default function FoodAnalysis() {
  const [analysisMode, setAnalysisMode] = useState<"camera" | "upload" | "text">("camera");
  const [foodDescription, setFoodDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showGdprBanner, setShowGdprBanner] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Always scroll to top when component mounts or refreshes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if GDPR banner should be shown
  useEffect(() => {
    if (user && !(user as any)?.hasSeenGdprBanner) {
      const timer = setTimeout(() => setShowGdprBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleGdprComplete = () => {
    setShowGdprBanner(false);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };
  const userTier = (user as any)?.subscriptionTier || 'free';
  const canLogFood = checkTierAccess(userTier, 'pro', (user as any)?.email);

  // Dynamic greeting based on device time - updates on each app visit
  const [timeGreeting, setTimeGreeting] = useState(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour < 12) {
      return "Good morning";
    } else if (currentHour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  });

  // Update greeting every time user opens the app/page
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    const newGreeting = currentHour < 12 
      ? "Good morning" 
      : currentHour < 18 
      ? "Good afternoon" 
      : "Good evening";
    
    setTimeGreeting(newGreeting);
  }, []);

  // Get user interface preferences
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    staleTime: 0, // Always get fresh preferences
  });

  const activeUser = currentUser || user;
  const privacySettings = (activeUser as any)?.privacySettings || {};
  const showNutritionDetails = privacySettings.showNutritionDetails !== false;

  const analyzeMutation = useMutation({
    mutationFn: async (data: { foodName?: string; imageData?: string }) => {
      const response = await apiRequest("POST", "/api/food/analyze", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data.analysis);
      // Invalidate ALL relevant caches so progress page updates immediately
      queryClient.invalidateQueries({ queryKey: ["/api/food/logs/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/food/analyzed/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/my-score"] });
      toast({
        title: "Analysis Complete!",
        description: `Food analyzed: ${data.analysis.foodName}`,
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 512px on longest side for faster uploads)
        const maxSize = 512;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image (higher compression for smaller files)
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUrl.split(',')[1]); // Remove prefix
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (analysisMode === "text" && !foodDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe the food you want to analyze.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if ((analysisMode === "camera" || analysisMode === "upload") && !selectedImage) {
      toast({
        title: "Missing Image",
        description: "Please select an image to analyze.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      let imageData: string | undefined;
      if (selectedImage) {
        imageData = await convertToBase64(selectedImage);
      }

      analyzeMutation.mutate({
        foodName: analysisMode === "text" ? foodDescription : undefined,
        imageData,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setSelectedImage(null);
    setImagePreview(null);
    setFoodDescription("");
    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    // Scroll to top of the page for better user experience
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isLogging, setIsLogging] = useState(false);
  const [, setLocation] = useLocation();

  const handleYum = async () => {
    if (!analysisResult || isLogging) return;
    
    // Don't allow logging non-food items (they get "NO" verdict with 0 calories)
    if (analysisResult.foodName === "Non-Food Item" && analysisResult.calories === 0) {
      toast({
        title: "Cannot Log Non-Food Item",
        description: "This isn't food! Please analyze an actual food item.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    setIsLogging(true);
    
    // Keep analysis result visible during API call
    const currentAnalysis = analysisResult;
    
    try {
      const points = currentAnalysis.verdict === "YES" ? 10 : 
                   currentAnalysis.verdict === "OK" ? 5 : 2;
      
      // apiRequest already throws for non-2xx status codes, so we don't need to check response.ok
      await apiRequest("POST", "/api/food-logs", {
        foodName: currentAnalysis.foodName,
        verdict: currentAnalysis.verdict,
        explanation: currentAnalysis.explanation,
        calories: currentAnalysis.calories,
        protein: currentAnalysis.protein,
        confidence: currentAnalysis.confidence,
        portion: currentAnalysis.portion,
        analysisMethod: currentAnalysis.method || "ai",
        action: "yum",
        points: points
      });

      // If we reach here, the request was successful
      toast({
        title: "Food Logged!",
        description: `+${points} points added to your score!`,
      });
      
      // Invalidate caches to update UI immediately
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/food/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/food/logs/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/weekly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/my-score"] });
      
      // Clear analysis result and image, then navigate smoothly
      resetAnalysis();
      setLocation("/");
    } catch (error: any) {
      console.error("Food logging error:", error);
      const errorMessage = error?.message || "Failed to log food. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLogging(false);
    }
  };

  const handleNah = () => {
    resetAnalysis();
    toast({
      title: "Analysis Discarded",
      description: "No worries, let's find something better!",
    });
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "YES": return "text-health-green";
      case "NO": return "text-danger-red";
      case "OK": return "text-warning-orange";
      default: return "text-ios-secondary";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "YES": return <CheckCircle className="w-8 h-8" />;
      case "NO": return <XCircle className="w-8 h-8" />;
      case "OK": return <AlertTriangle className="w-8 h-8" />;
      default: return null;
    }
  };

  const [expandNutrition, setExpandNutrition] = useState(false);

  if (analysisResult) {
    return (
      <div className="min-h-screen veridect-gradient-bg pt-20 pb-32">
        <div className="container-padding">
          <div className="max-w-4xl mx-auto">
            {/* Main Result Card with presentation style */}
            <div className="veridect-card">
              <div className="text-center p-8">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  analysisResult.verdict === "YES" ? "bg-health-green/10" :
                  analysisResult.verdict === "NO" ? "bg-danger-red/10" :
                  "bg-warning-orange/10"
                }`}>
                  <div className={getVerdictColor(analysisResult.verdict)}>
                    {getVerdictIcon(analysisResult.verdict)}
                  </div>
                </div>
                <h1 className={`text-5xl font-bold mb-2 ${getVerdictColor(analysisResult.verdict)}`}>
                  {analysisResult.verdict}
                </h1>
                <p className="text-2xl text-gray-700 font-medium">{analysisResult.foodName}</p>
              </div>

              <div className="p-8 space-y-6">
                {imagePreview && (
                  <div className="flex justify-center">
                    <div className="w-full max-w-md overflow-hidden rounded-xl shadow-lg">
                      <img 
                        src={imagePreview} 
                        alt="Analyzed food" 
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Explanation Card with verdict-based styling */}
                <div className={`rounded-xl p-6 ${
                  analysisResult.verdict === "YES" ? "bg-health-green/5 border border-health-green/20" :
                  analysisResult.verdict === "NO" ? "bg-danger-red/5 border border-danger-red/20" :
                  "bg-warning-orange/5 border border-warning-orange/20"
                }`}>
                  <p className="text-gray-700 leading-relaxed text-lg">{analysisResult.explanation}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 italic">
                      Estimates are approximations based on analysis by AI
                    </p>
                  </div>
                </div>

                {/* Expandable Nutritional Details */}
                {showNutritionDetails && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setExpandNutrition(!expandNutrition)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-700">Nutritional Details</span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          expandNutrition ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandNutrition && (
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
                          <div className="text-3xl font-bold text-purple-600">
                            {analysisResult.calories && analysisResult.calories > 0 ? analysisResult.calories : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">Calories</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
                          <div className="text-3xl font-bold text-health-green">
                            {analysisResult.protein && analysisResult.protein > 0 ? `${analysisResult.protein}g` : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">Protein</div>
                        </div>
                        {analysisResult.portion && (
                          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
                            <div className="text-3xl font-bold text-warning-orange">{analysisResult.portion}</div>
                            <div className="text-sm text-gray-500 mt-1">Portion</div>
                          </div>
                        )}
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
                          <div className="text-3xl font-bold text-gray-600">{analysisResult.confidence}%</div>
                          <div className="text-sm text-gray-500 mt-1">Confidence</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {analysisResult.alternatives && analysisResult.alternatives.length > 0 && (
                  <div className="bg-health-green/5 rounded-xl p-6 border border-health-green/20">
                    <h3 className="font-semibold text-gray-700 mb-3">Healthier Alternatives</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.alternatives.map((alternative, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-health-green/20 text-health-green rounded-full text-sm font-medium"
                        >
                          {alternative}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Share Card Component */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Share Your Result</h3>
                <ShareCard
                  foodName={analysisResult.foodName}
                  verdict={analysisResult.verdict}
                  explanation={analysisResult.explanation}
                  calories={analysisResult.calories ? `${analysisResult.calories} cal` : undefined}
                />
              </div>

              <div className="flex justify-center space-x-4">
                {analysisResult.foodName === "Non-Food Item" ? (
                  <Button 
                    onClick={handleNah}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 text-lg font-semibold"
                  >
                    Try Again with Food
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={canLogFood ? handleYum : () => navigate('/subscription')}
                      disabled={isLogging || !canLogFood}
                      className={`px-8 py-3 text-lg font-semibold ${
                        canLogFood 
                          ? "bg-health-green hover:bg-health-green/90 text-white disabled:opacity-50"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      title={!canLogFood ? "Upgrade to Pro to log food" : ""}
                    >
                      {!canLogFood ? "🔒 Yum (Pro)" : isLogging ? "Logging..." : "😋 Yum"}
                    </Button>
                    <Button 
                      onClick={handleNah}
                      disabled={isLogging}
                      variant="outline"
                      className="border-danger-red text-danger-red hover:bg-danger-red hover:text-white px-8 py-3 text-lg font-semibold"
                    >
                      😝 Nah
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex justify-center space-x-4 pt-4 pb-8">
                <Button onClick={resetAnalysis} variant="outline" size="sm">
                  Ask Veri Again
                </Button>
                <Button onClick={() => window.history.back()} variant="ghost" size="sm">
                  Back to Dashboard
                </Button>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen veridect-gradient-bg pt-20 pb-24">
      <div className="container-padding">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Veridect Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-veridect-text-light mb-2">
              {timeGreeting}, {((activeUser as any)?.firstName || 'there').trim()}!
            </h1>
            <p className="text-veridect-text-muted">
              Ready to analyze your food? Get instant health verdicts on your choices
            </p>
          </div>

          {/* Unified Smart Input Interface */}
          <div className="veridect-card p-8">
            {/* Mode Selection Icons - Always visible at top */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setAnalysisMode("camera")}
                className={`p-3 rounded-lg transition-all ${
                  analysisMode === "camera" 
                    ? "bg-health-green text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Take Photo"
              >
                <Camera className="w-6 h-6" />
              </button>
              <button
                onClick={() => setAnalysisMode("upload")}
                className={`p-3 rounded-lg transition-all ${
                  analysisMode === "upload" 
                    ? "bg-health-green text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Upload Image"
              >
                <Upload className="w-6 h-6" />
              </button>
              <button
                onClick={() => setAnalysisMode("text")}
                className={`p-3 rounded-lg transition-all ${
                  analysisMode === "text" 
                    ? "bg-health-green text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Describe Food"
              >
                <Type className="w-6 h-6" />
              </button>
            </div>
            {analysisMode === "camera" && (
              <div className="text-center space-y-4">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-full max-w-xs overflow-hidden rounded-lg shadow-lg">
                        <img 
                          src={imagePreview} 
                          alt="Captured food" 
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => cameraInputRef.current?.click()}
                      variant="outline"
                    >
                      Take Another Photo
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => cameraInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:border-ios-blue transition-colors"
                  >
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-ios-secondary">Tap to take a photo of your food</p>
                  </div>
                )}
              </div>
            )}

            {analysisMode === "upload" && (
              <div className="text-center space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-full max-w-xs overflow-hidden rounded-lg shadow-lg">
                        <img 
                          src={imagePreview} 
                          alt="Uploaded food" 
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      Choose Different Image
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:border-ios-blue transition-colors"
                  >
                    <Upload className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-700">Click to upload an image of your food</p>
                  </div>
                )}
              </div>
            )}

            {analysisMode === "text" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-ios-text">
                  Describe your food
                </label>
                <Textarea
                  placeholder="E.g., Grilled chicken breast with steamed broccoli and brown rice"
                  value={foodDescription}
                  onChange={(e) => setFoodDescription(e.target.value)}
                  rows={4}
                  className="w-full"
                />
                <p className="text-sm text-ios-secondary">
                  Be as specific as possible for the most accurate analysis
                </p>
              </div>
            )}

            <div className="mt-8 text-center">
              <Button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
                className="bg-ios-blue text-white px-8 py-3 text-lg font-medium"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Asking Veri...
                  </>
                ) : (
                  "Ask Veri"
                )}
              </Button>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="veridect-tip-card">
            <div className="flex items-start space-x-3">
              <div className="text-health-green text-xl">💡</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 text-base sm:text-lg">Pro Tip</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  For better accuracy, ensure good lighting and capture the entire meal. Or describe including any sauces or dressings!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showGdprBanner && <SimpleGDPRBanner onComplete={handleGdprComplete} />}
    </div>
  );
}
