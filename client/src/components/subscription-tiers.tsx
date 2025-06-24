import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Shield, Zap } from "lucide-react";

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  color: string;
}

interface SubscriptionTiersProps {
  currentTier?: string;
  onSelectTier: (tier: SubscriptionTier) => void;
}

const TIERS: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Perfect for getting started",
    features: [
      "5 food analyses per day",
      "Basic Yes/No verdicts",
      "Simple explanations",
      "Community access",
      "Basic nutrition info"
    ],
    icon: <Zap className="w-6 h-6" />,
    color: "gray"
  },
  {
    id: "pro",
    name: "Pro",
    price: 1.00,
    description: "€12 paid annually - normally €10/month",
    features: [
      "Unlimited analyses",
      "Food logging & progress tracking",
      "Challenges and bonus points",
      "Leaderboard & community access",
      "Food history",
      "Personalised AI analysis",
      "Priority support",
      "Advanced analytics"
    ],
    icon: <Crown className="w-6 h-6" />,
    popular: true,
    color: "blue"
  },
  {
    id: "advanced",
    name: "Advanced",
    price: 50.00,
    description: "For professionals & advanced users",
    features: [
      "Everything in Pro",
      "Professional-grade analysis",
      "Advanced nutrition metrics",
      "Clinical data integration",
      "Team collaboration tools",
      "API access",
      "Access to professional nutritionist",
      "Dedicated account manager"
    ],
    icon: <Shield className="w-6 h-6" />,
    color: "green"
  }
];

export default function SubscriptionTiers({ currentTier, onSelectTier }: SubscriptionTiersProps) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {TIERS.map((tier) => {
        const isCurrent = tier.id === currentTier;
        const canUpgrade = tier.id !== "free" && tier.id !== currentTier;
        
        return (
          <Card 
            key={tier.id}
            className={`relative tier-card ${
              tier.popular ? "border-2 border-ios-blue scale-105" : ""
            } ${isCurrent ? "bg-gray-50" : ""} ${
              tier.id === "advanced" ? "opacity-60 grayscale" : ""
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-ios-blue text-white">Most Popular</Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                tier.color === "blue" ? "bg-ios-blue text-white" :
                tier.color === "green" ? "bg-health-green text-white" :
                "bg-gray-200 text-gray-600"
              }`}>
                {tier.icon}
              </div>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <div className="text-4xl font-bold">
                €{tier.price}
                {tier.price > 0 && <span className="text-lg font-normal text-ios-secondary">/month</span>}
              </div>
              <p className="text-ios-secondary">{tier.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-health-green mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                {isCurrent ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : tier.id === "free" ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={currentTier === "free"}
                  >
                    {currentTier === "free" ? "Current Plan" : "Downgrade"}
                  </Button>
                ) : canUpgrade ? (
                  <Button
                    onClick={() => tier.id === "advanced" ? null : onSelectTier(tier)}
                    disabled={tier.id === "advanced"}
                    className={`w-full ${
                      tier.id === "advanced" ? "bg-gray-400 text-gray-600" :
                      tier.color === "blue" ? "bg-ios-blue text-white" :
                      tier.color === "green" ? "bg-health-green text-white" :
                      ""
                    }`}
                  >
                    {tier.id === "advanced" ? "Coming Soon" : `Upgrade to ${tier.name}`}
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    Contact Sales
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
