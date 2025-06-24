import { Home, Camera, TrendingUp, Trophy, User, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { checkTierAccess } from "@/components/subscription-check";

export default function Navigation() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const userTier = user?.subscriptionTier || 'free';

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/home", requiredTier: "free" },
    { id: "analyse", icon: Camera, label: "Analyse", path: "/", requiredTier: "free" },
    { id: "progress", icon: TrendingUp, label: "Progress", path: "/progress", requiredTier: "pro" },
    { id: "leaderboard", icon: Trophy, label: "Leaderboard", path: "/leaderboard", requiredTier: "pro" },
    { id: "profile", icon: User, label: "Profile", path: "/profile", requiredTier: "free" },
  ];

  const handleNavigation = (path: string, requiredTier: string) => {
    const hasAccess = checkTierAccess(userTier, requiredTier, user?.email);
    

    
    if (!hasAccess) {
      // Navigate to subscription page for upgrade
      window.scrollTo(0, 0);
      navigate('/subscription');
      return;
    }
    
    // Scroll to top immediately - no smooth behavior for instant response
    window.scrollTo(0, 0);
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path === "/home" && location === "/home") return true;
    if (path !== "/" && path !== "/home" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-ios-gray-200 z-50 safe-area-pb">
      <div className="max-w-md mx-auto px-4 py-2 pb-safe">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const hasAccess = checkTierAccess(userTier, item.requiredTier, user?.email);
            const isLocked = !hasAccess;
            const shouldGreyOut = !hasAccess;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path, item.requiredTier)}
                className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-all duration-200 relative ${
                  isLocked
                    ? "text-gray-300 cursor-not-allowed"
                    : shouldGreyOut
                    ? "text-gray-400 cursor-not-allowed"
                    : active
                    ? "text-ios-blue cursor-pointer"
                    : "text-ios-secondary hover:text-ios-text cursor-pointer"
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-200 relative ${
                  isLocked
                    ? "bg-gray-100"
                    : shouldGreyOut
                    ? "bg-gray-50"
                    : active 
                    ? "bg-ios-blue/10 scale-110" 
                    : "hover:bg-ios-gray-100"
                }`}>
                  {isLocked ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs font-medium mt-1 transition-all duration-200 ${
                  isLocked ? "opacity-50" : shouldGreyOut ? "opacity-60" : active ? "opacity-100" : "opacity-70"
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}