import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Scale, Shield, FileText, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
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
              <Link href="/privacy" onClick={scrollToTop}>
                <Button variant="ghost">Privacy</Button>
              </Link>
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

      <div className="pt-8 pb-32 container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Veridect Terms of Service</h1>
            <p className="text-xl text-ios-secondary">
              Please read these terms carefully before using Veridect.
            </p>
            <p className="text-sm text-ios-secondary mt-2">
              Last updated: June 24, 2025
            </p>
          </div>

          {/* Important Notice */}
          <Card className="bg-warning-orange/5 border-warning-orange/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-warning-orange mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-warning-orange mb-2">Medical Disclaimer</h3>
                  <p className="text-sm">
                    Veridect provides nutritional information and suggestions for educational, informational, and entertainment purposes only. 
                    This service is not intended to replace professional medical advice, diagnosis, or treatment. 
                    Always consult with qualified healthcare providers before making significant dietary changes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1. Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Scale className="w-6 h-6 text-ios-blue" />
                <span>1. Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing and using Veridect ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </CardContent>
          </Card>

          {/* 2. Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>2. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Veridect is an AI-powered nutrition analysis platform that provides food assessments and recommendations. 
                The Service includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI-powered food analysis and verdicts</li>
                <li>Nutritional information and guidance</li>
                <li>Progress tracking and gamification features</li>
                <li>Community leaderboards and challenges</li>
                <li>Subscription-based premium features</li>
              </ul>
            </CardContent>
          </Card>

          {/* 3. User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To access certain features, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and up-to-date information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </CardContent>
          </Card>

          {/* 4. Subscription Terms */}
          <Card>
            <CardHeader>
              <CardTitle>4. Subscription Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">Billing</h4>
              <p>
                Pro tier subscriptions are billed annually in advance at €12 per year (promotional rate, normally €120/year). 
                Payment is processed through Stripe.
              </p>
              <h4 className="font-semibold">Cancellation</h4>
              <p>
                You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.
              </p>
              <h4 className="font-semibold">Refunds</h4>
              <p>
                Refunds are provided according to our refund policy. Contact info@veridect.com for refund requests.
              </p>
            </CardContent>
          </Card>

          {/* 5. Privacy and Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-health-green" />
                <span>5. Privacy and Data Protection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your privacy is important to us. Our data practices are detailed in our Privacy Policy, which forms part of these terms.
              </p>
              <p>
                By using Veridect, you consent to the collection and use of your data as described in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* 6. Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle>6. Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Upload harmful or malicious content</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </CardContent>
          </Card>

          {/* 7. Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>7. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Service and its original content, features, and functionality are owned by Veridect and are protected by 
                international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </CardContent>
          </Card>

          {/* 8. Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Veridect shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </CardContent>
          </Card>

          {/* 9. Termination */}
          <Card>
            <CardHeader>
              <CardTitle>9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
            </CardContent>
          </Card>

          {/* 10. Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>10. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to modify these terms at any time. We will notify users of significant changes 
                via email or through the Service. Continued use after changes constitutes acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-ios-blue" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> info@veridect.com</p>
                <p><strong>Support:</strong> info@veridect.com</p>
                <p><strong>Address:</strong> Veridect Legal Department, [Address]</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}