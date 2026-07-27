import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useThemeStore } from '@/store/themeStore';
import { 
  Moon, 
  Sun, 
  LogOut, 
  Settings as SettingsIcon, 
  Palette, 
  Shield, 
  Sparkles,
  Monitor,
  Smartphone,
  Laptop
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export const Settings = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const [isHovering, setIsHovering] = useState(false);

  const themeOptions = [
    { 
      value: 'light', 
      label: 'লাইট মোড', 
      icon: Sun,
      description: 'উজ্জ্বল ও পরিষ্কার',
      bg: 'bg-white',
      border: 'border-gray-200',
    },
    { 
      value: 'dark', 
      label: 'ডার্ক মোড', 
      icon: Moon,
      description: 'গাঢ় ও চোখের জন্য আরামদায়ক',
      bg: 'bg-gray-900',
      border: 'border-gray-700',
    },
  ];

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* হেডার */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-primary/8 to-secondary/5 p-6 backdrop-blur border border-primary/5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-2xl" />
        
        <div className="relative flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              সেটিংস
            </h1>
            <p className="text-sm text-muted-foreground">
              আপনার অ্যাপের কাস্টমাইজেশন ও পছন্দসমূহ
            </p>
          </div>
        </div>
      </div>

      {/* থিম সেটিংস */}
      <Card className="border-border/40 rounded-2xl overflow-hidden bg-gradient-to-br from-background via-background/80 to-secondary/5 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <CardHeader className="relative">
          <CardTitle className="text-xl flex items-center gap-2">
            <Palette className="h-5 w-5 text-amber-500/70" />
            থিম কাস্টমাইজেশন
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            আপনার পছন্দের থিম নির্বাচন করুন
          </p>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          {/* থিম অপশন */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              
              return (
                <div
                  key={option.value}
                  onClick={toggleTheme}
                  className={cn(
                    "relative group cursor-pointer rounded-xl border-2 p-4 transition-all duration-300",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    isActive
                      ? "border-primary shadow-lg shadow-primary/10 bg-gradient-to-br from-primary/5 to-primary/3"
                      : "border-border/40 hover:border-primary/30 hover:bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2.5 rounded-xl transition-all duration-300",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted/30 text-muted-foreground group-hover:bg-primary/10"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{option.label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-medium text-primary">সক্রিয়</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* থিম প্রিভিউ */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-primary/60" />
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Laptop className="h-4 w-4 text-primary/60" />
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-primary/60" />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                সব ডিভাইসে একই থিম
              </span>
            </div>
            <Sparkles className="h-4 w-4 text-primary/30 animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* অ্যাকাউন্ট সেটিংস */}
      <Card className="border-border/40 rounded-2xl overflow-hidden bg-gradient-to-br from-background via-background/80 to-secondary/5 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <CardHeader className="relative">
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-rose-500/70" />
            অ্যাকাউন্ট
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            আপনার অ্যাকাউন্ট সম্পর্কিত সেটিংস
          </p>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          {/* লগআউট */}
          <div className="p-4 rounded-xl border border-rose-500/10 bg-gradient-to-r from-rose-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-rose-600 dark:text-rose-400">
                  লগআউট করুন
                </h4>
                <p className="text-sm text-muted-foreground">
                  আপনার অ্যাকাউন্ট থেকে সাইন আউট করুন
                </p>
              </div>
              <Button 
                variant="destructive"
                onClick={logout}
                className="rounded-xl shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all duration-300 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <LogOut className={cn(
                  "mr-2 h-4 w-4 transition-transform duration-300",
                  isHovering && "translate-x-1"
                )} />
                লগআউট করুন
              </Button>
            </div>
          </div>

          {/* অ্যাকাউন্ট ইনফো */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground">
                নিরাপদ সংযোগ
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                সক্রিয়
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ভার্সন */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground/40 font-mono">
          TakaMinder v2.0.0 · ২০২৬
        </p>
      </div>
    </div>
  );
};