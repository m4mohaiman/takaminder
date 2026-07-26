import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, User, Settings, Home, TrendingUp, Wallet, PieChart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/notifications/NotificationBell';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { ThemeToggle } from '../themeToggle/ThemeToggle';
import { Badge } from '@/components/ui/badge';

export const Header = () => {
  const { user, logout, userName, userInitial, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // সাইডবার মেনু আইটেম
  const menuItems = [
    { icon: Home, label: 'ড্যাশবোর্ড', path: '/dashboard' },
    { icon: TrendingUp, label: 'ট্রানজেকশন', path: '/transactions' },
    { icon: Wallet, label: 'বাজেট', path: '/budgets' },
    { icon: PieChart, label: 'রিপোর্ট', path: '/reports' },
  ];

  // মোবাইল সাইডবার
  const MobileSidebar = () => (
    <div className="flex flex-col h-full p-4">
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
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
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
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 lg:px-6 gap-4">
        {/* মোবাইল মেনু বাটন */}
        {isAuthenticated && (
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <MobileSidebar />
            </SheetContent>
          </Sheet>
        )}

        {/* লোগো */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TakaMinder
          </span>
          {isAuthenticated && (
            <Badge variant="secondary" className="hidden sm:inline-block text-xs">
              {user?.role || 'User'}
            </Badge>
          )}
        </Link>

        {/* ডেস্কটপ নেভিগেশন */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* ডান পাশের আইটেম */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />

          {isAuthenticated ? (
            <>
              {/* নোটিফিকেশন */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                <span className="sr-only">Notifications</span>
              </Button>

              {/* ইউজার ড্রপডাউন */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    প্রোফাইল
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    সেটিংস
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    লগআউট
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                লগইন
              </Button>
              <Button onClick={() => navigate('/register')}>
                রেজিস্টার
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};