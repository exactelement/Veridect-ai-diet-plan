import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Shield, Check, Zap, ArrowLeft, Tag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  comingSoon?: boolean;
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
    price: 12,

    features: [
      "Unlimited analyses",
      "Food logging & progress tracking",
      "Challenges and bonus points",
      "Leaderboard access",
      "Food history",
      "Personalised AI analysis",
      "Priority support",
      "🎉 Limited promotional price - normally €10/month!"
    ],
    limitations: [],
    icon: <Crown className="w-6 h-6 text-yellow-500" />,
    popular: true,
    color: "border-yellow-200 bg-yellow-50"
  },
  {
    id: "advanced",
    name: "Advanced",
    price: 50,
    description: "For professionals & advanced users",
    comingSoon: true,
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
    } else {
      toast({
        title: "Payment Successful",
        description: "Welcome to Pro! Your subscription is now active.",
      });
    }

    setIsProcessing(false);
  };

  return (
    <div className="max-w-md mx-auto mb-24">
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {tier.icon}
          </div>
          <CardTitle className="text-2xl">{tier.name} Plan</CardTitle>
          <div className="text-3xl font-bold text-ios-blue">
            €{tier.price}
            <span className="text-sm font-normal text-ios-secondary">/month</span>
            {tier.id === "pro" && (
              <div className="text-xs text-yellow-600 font-medium mt-1">
                €1/month billed annually - Limited offer!
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
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Fetch current subscription status
  const { data: subscriptionStatus } = useQuery({
    queryKey: ["/api/subscription/status"],
    staleTime: 30000, // 30 seconds
  });

  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/subscription/validate-coupon", { 
        couponCode: code 
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAppliedCoupon(data.coupon);
      toast({
        title: "Coupon Applied!",
        description: `${data.coupon.percent_off || data.coupon.amount_off}% discount applied`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Invalid Coupon",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (tierId: string) => {
      const response = await apiRequest("POST", "/api/subscription/create", { 
        tier: tierId,
        couponCode: appliedCoupon?.id || undefined
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && !data.clientSecret) {
        // 100% discount - no payment needed
        toast({
          title: "Subscription Activated!",
          description: "Your Pro subscription is now active with 100% discount",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        return;
      }
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

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/cancel");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Cancelled",
        description: data.message,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/reactivate");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Reactivated",
        description: data.message,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reactivate subscription",
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

    if (tier.comingSoon) {
      toast({
        title: "Coming Soon",
        description: `${tier.name} tier will be available soon.`,
      });
      return;
    }

    setSelectedTier(tier);
    createSubscriptionMutation.mutate(tier.id);
  };

  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Subscription Setup In Progress</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-ios-secondary mb-4">
              We're setting up the payment system for Pro subscriptions.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Coming Very Soon: €1/month Pro Tier billed annually (Limited offer!)
              </p>
              <ul className="text-sm text-blue-700 text-left space-y-1">
                <li>• Unlimited food analyses</li>
                <li>• Progress tracking & challenges</li>
                <li>• Leaderboard access</li>
                <li>• Personalized AI recommendations</li>
              </ul>
            </div>
            <p className="text-xs text-ios-secondary">
              You can still enjoy 5 free analyses daily while we finalize payments!
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
      <div className="container mx-auto px-4 py-8 mt-16 pb-32">
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
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-ios-primary mb-2">Choose Your Plan</h1>
        <p className="text-ios-secondary">
          Unlock advanced features to supercharge your nutrition journey
        </p>
      </div>
      
      {/* Coupon Code Section */}
      <Card className="mb-6 border-green-200 bg-green-50 max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Have a coupon code?</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCouponInput(!showCouponInput)}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              {showCouponInput ? "Hide" : "Apply Coupon"}
            </Button>
          </div>
          
          {showCouponInput && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button
                  onClick={() => applyCouponMutation.mutate(couponCode)}
                  disabled={!couponCode || applyCouponMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {applyCouponMutation.isPending ? "Validating..." : "Apply"}
                </Button>
              </div>
              
              {appliedCoupon && (
                <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Coupon Applied: {appliedCoupon.percent_off}% off
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {subscriptionTiers.map((tier) => {
          // Calculate discounted price if coupon is applied
          let displayPrice = tier.price;
          let originalPrice = tier.price;
          if (appliedCoupon && tier.id === 'pro') {
            if (appliedCoupon.percent_off) {
              displayPrice = tier.price * (1 - appliedCoupon.percent_off / 100);
            } else if (appliedCoupon.amount_off) {
              displayPrice = Math.max(0, tier.price - (appliedCoupon.amount_off / 100));
            }
          }
          
          const isCurrentTier = subscriptionStatus?.tier === tier.id;
          const isActive = subscriptionStatus?.status === 'active';
          const canUpgrade = tier.id === 'pro' && (subscriptionStatus?.tier === 'free' || !subscriptionStatus?.tier);
          
          return (
          <Card 
            key={tier.id} 
            className={`relative ${tier.color} hover:shadow-lg transition-all duration-200 ${
              tier.popular ? 'ring-2 ring-yellow-400' : ''
            } ${tier.comingSoon ? 'opacity-75' : ''} overflow-hidden`}
          >
            {tier.popular && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-yellow-500 text-white px-3 py-1 text-xs">Most Popular</Badge>
              </div>
            )}
            
            {tier.comingSoon && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-gray-600 text-white px-3 py-1 text-xs">Coming Soon</Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                {tier.icon}
              </div>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <div className="text-2xl font-bold text-ios-blue">
                {tier.id === "pro" ? (
                  <>
                    {appliedCoupon && displayPrice !== originalPrice ? (
                      <>
                        <span className="line-through text-gray-400 text-lg">€{originalPrice}</span>
                        <span className="ml-2 text-green-600">€{displayPrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <>€1</>
                    )}
                    <span className="text-sm font-normal text-ios-secondary">/month</span>
                    <div className="text-xs text-ios-secondary font-normal">charged annually (€12/year)</div>
                    <div className="text-xs text-red-600 font-medium">Limited offer! Normally €10/month</div>
                  </>
                ) : (
                  <>
                    €{tier.price}
                    <span className="text-sm font-normal text-ios-secondary">/month</span>
                  </>
                )}
              </div>
              <p className="text-sm text-ios-secondary">{tier.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-ios-primary">Features:</h4>
                <ul className="space-y-1">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {tier.limitations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-ios-secondary">Limitations:</h4>
                  <ul className="space-y-1">
                    {tier.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start text-sm text-ios-secondary">
                        <span className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0">•</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button
                onClick={() => handleSelectTier(tier)}
                disabled={createSubscriptionMutation.isPending || tier.comingSoon}
                className="w-full"
                variant={tier.id === "free" ? "outline" : "default"}
              >
                {tier.comingSoon ? (
                  "Coming Soon"
                ) : createSubscriptionMutation.isPending && selectedTier?.id === tier.id ? (
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
          );
        })}
      </div>
      
      {/* Current subscription status and management */}
      {subscriptionStatus && subscriptionStatus.tier !== "free" && (
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader className="text-center">
            <CardTitle>Subscription Management</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <p className="text-sm text-ios-secondary mb-2">Current plan:</p>
              <Badge className="bg-blue-600 text-white px-4 py-2">
                {subscriptionTiers.find(t => t.id === subscriptionStatus.tier)?.name}
              </Badge>
            </div>
            
            {subscriptionStatus.cancelAtPeriodEnd ? (
              <div className="space-y-3">
                <p className="text-sm text-orange-600">
                  Your subscription will end on {new Date(subscriptionStatus.currentPeriodEnd * 1000).toLocaleDateString()}
                </p>
                <Button
                  onClick={() => reactivateSubscriptionMutation.mutate()}
                  disabled={reactivateSubscriptionMutation.isPending}
                  className="w-full"
                >
                  {reactivateSubscriptionMutation.isPending ? "Processing..." : "Reactivate Subscription"}
                </Button>
              </div>
            ) : subscriptionStatus.canCancel && (
              <Button
                onClick={() => cancelSubscriptionMutation.mutate()}
                disabled={cancelSubscriptionMutation.isPending}
                variant="outline"
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
              >
                {cancelSubscriptionMutation.isPending ? "Processing..." : "Cancel Subscription"}
              </Button>
            )}
            
            <p className="text-xs text-ios-secondary">
              Status: {subscriptionStatus.status}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Legal footer links */}
      <div className="text-center text-xs text-ios-secondary space-x-4 mt-8 mb-4">
        <span>By subscribing, you agree to our </span>
        <button 
          onClick={() => window.open('/terms', '_blank')}
          className="text-ios-blue hover:underline"
        >
          Terms of Service
        </button>
        <span>•</span>
        <button 
          onClick={() => window.open('/refund-policy', '_blank')}
          className="text-ios-blue hover:underline"
        >
          Refund Policy
        </button>
        <span>•</span>
        <button 
          onClick={() => window.open('/privacy', '_blank')}
          className="text-ios-blue hover:underline"
        >
          Privacy Policy
        </button>
      </div>
      
      {/* Bottom spacer to prevent footer overlap */}
      <div className="h-20"></div>
    </div>
  );
}