import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Check, Heart, Shield, Zap, Users, Menu, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How It Works", href: "#how-it-works" },
  ];

  return (
    <div className="min-h-screen bg-ios-bg text-ios-text">
      {/* Responsive Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="page-container">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand - Always visible */}
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.location.reload()}
            >
              <img 
                src="/veridect-logo.png" 
                alt="Veridect Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="font-semibold text-xl">Veridect</span>
            </div>

            {/* Desktop Navigation - visible on large screens */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <a 
                  key={item.href}
                  href={item.href} 
                  className="text-ios-secondary hover:text-ios-text transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <Button onClick={() => window.location.href = "/login"} className="bg-ios-blue text-white px-6 py-2 rounded-full ios-button ios-shadow">
                Get Started
              </Button>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Login button - always visible */}
              <Button onClick={() => window.location.href = "/login"} className="bg-ios-blue text-white px-4 py-2 rounded-full ios-button ios-shadow">
                Login
              </Button>

              {/* Dropdown menu for medium screens */}
              <div className="hidden md:block lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <span className="text-sm">Menu</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {navigationItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <a href={item.href} className="w-full">
                          {item.label}
                        </a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile menu - visible on small screens */}
              <div className="md:hidden">
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    
                    <div className="mt-8 space-y-6">
                      {/* Navigation items */}
                      <nav className="space-y-2">
                        {navigationItems.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="block p-3 rounded-lg hover:bg-ios-gray-50 text-ios-text transition-colors"
                          >
                            <span className="font-medium">{item.label}</span>
                          </a>
                        ))}
                      </nav>

                      {/* Get Started button in mobile menu */}
                      <div className="pt-6 border-t border-ios-gray-200">
                        <Button 
                          onClick={() => {
                            setIsMenuOpen(false);
                            window.location.href = "/login";
                          }}
                          className="w-full bg-ios-blue text-white rounded-lg ios-button ios-shadow"
                        >
                          Get Started
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="page-container text-center">
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Yes</span> or <span className="gradient-text">No</span>?
            </h1>
            <p className="text-xl md:text-2xl text-ios-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform complex nutritional decisions into simple, AI-powered verdicts. 
              Get instant health guidance that adapts to your goals and lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button onClick={() => window.location.href = "/login"} className="bg-ios-blue text-white px-8 py-4 rounded-full text-lg font-medium ios-button ios-shadow">
                Try It Free
              </Button>
              <Button variant="outline" className="border-2 border-ios-blue text-ios-blue px-8 py-4 rounded-full text-lg font-medium ios-button">
                Watch Demo
              </Button>
            </div>
          </div>
          
          {/* App Interface Preview */}
          <div className="app-interface rounded-3xl p-8 max-w-4xl mx-auto ios-shadow animate-fade-in">
            <Card className="rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Food Analysis</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-danger-red rounded-full"></div>
                  <div className="w-3 h-3 bg-warning-orange rounded-full"></div>
                  <div className="w-3 h-3 bg-health-green rounded-full"></div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-xl p-6 text-center">
                    <div className="w-full h-48 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-white" />
                    </div>
                    <Button className="bg-ios-blue text-white px-6 py-3 rounded-full ios-button">
                      Analyze Food
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Card className="bg-health-green/10 border-2 border-health-green">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-health-green rounded-full flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-health-green">YES</h4>
                          <p className="text-sm text-ios-secondary">Mixed Green Salad</p>
                        </div>
                      </div>
                      <p className="text-ios-text mb-4">Excellent choice! Rich in vitamins, fiber, and antioxidants. Perfect for your weight management goals.</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ios-secondary">Calories: ~180</span>
                        <span className="text-ios-secondary">Confidence: 95%</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="text-center p-3">
                      <div className="text-lg font-bold text-health-green">8</div>
                      <div className="text-xs text-ios-secondary">Today's Yes</div>
                    </Card>
                    <Card className="text-center p-3">
                      <div className="text-lg font-bold text-warning-orange">2</div>
                      <div className="text-xs text-ios-secondary">OK Choices</div>
                    </Card>
                    <Card className="text-center p-3">
                      <div className="text-lg font-bold text-danger-red">1</div>
                      <div className="text-xs text-ios-secondary">No's</div>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powered by Advanced AI</h2>
            <p className="text-xl text-ios-secondary max-w-3xl mx-auto">
              Our platform combines cutting-edge artificial intelligence with professional expertise 
              to deliver accurate, personalized nutrition guidance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center animate-slide-up">
              <div className="w-16 h-16 bg-ios-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-ios-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Analysis</h3>
              <p className="text-ios-secondary">Get food verdicts in under 1 second with 95% accuracy using advanced computer vision.</p>
            </div>
            
            <div className="text-center animate-slide-up animation-delay-100">
              <div className="w-16 h-16 bg-health-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-health-green" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Network</h3>
              <p className="text-ios-secondary">Access certified nutritionists and dietitians for professional guidance and verification.</p>
            </div>
            
            <div className="text-center animate-slide-up animation-delay-200">
              <div className="w-16 h-16 bg-warning-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-warning-orange" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Privacy First</h3>
              <p className="text-ios-secondary">Apple-grade security with on-device processing and transparent data handling practices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-ios-bg">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Three Simple Steps</h2>
            <p className="text-xl text-ios-secondary">Transform your nutrition habits in seconds</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center ios-shadow animate-slide-up">
              <div className="w-16 h-16 bg-gradient-to-br from-ios-blue to-health-green rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Snap or Describe</h3>
              <p className="text-ios-secondary mb-6">Take a photo of your food or simply describe what you're about to eat.</p>
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
            
            <Card className="p-8 text-center ios-shadow animate-slide-up animation-delay-100">
              <div className="w-16 h-16 bg-gradient-to-br from-ios-blue to-health-green rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Instant Verdict</h3>
              <p className="text-ios-secondary mb-6">Receive a clear Yes, No, or OK verdict with detailed explanation and reasoning.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-health-green/10 rounded-lg p-3">
                  <span className="font-medium text-health-green">YES</span>
                  <span className="text-sm text-ios-secondary">Quinoa Bowl</span>
                </div>
                <div className="flex items-center justify-between bg-danger-red/10 rounded-lg p-3">
                  <span className="font-medium text-danger-red">NO</span>
                  <span className="text-sm text-ios-secondary">Fried Chicken</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 text-center ios-shadow animate-slide-up animation-delay-200">
              <div className="w-16 h-16 bg-gradient-to-br from-ios-blue to-health-green rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Track Progress</h3>
              <p className="text-ios-secondary mb-6">Monitor your daily choices, streaks, and health improvements over time.</p>
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ios-secondary">Weekly Score</span>
                  <span className="font-bold text-health-green">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-ios-blue to-health-green h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Health Journey</h2>
            <p className="text-xl text-ios-secondary">From casual guidance to medical-grade precision</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <Card className="p-8 border-2 border-gray-200 tier-card">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="text-4xl font-bold mb-2">€0</div>
                <p className="text-ios-secondary">Forever free</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-health-green" />
                  <span>5 analyses per day</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-health-green" />
                  <span>Basic nutritional info</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-health-green" />
                  <span>Simple yes/no verdicts</span>
                </li>
              </ul>
              <Button onClick={() => window.location.href = "/api/login"} className="w-full bg-gray-100 text-ios-text py-3 rounded-xl font-medium ios-button">
                Get Started
              </Button>
            </Card>
            
            {/* Pro Tier */}
            <Card className="p-8 border-2 border-ios-blue bg-white tier-card transform scale-105 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-ios-blue text-white px-4 py-1">Most Popular</Badge>
              </div>
              <div className="text-center mb-6 mt-4">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">Pro</h3>
                <div className="text-4xl font-bold mb-2 text-gray-900">€19.99</div>
                <p className="text-gray-600">per month</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-health-green" />
                  <span className="text-gray-800">Unlimited analyses</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-health-green" />
                  <span className="text-gray-800">Detailed nutrition tracking</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-health-green" />
                  <span className="text-gray-800">Goal-based recommendations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-health-green" />
                  <span className="text-gray-800">Wearables integration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-health-green" />
                  <span className="text-gray-800">Priority support</span>
                </li>
              </ul>
              <Button onClick={() => window.location.href = "/api/login"} className="w-full bg-ios-blue text-white py-3 rounded-xl font-medium ios-button hover:bg-blue-600">
                Start Pro Trial
              </Button>
            </Card>
            
            {/* Medical Tier */}
            <Card className="p-8 border-2 border-gray-200 tier-card">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Medical</h3>
                <div className="text-4xl font-bold mb-2">€49.99</div>
                <p className="text-ios-secondary">per month</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-health-green" />
                  <span>Medical-grade analysis</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-health-green" />
                  <span>Certified nutritionist access</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-health-green" />
                  <span>Health provider integration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-health-green" />
                  <span>Medication interaction alerts</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-health-green" />
                  <span>HIPAA compliance</span>
                </li>
              </ul>
              <Button onClick={() => window.location.href = "/api/login"} className="w-full bg-ios-blue text-white py-3 rounded-xl font-medium ios-button">
                Contact Sales
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-ios-blue">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Transform Your Health?</h2>
          <p className="text-xl mb-8 text-white">
            Join thousands of users who are already making smarter food choices with AI-powered guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button onClick={() => window.location.href = "/api/login"} className="bg-white text-ios-blue px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button variant="outline" className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/20">
              Download App
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto text-white">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">95%</div>
              <div className="text-sm text-white">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">&lt; 1s</div>
              <div className="text-sm text-white">Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-sm text-white">Happy Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ios-text text-white py-12">
        <div className="page-container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/veridect-logo.png" 
                  alt="Veridect Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="font-semibold text-xl">Veridect</span>
              </div>
              <p className="text-gray-400 mb-4">AI-powered nutrition guidance for healthier living.</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/how-to-use" className="hover:text-white transition-colors">How to Use</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 Veridect. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">HIPAA Compliant</span>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-400 text-sm">GDPR Ready</span>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-400 text-sm">SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
