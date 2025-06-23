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
}

export default function FoodAnalysis() {
  const [analysisMode, setAnalysisMode] = useState<"camera" | "upload" | "text">("camera");
  const [foodDescription, setFoodDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Always scroll to top when component mounts or refreshes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
      queryClient.invalidateQueries({ queryKey: ["/api/food/logs/today"] });
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
  };

  const [isLogging, setIsLogging] = useState(false);

  const handleYum = async () => {
    if (!analysisResult || isLogging) return;
    
    setIsLogging(true);
    
    // Always clear analysis result immediately when user clicks Yum
    const currentAnalysis = analysisResult;
    setAnalysisResult(null);
    
    try {
      const points = currentAnalysis.verdict === "YES" ? 10 : 
                   currentAnalysis.verdict === "OK" ? 5 : 2;
      
      const response = await apiRequest("POST", "/api/food-logs", {
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

      if (response.ok) {
        toast({
          title: "Food Logged!",
          description: `+${points} points added to your score!`,
        });
        
        // Navigate to home page to show updated progress
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        throw new Error("Failed to log food");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log food. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLogging(false);
    }
  };

  const handleNah = () => {
    toast({
      title: "Analysis Discarded",
      description: "No worries, let's find something better!",
    });
    resetAnalysis();
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

  if (analysisResult) {
    return (
      <div className="pt-20 pb-8 container-padding">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${getVerdictColor(analysisResult.verdict)}`}>
                {getVerdictIcon(analysisResult.verdict)}
              </div>
              <CardTitle className={`text-4xl font-bold ${getVerdictColor(analysisResult.verdict)}`}>
                {analysisResult.verdict}
              </CardTitle>
              <p className="text-xl text-ios-secondary">{analysisResult.foodName}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {imagePreview && (
                <div className="flex justify-center">
                  <div className="w-full max-w-xs overflow-hidden rounded-lg shadow-lg">
                    <img 
                      src={imagePreview} 
                      alt="Analyzed food" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}

              <Card className={`border-2 ${
                analysisResult.verdict === "YES" ? "border-health-green bg-health-green/5" :
                analysisResult.verdict === "NO" ? "border-danger-red bg-danger-red/5" :
                "border-warning-orange bg-warning-orange/5"
              }`}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Analysis Explanation</h3>
                  <p className="text-ios-text leading-relaxed">{analysisResult.explanation}</p>
                </CardContent>
              </Card>

              {/* Nutritional details - only show if user hasn't disabled them */}
              {showNutritionDetails && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-ios-blue">
                        {analysisResult.calories && analysisResult.calories > 0 ? analysisResult.calories : "N/A"}
                      </div>
                      <div className="text-sm text-ios-secondary">Calories</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-health-green">
                        {analysisResult.protein && analysisResult.protein > 0 ? `${analysisResult.protein}g` : "N/A"}
                      </div>
                      <div className="text-sm text-ios-secondary">Protein</div>
                    </CardContent>
                  </Card>
                  {analysisResult.portion && (
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-warning-orange">{analysisResult.portion}</div>
                        <div className="text-sm text-ios-secondary">Portion</div>
                      </CardContent>
                    </Card>
                  )}
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-ios-secondary">{analysisResult.confidence}%</div>
                      <div className="text-sm text-ios-secondary">Confidence</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {analysisResult.alternatives && analysisResult.alternatives.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">Healthier Alternatives</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.alternatives.map((alternative, index) => (
                        <Badge key={index} variant="secondary" className="bg-health-green/10 text-health-green">
                          {alternative}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={handleYum}
                  disabled={isLogging}
                  className="bg-health-green hover:bg-health-green/90 text-white px-8 py-3 text-lg font-semibold disabled:opacity-50"
                >
                  {isLogging ? "Logging..." : "😋 Yum"}
                </Button>
                <Button 
                  onClick={handleNah}
                  disabled={isLogging}
                  variant="outline"
                  className="border-danger-red text-danger-red hover:bg-danger-red hover:text-white px-8 py-3 text-lg font-semibold"
                >
                  😝 Nah
                </Button>
              </div>
              
              <div className="flex justify-center space-x-4 pt-4">
                <Button onClick={resetAnalysis} variant="outline" size="sm">
                  Analyze Another Food
                </Button>
                <Button onClick={() => window.history.back()} variant="ghost" size="sm">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 container-padding">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {timeGreeting}, {(activeUser as any)?.firstName || 'there'}!
          </h1>
          <p className="text-xl text-ios-secondary">
            Ready to analyze your food? Get instant health verdicts on your choices
          </p>
        </div>

        {/* Analysis Interface */}
        <Card>
          <CardContent className="p-8">
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
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-ios-secondary">Click to upload an image of your food</p>
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
                    Analyzing...
                  </>
                ) : (
                  "Analyze Food"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle>How would you like to analyze your food?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                variant={analysisMode === "camera" ? "default" : "outline"}
                onClick={() => setAnalysisMode("camera")}
                className="h-20 flex flex-col space-y-2"
              >
                <Camera className="w-6 h-6" />
                <span>Take Photo</span>
              </Button>
              <Button
                variant={analysisMode === "upload" ? "default" : "outline"}
                onClick={() => setAnalysisMode("upload")}
                className="h-20 flex flex-col space-y-2"
              >
                <Upload className="w-6 h-6" />
                <span>Upload Image</span>
              </Button>
              <Button
                variant={analysisMode === "text" ? "default" : "outline"}
                onClick={() => setAnalysisMode("text")}
                className="h-20 flex flex-col space-y-2"
              >
                <Type className="w-6 h-6" />
                <span>Describe Food</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-ios-blue/5 border-ios-blue/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">💡 Tips for Better Analysis</h3>
            <ul className="space-y-2 text-sm text-ios-secondary">
              <li>• Make sure the food is well-lit and clearly visible</li>
              <li>• Include any sauces, seasonings, or cooking methods in descriptions</li>
              <li>• For packaged foods, try to include the brand name</li>
              <li>• Multiple angles or close-up shots can improve accuracy</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
