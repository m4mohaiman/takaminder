import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Wallet, PieChart, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout, userName, userInitial } = useAuth();

  const menuItems = [
    { icon: Home, label: 'ড্যাশবোর্ড', path: '/dashboard' },
    { icon: TrendingUp, label: 'ট্রানজেকশন', path: '/transactions' },
    { icon: Wallet, label: 'বাজেট', path: '/budgets' },
    { icon: PieChart, label: 'রিপোর্ট', path: '/reports' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-[calc(100vh-4rem)] sticky top-16">
      {/* ইউজার প্রোফাইল */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {userInitial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{userName}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Link to="/profile" className="text-muted-foreground hover:text-foreground">
          <User className="h-4 w-4" />
        </Link>
      </div>

      {/* নেভিগেশন */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
              ${isActive(item.path) 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }
            `}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* ফুটার অ্যাকশন */}
      <div className="p-4 border-t space-y-2">
        <Link
          to="/settings"
          className={`
            flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
            ${isActive('/settings') 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }
          `}
        >
          <Settings className="h-5 w-5" />
          <span>সেটিংস</span>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          লগআউট
        </Button>
      </div>
    </aside>
  );
};