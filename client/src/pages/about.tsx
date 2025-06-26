import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Target, Users, Globe, Award, Lightbulb, Mail, MapPin, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const TEAM_MEMBERS = [
  {
    name: "Dr. Sarah Chen",
    role: "CEO & Co-Founder",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b47b?w=150&h=150&fit=crop&crop=face",
    bio: "Former Stanford researcher with 10+ years in nutrition science and AI."
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO & Co-Founder", 
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Ex-Google AI engineer specializing in computer vision and health tech."
  },
  {
    name: "Dr. Emily Watson",
    role: "Chief Medical Officer",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    bio: "Board-certified nutritionist and digital health innovation leader."
  },
  {
    name: "Alex Kim",
    role: "Head of Design",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Award-winning UX designer focused on health and wellness applications."
  }
];

const MILESTONES = [
  {
    year: "2023",
    title: "Company Founded",
    description: "Started with a mission to make nutrition simple and accessible"
  },
  {
    year: "2024",
    title: "AI Development",
    description: "Developed our proprietary food analysis AI with 95% accuracy"
  },
  {
    year: "2024",
    title: "Beta Launch",
    description: "Launched beta with 1,000+ early users and achieved 90% satisfaction"
  },
  {
    year: "2024",
    title: "Series A",
    description: "Raised $5M Series A to accelerate growth and expand team"
  }
];

const VALUES = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Health First",
    description: "Every decision we make prioritizes user health and wellbeing.",
    color: "text-danger-red"
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Accuracy Matters",
    description: "We're committed to providing the most accurate and reliable nutrition information.",
    color: "text-ios-blue"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Privacy Respected",
    description: "Your health data is yours. We protect it with bank-level security.",
    color: "text-health-green"
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Inclusive Access",
    description: "Healthy living should be accessible to everyone, regardless of background.",
    color: "text-warning-orange"
  }
];

export default function About() {
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
              <Link href="/how-to-use" onClick={scrollToTop}>
                <Button variant="ghost">How to Use</Button>
              </Link>
              <Link href="/login" onClick={scrollToTop}>
                <Button>Log In</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-8 pb-24 container-padding">
        <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/veridect-logo.png" 
              alt="Veridect Logo" 
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-4xl font-bold text-health-green">About Veridect</h1>
          </div>
          <p className="text-xl text-ios-secondary max-w-3xl mx-auto">
            We're on a mission to make healthy eating simple, accessible, and enjoyable for everyone. 
            One food choice at a time.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="bg-ios-blue">
          <CardContent className="p-8 text-center">
            <Lightbulb className="w-16 h-16 mx-auto mb-6 text-white" />
            <h2 className="text-3xl font-bold mb-4 text-white">Our Mission</h2>
            <p className="text-xl leading-relaxed max-w-4xl mx-auto text-white">
              To bring awareness to healthier nutrition and provide advanced nutrition guidance 
              through instant, AI-powered food analysis that helps people make informed choices 
              without the complexity of traditional calorie counting or nutrition label reading.
            </p>
          </CardContent>
        </Card>

        {/* The Problem */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">The Problem We're Solving</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-ios-secondary leading-relaxed">
              Nutrition is confusing. With conflicting advice, complex labels, and overwhelming choices, 
              making healthy decisions has become unnecessarily complicated. We believe in bringing awareness 
              to healthier nutrition and providing clear, personalized guidance that empowers informed choices.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-danger-red mb-2">73%</div>
                <p className="text-sm text-ios-secondary">of people find nutrition labels confusing</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning-orange mb-2">2.1B</div>
                <p className="text-sm text-ios-secondary">adults worldwide are overweight</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-ios-blue mb-2">80%</div>
                <p className="text-sm text-ios-secondary">of diets fail due to complexity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Solution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Our Solution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-ios-secondary leading-relaxed">
              Veridect transforms complex nutritional analysis into simple verdicts. Our AI analyzes 
              food photos in real-time, considering your personal health goals, dietary restrictions, 
              and preferences to deliver instant guidance you can trust.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3">What Makes Us Different</h4>
                <ul className="space-y-2 text-sm text-ios-secondary">
                  <li>• Instant analysis in under 1 second</li>
                  <li>• Personalized recommendations for your goals</li>
                  <li>• No calorie counting or complex tracking</li>
                  <li>• Privacy-first with on-device processing</li>
                  <li>• Medical-grade accuracy for health conditions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Our Technology</h4>
                <ul className="space-y-2 text-sm text-ios-secondary">
                  <li>• Advanced computer vision AI</li>
                  <li>• Comprehensive nutrition databases</li>
                  <li>• Real-time portion size estimation</li>
                  <li>• Certified nutritionist validation</li>
                  <li>• Continuous learning from user feedback</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {VALUES.map((value, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={value.color}>
                    {value.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{value.title}</h4>
                    <p className="text-ios-secondary">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Founder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Meet Our Founder</CardTitle>
            <p className="text-ios-secondary">
              Passionate entrepreneur dedicated to democratizing nutrition through AI technology.
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-health-green to-ios-blue rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-white font-bold text-4xl">MB</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Michael Bright</h3>
              <p className="text-health-green font-medium mb-4">CEO & Founder</p>
              <p className="text-ios-secondary leading-relaxed mb-6">
                Valencia-based entrepreneur passionate about democratizing nutrition through AI technology. 
                Michael founded Veridect to bring awareness to healthier nutrition and provide advanced nutrition guidance 
                to everyone regardless of their background or location.
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-ios-secondary">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Valencia, Spain</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>€2M Series A Target</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2025 Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-ios-blue" />
              2025 Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-ios-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                    Q2
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Private Beta Launch</h4>
                  <p className="text-ios-secondary">Invitation-only testing with select users</p>
                  <Badge className="mt-2 bg-ios-blue/10 text-ios-blue border-ios-blue/20">Current</Badge>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-health-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                    Q3
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Public Beta Launch</h4>
                  <p className="text-ios-secondary">Currently ongoing - open to all users</p>
                  <Badge className="mt-2 bg-health-green/10 text-health-green border-health-green/20">Ongoing</Badge>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-warning-orange text-white rounded-full flex items-center justify-center text-sm font-bold">
                    Q4
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Full Launch & Scale</h4>
                  <p className="text-ios-secondary">Target 20,000 users and €2M funding for growth acceleration</p>
                  <Badge className="mt-2 bg-warning-orange/10 text-warning-orange border-warning-orange/20">Upcoming</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recognition - Commented out as requested */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Recognition & Awards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg">
                <Award className="w-12 h-12 text-warning-orange mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Best Health App 2024</h4>
                <p className="text-sm text-ios-secondary">TechCrunch Disrupt</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <Award className="w-12 h-12 text-ios-blue mx-auto mb-4" />
                <h4 className="font-semibold mb-2">AI Innovation Award</h4>
                <p className="text-sm text-ios-secondary">Digital Health Summit</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <Award className="w-12 h-12 text-health-green mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Users' Choice</h4>
                <p className="text-sm text-ios-secondary">App Store Awards</p>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Stats */}
        <Card className="bg-ios-bg">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-center mb-8">Impact by Numbers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-ios-blue mb-2">20K</div>
                <p className="text-sm text-ios-secondary">Target Users</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-health-green mb-2">2M+</div>
                <p className="text-sm text-ios-secondary">Food Analyses</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning-orange mb-2">95%</div>
                <p className="text-sm text-ios-secondary">Accuracy Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-danger-red mb-2">4.9/5</div>
                <p className="text-sm text-ios-secondary">User Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-ios-secondary">
              We'd love to hear from you! Whether you have questions, feedback, or partnership opportunities, 
              our team is here to help.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-ios-blue" />
                    <span className="text-sm">info@veridect.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-health-green" />
                    <span className="text-sm">+34 672 810 584</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-warning-orange" />
                    <span className="text-sm">Valencia, Spain</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Press Kit
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Investor Relations
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Partnership Opportunities
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Careers
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-ios-blue">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">Ready to Transform Your Health?</h3>
            <p className="mb-6 text-white">
              Join thousands of users who are already making smarter food choices with Veridect.
            </p>
            <Link href="/login" onClick={scrollToTop}>
              <Button className="bg-white text-ios-blue hover:bg-gray-100 px-8 py-3 text-lg">
                Get Started Today
              </Button>
            </Link>
          </CardContent>
        </Card>
          {/* Back to Home Button */}
          <div className="text-center mt-8">
            <Link href="/" onClick={scrollToTop}>
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
