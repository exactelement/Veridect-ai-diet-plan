import { analyzeWithGemini, type GeminiAnalysisResult } from "./gemini";
import { apiRequest } from "@/lib/queryClient";

export interface FoodAnalysisResult extends GeminiAnalysisResult {
  method: "ai" | "fallback";
  nutritionFacts?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
  };
  alternatives?: string[];
  logId?: number;
}

export interface AnalysisOptions {
  includeAlternatives?: boolean;
  saveToLog?: boolean;
  userId?: string;
}

// Main food analysis function that coordinates with backend
export async function analyzeFoodWithAPI(
  foodName?: string,
  imageData?: string,
  options: AnalysisOptions = {}
): Promise<FoodAnalysisResult> {
  try {
    const response = await apiRequest("POST", "/api/food/analyze", {
      foodName,
      imageData,
      ...options,
    });
    
    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error("API food analysis failed:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to analyze food");
  }
}

// Client-side food analysis (for when user wants immediate feedback)
export async function analyzeFoodLocally(
  foodName?: string,
  imageData?: string
): Promise<FoodAnalysisResult> {
  try {
    // Use the Gemini service for client-side analysis
    const geminiResult = await analyzeWithGemini(foodName, imageData);
    
    // Transform to our expected format
    const nutritionFacts = {
      calories: geminiResult.calories || 0,
      protein: geminiResult.protein || 0,
      carbohydrates: geminiResult.carbohydrates || 0,
      fat: geminiResult.fat || 0,
      fiber: geminiResult.fiber || 0,
      sugar: geminiResult.sugar || 0,
      sodium: geminiResult.sodium || 0,
    };

    return {
      ...geminiResult,
      method: "ai",
      nutritionFacts,
      alternatives: generateAlternatives(geminiResult.verdict, geminiResult.foodName),
    };
  } catch (error) {
    console.error("Local analysis failed:", error);
    throw error;
  }
}

// Generate healthy alternatives based on verdict
function generateAlternatives(verdict: string, foodName: string): string[] {
  if (verdict === "YES") return [];

  const healthyAlternatives = [
    "Grilled chicken breast",
    "Quinoa salad",
    "Greek yogurt with berries",
    "Mixed nuts (unsalted)",
    "Fresh fruit bowl",
    "Vegetable stir-fry",
    "Whole grain toast with avocado",
    "Baked salmon with vegetables",
    "Green smoothie",
    "Raw vegetables with hummus",
    "Sweet potato",
    "Lentil soup",
    "Spinach salad",
    "Cottage cheese",
    "Almonds",
    "Blueberries",
    "Kale chips",
    "Chickpea salad",
    "Grilled vegetables",
    "Oatmeal with nuts"
  ];

  // Return 2-3 random alternatives
  const shuffled = healthyAlternatives.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
}

// Validate image before analysis
export function validateFoodImage(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select an image file' };
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Image must be smaller than 10MB' };
  }

  // Check image dimensions (optional, for performance)
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Max resolution check (optional)
      if (img.width > 4000 || img.height > 4000) {
        resolve({ valid: false, error: 'Image resolution too high. Please use a smaller image.' });
      } else {
        resolve({ valid: true });
      }
    };
    img.onerror = () => {
      resolve({ valid: false, error: 'Invalid image file' });
    };
    img.src = URL.createObjectURL(file);
  }) as any;
}

// Convert file to base64 for API transmission
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get pure base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Optimize image for analysis (resize if too large)
export function optimizeImageForAnalysis(file: File, maxWidth: number = 1024): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          } else {
            resolve(file); // Fallback to original
          }
        },
        'image/jpeg',
        0.8 // Quality
      );
    };
    
    img.onerror = () => resolve(file); // Fallback to original
    img.src = URL.createObjectURL(file);
  });
}

// Get analysis history for user
export async function getAnalysisHistory(limit: number = 50, offset: number = 0) {
  try {
    const response = await apiRequest("GET", `/api/food/logs?limit=${limit}&offset=${offset}`, undefined);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch analysis history:", error);
    throw error;
  }
}

// Get today's food logs
export async function getTodaysLogs() {
  try {
    const response = await apiRequest("GET", "/api/food/logs/today", undefined);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch today's logs:", error);
    throw error;
  }
}

// Calculate daily nutrition summary
export function calculateDailyNutrition(logs: any[]) {
  return logs.reduce(
    (summary, log) => ({
      calories: summary.calories + (log.calories || 0),
      protein: summary.protein + (log.protein || 0),
      carbohydrates: summary.carbohydrates + (log.carbohydrates || 0),
      fat: summary.fat + (log.fat || 0),
      fiber: summary.fiber + (log.fiber || 0),
      sugar: summary.sugar + (log.sugar || 0),
      sodium: summary.sodium + (log.sodium || 0),
      yesCount: summary.yesCount + (log.verdict === 'YES' ? 1 : 0),
      noCount: summary.noCount + (log.verdict === 'NO' ? 1 : 0),
      okCount: summary.okCount + (log.verdict === 'OK' ? 1 : 0),
    }),
    {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      yesCount: 0,
      noCount: 0,
      okCount: 0,
    }
  );
}

// Calculate health score based on food choices
export function calculateHealthScore(logs: any[]): number {
  if (logs.length === 0) return 0;
  
  const summary = calculateDailyNutrition(logs);
  const totalChoices = summary.yesCount + summary.noCount + summary.okCount;
  
  if (totalChoices === 0) return 0;
  
  // Score calculation: YES=100 points, OK=50 points, NO=0 points
  const score = (summary.yesCount * 100 + summary.okCount * 50) / (totalChoices * 100);
  return Math.round(score * 100);
}

// Export data for healthcare providers or personal use
export function exportNutritionData(logs: any[], format: 'json' | 'csv' = 'json') {
  if (format === 'json') {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `nutrition-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  } else if (format === 'csv') {
    const headers = ['Date', 'Food Name', 'Verdict', 'Calories', 'Protein', 'Carbs', 'Fat', 'Fiber', 'Sugar', 'Sodium', 'Confidence'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        new Date(log.createdAt).toISOString().split('T')[0],
        `"${log.foodName}"`,
        log.verdict,
        log.calories || 0,
        log.protein || 0,
        log.carbohydrates || 0,
        log.fat || 0,
        log.fiber || 0,
        log.sugar || 0,
        log.sodium || 0,
        log.confidence || 0
      ].join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `nutrition-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
}
