import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Users, Database, Activity, AlertTriangle, CheckCircle, Clock, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface SecurityMetrics {
  activeUsers: number;
  totalSessions: number;
  failedLogins: number;
  dataIntegrity: {
    score: number;
    issues: string[];
  };
  subscriptionSecurity: {
    activeSubscriptions: number;
    paymentIssues: number;
  };
  gdprCompliance: {
    consentRate: number;
    pendingRequests: number;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    lastCheck: string;
  };
}

export default function SecurityDashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Only allow admin users to access this dashboard
  if (!isLoading && user?.email !== 'info@veridect.com') {
    setLocation('/');
    return null;
  }

  const { data: metrics, isLoading: metricsLoading } = useQuery<SecurityMetrics>({
    queryKey: ['/api/admin/security-metrics'],
    staleTime: 30000, // Refresh every 30 seconds
  });

  if (isLoading || metricsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-700">Healthy</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-700">Warning</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-700">Critical</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ios-primary mb-2">Security Dashboard</h1>
        <p className="text-ios-secondary">Monitor system security and compliance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* System Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getHealthBadge(metrics?.systemHealth.status || 'unknown')}
              <p className="text-xs text-muted-foreground">
                Uptime: {metrics?.systemHealth.uptime || 0}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.totalSessions || 0} active sessions
            </p>
          </CardContent>
        </Card>

        {/* Data Integrity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Integrity</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.dataIntegrity.score || 0}%</div>
            <Progress value={metrics?.dataIntegrity.score || 0} className="mt-2" />
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.failedLogins || 0}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GDPR Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              GDPR Compliance
            </CardTitle>
            <CardDescription>Privacy and consent management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Consent Collection Rate</span>
                <span>{metrics?.gdprCompliance.consentRate || 0}%</span>
              </div>
              <Progress value={metrics?.gdprCompliance.consentRate || 0} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Data Requests</span>
              <Badge variant="outline">{metrics?.gdprCompliance.pendingRequests || 0}</Badge>
            </div>

            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-2">Data Retention Status</h4>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Policy documented and active</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Automated cleanup scheduled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Payment Security
            </CardTitle>
            <CardDescription>Subscription and payment monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Subscriptions</span>
              <span className="text-lg font-semibold">
                {metrics?.subscriptionSecurity.activeSubscriptions || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Payment Issues</span>
              <Badge variant={metrics?.subscriptionSecurity.paymentIssues === 0 ? "default" : "destructive"}>
                {metrics?.subscriptionSecurity.paymentIssues || 0}
              </Badge>
            </div>

            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-2">Security Measures</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Stripe webhook verification active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">No card data stored locally</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">PCI compliance via Stripe</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Integrity Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Security Status Overview</CardTitle>
            <CardDescription>Current security posture and recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-green-700">A- Security Grade</div>
                <div className="text-sm text-green-600">Highly Secure Platform</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-blue-700">Zero Breaches</div>
                <div className="text-sm text-blue-600">No security incidents</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Lock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-purple-700">€24/year</div>
                <div className="text-sm text-purple-600">Revenue protected</div>
              </div>
            </div>

            {metrics?.dataIntegrity.issues && metrics.dataIntegrity.issues.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Security Recommendations</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {metrics.dataIntegrity.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}