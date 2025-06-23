import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Brain, Shield, TrendingUp } from "lucide-react";
import TopHeader from "@/components/top-header";

export default function Disclaimer() {
  return (
    <>
      <TopHeader />
      <div className="min-h-screen bg-gradient-to-br from-ios-bg via-white to-ios-gray-50 pt-20 pb-24">
        <div className="container-padding">
          <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-warning-orange mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-ios-text mb-4">
              AI Disclaimer & Important Information
            </h1>
            <p className="text-xl text-ios-secondary">
              Understanding how our AI works and its limitations
            </p>
          </div>

          {/* Educational Purpose */}
          <Card className="border-warning-orange/20 bg-warning-orange/5">
            <CardHeader>
              <CardTitle className="flex items-center text-warning-orange">
                <Brain className="w-5 h-5 mr-3" />
                Educational Purposes Only
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-ios-text">
                YesNoApp provides AI-generated food analysis for <strong>educational and informational purposes only</strong>. 
                Our verdicts are estimates based on artificial intelligence algorithms and should not be considered as 
                professional medical, nutritional, or dietary advice.
              </p>
              <div className="bg-white/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What this means:</h3>
                <ul className="space-y-2 text-sm text-ios-secondary">
                  <li>• AI analysis may not always be 100% accurate</li>
                  <li>• Results are based on general nutritional guidelines</li>
                  <li>• Individual dietary needs may vary significantly</li>
                  <li>• Always consult healthcare professionals for medical advice</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* AI Accuracy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-3" />
                AI Accuracy & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-health-green/5 rounded-lg border border-health-green/20">
                  <h3 className="font-semibold text-health-green mb-2">What AI Does Well</h3>
                  <ul className="space-y-1 text-sm text-ios-secondary">
                    <li>• Identifies common foods from images</li>
                    <li>• Provides general nutritional information</li>
                    <li>• Offers consistent analysis patterns</li>
                    <li>• Learns from user feedback</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-danger-red/5 rounded-lg border border-danger-red/20">
                  <h3 className="font-semibold text-danger-red mb-2">AI Limitations</h3>
                  <ul className="space-y-1 text-sm text-ios-secondary">
                    <li>• Cannot analyze exact portions accurately</li>
                    <li>• May misidentify complex or mixed foods</li>
                    <li>• Cannot account for individual health conditions</li>
                    <li>• Estimates may vary with image quality</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Guidance */}
          <Card className="bg-gradient-to-r from-ios-blue/5 to-health-green/5">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-3" />
                When to Seek Professional Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-ios-text">
                For professional nutritionist guidance and personalized dietary advice, consider upgrading to our 
                <strong> Medical Tier</strong> which connects you with certified professionals.
              </p>
              
              <div className="bg-white/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Consult a healthcare professional if you have:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm text-ios-secondary">
                    <li>• Diabetes or blood sugar concerns</li>
                    <li>• Food allergies or intolerances</li>
                    <li>• Heart disease or cardiovascular issues</li>
                    <li>• Eating disorders or body image concerns</li>
                  </ul>
                  <ul className="space-y-2 text-sm text-ios-secondary">
                    <li>• Pregnancy or breastfeeding considerations</li>
                    <li>• Specific dietary restrictions</li>
                    <li>• Chronic health conditions</li>
                    <li>• Weight management goals</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Use Responsibly */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use YesNoApp Responsibly</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-ios-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Use as a Guide</h3>
                  <p className="text-sm text-ios-secondary">
                    Treat AI verdicts as helpful suggestions, not absolute rules
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-health-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Consider Context</h3>
                  <p className="text-sm text-ios-secondary">
                    Factor in your personal health goals and circumstances
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Seek Professional Help</h3>
                  <p className="text-sm text-ios-secondary">
                    Consult experts for personalized nutritional advice
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-ios-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Our AI Technology</h3>
                <p className="text-sm text-ios-secondary mb-3">
                  YesNoApp uses Google's Gemini AI model for food recognition and analysis. The system:
                </p>
                <ul className="space-y-1 text-sm text-ios-secondary">
                  <li>• Analyzes food images using computer vision</li>
                  <li>• Cross-references with nutritional databases</li>
                  <li>• Considers your personal health profile and goals</li>
                  <li>• Provides confidence scores for transparency</li>
                </ul>
              </div>
              
              <div className="bg-warning-orange/5 p-4 rounded-lg border border-warning-orange/20">
                <h3 className="font-semibold text-warning-orange mb-2">Important Disclaimer</h3>
                <p className="text-sm text-ios-secondary">
                  This app is not intended to diagnose, treat, cure, or prevent any disease. 
                  The information provided should not replace professional medical advice, diagnosis, or treatment. 
                  Always seek the advice of your physician or other qualified health provider with any questions 
                  you may have regarding a medical condition.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-gradient-to-r from-purple-500/5 to-ios-blue/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Questions or Concerns?</h3>
                <p className="text-sm text-ios-secondary mb-4">
                  If you have questions about our AI technology or need clarification about any analysis, 
                  please contact our support team.
                </p>
                <p className="text-xs text-ios-secondary">
                  Last updated: June 2025 | Version 1.0
                </p>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </>
  );
}