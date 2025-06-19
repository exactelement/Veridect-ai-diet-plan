export interface GeminiAnalysisResult {
  foodName: string;
  verdict: "YES" | "NO" | "OK";
  explanation: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  confidence: number;
  portion?: string;
}

export interface FoodAnalysisRequest {
  foodName?: string;
  imageData?: string;
}

// This is a client-side service that interfaces with our backend API
// The actual Gemini AI processing happens on the server for security
export async function analyzeWithGemini(
  foodName?: string,
  imageData?: string
): Promise<GeminiAnalysisResult> {
  try {
    const response = await fetch('/api/food/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        foodName,
        imageData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to analyze food');
    }

    const data = await response.json();
    
    // Validate and return the analysis result
    return {
      foodName: data.analysis.foodName || "Unknown Food",
      verdict: ["YES", "NO", "OK"].includes(data.analysis.verdict) ? data.analysis.verdict : "OK",
      explanation: data.analysis.explanation || "Analysis completed.",
      calories: data.analysis.calories || undefined,
      protein: data.analysis.protein || undefined,
      carbohydrates: data.analysis.carbohydrates || undefined,
      fat: data.analysis.fat || undefined,
      fiber: data.analysis.fiber || undefined,
      sugar: data.analysis.sugar || undefined,
      sodium: data.analysis.sodium || undefined,
      confidence: Math.max(80, Math.min(99, data.analysis.confidence || 85)),
      portion: data.analysis.portion || undefined,
    };
  } catch (error) {
    console.error("Food analysis error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to analyze food. Please try again.");
  }
}

// Helper function to validate image data
export function validateImageData(imageData: string): boolean {
  if (!imageData) return false;
  
  // Check if it's a valid base64 image
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
  const cleanData = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
  
  return base64Pattern.test(cleanData) && cleanData.length > 0;
}

// Helper function to compress image before sending
export function compressImageData(imageData: string, maxSizeKB: number = 500): string {
  // For now, return as-is. In production, you might want to implement
  // client-side image compression to reduce API payload size
  return imageData;
}

// Helper function to extract food items from text
export function extractFoodItems(description: string): string[] {
  // Simple implementation - in production this could be more sophisticated
  const foodKeywords = [
    'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna',
    'rice', 'pasta', 'bread', 'potato', 'quinoa',
    'salad', 'vegetables', 'broccoli', 'spinach', 'carrot',
    'apple', 'banana', 'orange', 'berries',
    'cheese', 'milk', 'yogurt', 'egg',
    'pizza', 'burger', 'sandwich', 'soup', 'stew'
  ];
  
  const words = description.toLowerCase().split(/\s+/);
  const foundFoods = words.filter(word => 
    foodKeywords.some(keyword => 
      word.includes(keyword) || keyword.includes(word)
    )
  );
  
  return [...new Set(foundFoods)]; // Remove duplicates
}

// Helper function to estimate confidence based on description detail
export function estimateDescriptionConfidence(description: string): number {
  if (!description || description.trim().length < 10) return 80;
  
  const detailIndicators = [
    'grilled', 'fried', 'steamed', 'baked', 'roasted',
    'cup', 'ounce', 'slice', 'piece', 'serving',
    'sauce', 'dressing', 'seasoning', 'spice',
    'organic', 'fresh', 'frozen', 'canned'
  ];
  
  const words = description.toLowerCase().split(/\s+/);
  const detailCount = words.filter(word => 
    detailIndicators.some(indicator => word.includes(indicator))
  ).length;
  
  // Base confidence of 80, +2 for each detail indicator, max 95
  return Math.min(95, 80 + (detailCount * 2));
}
