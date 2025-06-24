import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Chrome, Apple, Mail, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string()
    .min(1, "First name is required")
    .transform((name) => name.trim()),
  lastName: z.string()
    .min(1, "Last name is required")
    .transform((name) => name.trim()),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((email) => email.toLowerCase().trim()),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function Login() {
  const { toast } = useToast();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('token');
  const errorParam = urlParams.get('error');

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(resetToken ? 'reset' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Auto-focus appropriate field based on mode
  useEffect(() => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      if (mode === 'register') {
        // Focus on first name field for registration
        const firstNameInput = document.querySelector('input[name="firstName"]') as HTMLInputElement;
        if (firstNameInput) {
          firstNameInput.focus();
        }
      } else {
        // Focus on email field for login, forgot password, and reset password
        const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
        if (emailInput) {
          emailInput.focus();
        }
      }
    }, 100);
  }, [mode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + R to switch to register mode
      if (e.altKey && e.key === 'r' && mode === 'login') {
        e.preventDefault();
        setMode('register');
      }
      // Alt + L to switch to login mode
      if (e.altKey && e.key === 'l' && mode === 'register') {
        e.preventDefault();
        setMode('login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  // Handle URL error parameters
  useEffect(() => {
    if (errorParam) {
      let title = "Authentication Error";
      let description = "";

      switch (errorParam) {
        case 'google_oauth_not_configured':
          title = "Google Sign-In Not Available";
          description = "Google authentication requires setup. Please use email registration for now or contact support.";
          break;
        case 'google_failed':
          title = "Google Sign-In Failed";
          description = "Google authentication encountered an error. Please try again or use email login.";
          break;
        case 'use_email_login':
          title = "Use Email Login Instead";
          description = "This email is already registered with a password. Please sign in using your email and password instead of Google.";
          break;
        case 'use_google_login':
          title = "Use Google Login Instead";
          description = "This email is already registered with Google. Please use 'Sign in with Google' instead of Apple ID.";
          break;
        case 'use_apple_login':
          title = "Use Apple Login Instead";
          description = "This email is already registered with Apple ID. Please use 'Sign in with Apple' instead.";
          break;
        case 'apple_auth_failed':
          title = "Apple Sign-In Failed";
          description = "Apple authentication encountered an error. Please try again or use email login.";
          break;
        default:
          description = "An authentication error occurred. Please try email login instead.";
      }

      toast({
        title,
        description,
        variant: "destructive",
      });

      // Clean up URL parameter
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [errorParam, toast]);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", firstName: "", lastName: "" },
  });

  const forgotForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: resetToken || "", newPassword: "", confirmPassword: "" },
  });

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (response.ok) {
        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        
        // Smooth transition instead of hard reload
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Network error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Account Created!",
          description: "Welcome to Veridect! Setting up your profile...",
          duration: 3000,
        });
        
        // Smooth transition to onboarding
        setTimeout(() => {
          window.location.href = "/onboarding";
        }, 800);
      } else {
        const error = await response.json();
        const errorMessage = error.message || "Failed to create account";
        
        if (response.status === 409) {
          const friendlyMessage = "This email is already registered. Try logging in instead.";
          registerForm.setError("email", {
            type: "manual",
            message: friendlyMessage
          });
          toast({
            title: "Email Already Registered",
            description: friendlyMessage,
            variant: "destructive",
            duration: 5000,
          });
        } else if (errorMessage.includes("valid email")) {
          registerForm.setError("email", {
            type: "manual",
            message: errorMessage
          });
          toast({
            title: "Invalid Email",
            description: errorMessage,
            variant: "destructive",
            duration: 4000,
          });
        } else {
          toast({
            title: "Registration Failed",
            description: errorMessage,
            variant: "destructive",
            duration: 4000,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Network error occurred during registration",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      if (response.ok) {
        toast({
          title: "Reset Email Sent",
          description: "If the email exists, a password reset link has been sent.",
        });
        setMode('login');
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to send reset email",
          variant: "destructive",
          duration: 4000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while sending reset email",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated. Please log in.",
        });
        // Clear the token from URL and switch to login mode
        window.history.replaceState({}, '', '/login');
        setMode('login');
      } else {
        const error = await response.json();
        toast({
          title: "Reset Failed",
          description: error.message || "Failed to reset password",
          variant: "destructive",
          duration: 4000,
        });
      }
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Network error occurred during password reset",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = "/api/auth/google";
  };

  const handleAppleLogin = async () => {
    try {
      setIsLoading(true);

      // Check if Apple Client ID is configured
      if (!import.meta.env.VITE_APPLE_CLIENT_ID) {
        toast({
          title: "Apple Sign-In Not Available",
          description: "Apple authentication requires configuration. Please contact support or use email registration.",
          variant: "destructive",
          duration: 6000,
        });
        return;
      }

      // Check if Apple ID script is loaded
      if (typeof (window as any).AppleID === 'undefined') {
        // Load Apple ID script dynamically
        await loadAppleIDScript();
      }

      // Initialize Apple Sign-In
      await (window as any).AppleID.auth.init({
        clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: window.location.origin + '/api/auth/apple/callback',
        state: 'signin',
        usePopup: true
      });

      // Perform Apple Sign-In
      const data = await (window as any).AppleID.auth.signIn();
      
      if (data.authorization && data.authorization.id_token) {
        // Send the identity token to backend
        const response = await fetch("/api/auth/apple", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identityToken: data.authorization.id_token,
            authorizationCode: data.authorization.code,
            user: data.user
          }),
          credentials: "include",
        });

        if (response.ok) {
          const result = await response.json();
          toast({
            title: "Welcome!",
            description: "Apple Sign-In successful",
          });
          
          // Smooth transition based on onboarding status
          setTimeout(() => {
            window.location.href = result.redirect || (result.user?.onboardingCompleted ? "/" : "/onboarding");
          }, 500);
        } else {
          const error = await response.json();
          toast({
            title: "Apple Sign-In Failed",
            description: error.message || "Authentication failed",
            variant: "destructive",
            duration: 4000,
          });
        }
      }
    } catch (error: any) {
      console.error("Apple Sign-In error:", error);
      
      if (error.error === 'popup_closed_by_user' || error.error === 'user_cancelled_authorize') {
        // User cancelled - don't show error
        return;
      }
      
      toast({
        title: "Apple Sign-In Failed",
        description: "Unable to complete Apple Sign-In. Please try again or use email.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to dynamically load Apple ID script
  const loadAppleIDScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof (window as any).AppleID !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Apple ID script'));
      document.head.appendChild(script);
    });
  };





  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ios-bg to-ios-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-ios-blue to-health-green rounded-2xl flex items-center justify-center mx-auto mb-4">
            <img 
              src="/veridect-logo.png" 
              alt="Veridect Logo" 
              className="w-10 h-10 object-contain filter brightness-0 invert"
            />
          </div>
          <CardTitle className="text-2xl font-bold">
            {mode === 'login' ? "Welcome back" : 
             mode === 'register' ? "Create account" :
             mode === 'forgot' ? "Reset password" : "Set new password"}
          </CardTitle>
          <p className="text-ios-secondary">
            {mode === 'login' ? "Sign in to your Veridect account" : 
             mode === 'register' ? "Join thousands making healthier choices" :
             mode === 'forgot' ? "Enter your email to reset your password" : "Enter your new password"}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OAuth Buttons */}
          {(mode === 'login' || mode === 'register') && (
            <>
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full h-12 text-base font-medium hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                  title="Google OAuth credentials required for this feature"
                >
                  <Chrome className="mr-2 h-5 w-5" />
                  Continue with Google
                  {isLoading && <div className="ml-2 w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
                </Button>
                <Button
                  onClick={handleAppleLogin}
                  variant="outline"
                  className="w-full h-12 text-base font-medium"
                  disabled={isLoading}
                  title="Apple Sign-In configuration required for this feature"
                >
                  <Apple className="mr-2 h-5 w-5" />
                  Continue with Apple
                  {isLoading && <div className="ml-2 w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-ios-secondary">Or continue with email</span>
                </div>
              </div>


            </>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-ios-secondary" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="rememberMe" 
                      checked={rememberMe} 
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <label htmlFor="rememberMe" className="text-sm text-ios-secondary cursor-pointer">
                      Remember me
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setMode('forgot')}
                    className="text-ios-blue text-sm"
                  >
                    Forgot password?
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                              field.onChange(capitalized);
                            }}
                            placeholder="First name" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                              field.onChange(capitalized);
                            }}
                            placeholder="Last name" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-ios-secondary" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email address"
                            className="pl-10"
                            onBlur={() => {
                              // Trigger validation when user leaves the field
                              registerForm.trigger("email");
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' && (
            <Form {...forgotForm}>
              <form onSubmit={forgotForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                <FormField
                  control={forgotForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-ios-secondary" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setMode('login')}
                    className="text-ios-blue text-sm"
                  >
                    Back to login
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset' && (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update password"}
                </Button>
              </form>
            </Form>
          )}

          {/* Switch between login/register */}
          {(mode === 'login' || mode === 'register') && (
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-ios-blue"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}