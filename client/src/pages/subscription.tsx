import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Shield, Zap, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// Stripe temporarily disabled for deployment compatibility
// import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
// import { loadStripe } from "@stripe/stripe-js";

// const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
//   ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
//   : null;

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

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
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
    price: 19.99,
    description: "For serious health enthusiasts",
    features: [
      "Unlimited food analyses",
      "Detailed nutrition tracking",
      "Goal-based recommendations",
      "Weekly progress reports",
      "Wearables integration",
      "Priority support",
      "Advanced analytics",
      "Custom meal plans"
    ],
    icon: <Crown className="w-6 h-6" />,
    popular: true,
    color: "blue"
  },
  {
    id: "medical",
    name: "Medical",
    price: 99.99,
    description: "Medical-grade precision",
    features: [
      "Everything in Pro",
      "Medical-grade analysis",
      "Certified nutritionist access",
      "Health provider integration",
      "Medication interaction alerts",
      "HIPAA compliance",
      "Personal health coach",
      "Lab results integration",
      "Prescription diet plans"
    ],
    icon: <Shield className="w-6 h-6" />,
    color: "green"
  }
];

function SubscriptionForm({ tier }: { tier: SubscriptionTier }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const createSubscriptionMutation = useMutation({
    mutationFn: async (tierId: string) => {
      const response = await apiRequest("POST", "/api/subscription/create", { tier: tierId });
      return response.json();
    },
    onSuccess: async (data) => {
      if (!stripe || !elements) return;

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription?success=true`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    createSubscriptionMutation.mutate(tier.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-ios-blue text-white py-3 text-lg"
      >
        {isProcessing ? "Processing..." : `Subscribe to ${tier.name} - $${tier.price}/month`}
      </Button>
    </form>
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

  return (
    <div className="pt-20 pb-8 container-padding">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-ios-secondary">
            Upgrade your health journey with powerful features
          </p>
        </div>

        {/* Current Subscription Status */}
        {user && (
          <Card className="bg-ios-blue/5 border-ios-blue/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Current Plan</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className="capitalize">{currentTier}</Badge>
                    {isActive && <Badge variant="secondary">Active</Badge>}
                    {!isActive && currentTier !== "free" && <Badge variant="destructive">Cancelled</Badge>}
                  </div>
                </div>
                {currentTier !== "free" && isActive && (
                  <Button
                    variant="outline"
                    onClick={() => cancelSubscriptionMutation.mutate()}
                    disabled={cancelSubscriptionMutation.isPending}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Tiers */}
        <div className="grid md:grid-cols-3 gap-8">
          {SUBSCRIPTION_TIERS.map((tier) => {
            const isCurrent = tier.id === currentTier;
            const canUpgrade = tier.id !== "free" && tier.id !== currentTier;
            
            return (
              <Card 
                key={tier.id}
                className={`relative tier-card ${
                  tier.popular ? "border-2 border-ios-blue scale-105" : ""
                } ${isCurrent ? "bg-gray-50" : ""}`}
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
                    {tier.price === 0 ? 'Free' : `€${tier.price}`}
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
                        onClick={() => setSelectedTier(tier)}
                        className={`w-full ${
                          tier.color === "blue" ? "bg-ios-blue text-white" :
                          tier.color === "green" ? "bg-health-green text-white" :
                          ""
                        }`}
                      >
                        Upgrade to {tier.name}
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

        {/* Subscription Modal */}
        {selectedTier && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Subscribe to {selectedTier.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTier(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-2xl font-bold">${selectedTier.price}/month</p>
                  <p className="text-ios-secondary">{selectedTier.description}</p>
                </div>

                {stripePromise ? (
                  <Elements stripe={stripePromise}>
                    <SubscriptionForm tier={selectedTier} />
                  </Elements>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-ios-secondary mb-4">
                      Payment processing is temporarily unavailable.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedTier(null)}
                      className="w-full"
                    >
                      Back to Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Can I change my plan anytime?</h4>
              <p className="text-ios-secondary">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-ios-secondary">The Free plan is available forever. Paid plans come with a 14-day money-back guarantee.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-ios-secondary">We accept all major credit cards and PayPal through our secure payment processor.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Is my data secure?</h4>
              <p className="text-ios-secondary">Yes, we use bank-level encryption and are HIPAA compliant for Medical tier users.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
