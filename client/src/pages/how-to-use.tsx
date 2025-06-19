import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Type, CheckCircle, Target, TrendingUp, Crown, Shield, Play, ChevronRight } from "lucide-react";

const TUTORIAL_STEPS = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Play className="w-6 h-6" />,
    description: "Learn the basics of food analysis",
    steps: [
      {
        title: "Create Your Account",
        description: "Sign up with your preferred method - email, Google, or GitHub.",
        tips: ["Use a valid email for important updates", "Complete your profile for personalized recommendations"]
      },
      {
        title: "Complete Onboarding",
        description: "Tell us about your health goals, dietary preferences, and any allergies.",
        tips: ["Be honest about your goals for better recommendations", "You can update these preferences anytime"]
      },
      {
        title: "Choose Your Plan",
        description: "Start with the free plan or upgrade for advanced features.",
        tips: ["Free plan includes 5 daily analyses", "Pro/Medical plans offer unlimited usage"]
      }
    ]
  },
  {
    id: "food-analysis",
    title: "Food Analysis",
    icon: <Camera className="w-6 h-6" />,
    description: "Master the three ways to analyze food",
    steps: [
      {
        title: "Photo Analysis",
        description: "Take a clear photo of your food for instant AI analysis.",
        tips: [
          "Ensure good lighting for best results",
          "Include the entire meal in frame",
          "Avoid shadows and reflections",
          "Get close enough to see details"
        ]
      },
      {
        title: "Upload Images",
        description: "Upload existing photos from your gallery.",
        tips: [
          "Recent photos work best",
          "High resolution images improve accuracy",
          "Multiple angles can help identification"
        ]
      },
      {
        title: "Text Descriptions",
        description: "Describe your food when photos aren't available.",
        tips: [
          "Be specific about ingredients",
          "Include cooking methods",
          "Mention portion sizes",
          "Add brand names for packaged foods"
        ]
      }
    ]
  },
  {
    id: "understanding-verdicts",
    title: "Understanding Verdicts",
    icon: <CheckCircle className="w-6 h-6" />,
    description: "Learn what YES, NO, and OK mean",
    steps: [
      {
        title: "YES Verdicts",
        description: "Green checkmark means this food aligns with your health goals.",
        tips: [
          "High in nutrients your body needs",
          "Fits your dietary preferences",
          "Supports your health objectives",
          "Generally unprocessed or minimally processed"
        ]
      },
      {
        title: "NO Verdicts",
        description: "Red X means this food doesn't support your goals.",
        tips: [
          "High in unhealthy fats, sugar, or sodium",
          "Highly processed ingredients",
          "Conflicts with your dietary restrictions",
          "May hinder your health progress"
        ]
      },
      {
        title: "OK Verdicts",
        description: "Orange triangle means this food is acceptable in moderation.",
        tips: [
          "Not the healthiest option, but not harmful",
          "Can be part of a balanced diet occasionally",
          "Consider portion control",
          "Pair with healthier foods"
        ]
      }
    ]
  },
  {
    id: "tracking-progress",
    title: "Tracking Progress",
    icon: <TrendingUp className="w-6 h-6" />,
    description: "Monitor your nutrition journey",
    steps: [
      {
        title: "Daily Dashboard",
        description: "View today's food choices and health score.",
        tips: [
          "Aim for more YES choices than NO",
          "Track your daily calorie intake",
          "Monitor nutrition balance",
          "Review your daily score"
        ]
      },
      {
        title: "Weekly Leaderboard",
        description: "See how you rank among other users.",
        tips: [
          "Compete with friends for motivation",
          "YES choices earn the most points",
          "Consistency improves your ranking",
          "Rankings reset weekly"
        ]
      },
      {
        title: "Food History",
        description: "Review all your past analyses and learn from patterns.",
        tips: [
          "Identify recurring unhealthy choices",
          "Track improvements over time",
          "Export data for healthcare providers",
          "Use insights to adjust your diet"
        ]
      }
    ]
  }
];

const TIER_FEATURES = [
  {
    tier: "Free",
    icon: <Target className="w-5 h-5" />,
    color: "gray",
    features: [
      "5 food analyses per day",
      "Basic YES/NO/OK verdicts",
      "Simple explanations",
      "Community leaderboard",
      "Basic nutrition information"
    ]
  },
  {
    tier: "Pro",
    icon: <Crown className="w-5 h-5" />,
    color: "blue",
    features: [
      "Unlimited food analyses",
      "Detailed nutrition tracking",
      "Goal-based recommendations",
      "Weekly progress reports",
      "Wearables integration",
      "Priority support",
      "Advanced analytics",
      "Custom meal planning"
    ]
  },
  {
    tier: "Medical",
    icon: <Shield className="w-5 h-5" />,
    color: "green",
    features: [
      "Medical-grade analysis",
      "Certified nutritionist access",
      "Healthcare provider integration",
      "Medication interaction alerts",
      "HIPAA compliance",
      "Personal health coaching",
      "Lab results integration",
      "Prescription diet plans"
    ]
  }
];

export default function HowToUse() {
  const [activeStep, setActiveStep] = useState("getting-started");

  const currentStep = TUTORIAL_STEPS.find(step => step.id === activeStep);

  return (
    <div className="pt-20 pb-8 container-padding">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">How to Use YesNoApp</h1>
          <p className="text-xl text-ios-secondary">
            Master your nutrition journey with our comprehensive guide
          </p>
        </div>

        {/* Quick Start Video */}
        <Card className="bg-gradient-to-br from-ios-blue to-health-green text-white">
          <CardContent className="p-8 text-center">
            <Play className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Quick Start Video</h2>
            <p className="text-white/90 mb-6">
              Watch our 2-minute tutorial to get started immediately
            </p>
            <Button className="bg-white text-ios-blue hover:bg-white/90">
              Watch Tutorial
            </Button>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tutorial Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TUTORIAL_STEPS.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeStep === step.id
                        ? "bg-ios-blue text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`${activeStep === step.id ? "text-white" : "text-ios-blue"}`}>
                        {step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{step.title}</div>
                        <div className={`text-sm truncate ${
                          activeStep === step.id ? "text-white/80" : "text-ios-secondary"
                        }`}>
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Step Content */}
          <div className="lg:col-span-3">
            {currentStep && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="text-ios-blue">{currentStep.icon}</div>
                    <div>
                      <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
                      <p className="text-ios-secondary">{currentStep.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentStep.steps.map((step, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-ios-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
                          <p className="text-ios-secondary mb-4">{step.description}</p>
                          
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">💡 Pro Tips:</h5>
                            <ul className="space-y-1">
                              {step.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="text-sm text-ios-secondary flex items-start space-x-2">
                                  <ChevronRight className="w-4 h-4 text-health-green mt-0.5 flex-shrink-0" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Feature Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Features by Plan</CardTitle>
            <p className="text-ios-secondary">
              Choose the plan that best fits your health journey
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {TIER_FEATURES.map((tier) => (
                <div key={tier.tier} className="border rounded-lg p-6">
                  <div className="text-center mb-6">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                      tier.color === "blue" ? "bg-ios-blue text-white" :
                      tier.color === "green" ? "bg-health-green text-white" :
                      "bg-gray-200 text-gray-600"
                    }`}>
                      {tier.icon}
                    </div>
                    <h3 className="text-xl font-bold">{tier.tier}</h3>
                  </div>
                  
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-health-green mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips for Best Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Photography Tips</h4>
                <ul className="space-y-3 text-sm text-ios-secondary">
                  <li className="flex items-start space-x-2">
                    <Camera className="w-4 h-4 text-ios-blue mt-1 flex-shrink-0" />
                    <span>Use natural lighting when possible</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Camera className="w-4 h-4 text-ios-blue mt-1 flex-shrink-0" />
                    <span>Capture the entire meal in frame</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Camera className="w-4 h-4 text-ios-blue mt-1 flex-shrink-0" />
                    <span>Take photos at a slight angle, not directly overhead</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Camera className="w-4 h-4 text-ios-blue mt-1 flex-shrink-0" />
                    <span>Include utensils or hands for size reference</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Description Tips</h4>
                <ul className="space-y-3 text-sm text-ios-secondary">
                  <li className="flex items-start space-x-2">
                    <Type className="w-4 h-4 text-health-green mt-1 flex-shrink-0" />
                    <span>Include cooking methods (grilled, fried, steamed)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Type className="w-4 h-4 text-health-green mt-1 flex-shrink-0" />
                    <span>Mention sauces, dressings, and seasonings</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Type className="w-4 h-4 text-health-green mt-1 flex-shrink-0" />
                    <span>Specify portion sizes when known</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Type className="w-4 h-4 text-health-green mt-1 flex-shrink-0" />
                    <span>Include brand names for packaged foods</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">How accurate is the AI analysis?</h4>
              <p className="text-ios-secondary">
                Our AI achieves 95% accuracy in food identification and provides nutritional estimates 
                based on extensive databases and visual analysis. However, always verify critical 
                nutritional information for medical purposes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Can I edit the analysis results?</h4>
              <p className="text-ios-secondary">
                Yes! You can manually adjust portion sizes, add missing ingredients, or correct 
                misidentified foods. This helps improve future analyses and ensures accuracy.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">What if the app doesn't recognize my food?</h4>
              <p className="text-ios-secondary">
                Try describing the food in text or taking another photo with better lighting. 
                For unique or cultural dishes, our AI learns from user feedback to improve recognition.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">How do I track progress over time?</h4>
              <p className="text-ios-secondary">
                Visit your profile to see your complete food history, weekly scores, and health trends. 
                Pro users get detailed analytics and can export data for healthcare providers.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Get Help */}
        <Card className="bg-ios-blue/5 border-ios-blue/20">
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ios-secondary mb-4">
              Still have questions? Our support team is here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-ios-blue text-white">
                Contact Support
              </Button>
              <Button variant="outline">
                Join Community
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
