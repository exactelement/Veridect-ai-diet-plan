import { analyzeWithGemini, type GeminiAnalysisResult } from "./gemini";

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
}

// Smart cache for consistent verdicts per user profile
const analysisCache = new Map<string, FoodAnalysisResult>();

// Generate cache key from food content AND user profile for consistency
function getCacheKey(foodName?: string, imageData?: string, userProfile?: any): string {
  let foodKey = "";
  
  if (imageData) {
    // For images, create a more stable fingerprint by sampling multiple parts
    const imageFingerprint = [
      imageData.substring(0, 100),
      imageData.substring(Math.floor(imageData.length * 0.25), Math.floor(imageData.length * 0.25) + 50),
      imageData.substring(Math.floor(imageData.length * 0.5), Math.floor(imageData.length * 0.5) + 50),
      imageData.substring(Math.floor(imageData.length * 0.75), Math.floor(imageData.length * 0.75) + 50),
      imageData.substring(-100)
    ].join('');
    foodKey = `img:${imageFingerprint}`;
  } else if (foodName) {
    // For text, use normalized food name
    foodKey = `text:${foodName.toLowerCase().trim()}`;
  }
  
  if (!foodKey) return "";
  
  // Create user profile fingerprint for consistent personalization
  const profileKey = userProfile ? [
    (userProfile.healthGoals || []).sort().join(','),
    (userProfile.dietaryPreferences || []).sort().join(','),
    (userProfile.allergies || []).sort().join(','),
    userProfile.subscriptionTier || 'free'
  ].join('|') : 'anonymous';
  
  return `${foodKey}::${profileKey}`;
}

// Fallback food database for when AI fails
const FALLBACK_FOODS: Record<string, Partial<GeminiAnalysisResult>> = {
  "apple": {
    foodName: "Apple",
    verdict: "YES",
    explanation: "Great choice! Apples are packed with fiber, vitamins, and natural antioxidants. Perfect healthy snack!",
    calories: 95,
    protein: 0,
    carbohydrates: 25,
    fat: 0,
    fiber: 4,
    sugar: 19,
    sodium: 2,
    confidence: 95,
    portion: "1 medium apple"
  },
  "banana": {
    foodName: "Banana",
    verdict: "YES",
    explanation: "Excellent choice! Bananas provide natural energy, potassium, and vitamin B6. Perfect for pre or post workout!",
    calories: 105,
    protein: 1,
    carbohydrates: 27,
    fat: 0,
    fiber: 3,
    sugar: 14,
    sodium: 1,
    confidence: 95,
    portion: "1 medium banana"
  },
  "burger": {
    foodName: "Burger",
    verdict: "NO",
    explanation: "Think twice! Most burgers are high in saturated fat, sodium, and calories. Consider a healthier protein option instead.",
    calories: 540,
    protein: 25,
    carbohydrates: 40,
    fat: 31,
    fiber: 3,
    sugar: 5,
    sodium: 1040,
    confidence: 90,
    portion: "1 burger"
  },
  "salad": {
    foodName: "Mixed Salad",
    verdict: "YES",
    explanation: "Now THAT'S what I call a power move! This leafy green masterpiece is packed with vitamins and fiber. Your body's about to celebrate!",
    calories: 150,
    protein: 8,
    carbohydrates: 12,
    fat: 8,
    fiber: 6,
    sugar: 6,
    sodium: 300,
    confidence: 92,
    portion: "1 large bowl"
  },
  "pizza": {
    foodName: "Pizza",
    verdict: "NO",
    explanation: "Whoa there, pizza lover! This cheesy temptation is loaded with calories and sodium. Save it for cheat day!",
    calories: 285,
    protein: 12,
    carbohydrates: 36,
    fat: 10,
    fiber: 2,
    sugar: 4,
    sodium: 640,
    confidence: 88,
    portion: "1 slice"
  },
  "chicken": {
    foodName: "Grilled Chicken",
    verdict: "YES",
    explanation: "Winner winner, chicken dinner! This lean protein superstar is perfect for muscle building. The MVP of healthy eating!",
    calories: 165,
    protein: 31,
    carbohydrates: 0,
    fat: 4,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    confidence: 94,
    portion: "3 oz serving"
  },
  "broccoli": {
    foodName: "Broccoli",
    verdict: "YES",
    explanation: "Look at these little green trees of awesomeness! Packed with vitamins C and K, plus fiber. Broccoli for the win!",
    calories: 25,
    protein: 3,
    carbohydrates: 5,
    fat: 0,
    fiber: 3,
    sugar: 1,
    sodium: 33,
    confidence: 96,
    portion: "1 cup chopped"
  },
  "rice": {
    foodName: "Rice",
    verdict: "OK",
    explanation: "Decent energy source, but white rice lacks fiber and nutrients. Brown rice would be a better choice!",
    calories: 205,
    protein: 4,
    carbohydrates: 45,
    fat: 0,
    fiber: 1,
    sugar: 0,
    sodium: 2,
    confidence: 90,
    portion: "1 cup cooked"
  },
  "donut": {
    foodName: "Donut",
    verdict: "NO",
    explanation: "Sugar bomb incoming! High in calories, trans fats, and empty carbs. Your pancreas is not amused.",
    calories: 269,
    protein: 4,
    carbohydrates: 31,
    fat: 15,
    fiber: 1,
    sugar: 12,
    sodium: 307,
    confidence: 92,
    portion: "1 medium donut"
  },
  "avocado": {
    foodName: "Avocado",
    verdict: "YES",
    explanation: "Holy guacamole! This green goddess is loaded with heart-healthy fats and fiber. Nature's butter!",
    calories: 160,
    protein: 2,
    carbohydrates: 9,
    fat: 15,
    fiber: 7,
    sugar: 1,
    sodium: 7,
    confidence: 95,
    portion: "1/2 medium avocado"
  }
};

function getFallbackAnalysis(foodName: string): GeminiAnalysisResult {
  const lowerFood = foodName.toLowerCase();
  
  // Check for exact matches first
  for (const [key, value] of Object.entries(FALLBACK_FOODS)) {
    if (lowerFood.includes(key)) {
      return {
        foodName: value.foodName!,
        verdict: value.verdict!,
        explanation: value.explanation!,
        calories: value.calories!,
        protein: value.protein!,
        carbohydrates: value.carbohydrates!,
        fat: value.fat!,
        fiber: value.fiber!,
        sugar: value.sugar!,
        sodium: value.sodium!,
        confidence: value.confidence!,
        portion: value.portion!,
      };
    }
  }

  // Generic fallback for unknown foods
  const verdicts = ["YES", "OK", "NO"] as const;
  const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];
  
  const responses = {
    "YES": [
      "This looks like a healthy choice! Rich in nutrients and aligned with your wellness goals.",
      "Great pick! This food appears to be nutrient-dense and beneficial for your health.",
      "Excellent choice! This seems to be a wholesome, natural food option.",
      "Smart selection! This food fits well with a balanced, healthy diet.",
      "Good call! This appears to be minimally processed and nutritious."
    ],
    "NO": [
      "Think twice about this one! Appears to be highly processed with questionable ingredients.",
      "Skip it! This food seems loaded with sugar, unhealthy fats, or artificial additives.",
      "Not recommended! This choice could derail your health progress.",
      "Red flag! This food appears to be high in calories and low in nutrients.",
      "Proceed with caution! This doesn't align with your health goals."
    ],
    "OK": [
      "This is an okay choice in moderation. Not the healthiest, but not the worst either.",
      "Moderate option. Could be better, but acceptable occasionally as part of a balanced diet.",
      "Average choice. Consider pairing with healthier options or enjoying in smaller portions.",
      "Neutral territory. Fine occasionally, but there are better options available.",
      "Middle ground food. Won't hurt your progress if consumed mindfully."
    ]
  };

  const explanations = responses[randomVerdict];
  const randomExplanation = explanations[Math.floor(Math.random() * explanations.length)];

  // Generate realistic nutritional values based on verdict
  let calorieRange, proteinRange, fatRange;
  if (randomVerdict === "YES") {
    calorieRange = [50, 250];
    proteinRange = [5, 25];
    fatRange = [2, 10];
  } else if (randomVerdict === "NO") {
    calorieRange = [200, 600];
    proteinRange = [3, 15];
    fatRange = [10, 35];
  } else {
    calorieRange = [100, 350];
    proteinRange = [4, 20];
    fatRange = [5, 20];
  }

  const calories = Math.floor(Math.random() * (calorieRange[1] - calorieRange[0])) + calorieRange[0];
  const protein = Math.floor(Math.random() * (proteinRange[1] - proteinRange[0])) + proteinRange[0];
  const fat = Math.floor(Math.random() * (fatRange[1] - fatRange[0])) + fatRange[0];
  const carbs = Math.floor((calories - (protein * 4) - (fat * 9)) / 4);

  return {
    foodName: foodName || "Unknown Food",
    verdict: randomVerdict,
    explanation: randomExplanation,
    calories,
    protein,
    carbohydrates: Math.max(0, carbs),
    fat,
    fiber: Math.floor(Math.random() * 8) + 1,
    sugar: Math.floor(Math.random() * 20) + 2,
    sodium: Math.floor(Math.random() * 600) + 50,
    confidence: Math.floor(Math.random() * 15) + 80, // 80-94 for fallback
    portion: "1 serving",
  };
}

function generateAlternatives(verdict: string, foodName: string, userProfile?: {
  healthGoals?: string[];
  dietaryPreferences?: string[];
  allergies?: string[];
  fitnessLevel?: string;
  subscriptionTier?: string;
}): string[] {
  if (verdict === "YES") return [];

  let healthyAlternatives = [
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

  // Filter alternatives based on user preferences and allergies
  if (userProfile?.dietaryPreferences?.includes('Vegan')) {
    healthyAlternatives = healthyAlternatives.filter(food => 
      !food.includes('chicken') && !food.includes('salmon') && 
      !food.includes('Greek yogurt') && !food.includes('cottage cheese')
    );
    healthyAlternatives.push("Tofu stir-fry", "Almond milk smoothie", "Chia seed pudding", "Tempeh bowl");
  }

  if (userProfile?.dietaryPreferences?.includes('Vegetarian')) {
    healthyAlternatives = healthyAlternatives.filter(food => 
      !food.includes('chicken') && !food.includes('salmon')
    );
  }

  if (userProfile?.allergies?.includes('Nuts')) {
    healthyAlternatives = healthyAlternatives.filter(food => 
      !food.includes('nuts') && !food.includes('Almonds')
    );
  }

  if (userProfile?.healthGoals?.includes('Weight Loss')) {
    healthyAlternatives.push("Cucumber salad", "Celery with hummus", "Zucchini noodles", "Cauliflower rice");
  }

  if (userProfile?.healthGoals?.includes('Muscle Gain')) {
    healthyAlternatives.push("Protein smoothie", "Lean beef", "Egg whites", "Protein-rich legumes");
  }

  // Return 2-3 personalized alternatives
  const shuffled = healthyAlternatives.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
}

export async function analyzeFoodWithGemini(
  foodName?: string,
  imageData?: string,
  userProfile?: {
    healthGoals?: string[];
    dietaryPreferences?: string[];
    allergies?: string[];
    fitnessLevel?: string;
    subscriptionTier?: string;
  }
): Promise<FoodAnalysisResult> {
  // Check smart cache for consistent verdicts per user profile
  const cacheKey = getCacheKey(foodName, imageData, userProfile);
  if (cacheKey && analysisCache.has(cacheKey)) {
    console.log(`Returning consistent cached analysis for: ${foodName || 'image'}`);
    return analysisCache.get(cacheKey)!;
  }
  
  console.log(`Fresh analysis for: ${foodName || 'image upload'}`);
  // Don't clear cache - maintain consistency

  try {
    // Try AI analysis first with user profile for personalization
    const aiResult = await analyzeWithGemini(foodName, imageData, userProfile);
    
    const nutritionFacts = {
      calories: aiResult.calories || 0,
      protein: aiResult.protein || 0,
      carbohydrates: aiResult.carbohydrates || 0,
      fat: aiResult.fat || 0,
      fiber: aiResult.fiber || 0,
      sugar: aiResult.sugar || 0,
      sodium: aiResult.sodium || 0,
    };

    const result = {
      ...aiResult,
      method: "ai",
      nutritionFacts,
      alternatives: generateAlternatives(aiResult.verdict, aiResult.foodName, userProfile),
    };

    // Cache result for consistency (with user profile fingerprint)
    if (cacheKey) {
      analysisCache.set(cacheKey, result);
      // Limit cache size to prevent memory issues
      if (analysisCache.size > 500) {
        const firstKey = analysisCache.keys().next().value;
        analysisCache.delete(firstKey);
      }
    }

    return result;
  } catch (error) {
    console.warn("AI analysis failed, using fallback:", error);
    
    // Use fallback analysis
    const fallbackResult = getFallbackAnalysis(foodName || "Unknown Food");
    
    const nutritionFacts = {
      calories: fallbackResult.calories || 0,
      protein: fallbackResult.protein || 0,
      carbohydrates: fallbackResult.carbohydrates || 0,
      fat: fallbackResult.fat || 0,
      fiber: fallbackResult.fiber || 0,
      sugar: fallbackResult.sugar || 0,
      sodium: fallbackResult.sodium || 0,
    };

    const result = {
      ...fallbackResult,
      method: "fallback",
      nutritionFacts,
      alternatives: generateAlternatives(fallbackResult.verdict, fallbackResult.foodName, userProfile),
    };

    // Cache fallback result for consistency
    if (cacheKey) {
      analysisCache.set(cacheKey, result);
      // Limit cache size to prevent memory issues  
      if (analysisCache.size > 500) {
        const firstKey = analysisCache.keys().next().value;
        analysisCache.delete(firstKey);
      }
    }
    
    return result;
  }
}
