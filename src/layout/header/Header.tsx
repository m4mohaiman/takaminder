import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  LogOut,
  User,
  Settings,
  Home,
  TrendingUp,
  Wallet,
  PieChart,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { ThemeToggle } from "../themeToggle/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Header = () => {
  const { user, logout, userName, userInitial, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // সাইডবার মেনু আইটেম
  const menuItems = [
    { icon: Home, label: "ড্যাশবোর্ড", path: "/dashboard" },
    { icon: TrendingUp, label: "ট্রানজেকশন", path: "/transactions" },
    { icon: Wallet, label: "বাজেট", path: "/budgets" },
    { icon: PieChart, label: "রিপোর্ট", path: "/reports" },
  ];

  // মোবাইল সাইডবার
  const MobileSidebar = () => (
    <div className="flex flex-col h-full p-4 bg-gradient-to-b from-background to-secondary/5">
      <div className="flex items-center gap-2 mb-8">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          TakaMinder
        </span>
      </div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-300"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-border/40 pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all duration-300"
          onClick={() => {
            logout();
            setIsMobileMenuOpen(false);
          }}
        >
          <LogOut className="h-5 w-5 mr-2" />
          লগআউট
        </Button>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 lg:px-6 gap-4">
        {/* মোবাইল মেনু বাটন */}
        {isAuthenticated && (
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden rounded-xl hover:bg-primary/5 transition-all duration-300"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r border-border/40">
              <MobileSidebar />
            </SheetContent>
          </Sheet>
        )}

        {/* লোগো */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                TakaMinder
              </span>
            </div>
          </div>
          {isAuthenticated && (
            <Badge
              variant="secondary"
              className="hidden sm:inline-block text-[10px] px-2 py-0.5 bg-primary/10 text-primary/70 border border-primary/10 rounded-full"
            >
              {user?.role || "User"}
            </Badge>
          )}
        </Link>

        {/* ডান পাশের আইটেম */}
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell />

          {isAuthenticated ? (
            <>
              {/* ইউজার ড্রপডাউন */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-300"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-xl"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold">{userName}</p>
                      <p className="text-xs text-muted-foreground/70 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuItem 
                    onClick={() => navigate("/profile")}
                    className="rounded-xl cursor-pointer transition-all duration-200 hover:bg-primary/5"
                  >
                    <User className="mr-2 h-4 w-4" />
                    প্রোফাইল
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/settings")}
                    className="rounded-xl cursor-pointer transition-all duration-200 hover:bg-primary/5"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    সেটিংস
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="rounded-xl cursor-pointer text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    লগআউট
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")}
                className="rounded-xl hover:bg-primary/5 transition-all duration-300"
              >
                লগইন
              </Button>
              <Button 
                onClick={() => navigate("/register")}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-primary/20 transition-all duration-300"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                রেজিস্টার
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};