import { Home, Camera, TrendingUp, Trophy, User } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";

export default function Navigation() {
  const [location, navigate] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { id: "home", icon: Home, label: t("nav.home"), path: "/home" },
    { id: "analyse", icon: Camera, label: t("nav.analyze"), path: "/" },
    { id: "progress", icon: TrendingUp, label: t("nav.progress"), path: "/progress" },
    { id: "leaderboard", icon: Trophy, label: t("nav.rankings"), path: "/leaderboard" },
    { id: "profile", icon: User, label: t("nav.profile"), path: "/profile" },
  ];

  const handleNavigation = (path: string) => {
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-ios-gray-200 z-50">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-all duration-200 ${
                  active
                    ? "text-ios-blue"
                    : "text-ios-secondary hover:text-ios-text"
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-200 ${
                  active 
                    ? "bg-ios-blue/10 scale-110" 
                    : "hover:bg-ios-gray-100"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium mt-1 transition-all duration-200 ${
                  active ? "opacity-100" : "opacity-70"
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