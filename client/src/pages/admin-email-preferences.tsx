import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, User, Calendar, Check, X, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface UserEmailPreference {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gdprConsent: {
    improveAIRecommendations?: boolean;
    nutritionInsightsEmails?: boolean;
    anonymousUsageAnalytics?: boolean;
    timestamp?: string;
    version?: string;
  };
  hasSeenPrivacyBanner: boolean;
  createdAt: string;
}

export default function AdminEmailPreferences() {
  const { user } = useAuth();
  
  const { data: preferences, isLoading, error } = useQuery({
    queryKey: ["/api/admin/email-preferences"],
    enabled: !!user,
  });

  const exportToCSV = () => {
    if (!preferences) return;
    
    const csvData = preferences.map((user: UserEmailPreference) => ({
      Email: user.email,
      Name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      'Weekly Nutrition Emails': user.gdprConsent?.nutritionInsightsEmails ? 'Yes' : 'No',
      'AI Improvements': user.gdprConsent?.improveAIRecommendations ? 'Yes' : 'No',
      'Usage Analytics': user.gdprConsent?.anonymousUsageAnalytics ? 'Yes' : 'No',
      'Consent Date': new Date(user.createdAt).toLocaleDateString(),
      'GDPR Version': user.gdprConsent?.version || '1.0'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-preferences-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ios-bg pt-16 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-spin w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ios-bg pt-16 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Access denied. Admin privileges required.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const emailSubscribers = preferences?.filter((user: UserEmailPreference) => 
    user.gdprConsent?.nutritionInsightsEmails
  ) || [];

  const aiOptIns = preferences?.filter((user: UserEmailPreference) => 
    user.gdprConsent?.improveAIRecommendations
  ) || [];

  const analyticsOptIns = preferences?.filter((user: UserEmailPreference) => 
    user.gdprConsent?.anonymousUsageAnalytics
  ) || [];

  return (
    <div className="min-h-screen bg-ios-bg pt-16 pb-24 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ios-text">Email Preferences Dashboard</h1>
            <p className="text-ios-secondary mt-1">GDPR consent and email subscription management</p>
          </div>
          <Button onClick={exportToCSV} className="bg-ios-blue text-white">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-8 h-8 text-ios-blue" />
                <div>
                  <p className="text-2xl font-bold text-ios-text">{emailSubscribers.length}</p>
                  <p className="text-sm text-ios-secondary">Email Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-ios-text">{preferences?.length || 0}</p>
                  <p className="text-sm text-ios-secondary">Total Consents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Check className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-ios-text">{aiOptIns.length}</p>
                  <p className="text-sm text-ios-secondary">AI Opt-ins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-ios-text">{analyticsOptIns.length}</p>
                  <p className="text-sm text-ios-secondary">Analytics Opt-ins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Subscribers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Weekly Email Subscribers ({emailSubscribers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emailSubscribers.length === 0 ? (
              <p className="text-ios-secondary text-center py-8">No users have opted in for weekly emails yet.</p>
            ) : (
              <div className="space-y-3">
                {emailSubscribers.map((user: UserEmailPreference) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-ios-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium text-ios-text">{user.email}</p>
                          <p className="text-sm text-ios-secondary">
                            {user.firstName || user.lastName ? 
                              `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                              'No name provided'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.gdprConsent?.improveAIRecommendations ? "default" : "secondary"}>
                        AI: {user.gdprConsent?.improveAIRecommendations ? 'Yes' : 'No'}
                      </Badge>
                      <Badge variant={user.gdprConsent?.anonymousUsageAnalytics ? "default" : "secondary"}>
                        Analytics: {user.gdprConsent?.anonymousUsageAnalytics ? 'Yes' : 'No'}
                      </Badge>
                      <span className="text-xs text-ios-secondary">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Users with GDPR Consent */}
        <Card>
          <CardHeader>
            <CardTitle>All GDPR Consents ({preferences?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {preferences?.map((user: UserEmailPreference) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-ios-text">{user.email}</p>
                        <p className="text-sm text-ios-secondary">
                          {user.firstName || user.lastName ? 
                            `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                            'No name provided'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {user.gdprConsent?.nutritionInsightsEmails ? 
                        <Check className="w-4 h-4 text-green-500" /> : 
                        <X className="w-4 h-4 text-red-500" />
                      }
                      <span className="text-xs">Email</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {user.gdprConsent?.improveAIRecommendations ? 
                        <Check className="w-4 h-4 text-green-500" /> : 
                        <X className="w-4 h-4 text-red-500" />
                      }
                      <span className="text-xs">AI</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {user.gdprConsent?.anonymousUsageAnalytics ? 
                        <Check className="w-4 h-4 text-green-500" /> : 
                        <X className="w-4 h-4 text-red-500" />
                      }
                      <span className="text-xs">Analytics</span>
                    </div>
                    <span className="text-xs text-ios-secondary ml-3">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )) || (
                <p className="text-ios-secondary text-center py-8">No GDPR consents recorded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}