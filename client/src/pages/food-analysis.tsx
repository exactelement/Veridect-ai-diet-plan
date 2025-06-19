import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Type, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
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
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
    });
  };

  const handleAnalyze = async () => {
    if (analysisMode === "text" && !foodDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe the food you want to analyze.",
        variant: "destructive",
      });
      return;
    }

    if ((analysisMode === "camera" || analysisMode === "upload") && !selectedImage) {
      toast({
        title: "Missing Image",
        description: "Please select an image to analyze.",
        variant: "destructive",
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
      });
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setSelectedImage(null);
    setImagePreview(null);
    setFoodDescription("");
  };

  const handleYum = async () => {
    if (!analysisResult) return;
    
    try {
      const points = analysisResult.verdict === "YES" ? 10 : 
                   analysisResult.verdict === "OK" ? 5 : 2;
      
      const response = await apiRequest("POST", "/api/food-logs", {
        foodName: analysisResult.foodName,
        verdict: analysisResult.verdict,
        explanation: analysisResult.explanation,
        calories: analysisResult.calories,
        protein: analysisResult.protein,
        confidence: analysisResult.confidence,
        portion: analysisResult.portion,
        action: "yum",
        points: points
      });

      if (response.ok) {
        toast({
          title: "Food Logged!",
          description: `+${points} points added to your score!`,
        });
        
        // Navigate to home page to show updated progress
        window.location.href = "/";
      } else {
        throw new Error("Failed to log food");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log food. Please try again.",
        variant: "destructive",
      });
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
                <div className="text-center">
                  <img 
                    src={imagePreview} 
                    alt="Analyzed food" 
                    className="max-w-sm mx-auto rounded-lg shadow-lg"
                  />
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

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analysisResult.calories && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-ios-blue">{analysisResult.calories}</div>
                      <div className="text-sm text-ios-secondary">Calories</div>
                    </CardContent>
                  </Card>
                )}
                {analysisResult.protein && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-health-green">{analysisResult.protein}g</div>
                      <div className="text-sm text-ios-secondary">Protein</div>
                    </CardContent>
                  </Card>
                )}
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
                  className="bg-health-green hover:bg-health-green/90 text-white px-8 py-3 text-lg font-semibold"
                >
                  😋 Yum
                </Button>
                <Button 
                  onClick={handleNah} 
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
    <div className="pt-20 pb-8 container-padding">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Food Analysis</h1>
          <p className="text-xl text-ios-secondary">
            Get instant health verdicts on your food choices
          </p>
        </div>

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
                    <img 
                      src={imagePreview} 
                      alt="Captured food" 
                      className="max-w-md mx-auto rounded-lg shadow-lg"
                    />
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
                    <img 
                      src={imagePreview} 
                      alt="Uploaded food" 
                      className="max-w-md mx-auto rounded-lg shadow-lg"
                    />
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
