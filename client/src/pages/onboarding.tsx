import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Heart, Target, ShieldCheck, Star, Zap, Crown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const onboardingSchema = z.object({
  calorieGoal: z.number().min(800, "Minimum 800 calories").max(5000, "Maximum 5000 calories").default(2000),
  dietaryPreferences: z.array(z.string()).default([]),
  healthGoals: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

const DIETARY_PREFERENCES = [
  "Vegetarian", "Vegan", "Keto", "Paleo", "Mediterranean", 
  "Low-carb", "Low-fat", "Gluten-free", "Dairy-free"
];

const HEALTH_GOALS = [
  "Weight loss", "Weight gain", "Muscle building", "Heart health",
  "Diabetes management", "Lower cholesterol", "More energy", "Better sleep"
];

const COMMON_ALLERGIES = [
  "Nuts", "Shellfish", "Dairy", "Eggs", "Soy", "Gluten", "Fish"
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      calorieGoal: 2000,
      dietaryPreferences: [],
      healthGoals: [],
      allergies: [],
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: OnboardingForm) => {
      await apiRequest("PUT", "/api/user/profile", {
        ...data,
        dietaryPreferences: data.dietaryPreferences,
        healthGoals: data.healthGoals,
        allergies: data.allergies,
        privacySettings: {
          shareDataForResearch: false,
          allowMarketing: false,
          shareWithHealthProviders: false
        }
      });
    },
    onSuccess: () => {
      // Move to subscription step after profile update
      setStep(4);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/user/complete-onboarding", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Setup Complete!",
        description: "Please review your privacy preferences to continue.",
      });
      // User stays here until GDPR banner interaction completes
    },
    onError: (error: Error) => {
      toast({
        title: "Error completing onboarding",
        description: error.message,
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const onSubmit = (data: OnboardingForm) => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      updateProfileMutation.mutate(data);
    }
  };

  const handleSubscriptionChoice = (tier: string) => {
    if (tier === 'pro') {
      // Set flag to redirect to subscription after GDPR banner completes
      setPendingSubscriptionUpgrade(true);
      localStorage.setItem('pending-pro-upgrade', 'true');
      completeOnboardingMutation.mutate();
    } else {
      // Set flag for free tier to redirect to food analysis after GDPR
      localStorage.setItem('pending-free-tier', 'true');
      completeOnboardingMutation.mutate();
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-ios-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                completeOnboardingMutation.mutate();
              }}
              disabled={completeOnboardingMutation.isPending}
              className="text-ios-secondary hover:text-ios-primary"
            >
              {completeOnboardingMutation.isPending ? "..." : "← Skip for now"}
            </Button>
            <div className="w-16 h-16 bg-gradient-to-br from-ios-blue to-health-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">Y</span>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to YesNoApp</CardTitle>
          <p className="text-ios-secondary">Let's personalize your nutrition journey</p>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-ios-secondary">Step {step} of 4</p>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Heart className="w-12 h-12 text-ios-blue mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
                    <p className="text-ios-secondary">This helps us provide personalized recommendations</p>
                  </div>
                  


                  <FormField
                    control={form.control}
                    name="calorieGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Calorie Goal</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="800"
                            max="5000"
                            step="50"
                            placeholder="2000"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 2000)}
                          />
                        </FormControl>
                        <p className="text-sm text-ios-secondary">
                          Set your daily calorie target based on your goals
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Target className="w-12 h-12 text-health-green mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">What are your health goals?</h2>
                    <p className="text-ios-secondary">Select all that apply to you</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="healthGoals"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 gap-4">
                          {HEALTH_GOALS.map((goal) => (
                            <FormField
                              key={goal}
                              control={form.control}
                              name="healthGoals"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(goal)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, goal])
                                          : field.onChange(field.value?.filter((value) => value !== goal));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {goal}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <ShieldCheck className="w-12 h-12 text-warning-orange mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Dietary preferences & allergies</h2>
                    <p className="text-ios-secondary">Help us keep you safe and satisfied</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Dietary Preferences</h3>
                    <FormField
                      control={form.control}
                      name="dietaryPreferences"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-2 gap-4">
                            {DIETARY_PREFERENCES.map((pref) => (
                              <FormField
                                key={pref}
                                control={form.control}
                                name="dietaryPreferences"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(pref)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, pref])
                                            : field.onChange(field.value?.filter((value) => value !== pref));
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {pref}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Allergies</h3>
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-2 gap-4">
                            {COMMON_ALLERGIES.map((allergy) => (
                              <FormField
                                key={allergy}
                                control={form.control}
                                name="allergies"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(allergy)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, allergy])
                                            : field.onChange(field.value?.filter((value) => value !== allergy));
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {allergy}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <ShieldCheck className="w-12 h-12 text-ios-blue mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Unlock your full potential!</h2>
                    <p className="text-ios-secondary">Choose the plan that fits your nutrition journey</p>
                  </div>

                  <div className="grid gap-4">
                    {/* Free Plan */}
                    <Card className="border-2 border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold">Free Plan</h3>
                            <p className="text-gray-600">Perfect to get started</p>
                          </div>
                          <div className="text-2xl font-bold">€0</div>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center"><span className="mr-2">✓</span>5 analyses per day</li>
                          <li className="flex items-center"><span className="mr-2">✓</span>Basic nutritional info</li>
                          <li className="flex items-center"><span className="mr-2">✓</span>Simple yes/no verdicts</li>
                        </ul>
                        <Button 
                          type="button"
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={() => handleSubscriptionChoice('free')}
                          disabled={completeOnboardingMutation.isPending}
                        >
                          Continue with Free
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="border-2 border-ios-blue bg-blue-50">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-ios-blue">Pro Plan</h3>
                            <p className="text-blue-600">Most popular choice</p>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-ios-blue">€1</div>
                            <div className="text-xs text-blue-600">per month, billed annually</div>
                          </div>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center"><span className="mr-2">✓</span>Unlimited analyses</li>
                          <li className="flex items-center"><span className="mr-2">✓</span>Food logging & progress</li>
                          <li className="flex items-center"><span className="mr-2">✓</span>Challenges & leaderboard</li>
                          <li className="flex items-center"><span className="mr-2">✓</span>Personalized AI analysis</li>
                        </ul>
                        <Button 
                          type="button"
                          className="w-full mt-4 bg-ios-blue hover:bg-blue-600"
                          onClick={() => handleSubscriptionChoice('pro')}
                          disabled={completeOnboardingMutation.isPending}
                        >
                          {completeOnboardingMutation.isPending ? "Setting up..." : "Upgrade to Pro"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="text-center">
                    <button 
                      type="button"
                      className="text-sm text-gray-500 underline"
                      onClick={() => completeOnboardingMutation.mutate()}
                      disabled={completeOnboardingMutation.isPending}
                    >
                      I'll decide later
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                {step > 1 && step < 4 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
                {step < 4 && (
                  <Button
                    type="submit"
                    className="ml-auto bg-ios-blue text-white"
                    disabled={updateProfileMutation.isPending || completeOnboardingMutation.isPending}
                  >
                    {step === 3 ? "Continue" : "Continue"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
