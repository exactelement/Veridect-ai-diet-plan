import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Target, Users, Globe, Award, Lightbulb, Mail, MapPin } from "lucide-react";

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
    description: "Every decision we make prioritizes user health and wellbeing above profit.",
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
  return (
    <div className="pt-20 pb-8 container-padding">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">About YesNoApp</h1>
          <p className="text-xl text-ios-secondary max-w-3xl mx-auto">
            We're on a mission to make healthy eating simple, accessible, and enjoyable for everyone. 
            One food choice at a time.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="bg-gradient-to-br from-ios-blue to-health-green text-white">
          <CardContent className="p-8 text-center">
            <Lightbulb className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-xl text-white/90 leading-relaxed max-w-4xl mx-auto">
              To democratize nutrition knowledge by providing instant, AI-powered food analysis 
              that helps people make healthier choices without the complexity of traditional 
              calorie counting or nutrition label reading.
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
              making healthy decisions has become unnecessarily complicated. We believe healthy eating 
              should be as simple as asking "Is this good for me?" and getting a clear, personalized answer.
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
              YesNoApp transforms complex nutritional analysis into simple verdicts. Our AI analyzes 
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

        {/* Team */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Meet Our Team</CardTitle>
            <p className="text-ios-secondary">
              Experts in AI, nutrition science, and health technology working together to improve global health.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TEAM_MEMBERS.map((member, index) => (
                <div key={index} className="text-center">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h4 className="font-semibold">{member.name}</h4>
                  <p className="text-ios-blue text-sm mb-2">{member.role}</p>
                  <p className="text-ios-secondary text-xs">{member.bio}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Our Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {MILESTONES.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-ios-blue text-white rounded-full flex items-center justify-center font-bold">
                      {milestone.year}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{milestone.title}</h4>
                    <p className="text-ios-secondary">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recognition */}
        <Card>
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
        </Card>

        {/* Stats */}
        <Card className="bg-ios-bg">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-center mb-8">Impact by Numbers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-ios-blue mb-2">50K+</div>
                <p className="text-sm text-ios-secondary">Active Users</p>
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
                    <span className="text-sm">hello@yesnoapp.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-health-green" />
                    <span className="text-sm">support@yesnoapp.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-warning-orange" />
                    <span className="text-sm">San Francisco, CA</span>
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
        <Card className="bg-gradient-to-br from-health-green to-ios-blue" style={{color: 'white'}}>
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4" style={{color: 'white'}}>Ready to Transform Your Health?</h3>
            <p className="mb-6" style={{color: 'white'}}>
              Join thousands of users who are already making smarter food choices with YesNoApp.
            </p>
            <Button className="bg-white text-ios-blue hover:bg-white/90 px-8 py-3 text-lg" style={{backgroundColor: 'white', color: '#007AFF'}}>
              Get Started Today
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
