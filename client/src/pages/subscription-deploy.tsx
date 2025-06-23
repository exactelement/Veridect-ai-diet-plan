import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Shield, Zap, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Perfect for getting started with food analysis",
    features: [
      "5 food analyses per day",
      "Basic nutritional information",
      "Simple Yes/No/OK verdicts",
      "Access to food database",
      "Basic progress tracking"
    ],
    icon: <Zap className="w-6 h-6" />,
    color: "text-green-600"
  },
  {
    id: "pro",
    name: "Pro",
    price: 19.99,
    description: "Advanced features for serious health enthusiasts",
    features: [
      "Unlimited food analyses",
      "Detailed nutritional breakdown",
      "Personalized recommendations",
      "Advanced progress tracking",
      "Weekly challenges & rewards",
      "Priority customer support",
      "Export data & reports"
    ],
    icon: <Crown className="w-6 h-6" />,
    popular: true,
    color: "text-blue-600"
  },
  {
    id: "medical",
    name: "Medical",
    price: 49.99,
    description: "Professional-grade analysis for healthcare providers",
    features: [
      "Everything in Pro",
      "Medical-grade accuracy",
      "Integration with health records",
      "Batch analysis tools",
      "White-label options",
      "API access",
      "Dedicated account manager",
      "HIPAA compliance"
    ],
    icon: <Shield className="w-6 h-6" />,
    color: "text-purple-600"
  }
];

function CheckoutForm({ tier, onBack }: { tier: SubscriptionTier; onBack: () => void }) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
      toast({
        title: "Payment Integration Coming Soon",
        description: "Stripe payment processing will be available after deployment.",
      });
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-2 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Subscription</CardTitle>
          <p className="text-gray-600">
            You're upgrading to {tier.name} for €{tier.price}/month
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <div className="text-blue-600 mb-4">
              {tier.icon}
            </div>
            <h3 className="font-semibold text-lg mb-2">{tier.name} Plan</h3>
            <p className="text-blue-700 mb-4">{tier.description}</p>
            <div className="text-3xl font-bold text-blue-800 mb-4">
              €{tier.price}<span className="text-lg font-normal">/month</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">What you'll get:</h4>
            <ul className="space-y-2">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-6 border rounded-lg bg-yellow-50 text-center">
              <p className="text-yellow-800 font-medium mb-2">Payment Integration Coming Soon</p>
              <p className="text-yellow-600 text-sm">
                Secure Stripe payment processing will be enabled after deployment.
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="flex-1"
              >
                Back to Plans
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-gray-400 cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Coming Soon"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Subscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/subscription/cancel", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentTier = user?.subscriptionTier || "free";
  const isActive = user?.subscriptionStatus === "active";

  const handleSelectTier = (tier: SubscriptionTier) => {
    if (tier.id === "free") {
      return;
    }
    setSelectedTier(tier);
  };

  if (selectedTier) {
    return (
      <div className="pt-20 pb-8 container-padding">
        <CheckoutForm tier={selectedTier} onBack={() => setSelectedTier(null)} />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-8 container-padding">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Upgrade your health journey with powerful features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subscriptionTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`relative transition-all duration-200 hover:shadow-lg ${
                tier.popular ? "ring-2 ring-blue-500" : ""
              } ${
                currentTier === tier.id ? "bg-green-50 border-green-200" : ""
              }`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  Most Popular
                </Badge>
              )}
              
              {currentTier === tier.id && (
                <Badge className="absolute -top-3 right-4 bg-green-600">
                  Current Plan
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className={`mx-auto mb-4 ${tier.color}`}>
                  {tier.icon}
                </div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {tier.price === 0 ? "Free" : `€${tier.price}`}
                  {tier.price > 0 && <span className="text-lg font-normal">/month</span>}
                </div>
                <p className="text-gray-600 text-sm">{tier.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectTier(tier)}
                  disabled={currentTier === tier.id}
                  className={`w-full ${
                    currentTier === tier.id
                      ? "bg-green-600 text-white cursor-default"
                      : tier.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : ""
                  }`}
                  variant={tier.popular ? "default" : "outline"}
                >
                  {currentTier === tier.id
                    ? "Current Plan"
                    : tier.price === 0
                    ? "Free Forever"
                    : `Upgrade to ${tier.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {user?.subscriptionTier && user?.subscriptionTier !== "free" && isActive && (
          <div className="text-center mt-8">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Current Subscription</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You're currently on the {user.subscriptionTier} plan
                </p>
                <Button
                  onClick={() => cancelSubscriptionMutation.mutate()}
                  disabled={cancelSubscriptionMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  {cancelSubscriptionMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}