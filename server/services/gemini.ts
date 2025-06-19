import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error("GOOGLE_GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

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

export async function analyzeWithGemini(
  foodName?: string,
  imageData?: string
): Promise<GeminiAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are YesOrNo, a brutally honest AI health assistant specializing in food analysis. Your task is to analyze food and provide a clear verdict.

For the given food${imageData ? ' image' : `: "${foodName}"`}, provide:
1. A verdict: YES (healthy), NO (unhealthy), or OK (moderate)
2. A brief, engaging explanation with personality
3. Your best estimate of nutritional content including calories, protein, carbs, fat, fiber, sugar, sodium
4. A confidence score
5. A portion size estimate (e.g., "1 cup", "2 slices", "3 oz", "1 medium piece")

Respond with JSON in this exact format:
{
  "foodName": "The actual name of the food item",
  "verdict": "YES/NO/OK",
  "explanation": "Brief engaging explanation with personality",
  "calories": 250,
  "protein": 20,
  "carbohydrates": 30,
  "fat": 10,
  "fiber": 5,
  "sugar": 8,
  "sodium": 400,
  "confidence": 85,
  "portion": "1 cup"
}

IMPORTANT:
- All numeric values must be whole numbers
- confidence must be between 80 and 99
- portion should be a clear measurement
- Provide your best nutritional estimates based on what you can see/analyze
- Consider portion sizes, ingredients, and typical nutritional values
- Be specific about the food item and provide accurate nutritional estimates
- If analyzing an image, pay close attention to portion sizes and ingredients visible`;

  try {
    let result;
    
    if (imageData) {
      // Convert base64 to proper format for Gemini
      const imageBase64 = imageData.includes(',') ? imageData.split(',')[1] : imageData;
      
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: "image/jpeg"
          }
        }
      ]);
    } else {
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate and sanitize the response
    return {
      foodName: analysis.foodName || "Unknown Food",
      verdict: ["YES", "NO", "OK"].includes(analysis.verdict) ? analysis.verdict : "OK",
      explanation: analysis.explanation || "Analysis completed.",
      calories: Math.max(0, Math.min(10000, parseInt(analysis.calories) || 0)),
      protein: Math.max(0, Math.min(2000, parseInt(analysis.protein) || 0)),
      carbohydrates: Math.max(0, Math.min(2000, parseInt(analysis.carbohydrates) || 0)),
      fat: Math.max(0, Math.min(1000, parseInt(analysis.fat) || 0)),
      fiber: Math.max(0, Math.min(200, parseInt(analysis.fiber) || 0)),
      sugar: Math.max(0, Math.min(1000, parseInt(analysis.sugar) || 0)),
      sodium: Math.max(0, Math.min(10000, parseInt(analysis.sodium) || 0)),
      confidence: Math.max(80, Math.min(99, parseInt(analysis.confidence) || 85)),
      portion: analysis.portion || "1 serving",
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to analyze food with AI. Please try again.");
  }
}
