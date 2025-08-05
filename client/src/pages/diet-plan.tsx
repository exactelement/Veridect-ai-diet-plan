import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  Calendar, 
  ChefHat, 
  Coffee, 
  Salad, 
  Soup,
  Cookie,
  Scale,
  Plus,
  Minus,
  ShoppingCart,
  Edit,
  Check,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MealPlan {
  id: string;
  day: string;
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snack: string[];
  };
  completed: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snack: boolean;
  };
}

export default function DietPlan() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI nutrition assistant powered by science-backed recommendations. I can help you create personalized, healthy meal plans based on your health goals and preferences. Try asking me to 'update my breakfast with protein-rich foods' or 'create a weekly meal plan for weight loss'. What would you like to achieve with your diet?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Meal Plan State
  const [weeklyPlan, setWeeklyPlan] = useState<MealPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [currentWeight, setCurrentWeight] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");

  // Shopping List State
  const [shoppingList, setShoppingList] = useState<Record<string, { items: string[], quantities: Record<string, number> }>>({
    "Produce": { items: [], quantities: {} },
    "Dairy": { items: [], quantities: {} },
    "Meat & Fish": { items: [], quantities: {} },
    "Pantry": { items: [], quantities: {} },
    "Other": { items: [], quantities: {} }
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to AI
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Build conversation context from previous messages
      const context = messages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n');
      
      const response = await fetch('/api/diet/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403 && errorData.upgradeRequired) {
          toast({
            title: "Pro Feature Required",
            description: "Diet planning requires a Pro subscription. Upgrade to access AI nutrition assistance.",
            variant: "destructive"
          });
          setIsTyping(false);
          return;
        }
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      // Only update meal plan when user explicitly asks for it
      if ((inputMessage.toLowerCase().includes("update my") || 
           inputMessage.toLowerCase().includes("change my") ||
           inputMessage.toLowerCase().includes("modify my") ||
           inputMessage.toLowerCase().includes("add to my")) &&
          (data.response.includes("I'll update your") || 
           data.response.includes("Here's your new") ||
           data.response.includes("**"))) {
        // Extract meal type and update relevant plan
        const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
        const mentionedMealType = mealTypes.find(type => 
          inputMessage.toLowerCase().includes(type) || data.response.toLowerCase().includes(type)
        );
        
        if (mentionedMealType) {
          setTimeout(() => {
            updateMealPlanFromAI(data.response, mentionedMealType as "breakfast" | "lunch" | "dinner" | "snack");
          }, 500);
        }
      }
      
      // If AI suggests a full meal plan, generate it
      if (inputMessage.toLowerCase().includes("weekly plan") || inputMessage.toLowerCase().includes("meal plan")) {
        setTimeout(() => {
          generateWeeklyPlan();
        }, 500);
      }
      
    } catch (error) {
      setIsTyping(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive"
      });
    }
  };

  const generateAIResponse = (message: string): string => {
    // Simple response logic (replace with actual AI)
    if (message.toLowerCase().includes("weight") || message.toLowerCase().includes("lose")) {
      return "I understand you want to lose weight. I'll create a balanced meal plan with a moderate calorie deficit. Your plan will focus on high-protein, nutrient-dense foods to keep you satisfied while supporting your goals. Let me generate a weekly plan for you...";
    } else if (message.toLowerCase().includes("muscle") || message.toLowerCase().includes("gain")) {
      return "Great! For muscle gain, I'll create a meal plan with adequate protein and calories to support muscle growth. Each meal will include quality protein sources and complex carbohydrates. Let me prepare your weekly plan...";
    } else if (message.toLowerCase().includes("vegan") || message.toLowerCase().includes("vegetarian")) {
      return "Perfect! I'll create a plant-based meal plan that ensures you get all essential nutrients, including adequate protein, B12, iron, and omega-3s. Your meals will be diverse and delicious. Generating your weekly plan now...";
    }
    return "I'll help you create a personalized meal plan. Could you tell me more about your dietary preferences, any restrictions, and your main health goals?";
  };

  // Update specific meal plan from AI response
  const updateMealPlanFromAI = (aiResponse: string, mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    // Extract meal information from AI response
    const lines = aiResponse.split('\n');
    let mealName = "";
    let ingredients: string[] = [];
    
    // Look for meal name (usually in **bold** or after "Here's your new")
    for (const line of lines) {
      if (line.includes('**') && line.trim() !== '') {
        mealName = line.replace(/\*\*/g, '').trim();
        break;
      }
    }
    
    // Extract ingredients (lines that start with - or •)
    for (const line of lines) {
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        const ingredient = line.replace(/^[-•]\s*/, '').split(' - ')[0].trim();
        if (ingredient) {
          ingredients.push(ingredient);
        }
      }
    }
    
    // If we couldn't extract properly, use fallback
    if (!mealName || ingredients.length === 0) {
      mealName = `AI-Recommended ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`;
      ingredients = ["Check AI response above for details"];
    }
    
    // Update the weekly plan
    setWeeklyPlan(prev => {
      if (prev.length === 0) {
        // Initialize with basic plan if empty
        const newPlan = Array.from({ length: 7 }, (_, i) => ({
          day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
          meals: {
            breakfast: { name: 'Healthy Breakfast', ingredients: ['Oats', 'Berries', 'Nuts'] },
            lunch: { name: 'Balanced Lunch', ingredients: ['Lean protein', 'Vegetables', 'Whole grains'] },
            dinner: { name: 'Nutritious Dinner', ingredients: ['Fish/Chicken', 'Vegetables', 'Quinoa'] },
            snack: { name: 'Healthy Snack', ingredients: ['Fruits', 'Nuts'] }
          },
          completed: { breakfast: false, lunch: false, dinner: false, snack: false }
        }));
        
        // Update the specific meal type
        return newPlan.map(day => ({
          ...day,
          meals: {
            ...day.meals,
            [mealType]: { name: mealName, ingredients }
          }
        }));
      }
      
      // Update existing plan
      return prev.map(day => ({
        ...day,
        meals: {
          ...day.meals,
          [mealType]: { name: mealName, ingredients }
        }
      }));
    });
    
    // Show success toast
    toast({
      title: "Meal Plan Updated!",
      description: `Your ${mealType} plan has been updated with AI recommendations.`,
    });
  };

  const generateWeeklyPlan = () => {
    // Generate sample weekly plan
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const samplePlan = days.map((day, index) => ({
      id: `day-${index}`,
      day,
      meals: {
        breakfast: ["Oatmeal with berries", "Greek yogurt", "Whole grain toast"],
        lunch: ["Grilled chicken salad", "Quinoa bowl", "Mixed vegetables"],
        dinner: ["Salmon with asparagus", "Brown rice", "Side salad"],
        snack: ["Apple with almond butter", "Protein shake"]
      },
      completed: {
        breakfast: false,
        lunch: false,
        dinner: false,
        snack: false
      }
    }));
    setWeeklyPlan(samplePlan);
    updateShoppingList(samplePlan);
  };

  const updateShoppingList = (plan: MealPlan[]) => {
    // Generate shopping list from meal plan
    const newList = {
      "Produce": { 
        items: ["Berries", "Apples", "Asparagus", "Mixed salad greens"],
        quantities: { "Berries": 2, "Apples": 7, "Asparagus": 2, "Mixed salad greens": 3 }
      },
      "Dairy": { 
        items: ["Greek yogurt", "Almond butter"],
        quantities: { "Greek yogurt": 7, "Almond butter": 1 }
      },
      "Meat & Fish": { 
        items: ["Chicken breast", "Salmon fillets"],
        quantities: { "Chicken breast": 3, "Salmon fillets": 2 }
      },
      "Pantry": { 
        items: ["Oatmeal", "Quinoa", "Brown rice", "Whole grain bread"],
        quantities: { "Oatmeal": 1, "Quinoa": 1, "Brown rice": 1, "Whole grain bread": 1 }
      },
      "Other": { 
        items: ["Protein powder"],
        quantities: { "Protein powder": 1 }
      }
    };
    setShoppingList(newList);
  };

  const toggleMealCompletion = (dayId: string, mealType: keyof MealPlan["completed"]) => {
    setWeeklyPlan(prev => prev.map(day => 
      day.id === dayId 
        ? { ...day, completed: { ...day.completed, [mealType]: !day.completed[mealType] } }
        : day
    ));
  };

  const updateQuantity = (aisle: string, item: string, delta: number) => {
    setShoppingList(prev => ({
      ...prev,
      [aisle]: {
        ...prev[aisle],
        quantities: {
          ...prev[aisle].quantities,
          [item]: Math.max(0, (prev[aisle].quantities[item] || 0) + delta)
        }
      }
    }));
  };

  return (
    <div className="min-h-screen bg-ios-bg pt-20 pb-24">
      <div className="px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-ios-text">AI Diet Planning</h1>
              <p className="text-ios-secondary mt-1">Create personalized meal plans with AI assistance</p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Pro Feature
            </Badge>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* AI Chat Section */}
            <div className="bg-white rounded-2xl shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  AI Nutrition Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.role === "user" ? "text-purple-200" : "text-gray-500"
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="flex gap-2 mt-4">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !isTyping && sendMessage()}
                    placeholder="Ask about meal plans, nutrition advice, or say 'update my breakfast' to modify meals..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={isTyping || !inputMessage.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </div>

            {/* Weekly Meal Plan */}
            <div className="bg-white rounded-2xl shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Weekly Meal Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="breakfast" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="breakfast">
                      <Coffee className="w-4 h-4 mr-1" />
                      Breakfast
                    </TabsTrigger>
                    <TabsTrigger value="lunch">
                      <Salad className="w-4 h-4 mr-1" />
                      Lunch
                    </TabsTrigger>
                    <TabsTrigger value="dinner">
                      <Soup className="w-4 h-4 mr-1" />
                      Dinner
                    </TabsTrigger>
                    <TabsTrigger value="snack">
                      <Cookie className="w-4 h-4 mr-1" />
                      Snack
                    </TabsTrigger>
                  </TabsList>
                  
                  {(["breakfast", "lunch", "dinner", "snack"] as const).map((mealType) => (
                    <TabsContent key={mealType} value={mealType}>
                      <ScrollArea className="h-[350px]">
                        <div className="space-y-3">
                          {weeklyPlan.map((day) => (
                            <div key={day.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-800">{day.day}</h4>
                                <Checkbox
                                  checked={day.completed[mealType]}
                                  onCheckedChange={() => toggleMealCompletion(day.id, mealType)}
                                />
                              </div>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {day.meals[mealType].map((item, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <ChefHat className="w-3 h-3 text-purple-500" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>

                {/* Weight Tracking */}
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-800">Track Weight</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="kg/lbs"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        className="w-24"
                      />
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>

          {/* Shopping List */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  Smart Shopping List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(shoppingList).map(([aisle, { items, quantities }]) => (
                    <div key={aisle} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">{aisle}</h4>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{item}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateQuantity(aisle, item, -1)}
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {quantities[item] || 0}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateQuantity(aisle, item, 1)}
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Order Groceries Online
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}