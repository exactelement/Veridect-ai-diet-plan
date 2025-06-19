import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Users, Globe } from "lucide-react";

export default function Privacy() {
  return (
    <div className="pt-20 pb-8 container-padding">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-ios-secondary">
            Your privacy is fundamental to our mission. Learn how we protect your data.
          </p>
          <p className="text-sm text-ios-secondary mt-2">
            Last updated: December 19, 2024
          </p>
        </div>

        {/* Privacy Overview */}
        <Card className="bg-ios-blue/5 border-ios-blue/20">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8 text-ios-blue" />
              <h2 className="text-2xl font-bold">Our Privacy Commitment</h2>
            </div>
            <p className="text-lg leading-relaxed">
              YesNoApp is built with privacy-first principles. We minimize data collection, 
              maximize on-device processing, and give you complete control over your information. 
              Your health data belongs to you, and we're just here to help you make better choices.
            </p>
          </CardContent>
        </Card>

        {/* What We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-6 h-6" />
              <span>What Information We Collect</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Account Information</h3>
              <ul className="space-y-2 text-ios-secondary">
                <li>• Email address (for account creation and communication)</li>
                <li>• Name (to personalize your experience)</li>
                <li>• Profile picture (optional, from your authentication provider)</li>
                <li>• Subscription and billing information (for paid plans)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Health & Nutrition Data</h3>
              <ul className="space-y-2 text-ios-secondary">
                <li>• Food photos and descriptions you submit for analysis</li>
                <li>• Your dietary preferences and health goals</li>
                <li>• Food analysis results and verdicts</li>
                <li>• Allergies and medical conditions (only if you provide them)</li>
                <li>• Progress tracking and usage statistics</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Technical Information</h3>
              <ul className="space-y-2 text-ios-secondary">
                <li>• Device type and operating system</li>
                <li>• App usage patterns and performance metrics</li>
                <li>• IP address and general location (for service optimization)</li>
                <li>• Crash reports and error logs (anonymized)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-6 h-6" />
              <span>How We Use Your Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Primary Uses</h4>
                <ul className="space-y-1 text-ios-secondary text-sm">
                  <li>• Provide food analysis and health verdicts</li>
                  <li>• Personalize recommendations based on your goals</li>
                  <li>• Track your progress and generate insights</li>
                  <li>• Improve our AI models and accuracy</li>
                  <li>• Provide customer support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Secondary Uses</h4>
                <ul className="space-y-1 text-ios-secondary text-sm">
                  <li>• Send important product updates</li>
                  <li>• Conduct research to improve health outcomes</li>
                  <li>• Ensure platform security and prevent fraud</li>
                  <li>• Comply with legal requirements</li>
                  <li>• Generate anonymized usage statistics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-6 h-6" />
              <span>How We Protect Your Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-health-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-health-green" />
                </div>
                <h4 className="font-semibold mb-2">Encryption</h4>
                <p className="text-sm text-ios-secondary">All data is encrypted in transit and at rest using industry-standard AES-256 encryption.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-ios-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-ios-blue" />
                </div>
                <h4 className="font-semibold mb-2">Access Controls</h4>
                <p className="text-sm text-ios-secondary">Strict access controls ensure only authorized personnel can access your data.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-warning-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Database className="w-6 h-6 text-warning-orange" />
                </div>
                <h4 className="font-semibold mb-2">Secure Infrastructure</h4>
                <p className="text-sm text-ios-secondary">Our infrastructure is hosted on secure, compliant cloud platforms with regular security audits.</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold mb-3">Compliance Standards</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <strong className="text-sm">GDPR</strong>
                  <p className="text-xs text-ios-secondary mt-1">EU Data Protection</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <strong className="text-sm">HIPAA</strong>
                  <p className="text-xs text-ios-secondary mt-1">Medical Tier Only</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <strong className="text-sm">SOC 2</strong>
                  <p className="text-xs text-ios-secondary mt-1">Security Standards</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <strong className="text-sm">CCPA</strong>
                  <p className="text-xs text-ios-secondary mt-1">California Privacy</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-6 h-6" />
              <span>Data Sharing & Third Parties</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-health-green/5 border border-health-green/20 rounded-lg p-4">
              <h4 className="font-semibold text-health-green mb-2">We Never Sell Your Data</h4>
              <p className="text-sm">Your personal health information is never sold to advertisers, marketers, or data brokers. Period.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Limited Data Sharing</h4>
              <p className="text-ios-secondary mb-3">We only share data in these specific circumstances:</p>
              <ul className="space-y-2 text-sm text-ios-secondary">
                <li>• <strong>Service Providers:</strong> Trusted partners who help us operate the app (AI providers, cloud hosting, payment processing)</li>
                <li>• <strong>Health Providers:</strong> Only with your explicit consent and only for Medical tier users</li>
                <li>• <strong>Research Partners:</strong> Anonymized, aggregated data for nutrition research (only if you opt-in)</li>
                <li>• <strong>Legal Requirements:</strong> When required by law or to protect our users' safety</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-6 h-6" />
              <span>Your Privacy Rights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Access & Control</h4>
                <ul className="space-y-2 text-sm text-ios-secondary">
                  <li>• View all data we have about you</li>
                  <li>• Download your data in a portable format</li>
                  <li>• Correct or update your information</li>
                  <li>• Delete your account and all associated data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Privacy Controls</h4>
                <ul className="space-y-2 text-sm text-ios-secondary">
                  <li>• Opt out of data sharing for research</li>
                  <li>• Control marketing communications</li>
                  <li>• Manage health provider access</li>
                  <li>• Set data retention preferences</li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Exercise Your Rights</h4>
              <p className="text-sm text-ios-secondary">
                To exercise any of these rights, contact us at <strong>privacy@yesnoapp.com</strong> or 
                use the privacy controls in your account settings. We'll respond within 30 days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ios-secondary">
              YesNoApp is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you believe we have collected information 
              from a child under 13, please contact us immediately and we will delete it.
            </p>
          </CardContent>
        </Card>

        {/* International Users */}
        <Card>
          <CardHeader>
            <CardTitle>International Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ios-secondary mb-4">
              YesNoApp is operated from the United States. If you're using our service from outside 
              the US, your data may be transferred to and processed in the United States.
            </p>
            <ul className="space-y-2 text-sm text-ios-secondary">
              <li>• We provide the same privacy protections regardless of location</li>
              <li>• EU users benefit from GDPR protections</li>
              <li>• We use Standard Contractual Clauses for international transfers</li>
              <li>• Local data residency available for Medical tier users</li>
            </ul>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ios-secondary">
              We may update this privacy policy from time to time. We'll notify you of any material 
              changes by email or through the app. Your continued use of YesNoApp after changes 
              become effective constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-ios-blue/5 border-ios-blue/20">
          <CardHeader>
            <CardTitle>Questions About Privacy?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ios-secondary mb-4">
              We're here to help you understand how your data is protected. Contact our privacy team:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> privacy@yesnoapp.com</p>
              <p><strong>Data Protection Officer:</strong> dpo@yesnoapp.com</p>
              <p><strong>Address:</strong> YesNoApp, Inc. Privacy Team, [Address]</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
