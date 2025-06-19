import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Scale, Shield, FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="pt-20 pb-8 container-padding">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-ios-secondary">
            Please read these terms carefully before using YesNoApp.
          </p>
          <p className="text-sm text-ios-secondary mt-2">
            Last updated: December 19, 2024
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
                  YesNoApp provides nutritional information and suggestions for educational purposes only. 
                  This service is not intended to replace professional medical advice, diagnosis, or treatment. 
                  Always consult with qualified healthcare providers before making significant dietary changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scale className="w-6 h-6" />
              <span>Acceptance of Terms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-ios-secondary">
              By accessing or using YesNoApp ("the Service"), you agree to be bound by these Terms of Service 
              ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
            <ul className="space-y-2 text-sm text-ios-secondary">
              <li>• These Terms apply to all users of the Service</li>
              <li>• You must be at least 13 years old to use the Service</li>
              <li>• Users under 18 must have parental consent</li>
              <li>• By using the Service, you represent that you meet these requirements</li>
            </ul>
          </CardContent>
        </Card>

        {/* Description of Service */}
        <Card>
          <CardHeader>
            <CardTitle>Description of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-ios-secondary">
              YesNoApp is an AI-powered nutrition analysis platform that provides food health verdicts, 
              nutritional information, and personalized recommendations to help users make informed dietary choices.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Free Tier</h4>
                <ul className="text-sm text-ios-secondary space-y-1">
                  <li>• Basic food analysis</li>
                  <li>• Limited daily usage</li>
                  <li>• Community features</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Pro Tier</h4>
                <ul className="text-sm text-ios-secondary space-y-1">
                  <li>• Unlimited analysis</li>
                  <li>• Advanced tracking</li>
                  <li>• Goal-based recommendations</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Medical Tier</h4>
                <ul className="text-sm text-ios-secondary space-y-1">
                  <li>• Medical-grade analysis</li>
                  <li>• Professional consultations</li>
                  <li>• Healthcare integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>User Accounts and Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Account Security</h4>
              <ul className="space-y-1 text-sm text-ios-secondary">
                <li>• You are responsible for maintaining account security</li>
                <li>• You must provide accurate and current information</li>
                <li>• You are responsible for all activities under your account</li>
                <li>• Notify us immediately of any unauthorized access</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Prohibited Uses</h4>
              <ul className="space-y-1 text-sm text-ios-secondary">
                <li>• Violating any applicable laws or regulations</li>
                <li>• Uploading harmful, fraudulent, or misleading content</li>
                <li>• Attempting to access other users' accounts</li>
                <li>• Using the Service for commercial purposes without permission</li>
                <li>• Reverse engineering or copying our technology</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription and Payment Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Billing</h4>
              <ul className="space-y-1 text-sm text-ios-secondary">
                <li>• Subscriptions are billed monthly in advance</li>
                <li>• Payment is due at the start of each billing cycle</li>
                <li>• We accept major credit cards and PayPal</li>
                <li>• Failed payments may result in service suspension</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Cancellation and Refunds</h4>
              <ul className="space-y-1 text-sm text-ios-secondary">
                <li>• You may cancel your subscription at any time</li>
                <li>• Cancellation takes effect at the end of the current billing period</li>
                <li>• 14-day money-back guarantee for new subscriptions</li>
                <li>• No refunds for partial billing periods</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Price Changes</h4>
              <p className="text-sm text-ios-secondary">
                We may change subscription prices with 30 days' advance notice. 
                Price changes apply to subsequent billing cycles only.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content and Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-6 h-6" />
              <span>Content and Intellectual Property</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Your Content</h4>
              <ul className="space-y-1 text-sm text-ios-secondary">
                <li>• You retain ownership of content you upload (photos, descriptions)</li>
                <li>• You grant us license to use your content to provide the Service</li>
                <li>• You warrant that your content doesn't violate third-party rights</li>
                <li>• We may remove content that violates these Terms</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Our Content</h4>
              <ul className="space-y-1 text-sm text-ios-secondary">
                <li>• The Service and all related content are our intellectual property</li>
                <li>• You may not copy, modify, or distribute our content</li>
                <li>• Our trademarks and logos are protected</li>
                <li>• AI-generated analysis results are provided under license</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6" />
              <span>Privacy and Data Protection</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-ios-secondary">
              Your privacy is important to us. Our collection and use of personal information 
              is governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            
            <div>
              <h4 className="font-semibold mb-2">Data Usage</h4>
              <ul className="space-y-1 text-sm text-ios-secondary">
                <li>• We process your data to provide and improve the Service</li>
                <li>• Anonymized data may be used for research purposes</li>
                <li>• You can opt out of research data sharing</li>
                <li>• Medical tier data is subject to additional protections</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers and Limitations */}
        <Card>
          <CardHeader>
            <CardTitle>Disclaimers and Limitations of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-danger-red/5 border border-danger-red/20 rounded-lg p-4">
              <h4 className="font-semibold text-danger-red mb-2">Important Disclaimers</h4>
              <ul className="space-y-1 text-sm text-danger-red">
                <li>• The Service is provided "as is" without warranties</li>
                <li>• AI analysis may contain errors or inaccuracies</li>
                <li>• We don't guarantee specific health outcomes</li>
                <li>• Always verify nutritional information independently</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Limitation of Liability</h4>
              <p className="text-sm text-ios-secondary">
                To the maximum extent permitted by law, YesNoApp shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages, including 
                but not limited to loss of profits, data, or other intangible losses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Medical Limitations</h4>
              <ul className="space-y-1 text-sm text-ios-secondary">
                <li>• Not intended for medical diagnosis or treatment</li>
                <li>• Consult healthcare providers for medical advice</li>
                <li>• Don't rely solely on our recommendations for medical conditions</li>
                <li>• Emergency situations require immediate medical attention</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card>
          <CardHeader>
            <CardTitle>Indemnification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ios-secondary">
              You agree to defend, indemnify, and hold harmless YesNoApp and its affiliates from 
              any claims, damages, or expenses arising from your use of the Service, violation of 
              these Terms, or infringement of any third-party rights.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">By You</h4>
              <p className="text-sm text-ios-secondary">
                You may terminate your account at any time by contacting us or using 
                the account deletion feature in the app.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">By Us</h4>
              <p className="text-sm text-ios-secondary">
                We may terminate or suspend your account immediately for violations of these Terms, 
                illegal activity, or other reasons that may harm our users or the Service.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Effect of Termination</h4>
              <ul className="space-y-1 text-sm text-ios-secondary">
                <li>• Your right to use the Service ceases immediately</li>
                <li>• Your data will be deleted according to our retention policy</li>
                <li>• Outstanding payment obligations remain in effect</li>
                <li>• These Terms survive termination where applicable</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card>
          <CardHeader>
            <CardTitle>Governing Law and Disputes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Governing Law</h4>
              <p className="text-sm text-ios-secondary">
                These Terms are governed by the laws of [State/Country], without regard to 
                conflict of law principles.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Dispute Resolution</h4>
              <ul className="space-y-1 text-sm text-ios-secondary">
                <li>• Disputes should first be addressed through informal negotiation</li>
                <li>• Binding arbitration may be required for unresolved disputes</li>
                <li>• Class action waivers may apply</li>
                <li>• Small claims court remains available for qualifying disputes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ios-secondary">
              We reserve the right to modify these Terms at any time. We'll notify users of 
              material changes by email or through the Service. Continued use after changes 
              constitutes acceptance of the modified Terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-ios-blue/5 border-ios-blue/20">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ios-secondary mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> legal@yesnoapp.com</p>
              <p><strong>Support:</strong> support@yesnoapp.com</p>
              <p><strong>Address:</strong> YesNoApp, Inc. Legal Department, [Address]</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
