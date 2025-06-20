import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, Type, Loader2 } from "lucide-react";

interface FoodAnalysisInterfaceProps {
  onAnalyze: (data: { foodName?: string; imageData?: string }) => void;
  isAnalyzing: boolean;
}

export default function FoodAnalysisInterface({ onAnalyze, isAnalyzing }: FoodAnalysisInterfaceProps) {
  const [analysisMode, setAnalysisMode] = useState<"camera" | "upload" | "text">("camera");
  const [foodDescription, setFoodDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
      return;
    }

    if ((analysisMode === "camera" || analysisMode === "upload") && !selectedImage) {
      return;
    }

    try {
      let imageData: string | undefined;
      if (selectedImage) {
        imageData = await convertToBase64(selectedImage);
      }

      onAnalyze({
        foodName: analysisMode === "text" ? foodDescription : undefined,
        imageData,
      });
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Mode Selection */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">How would you like to analyze your food?</h3>
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
              disabled={isAnalyzing || (
                (analysisMode === "text" && !foodDescription.trim()) ||
                ((analysisMode === "camera" || analysisMode === "upload") && !selectedImage)
              )}
              className="bg-ios-blue text-white px-8 py-3 text-lg font-medium"
            >
              {isAnalyzing ? (
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
  );
}
