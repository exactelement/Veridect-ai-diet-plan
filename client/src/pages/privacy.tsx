import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Eye, Lock, UserCheck, FileText, Mail, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  // Scroll to top when navigating
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-ios-bg">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={scrollToTop}>
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/about" onClick={scrollToTop}>
                <Button variant="ghost">About</Button>
              </Link>
              <Link href="/how-to-use" onClick={scrollToTop}>
                <Button variant="ghost">How to Use</Button>
              </Link>
              <Link href="/" onClick={scrollToTop}>
                <Button>Log In</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-8 pb-24">
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

          <div className="text-center mt-8">
            <Link href="/">
              <Button>
                Back to Home
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}