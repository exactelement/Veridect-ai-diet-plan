import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ChevronRight, Sparkles, Shield, Brain, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Veridect",
    description: "Your AI-powered nutrition companion",
    icon: <Sparkles className="w-8 h-8" />
  },
  {
    id: "suitability",
    title: "Is Veridect Right for You?",
    description: "Let's find out with a quick quiz",
    icon: <Brain className="w-8 h-8" />
  },
  {
    id: "personalization",
    title: "Personalize Your Experience",
    description: "Tell us about your health goals",
    icon: <Heart className="w-8 h-8" />
  },
  {
    id: "features",
    title: "Unlock Premium Features",
    description: "See what Pro can do for you",
    icon: <Shield className="w-8 h-8" />
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [suitabilityScore, setSuitabilityScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [personalizationData, setPersonalizationData] = useState({
    healthGoals: [] as string[],
    dietaryRestrictions: [] as string[],
    fitnessLevel: "",
    age: "",
    weight: "",
    height: ""
  });
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/user/onboarding", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Veridect!",
        description: "Your profile has been set up successfully.",
        duration: 3000,
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Error",
        description: error.message,
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleSuitabilityQuiz = (question: string, answer: string) => {
    const newAnswers = { ...quizAnswers, [question]: answer };
    setQuizAnswers(newAnswers);
    
    // Simple scoring logic
    let score = 0;
    if (newAnswers.healthConscious === "yes") score += 25;
    if (newAnswers.trackFood === "yes") score += 25;
    if (newAnswers.dietGoals === "yes") score += 25;
    if (newAnswers.techComfortable === "yes") score += 25;
    
    setSuitabilityScore(score);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome to Veridect</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Your AI-powered nutrition companion that brings awareness to healthier eating, one photo at a time.
            </p>
            <div className="space-y-3 max-w-sm mx-auto">
              <div className="flex items-center gap-3 text-left">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Instant food analysis with AI</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Clear Yes/OK/No verdicts</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Personalized recommendations</span>
              </div>
            </div>
          </div>
        );

      case 1: // Suitability Quiz
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Is Veridect Right for You?</h2>
              <p className="text-gray-600">Answer a few quick questions to find out</p>
            </div>
            
            <div className="space-y-6">
              {/* Question 1 */}
              <div className="space-y-3">
                <p className="font-medium text-gray-700">Are you interested in making healthier food choices?</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={quizAnswers.healthConscious === "yes" ? "default" : "outline"}
                    onClick={() => handleSuitabilityQuiz("healthConscious", "yes")}
                  >
                    Yes, definitely!
                  </Button>
                  <Button
                    variant={quizAnswers.healthConscious === "no" ? "default" : "outline"}
                    onClick={() => handleSuitabilityQuiz("healthConscious", "no")}
                  >
                    Not really
                  </Button>
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-3">
                <p className="font-medium text-gray-700">Do you currently track what you eat?</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={quizAnswers.trackFood === "yes" ? "default" : "outline"}
                    onClick={() => handleSuitabilityQuiz("trackFood", "yes")}
                  >
                    Yes, I do
                  </Button>
                  <Button
                    variant={quizAnswers.trackFood === "no" ? "default" : "outline"}
                    onClick={() => handleSuitabilityQuiz("trackFood", "no")}
                  >
                    No, I don't
                  </Button>
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-3">
                <p className="font-medium text-gray-700">Do you have specific dietary goals?</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={quizAnswers.dietGoals === "yes" ? "default" : "outline"}
                    onClick={() => handleSuitabilityQuiz("dietGoals", "yes")}
                  >
                    Yes, I have goals
                  </Button>
                  <Button
                    variant={quizAnswers.dietGoals === "no" ? "default" : "outline"}
                    onClick={() => handleSuitabilityQuiz("dietGoals", "no")}
                  >
                    Just curious
                  </Button>
                </div>
              </div>

              {/* Question 4 */}
              <div className="space-y-3">
                <p className="font-medium text-gray-700">Are you comfortable using AI technology?</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={quizAnswers.techComfortable === "yes" ? "default" : "outline"}
                    onClick={() => handleSuitabilityQuiz("techComfortable", "yes")}
                  >
                    Yes, love it!
                  </Button>
                  <Button
                    variant={quizAnswers.techComfortable === "no" ? "default" : "outline"}
                    onClick={() => handleSuitabilityQuiz("techComfortable", "no")}
                  >
                    Not really
                  </Button>
                </div>
              </div>
            </div>

            {/* Results */}
            {Object.keys(quizAnswers).length === 4 && (
              <Card className={`mt-6 ${suitabilityScore >= 75 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    {suitabilityScore >= 75 ? "Perfect Match! 🎉" : "Let's Give It a Try! 🌟"}
                  </h3>
                  <p className="text-gray-700">
                    {suitabilityScore >= 75 
                      ? "Veridect is ideal for your health journey. You'll love the personalized insights!"
                      : "While you might be new to health tracking, Veridect makes it easy and fun to start!"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2: // Basic Personalization
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Let's Personalize Your Experience</h2>
              <p className="text-gray-600">Tell us about your health goals</p>
            </div>

            {/* Health Goals */}
            <div className="space-y-3">
              <p className="font-medium text-gray-700">What are your main health goals?</p>
              <div className="grid grid-cols-2 gap-3">
                {["Lose weight", "Gain muscle", "Eat healthier", "More energy", "Better sleep", "Manage condition"].map((goal) => (
                  <Button
                    key={goal}
                    variant={personalizationData.healthGoals.includes(goal) ? "default" : "outline"}
                    onClick={() => {
                      const goals = personalizationData.healthGoals.includes(goal)
                        ? personalizationData.healthGoals.filter(g => g !== goal)
                        : [...personalizationData.healthGoals, goal];
                      setPersonalizationData({ ...personalizationData, healthGoals: goals });
                    }}
                    className="text-sm"
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-3">
              <p className="font-medium text-gray-700">Any dietary restrictions?</p>
              <div className="grid grid-cols-2 gap-3">
                {["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Keto", "None"].map((diet) => (
                  <Button
                    key={diet}
                    variant={personalizationData.dietaryRestrictions.includes(diet) ? "default" : "outline"}
                    onClick={() => {
                      if (diet === "None") {
                        setPersonalizationData({ ...personalizationData, dietaryRestrictions: [] });
                      } else {
                        const restrictions = personalizationData.dietaryRestrictions.includes(diet)
                          ? personalizationData.dietaryRestrictions.filter(d => d !== diet)
                          : [...personalizationData.dietaryRestrictions.filter(d => d !== "None"), diet];
                        setPersonalizationData({ ...personalizationData, dietaryRestrictions: restrictions });
                      }
                    }}
                    className="text-sm"
                  >
                    {diet}
                  </Button>
                ))}
              </div>
            </div>

            {/* Fitness Level */}
            <div className="space-y-3">
              <p className="font-medium text-gray-700">How would you describe your fitness level?</p>
              <div className="grid grid-cols-3 gap-3">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <Button
                    key={level}
                    variant={personalizationData.fitnessLevel === level ? "default" : "outline"}
                    onClick={() => setPersonalizationData({ ...personalizationData, fitnessLevel: level })}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Pro Features
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Unlock Your Full Potential</h2>
              <p className="text-gray-600">See what Veridect Pro can do for you</p>
            </div>

            <div className="space-y-4">
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-purple-800 mb-3">Veridect Pro Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">Unlimited food analyses per day</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">Personalized AI diet plans</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">Weekly challenges & leaderboard</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">Detailed nutrition tracking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">Smart shopping lists</span>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-2xl font-bold text-purple-800">€1/month</p>
                    <p className="text-sm text-purple-600">Billed annually (€12/year)</p>
                    <Button 
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                      onClick={() => navigate("/subscription")}
                    >
                      Start Pro Trial
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => handleComplete()}
              >
                Continue with Free Version
              </Button>
            </div>
          </div>
        );
    }
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    saveMutation.mutate({
      suitabilityScore,
      ...personalizationData,
      completedOnboarding: true
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return Object.keys(quizAnswers).length === 4;
      case 2: return personalizationData.healthGoals.length > 0 && personalizationData.fitnessLevel;
      case 3: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen veridect-gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={(currentStep + 1) / onboardingSteps.length * 100} className="h-2" />
          <div className="flex justify-between mt-4">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStep ? "text-purple-600" : "text-gray-400"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentStep ? "bg-purple-600 text-white" : "bg-gray-200"
                }`}>
                  {step.icon}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {renderStepContent()}
            
            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              {currentStep < onboardingSteps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || saveMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={saveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saveMutation.isPending ? "Setting up..." : "Get Started"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}