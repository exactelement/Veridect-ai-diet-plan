import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, Target, Calendar, Download, Mail } from "lucide-react";
import TopHeader from "@/components/top-header";

export default function Investor() {
  const metrics = [
    { label: "Market Size", value: "$4.5T", color: "text-health-green", bg: "bg-health-green/10" },
    { label: "Growth Rate", value: "25%", color: "text-ios-blue", bg: "bg-ios-blue/10" },
    { label: "5-Year ARR Target", value: "$500M", color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "AI Accuracy", value: "95%+", color: "text-warning-orange", bg: "bg-warning-orange/10" }
  ];

  const milestones = [
    { quarter: "Q1 2025", milestone: "MVP Launch & Initial User Base", status: "completed" },
    { quarter: "Q2 2025", milestone: "Private Beta Launch", status: "current" },
    { quarter: "Q3 2025", milestone: "Public Beta Launch - Currently Ongoing", status: "current" },
    { quarter: "Q4 2025", milestone: "Full Launch & Scale to 20K Users", status: "upcoming" }
  ];

  const traction = [
    { metric: "User Registrations", value: "20,000+", growth: "+150% MoM" },
    { metric: "Daily Active Users", value: "5,000+", growth: "+85% MoM" },
    { metric: "Food Analyses", value: "100,000+", growth: "+200% MoM" },
    { metric: "Conversion Rate", value: "12%", growth: "+3% MoM" }
  ];

  return (
    <>
      <TopHeader />
      <div className="min-h-screen bg-gradient-to-br from-ios-bg via-white to-ios-gray-50 pt-20 pb-24">
        <div className="container-padding">
          <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <Badge className="mb-4 bg-ios-blue/10 text-ios-blue border-ios-blue/20">
              New
            </Badge>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-ios-blue to-health-green bg-clip-text text-transparent mb-4">
              Investor Presentation
            </h1>
            <p className="text-xl text-ios-secondary max-w-3xl mx-auto">
              View our comprehensive investor presentation to learn more about Veridect's vision, 
              market opportunity, and growth potential.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 bg-gradient-to-r from-health-green to-health-green/80 hover:from-health-green/90 hover:to-health-green/70">
              <TrendingUp className="w-5 h-5 mr-3" />
              View Presentation
            </Button>
            <Button variant="outline" className="h-16 border-ios-blue/20 text-ios-blue hover:bg-ios-blue/5">
              <TrendingUp className="w-5 h-5 mr-3" />
              View Roadmap
            </Button>
            <Button variant="outline" className="h-16 border-purple-500/20 text-purple-500 hover:bg-purple-500/5">
              <DollarSign className="w-5 h-5 mr-3" />
              Investor Booklet
            </Button>
          </div>

          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-3" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                  <div key={index} className={`p-6 rounded-lg ${metric.bg} text-center`}>
                    <div className={`text-3xl font-bold ${metric.color} mb-2`}>
                      {metric.value}
                    </div>
                    <div className="text-sm text-ios-secondary">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Traction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-3" />
                Current Traction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {traction.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-ios-text mb-1">
                      {item.value}
                    </div>
                    <div className="text-sm text-ios-secondary mb-2">
                      {item.metric}
                    </div>
                    <Badge className="bg-health-green/10 text-health-green border-health-green/20 text-xs">
                      {item.growth}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Vision */}
          <Card className="bg-gradient-to-r from-ios-blue/5 to-health-green/5">
            <CardHeader>
              <CardTitle>Product Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-ios-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-ios-blue" />
                  </div>
                  <h3 className="font-semibold mb-2">Consumer Health</h3>
                  <p className="text-sm text-ios-secondary">
                    Democratizing nutrition guidance through AI-powered instant food analysis
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-health-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-health-green" />
                  </div>
                  <h3 className="font-semibold mb-2">B2B2C Expansion</h3>
                  <p className="text-sm text-ios-secondary">
                    Partnering with healthcare providers, insurance companies, and wellness platforms
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Global Scale</h3>
                  <p className="text-sm text-ios-secondary">
                    International expansion with localized nutrition guidelines and partnerships
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-3" />
                2025 Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-lg border border-ios-gray-200">
                    <div className={`w-4 h-4 rounded-full ${
                      milestone.status === 'completed' ? 'bg-health-green' :
                      milestone.status === 'current' ? 'bg-ios-blue' :
                      'bg-ios-gray-200'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{milestone.milestone}</h3>
                        <Badge className={
                          milestone.status === 'completed' ? 'bg-health-green/10 text-health-green border-health-green/20' :
                          milestone.status === 'current' ? 'bg-ios-blue/10 text-ios-blue border-ios-blue/20' :
                          'bg-ios-gray-100 text-ios-secondary border-ios-gray-200'
                        }>
                          {milestone.quarter}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-gradient-to-r from-purple-500/5 to-ios-blue/5">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 border-ios-blue/20 text-ios-blue hover:bg-ios-blue/5">
                  <Mail className="w-5 h-5 mr-3" />
                  Schedule a Meeting
                </Button>
                <Button variant="outline" className="h-12 border-purple-500/20 text-purple-500 hover:bg-purple-500/5">
                  <Download className="w-5 h-5 mr-3" />
                  Download Pitch Deck
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-white/50 rounded-lg">
                <p className="text-sm text-ios-secondary text-center">
                  For investment inquiries, partnerships, or detailed financial projections, 
                  please contact our investor relations team at info@veridect.com
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