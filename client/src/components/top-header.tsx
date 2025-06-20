import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogOut, User, FileText, Shield, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

export default function TopHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const menuItems = [
    { label: "About Us", href: "/about", icon: FileText },
    { label: "Privacy & GDPR", href: "/privacy", icon: Shield },
    { label: "AI Disclaimer", href: "/disclaimer", icon: AlertTriangle },
    { label: "Investor Presentation", href: "/investor", icon: TrendingUp },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-ios-gray-200">
      <div className="container-padding">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-health-green">Yes</span>
              <span className="text-danger-red">No</span>
              <span className="text-ios-blue">App</span>
            </div>
          </Link>

          {/* Welcome message and user controls */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <div className="hidden sm:block">
                <span className="text-sm text-ios-secondary">Welcome, </span>
                <Link href="/profile">
                  <span className="text-sm font-medium text-ios-text hover:text-ios-blue cursor-pointer transition-colors">
                    {(user as any).firstName || 'User'}
                  </span>
                </Link>
              </div>
            )}

            {/* Menu trigger */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                
                <div className="mt-8 space-y-6">
                  {/* User info in menu */}
                  {isAuthenticated && user && (
                    <div className="p-4 bg-health-green/5 rounded-lg">
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                        <div className="flex items-center space-x-3 hover:bg-health-green/10 p-2 rounded-lg transition-colors cursor-pointer">
                          <div className="w-10 h-10 bg-health-green/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-health-green" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {(user as any).firstName} {(user as any).lastName}
                            </div>
                            <div className="text-sm text-ios-secondary">
                              {(user as any).email}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}

                  {/* Menu items */}
                  <nav className="space-y-2">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.href;
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                            isActive 
                              ? 'bg-ios-blue/10 text-ios-blue' 
                              : 'hover:bg-ios-gray-50 text-ios-text'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Logout button */}
                  {isAuthenticated && (
                    <div className="pt-6 border-t border-ios-gray-200">
                      <a
                        href="/api/logout"
                        className="flex items-center space-x-3 p-3 text-danger-red hover:bg-danger-red/5 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </a>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}