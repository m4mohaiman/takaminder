import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Wallet, 
  PieChart, 
  Settings, 
  LogOut, 
  User,
  Sparkles,
  BadgeDollarSign,
  PiggyBank,
  BarChart3,
  LayoutDashboard
} from 'lucide-react';

import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'ড্যাশবোর্ড', 
      path: '/dashboard',
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    },
    { 
      icon: TrendingUp, 
      label: 'ট্রানজেকশন', 
      path: '/transactions',
      color: 'from-emerald-500 to-teal-400',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    },
    { 
      icon: PiggyBank, 
      label: 'বাজেট', 
      path: '/budgets',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    },
    { 
      icon: BarChart3, 
      label: 'রিপোর্ট', 
      path: '/reports',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-gradient-to-b from-background via-background to-secondary/5 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-[calc(100vh-4rem)] sticky top-16 relative overflow-hidden">
      
      {/* ডেকোরেটিভ ব্যাকগ্রাউন্ড */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -right-20 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* নেভিগেশন */}
      <nav className="relative flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300",
                "hover:scale-[1.02] active:scale-[0.98]",
                active 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color.split(' ')[1]}/30` 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              {/* অ্যাকটিভ ইন্ডিকেটর */}
              {active && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-full shadow-lg" />
              )}
              
              {/* আইকন */}
              <div className={cn(
                "relative p-1.5 rounded-lg transition-all duration-300",
                active 
                  ? "bg-white/20 backdrop-blur" 
                  : "bg-transparent group-hover:bg-primary/10"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  active ? "text-white" : "group-hover:text-primary"
                )} />
              </div>
              
              {/* লেবেল */}
              <span className={cn(
                "font-medium transition-all duration-300",
                active ? "text-white" : "group-hover:translate-x-0.5"
              )}>
                {item.label}
              </span>

              {/* অ্যাকটিভ ব্যাজ */}
              {active && (
                <span className="ml-auto flex items-center gap-1 text-xs text-white/70">
                  <Sparkles className="h-3 w-3" />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* সেটিংস ও লগআউট */}
      <div className="relative p-4 border-t space-y-1.5 bg-gradient-to-t from-secondary/5 to-transparent">
        {/* ভার্সন */}
        <div className="mt-2 text-center">
          <span className="text-[10px] text-muted-foreground/50 font-mono">
            v2.0.0 · ২০২৬
          </span>
        </div>
      </div>
    </aside>
  );
};