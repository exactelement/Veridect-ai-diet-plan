import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { User, Settings, History, ChevronDown, ChevronRight, Heart, Monitor, Calendar, Edit, Lock } from "lucide-react";
import { updateUserProfileSchema } from "@shared/schema";
import type { UpdateUserProfile, FoodLog } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Collapsible section states
  const [personalOpen, setPersonalOpen] = useState(false);
  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const [interfaceOpen, setInterfaceOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  
  // App interface preferences (sync with user data)
  const [showCalories, setShowCalories] = useState(true);
  const [participateInChallenge, setParticipateInChallenge] = useState(true);

  // Update state when user data changes
  useEffect(() => {
    if (user) {
      const privacySettings = (user as any)?.privacySettings;
      setShowCalories(privacySettings?.showCalorieCounter === undefined ? true : privacySettings.showCalorieCounter);
      setParticipateInChallenge(privacySettings?.participateInWeeklyChallenge === undefined ? true : privacySettings.participateInWeeklyChallenge);
    }
  }, [user]);

  const { data: foodLogs = [], isLoading: logsLoading } = useQuery<FoodLog[]>({
    queryKey: ["/api/food/logs"],
  });

  // Personal information form
  const personalForm = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
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
      // Update basic info
      await apiRequest("PUT", "/api/user/profile", {
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      // Change password if provided
      if (data.newPassword && data.currentPassword) {
        await apiRequest("POST", "/api/auth/change-password", {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });
      }
      
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
      personalForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
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
    mutationFn: async (preferences: { showCalorieCounter: boolean; participateInWeeklyChallenge: boolean }) => {
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
      // Simply invalidate the user data query to refresh
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error, variables) => {
      // Revert local state on error
      const privacySettings = (user as any)?.privacySettings;
      setShowCalories(privacySettings?.showCalorieCounter === undefined ? true : privacySettings.showCalorieCounter);
      setParticipateInChallenge(privacySettings?.participateInWeeklyChallenge === undefined ? true : privacySettings.participateInWeeklyChallenge);
      
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onPersonalSubmit = (data: PersonalInfoForm) => {
    updatePersonalMutation.mutate(data);
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
                    <Badge className="mt-2 bg-ios-blue text-white">
                      {user.subscriptionTier.toUpperCase()} Plan
                    </Badge>
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
                                <Input {...field} />
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
                                <Input {...field} />
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

                      <div className="border-t pt-4 mt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Lock className="w-4 h-4 mr-2" />
                          Change Password
                        </h3>
                        <div className="space-y-4">
                          <FormField
                            control={personalForm.control}
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
                              control={personalForm.control}
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
                              control={personalForm.control}
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
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-ios-blue hover:bg-ios-blue/90"
                        disabled={updatePersonalMutation.isPending}
                      >
                        {updatePersonalMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Personalization Dropdown */}
          <Card className="bg-white/80 backdrop-blur-sm border border-ios-separator">
            <Collapsible open={personalizationOpen} onOpenChange={setPersonalizationOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-ios-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Heart className="w-5 h-5 text-ios-blue" />
                      <span>Personalization</span>
                    </div>
                    {personalizationOpen ? (
                      <ChevronDown className="w-5 h-5 text-ios-secondary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-ios-secondary" />
                    )}
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
          <Card className="bg-white/80 backdrop-blur-sm border border-ios-separator">
            <Collapsible open={interfaceOpen} onOpenChange={setInterfaceOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-ios-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Monitor className="w-5 h-5 text-ios-blue" />
                      <span>App Interface</span>
                    </div>
                    {interfaceOpen ? (
                      <ChevronDown className="w-5 h-5 text-ios-secondary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-ios-secondary" />
                    )}
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
          <Card className="bg-white/80 backdrop-blur-sm border border-ios-separator">
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-ios-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <History className="w-5 h-5 text-ios-blue" />
                      <span>Food History</span>
                    </div>
                    {historyOpen ? (
                      <ChevronDown className="w-5 h-5 text-ios-secondary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-ios-secondary" />
                    )}
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
                                {log.calories && (
                                  <p className="text-sm text-ios-secondary mt-1">
                                    {log.calories} calories
                                  </p>
                                )}
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
      </div>
    </div>
  );
}