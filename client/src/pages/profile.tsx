import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, History, Shield } from "lucide-react";
import { updateUserProfileSchema } from "@shared/schema";
import type { UpdateUserProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: foodLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/food/logs"],
  });

  const form = useForm<UpdateUserProfile>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      dietaryPreferences: user?.dietaryPreferences || [],
      healthGoals: user?.healthGoals || [],
      allergies: user?.allergies || [],
      privacySettings: user?.privacySettings || {
        shareDataForResearch: false,
        allowMarketing: false,
        shareWithHealthProviders: false
      },
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile) => {
      await apiRequest("PUT", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateUserProfile) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="pt-20 pb-8 container-padding">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                <AvatarFallback className="bg-ios-blue text-white text-2xl">
                  {user?.firstName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{user?.firstName} {user?.lastName}</h1>
                <p className="text-ios-secondary">{user?.email}</p>
                <Badge 
                  variant={user?.subscriptionTier === 'free' ? 'secondary' : 'default'}
                  className="mt-2 capitalize"
                >
                  {user?.subscriptionTier} Plan
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Food History</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Privacy</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
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
                        control={form.control}
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
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Health Goals */}
                    <div>
                      <FormLabel className="text-base font-medium">Health Goals</FormLabel>
                      <div className="grid grid-cols-2 gap-3 mt-3">
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
                    </div>

                    {/* Dietary Preferences */}
                    <div>
                      <FormLabel className="text-base font-medium">Dietary Preferences</FormLabel>
                      <div className="grid grid-cols-2 gap-3 mt-3">
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
                    </div>

                    {/* Allergies */}
                    <div>
                      <FormLabel className="text-base font-medium">Allergies</FormLabel>
                      <div className="grid grid-cols-2 gap-3 mt-3">
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
                    </div>

                    <Button
                      type="submit"
                      className="bg-ios-blue text-white"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Food History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Food Analysis History</CardTitle>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : foodLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-ios-secondary">No food logs yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {foodLogs.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            log.verdict === 'YES' ? 'bg-health-green' :
                            log.verdict === 'OK' ? 'bg-warning-orange' :
                            'bg-danger-red'
                          }`}>
                            {log.verdict === 'YES' ? '✓' : log.verdict === 'OK' ? '~' : '✗'}
                          </div>
                          <div>
                            <div className="font-medium">{log.foodName}</div>
                            <div className="text-sm text-ios-secondary">
                              {log.calories ? `${log.calories} cal` : 'No calorie info'} • 
                              {log.protein ? ` ${log.protein}g protein • ` : ' '}
                              Confidence: {log.confidence}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-ios-secondary">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-ios-secondary">
                            {new Date(log.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="privacySettings.shareDataForResearch"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Share data for research</FormLabel>
                              <p className="text-sm text-ios-secondary">
                                Help improve our AI by sharing anonymized food analysis data for research purposes.
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="privacySettings.allowMarketing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Marketing communications</FormLabel>
                              <p className="text-sm text-ios-secondary">
                                Receive emails about new features, health tips, and promotional offers.
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="privacySettings.shareWithHealthProviders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Share with health providers</FormLabel>
                              <p className="text-sm text-ios-secondary">
                                Allow sharing of your nutrition data with authorized healthcare providers (Medical tier only).
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="bg-ios-blue text-white"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Privacy Settings"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
