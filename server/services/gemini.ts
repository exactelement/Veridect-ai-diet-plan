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

// Simple hash function for deterministic results
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export async function analyzeWithGemini(
  foodName?: string,
  imageData?: string,
  userProfile?: {
    healthGoals?: string[];
    dietaryPreferences?: string[];
    allergies?: string[];
    fitnessLevel?: string;
    subscriptionTier?: string;
  }
): Promise<GeminiAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Build personalized context based on user profile
  let personalizedContext = "";
  if (userProfile) {
    personalizedContext = `

PERSONALIZED ANALYSIS FOR THIS USER:
- Health Goals: ${userProfile.healthGoals?.join(', ') || 'Not specified'}
- Dietary Preferences: ${userProfile.dietaryPreferences?.join(', ') || 'Not specified'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None specified'}
- Fitness Level: ${userProfile.fitnessLevel || 'Not specified'}
- Subscription Tier: ${userProfile.subscriptionTier || 'Free'}

IMPORTANT: Analyze this food specifically for THIS USER's goals, preferences, and restrictions. Consider:
- If they have allergies, flag any potential allergens as NO verdict
- If they have specific health goals (weight loss, muscle gain, etc.), tailor verdict accordingly
- If they follow specific diets (keto, vegan, etc.), consider compatibility
- Provide more detailed scientific analysis for Medical tier users
- Use casual tone for Free tier, scientific tone for Medical tier`;
  }

  // Create deterministic seed for consistent results
  const seedInput = [
    foodName || 'image',
    (userProfile?.healthGoals || []).sort().join(','),
    (userProfile?.dietaryPreferences || []).sort().join(','),
    (userProfile?.allergies || []).sort().join(',')
  ].join('|');
  
  const deterministicSeed = simpleHash(seedInput);

  const prompt = `You are YesOrNo, a brutally honest AI health assistant specializing in personalized food analysis based on scientific research. Your task is to analyze ONLY FOOD ITEMS and provide a clear verdict tailored to the specific user.

CRITICAL FOOD DETECTION RULE: 
- If the image/description is NOT FOOD OR DRINK (electronics, objects, text, screenshots, etc.), you MUST return a "NO" verdict
- ANALYZE ALL edible food items AND beverages (water, juice, soda, coffee, tea, alcohol, smoothies, etc.)
- Drinks are food items and should be analyzed for their nutritional content
- Be strict about what constitutes food/drinks vs non-edible items

CONSISTENCY REQUIREMENT: Use this deterministic seed for reproducible results: ${deterministicSeed}
IMPORTANT: Always provide identical verdicts for the same food + user profile combination.

${personalizedContext}

For the given ${imageData ? ' image' : `food/drink: "${foodName}"`}, first determine if this is actually food or a beverage:

IF NOT FOOD OR DRINK (digital screens, electronics, text, objects, etc.):
- Set verdict to "NO"
- Set foodName to "Non-Food Item"
- Set explanation to a witty rejection message like "Hold up! That's not food or drink - I only analyze edible items!"
- Set all nutrition values to 0
- Set confidence to 99

IF IT IS FOOD OR DRINK, provide:
1. A verdict: YES (healthy for this user), NO (unhealthy for this user), or OK (moderate for this user)
2. A SHORT, witty explanation (MAX 6 lines) with humor and personality - be a fun nutritionist friend
3. Your best estimate of nutritional content including calories, protein, carbs, fat, fiber, sugar, sodium
4. A confidence score
5. A portion size estimate (e.g., "1 cup", "2 slices", "3 oz", "1 medium piece")

TONE GUIDELINES: Keep explanations CONCISE (max 6 lines) with witty, varied openings. Be creative and unpredictable! Mix these styles:
- Playful observations: "Well, well, what do we have here?" / "Spotted in the wild..." / "Plot twist!"
- Food personality: "This dish has main character energy" / "Giving off major comfort vibes"
- Casual assessments: "Let's talk real talk" / "Here's the scoop" / "Breaking it down"
- Punny reactions: Use clever food puns and wordplay
- Encouraging tone: Even for "NO" verdicts, keep it supportive, never scary or negative
- VARIETY IS KEY: Never repeat the same opening phrase - be spontaneous and creative!

Respond with JSON in this exact format:
{
  "foodName": "The actual name of the food/drink item OR 'Non-Food Item'",
  "verdict": "YES/NO/OK",
  "explanation": "Fun, witty explanation with humor and personality",
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
- All numeric values must be WHOLE NUMBERS (no decimals, no "<1" or similar)
- confidence must be between 80 and 99
- portion should be a clear measurement
- Use only whole numbers like: "sugar": 8 (not "sugar": "<1" or "sugar": 8.5)
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
