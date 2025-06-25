import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import TopHeader from "@/components/top-header";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Eye, Lock, UserCheck, FileText, Mail } from "lucide-react";

export default function Privacy() {
  const { isAuthenticated } = useAuth();

  // Show content regardless of auth status to fix blank page
  const isLoggedIn = isAuthenticated;



  return (
    <div className="min-h-screen bg-ios-bg">
      {isLoggedIn && <TopHeader />}
      <div className="container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-ios-blue mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-ios-text">Privacy Policy</h1>
            <p className="text-ios-secondary mt-2">Last updated: June 25, 2025</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-ios-text">Account Information</h4>
                <p className="text-ios-secondary">Email address, name, profile preferences</p>
              </div>
              <div>
                <h4 className="font-semibold text-ios-text">Usage Data</h4>
                <p className="text-ios-secondary">Food photos, analysis results, nutrition tracking</p>
              </div>
              <div>
                <h4 className="font-semibold text-ios-text">Technical Data</h4>
                <p className="text-ios-secondary">Device information, IP address, usage analytics</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                How We Protect Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-ios-secondary">
                • All data is encrypted in transit and at rest using industry-standard encryption
              </p>
              <p className="text-ios-secondary">
                • We implement strict access controls and regular security audits
              </p>
              <p className="text-ios-secondary">
                • Food photos are processed securely and can be deleted at any time
              </p>
              <p className="text-ios-secondary">
                • We comply with GDPR and other privacy regulations
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-ios-secondary">
                • Access and download your data
              </p>
              <p className="text-ios-secondary">
                • Correct or update your information
              </p>
              <p className="text-ios-secondary">
                • Delete your account - contact support at <strong>info@veridect.com</strong>
              </p>
              <p className="text-ios-secondary">
                • Opt out of non-essential communications
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Data Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ios-secondary">
                We do not sell, rent, or share your personal information with third parties 
                except as necessary to provide our services (like AI analysis) or as required by law.
                All third-party services we use are GDPR compliant and bound by strict privacy agreements.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ios-secondary">
                For privacy-related questions or to exercise your rights, contact us at:
                <br />
                <strong>info@veridect.com</strong>
              </p>
            </CardContent>
          </Card>

          {!isLoggedIn && (
            <div className="text-center mt-8">
              <Button onClick={() => window.location.href = "/"}>
                Back to Home
              </Button>
            </div>
          )}

        </div>
      </div>
      {isLoggedIn && <Navigation />}
    </div>
  );
}