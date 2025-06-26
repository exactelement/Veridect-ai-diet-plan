import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Settings, History, ChevronDown, ChevronRight, Heart, Monitor, Calendar, Edit, Lock, AlertCircle, XCircle, Loader2, Crown, Mail, Shield, CheckCircle } from "lucide-react";
import { updateUserProfileSchema } from "@shared/schema";
import type { UpdateUserProfile, FoodLog } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { checkTierAccess } from "@/components/subscription-check";
import { z } from "zod";

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

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => {
  return data.newPassword === data.confirmPassword;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;
type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;

// Email Preferences Component
function EmailPreferencesSection({ user }: { user: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Initialize preferences from user's GDPR consent data
  const [preferences, setPreferences] = useState(() => ({
    nutritionInsightsEmails: user.gdprConsent?.nutritionEmails || user.gdprConsent?.nutritionInsightsEmails || false,
    improveAIRecommendations: user.gdprConsent?.aiImprovement || user.gdprConsent?.improveAIRecommendations || false,
    anonymousUsageAnalytics: user.gdprConsent?.analytics || user.gdprConsent?.anonymousUsageAnalytics || false,
    marketingEmails: user.gdprConsent?.marketing || user.gdprConsent?.marketingEmails || false,
  }));

  // Update local state when user data changes
  useEffect(() => {
    setPreferences({
      nutritionInsightsEmails: user.gdprConsent?.nutritionEmails || user.gdprConsent?.nutritionInsightsEmails || false,
      improveAIRecommendations: user.gdprConsent?.aiImprovement || user.gdprConsent?.improveAIRecommendations || false,
      anonymousUsageAnalytics: user.gdprConsent?.analytics || user.gdprConsent?.anonymousUsageAnalytics || false,
      marketingEmails: user.gdprConsent?.marketing || user.gdprConsent?.marketingEmails || false,
    });
  }, [user.gdprConsent]);

  const updateEmailPreferences = useMutation({
    mutationFn: async (newPreferences: any) => {
      // Map profile preferences to unified GDPR format
      const gdprData = {
        essential: true, // Always true
        analytics: newPreferences.anonymousUsageAnalytics,
        marketing: newPreferences.marketingEmails,
        aiImprovement: newPreferences.improveAIRecommendations,
        nutritionEmails: newPreferences.nutritionInsightsEmails,
        // Keep both field names for compatibility
        nutritionInsightsEmails: newPreferences.nutritionInsightsEmails,
        improveAIRecommendations: newPreferences.improveAIRecommendations,
        anonymousUsageAnalytics: newPreferences.anonymousUsageAnalytics,
        marketingEmails: newPreferences.marketingEmails,
        timestamp: new Date().toISOString(),
        version: "1.0",
      };

      return await apiRequest("POST", "/api/user/gdpr-consent", {
        consent: gdprData,
        hasSeenGdprBanner: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Email Preferences Updated",
        description: "Your email preferences have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update email preferences.",
        variant: "destructive",
      });
    },
  });

  const handlePreferenceChange = (key: string, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    updateEmailPreferences.mutate(newPreferences);
  };

  return (
    <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-ios-text">Weekly Nutrition Insights</h3>
              <p className="text-sm text-ios-secondary mt-1">
                Receive weekly progress summaries, nutrition tips, and personalized insights based on your food analysis
              </p>
            </div>
            <Switch
              checked={preferences.nutritionInsightsEmails}
              onCheckedChange={(checked) => handlePreferenceChange('nutritionInsightsEmails', checked)}
              disabled={updateEmailPreferences.isPending}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-ios-text">AI Improvement Participation</h3>
              <p className="text-sm text-ios-secondary mt-1">
                Help improve our AI by sharing anonymized food analysis data to enhance accuracy for everyone
              </p>
            </div>
            <Switch
              checked={preferences.improveAIRecommendations}
              onCheckedChange={(checked) => handlePreferenceChange('improveAIRecommendations', checked)}
              disabled={updateEmailPreferences.isPending}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-ios-text">Usage Analytics</h3>
              <p className="text-sm text-ios-secondary mt-1">
                Allow anonymous usage data collection to help us improve app performance and user experience
              </p>
            </div>
            <Switch
              checked={preferences.anonymousUsageAnalytics}
              onCheckedChange={(checked) => handlePreferenceChange('anonymousUsageAnalytics', checked)}
              disabled={updateEmailPreferences.isPending}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-ios-text">Marketing Communications</h3>
              <p className="text-sm text-ios-secondary mt-1">
                Receive promotional emails about new features, special offers, and Veridect updates
              </p>
            </div>
            <Switch
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
              disabled={updateEmailPreferences.isPending}
            />
          </div>
        </div>

        <div className="bg-ios-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-ios-text mb-2">Email Unsubscribe Options</h4>
          <div className="text-sm text-ios-secondary space-y-2">
            <p>• You can re-enable emails anytime by returning to this page</p>
            <p>• For email support, contact: <span className="text-ios-blue">info@veridect.com</span></p>
          </div>
        </div>

        {updateEmailPreferences.isPending && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-ios-secondary">
              <div className="animate-spin w-4 h-4 border-2 border-ios-blue border-t-transparent rounded-full" />
              <span>Updating preferences...</span>
            </div>
          </div>
        )}
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch subscription status with optimized polling
  const { data: subscriptionStatus } = useQuery({
    queryKey: ["/api/subscription/status"],
    enabled: !!user && user.subscriptionTier === 'pro',
    refetchInterval: 300000, // Refresh every 5 minutes instead of 30 seconds
    staleTime: 240000, // Consider data fresh for 4 minutes
  });
  const userTier = user?.subscriptionTier || 'free';
  const hasProAccess = checkTierAccess(userTier, 'pro', user?.email);

  // Scroll to top when navigating to profile
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Collapsible section states
  const [personalOpen, setPersonalOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const [interfaceOpen, setInterfaceOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // App interface preferences - derive directly from user data instead of local state
  const privacySettings = (user as any)?.privacySettings;
  const showCalories = privacySettings?.showCalorieCounter === undefined ? true : privacySettings.showCalorieCounter;
  const participateInChallenge = privacySettings?.participateInWeeklyChallenge === undefined ? true : privacySettings.participateInWeeklyChallenge;
  const showFoodStats = privacySettings?.showFoodStats === undefined ? true : privacySettings.showFoodStats;

  const { data: foodLogs = [], isLoading: logsLoading } = useQuery<FoodLog[]>({
    queryKey: ["/api/food/logs"],
  });

  // Personal information form (name and email only)
  const personalForm = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  // Password change form (separate)
  const passwordForm = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Personalization form
  const personalizationForm = useForm<UpdateUserProfile>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      dietaryPreferences: user?.dietaryPreferences || [],
      healthGoals: user?.healthGoals || [],
      allergies: user?.allergies || [],
      calorieGoal: user?.calorieGoal || 2000,
    },
  });

  const updatePersonalMutation = useMutation({
    mutationFn: async (data: PersonalInfoForm) => {
      // Update basic info only
      await apiRequest("PUT", "/api/user/profile", {
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      // Update email if changed (future feature)
      if (data.email !== user?.email) {
        // This would trigger email verification in real implementation
        toast({
          title: "Email Change Requested",
          description: "Email verification feature coming soon",
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Personal Information Updated",
        description: "Your changes have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Don't reset form to preserve user input
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChangeForm) => {
      await apiRequest("POST", "/api/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Password Change Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePersonalizationMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile) => {
      await apiRequest("PUT", "/api/user/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Your health goals and preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateInterfaceMutation = useMutation({
    mutationFn: async (preferences: { showCalorieCounter: boolean; participateInWeeklyChallenge: boolean; showFoodStats: boolean }) => {
      const updatedSettings = {
        privacySettings: {
          ...((user as any)?.privacySettings || {}),
          ...preferences,
        },
      };

      await apiRequest("PUT", "/api/user/profile", updatedSettings);
    },
    onSuccess: async (data, variables) => {
      toast({
        title: "Interface Updated",
        description: "Your display preferences have been saved.",
        duration: 3000, // Auto-dismiss after 3 seconds
      });
      
      // Invalidate user data and leaderboard queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/weekly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/my-score"] });
    },
    onError: (error: Error, variables) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  // Cancel subscription mutation
  const cancelSubscription = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/subscription/cancel");
    },
    onSuccess: () => {
      toast({
        title: "Cancellation Scheduled",
        description: "Your subscription will be cancelled at the end of your billing period. You'll retain Pro access until then.",
      });
      // Force refetch both user data and subscription status
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
      queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      queryClient.refetchQueries({ queryKey: ["/api/subscription/status"] });
      setShowCancelDialog(false);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to cancel subscription.";
      toast({
        title: "Cancellation Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onPersonalSubmit = (data: PersonalInfoForm) => {
    updatePersonalMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordChangeForm) => {
    changePasswordMutation.mutate(data);
  };

  const onPersonalizationSubmit = (data: UpdateUserProfile) => {
    updatePersonalizationMutation.mutate(data);
  };

  // Group food logs by date
  const groupedLogs = foodLogs.reduce((acc: Record<string, FoodLog[]>, log) => {
    const date = new Date(log.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-bg via-white to-ios-gray-50 pt-20 pb-24">
      <div className="container-padding">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Profile Header */}
          <Card className="bg-white/80 backdrop-blur-sm border border-ios-separator">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.profileImageUrl || ""} />
                  <AvatarFallback className="bg-ios-blue text-white text-xl">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-ios-text">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-ios-secondary">{user.email}</p>
                  {user.subscriptionTier && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-ios-blue text-white">
                        {user.subscriptionTier.toUpperCase()} Plan
                      </Badge>
                      {user.subscriptionTier === 'pro' && (
                        <div className="flex items-center gap-2">
                          {(user as any).subscriptionStatus === 'cancelling' ? (
                            <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                              ⚠️ Cancelled - Access until period end
                            </Badge>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowCancelDialog(true)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 h-8"
                              disabled={(user as any).subscriptionStatus === 'cancelling'}
                            >
                              {(user as any).subscriptionStatus === 'cancelling' ? 'Cancellation Scheduled' : 'Cancel Subscription'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Dropdown */}
          <Card className="bg-white/80 backdrop-blur-sm border border-ios-separator">
            <Collapsible open={personalOpen} onOpenChange={setPersonalOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-ios-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-ios-blue" />
                      <span>Personal Information</span>
                    </div>
                    {personalOpen ? (
                      <ChevronDown className="w-5 h-5 text-ios-secondary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-ios-secondary" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Form {...personalForm}>
                    <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={personalForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                                    field.onChange(capitalized);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={personalForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                                    field.onChange(capitalized);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={personalForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                            <p className="text-sm text-ios-secondary">
                              Email verification will be required for changes
                            </p>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-ios-blue hover:bg-ios-blue-dark text-white"
                        disabled={updatePersonalMutation.isPending}
                      >
                        {updatePersonalMutation.isPending ? "Updating..." : "Update Personal Info"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Password Change Section (Separate Form) */}
          <Card className="bg-white/80 backdrop-blur-sm border border-ios-separator">
            <Collapsible open={passwordOpen} onOpenChange={setPasswordOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-ios-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-ios-blue" />
                      <span>Change Password</span>
                    </div>
                    {passwordOpen ? (
                      <ChevronDown className="w-5 h-5 text-ios-secondary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-ios-secondary" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-ios-blue hover:bg-ios-blue-dark text-white"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Email Preferences Dropdown - Available to All Users */}
          <Card className="bg-white/80 backdrop-blur-sm border border-ios-separator">
            <Collapsible open={emailOpen} onOpenChange={setEmailOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-ios-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-ios-blue" />
                      <span>Email Preferences</span>
                    </div>
                    {emailOpen ? (
                      <ChevronDown className="w-5 h-5 text-ios-secondary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-ios-secondary" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <EmailPreferencesSection user={user} />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Personalization Dropdown */}
          <Card className={`bg-white/80 backdrop-blur-sm border border-ios-separator ${!hasProAccess ? 'opacity-50' : ''}`}>
            <Collapsible open={personalizationOpen} onOpenChange={hasProAccess ? setPersonalizationOpen : undefined}>
              <CollapsibleTrigger asChild>
                <CardHeader className={`cursor-pointer hover:bg-ios-gray-50 transition-colors ${!hasProAccess ? 'pointer-events-none' : ''}`}>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Heart className={`w-5 h-5 ${hasProAccess ? 'text-ios-blue' : 'text-gray-600'}`} />
                      <span className={hasProAccess ? '' : 'text-gray-600'}>Personalization</span>
                      {!hasProAccess && <Lock className="w-4 h-4 text-gray-400 ml-2" />}
                    </div>
                    {hasProAccess && (personalizationOpen ? (
                      <ChevronDown className="w-5 h-5 text-ios-secondary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-ios-secondary" />
                    ))}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Form {...personalizationForm}>
                    <form onSubmit={personalizationForm.handleSubmit(onPersonalizationSubmit)} className="space-y-6">
                      
                      {/* Calorie Goal */}
                      <FormField
                        control={personalizationForm.control}
                        name="calorieGoal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Daily Calorie Goal</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="800"
                                max="5000"
                                step="50"
                                placeholder="2000"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <p className="text-sm text-ios-secondary">
                              Recommended range: 1200-3000 calories per day
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Health Goals */}
                      <FormField
                        control={personalizationForm.control}
                        name="healthGoals"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Health Goals</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                              {HEALTH_GOALS.map((goal) => (
                                <div key={goal} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`goal-${goal}`}
                                    checked={field.value?.includes(goal)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...(field.value || []), goal]);
                                      } else {
                                        field.onChange(field.value?.filter((g) => g !== goal));
                                      }
                                    }}
                                  />
                                  <label htmlFor={`goal-${goal}`} className="text-sm">
                                    {goal}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Dietary Preferences */}
                      <FormField
                        control={personalizationForm.control}
                        name="dietaryPreferences"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Dietary Preferences</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                              {DIETARY_PREFERENCES.map((pref) => (
                                <div key={pref} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`pref-${pref}`}
                                    checked={field.value?.includes(pref)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...(field.value || []), pref]);
                                      } else {
                                        field.onChange(field.value?.filter((p) => p !== pref));
                                      }
                                    }}
                                  />
                                  <label htmlFor={`pref-${pref}`} className="text-sm">
                                    {pref}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Allergies */}
                      <FormField
                        control={personalizationForm.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Allergies & Restrictions</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                              {COMMON_ALLERGIES.map((allergy) => (
                                <div key={allergy} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`allergy-${allergy}`}
                                    checked={field.value?.includes(allergy)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...(field.value || []), allergy]);
                                      } else {
                                        field.onChange(field.value?.filter((a) => a !== allergy));
                                      }
                                    }}
                                  />
                                  <label htmlFor={`allergy-${allergy}`} className="text-sm">
                                    {allergy}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-ios-blue hover:bg-ios-blue/90"
                        disabled={updatePersonalizationMutation.isPending}
                      >
                        {updatePersonalizationMutation.isPending ? "Saving..." : "Save Preferences"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* App Interface Dropdown */}
          <Card className={`bg-white/80 backdrop-blur-sm border border-ios-separator ${!hasProAccess ? 'opacity-50' : ''}`}>
            <Collapsible open={interfaceOpen} onOpenChange={hasProAccess ? setInterfaceOpen : undefined}>
              <CollapsibleTrigger asChild>
                <CardHeader className={`cursor-pointer hover:bg-ios-gray-50 transition-colors ${!hasProAccess ? 'pointer-events-none' : ''}`}>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Monitor className={`w-5 h-5 ${hasProAccess ? 'text-ios-blue' : 'text-gray-600'}`} />
                      <span className={hasProAccess ? '' : 'text-gray-600'}>App Interface</span>
                      {!hasProAccess && <Lock className="w-4 h-4 text-gray-600 ml-2" />}
                    </div>
                    {hasProAccess && (interfaceOpen ? (
                      <ChevronDown className="w-5 h-5 text-ios-secondary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-ios-secondary" />
                    ))}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Show Calorie Counter</h3>
                      <p className="text-sm text-ios-secondary">Display calorie numbers in home tab</p>
                    </div>
                    <Switch
                      checked={showCalories}
                      onCheckedChange={(checked) => {
                        // Don't update local state immediately - wait for server response
                        updateInterfaceMutation.mutate({
                          showCalorieCounter: checked,
                          participateInWeeklyChallenge: participateInChallenge,
                          showFoodStats: showFoodStats,
                        });
                      }}
                      disabled={updateInterfaceMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Show Food Statistics</h3>
                      <p className="text-sm text-ios-secondary">Display Yes/OK/No food counts and health score</p>
                    </div>
                    <Switch
                      checked={showFoodStats}
                      onCheckedChange={(checked) => {
                        // Don't update local state immediately - wait for server response
                        updateInterfaceMutation.mutate({
                          showCalorieCounter: showCalories,
                          participateInWeeklyChallenge: participateInChallenge,
                          showFoodStats: checked,
                        });
                      }}
                      disabled={updateInterfaceMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Weekly Challenge Participation</h3>
                      <p className="text-sm text-ios-secondary">Include me in leaderboard competitions</p>
                    </div>
                    <Switch
                      checked={participateInChallenge}
                      onCheckedChange={(checked) => {
                        // Don't update local state immediately - wait for server response
                        updateInterfaceMutation.mutate({
                          showCalorieCounter: showCalories,
                          participateInWeeklyChallenge: checked,
                          showFoodStats: showFoodStats,
                        });
                      }}
                      disabled={updateInterfaceMutation.isPending}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-ios-secondary">
                      More interface customization options coming soon
                    </p>
                  </div>

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Food History Dropdown */}
          <Card className={`bg-white/80 backdrop-blur-sm border border-ios-separator ${!hasProAccess ? 'opacity-50' : ''}`}>
            <Collapsible open={historyOpen} onOpenChange={hasProAccess ? setHistoryOpen : undefined}>
              <CollapsibleTrigger asChild>
                <CardHeader className={`cursor-pointer hover:bg-ios-gray-50 transition-colors ${!hasProAccess ? 'pointer-events-none' : ''}`}>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <History className={`w-5 h-5 ${hasProAccess ? 'text-ios-blue' : 'text-gray-600'}`} />
                      <span className={hasProAccess ? '' : 'text-gray-600'}>Food History</span>
                      {!hasProAccess && <Lock className="w-4 h-4 text-gray-600 ml-2" />}
                    </div>
                    {hasProAccess && (historyOpen ? (
                      <ChevronDown className="w-5 h-5 text-ios-secondary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-ios-secondary" />
                    ))}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {logsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-ios-secondary">Loading food history...</p>
                    </div>
                  ) : foodLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-ios-secondary/50 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Food History</h3>
                      <p className="text-ios-secondary">
                        Start analyzing foods to see your history here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6 max-h-96 overflow-y-auto">
                      {sortedDates.map((date) => (
                        <div key={date} className="border-l-2 border-ios-blue pl-4">
                          <h3 className="font-semibold text-ios-text mb-3">{date}</h3>
                          <div className="space-y-2">
                            {groupedLogs[date].map((log) => (
                              <div key={log.id} className="bg-ios-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{log.foodName}</h4>
                                  <Badge 
                                    className={
                                      log.verdict === "YES" ? "bg-health-green text-white" :
                                      log.verdict === "OK" ? "bg-warning-orange text-white" :
                                      "bg-danger-red text-white"
                                    }
                                  >
                                    {log.verdict}
                                  </Badge>
                                </div>
                                <p className="text-sm text-ios-secondary mt-1">
                                  {log.calories && log.calories > 0 ? `${log.calories} calories` : 'N/A calories'}
                                </p>
                                <p className="text-xs text-ios-secondary mt-1">
                                  {new Date(log.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

        </div>

        {/* Cancel Subscription Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Cancel Pro Subscription
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your Pro subscription? This will schedule cancellation at the end of your billing period. You'll lose access to:
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <XCircle className="w-4 h-4 text-red-500" />
                Unlimited food analyses
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <XCircle className="w-4 h-4 text-red-500" />
                Detailed nutrition insights
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <XCircle className="w-4 h-4 text-red-500" />
                Food logging and history
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <XCircle className="w-4 h-4 text-red-500" />
                Leaderboard participation
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> Your subscription will be scheduled for cancellation at the end of your current billing period. You'll retain full Pro access until then, after which you'll automatically revert to the Free plan.
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelSubscription.isPending}
              >
                Keep Pro
              </Button>
              <Button
                variant="destructive"
                onClick={() => cancelSubscription.mutate()}
                disabled={cancelSubscription.isPending}
              >
                {cancelSubscription.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}