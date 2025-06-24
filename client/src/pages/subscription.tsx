import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Check, Zap, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing VITE_STRIPE_PUBLIC_KEY - Stripe payments will not work');
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  color: string;
  limitations: string[];
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Perfect for trying Veridect",
    features: [
      "5 analyses per day",
      "Basic nutritional info",
      "Simple yes/no verdicts"
    ],
    limitations: [
      "Limited to 5 analyses daily",
      "No food logging functionality",
      "No personalization features",
      "No leaderboard access",
      "No food history access",
      "Basic support only"
    ],
    icon: <Check className="w-6 h-6 text-green-500" />,
    color: "border-gray-200 bg-white"
  },
  {
    id: "pro",
    name: "Pro",
    price: 1.00,
    description: "Launch promotion - normally €10/month",
    features: [
      "Unlimited food analyses",
      "Detailed nutritional breakdown",
      "Advanced AI insights",
      "Personalized recommendations",
      "Export food history",
      "Priority support",
      "🎉 1-year promotional price"
    ],
    limitations: [],
    icon: <Crown className="w-6 h-6 text-yellow-500" />,
    popular: true,
    color: "border-yellow-200 bg-yellow-50"
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
      "White-label options",
      "Dedicated account manager"
    ],
    limitations: [],
    icon: <Shield className="w-6 h-6 text-purple-500" />,
    color: "border-purple-200 bg-purple-50"
  }
];

function CheckoutForm({ tier, onBack }: { tier: SubscriptionTier; onBack: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/?subscription=success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {tier.icon}
          </div>
          <CardTitle className="text-2xl">{tier.name} Plan</CardTitle>
          <div className="text-3xl font-bold text-ios-blue">
            €{tier.price.toFixed(2)}
            <span className="text-sm font-normal text-ios-secondary">/month</span>
            {tier.id === "pro" && (
              <div className="text-xs text-yellow-600 font-medium mt-1">
                Was €10/month - Limited time offer!
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack}
                className="flex-1"
                disabled={isProcessing}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={!stripe || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Subscribe
                  </>
                )}
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
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");

  const createSubscriptionMutation = useMutation({
    mutationFn: async (tierId: string) => {
      const response = await apiRequest("POST", "/api/subscriptions/create", { tierId });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectTier = (tier: SubscriptionTier) => {
    if (tier.id === "free") {
      toast({
        title: "Already on Free Plan",
        description: "You're currently using the free tier.",
      });
      return;
    }

    if (tier.id === user?.subscriptionTier) {
      toast({
        title: "Current Plan",
        description: `You're already subscribed to the ${tier.name} plan.`,
      });
      return;
    }

    setSelectedTier(tier);
    createSubscriptionMutation.mutate(tier.id);
  };

  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Subscription Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-ios-secondary mb-4">
              Stripe payment integration is not configured yet.
            </p>
            <p className="text-sm text-ios-secondary">
              Please contact support for subscription options.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedTier && clientSecret && stripePromise) {
    const options = {
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
      },
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm 
            tier={selectedTier} 
            onBack={() => {
              setSelectedTier(null);
              setClientSecret("");
            }} 
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-ios-primary mb-2">
          Choose Your Plan
        </h1>
        <p className="text-ios-secondary">
          Unlock the full potential of AI-powered nutrition analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {subscriptionTiers.map((tier) => (
          <Card 
            key={tier.id} 
            className={`relative ${tier.color} ${tier.popular ? 'ring-2 ring-ios-blue' : ''} transition-all hover:shadow-lg`}
          >
            {tier.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-ios-blue text-white">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {tier.icon}
              </div>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <div className="text-2xl font-bold text-ios-blue">
                €{tier.price.toFixed(2)}
                <span className="text-sm font-normal text-ios-secondary">/month</span>
                {tier.id === "pro" && (
                  <div className="text-xs text-yellow-600 font-medium mt-1">
                    Was €10/month - Limited time offer!
                  </div>
                )}
              </div>
              <p className="text-sm text-ios-secondary">{tier.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Features:</h4>
                <ul className="space-y-1">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              {tier.limitations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Limitations:</h4>
                  <ul className="space-y-1">
                    {tier.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start text-sm text-red-600">
                        <span className="mr-2 mt-0.5">•</span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button 
                onClick={() => handleSelectTier(tier)}
                className="w-full"
                variant={user?.subscriptionTier === tier.id ? "outline" : "default"}
                disabled={createSubscriptionMutation.isPending}
              >
                {createSubscriptionMutation.isPending && selectedTier?.id === tier.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : user?.subscriptionTier === tier.id ? (
                  "Current Plan"
                ) : tier.id === "free" ? (
                  "Free Plan"
                ) : (
                  `Upgrade to ${tier.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {user?.subscriptionTier && user.subscriptionTier !== "free" && (
        <div className="text-center mt-8">
          <p className="text-sm text-ios-secondary">
            Current plan: <strong>{subscriptionTiers.find(t => t.id === user.subscriptionTier)?.name}</strong>
          </p>
        </div>
      )}
    </div>
  );
}