import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useThemeStore } from '@/store/themeStore';
import { useTransactionStore } from '@/store/transactionStore';
import { useBudgetStore } from '@/store/budgetStore';
import { 
  Moon, 
  Sun, 
  Settings as SettingsIcon, 
  Palette, 
  Shield, 
  Sparkles,
  Monitor,
  Smartphone,
  Laptop,
  Trash2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

export const Settings = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const { clearBudgets } = useBudgetStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const themeOptions = [
    { 
      value: 'light', 
      label: 'লাইট মোড', 
      icon: Sun,
      description: 'উজ্জ্বল ও পরিষ্কার',
    },
    { 
      value: 'dark', 
      label: 'ডার্ক মোড', 
      icon: Moon,
      description: 'গাঢ় ও চোখের জন্য আরামদায়ক',
    },
  ];

  // ✅ সব ডেটা ডিলিট
  const handleDeleteAllData = async () => {
    if (!user?.id) {
      toast.error('ইউজার লগইন নেই!');
      return;
    }

    if (!deletePassword) {
      toast.error('পাসওয়ার্ড দিন!');
      return;
    }

    setIsDeleting(true);
    try {
      // ১. পাসওয়ার্ড ভেরিফাই করুন
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: deletePassword,
      });

      if (signInError) {
        toast.error('পাসওয়ার্ড ভুল!');
        setIsDeleting(false);
        return;
      }

      // ২. ট্রানজেকশন ডিলিট
      const { error: txError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (txError) throw txError;

      // ৩. বাজেট ডিলিট
      const { error: budgetError } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', user.id);

      if (budgetError) throw budgetError;

      // ৪. লোকাল স্টেট ক্লিয়ার
      clearBudgets();
      
      // ৫. ট্রানজেকশন স্টোর ক্লিয়ার
      useTransactionStore.setState({ transactions: [], totalIncome: 0, totalExpense: 0, balance: 0 });

      toast.success('সব ডেটা সফলভাবে ডিলিট হয়েছে! 🗑️');
      setIsDeleteModalOpen(false);
      setDeletePassword('');
      
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'ডেটা ডিলিট করতে ব্যর্থ!');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8 space-y-6">
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
              আপনার অ্যাপের কাস্টমাইজেশন
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

      {/* ✅ ডিলিট অল ডেটা */}
      <Card className="border-border/40 rounded-2xl overflow-hidden bg-gradient-to-br from-background via-background/80 to-secondary/5 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <CardHeader className="relative">
          <CardTitle className="text-xl flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-rose-500/70" />
            ডেটা ম্যানেজমেন্ট
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            আপনার সব ডেটা ডিলিট করুন (এই কাজটি বাতিল করা যাবে না)
          </p>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="p-4 rounded-xl border border-rose-500/20 bg-gradient-to-r from-rose-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  সব ডেটা ডিলিট করুন
                </h4>
                <p className="text-sm text-muted-foreground">
                  ট্রানজেকশন ও বাজেট সহ সব ডেটা মুছে ফেলুন
                </p>
              </div>
              <Button 
                variant="destructive"
                onClick={() => setIsDeleteModalOpen(true)}
                className="rounded-xl shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all duration-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                ডিলিট করুন
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ ডিলিট কনফার্মেশন মডেল */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl border border-border/40 p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-rose-500/10">
                <AlertTriangle className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold">আপনি কি নিশ্চিত?</h3>
                <p className="text-sm text-muted-foreground">
                  এই কাজটি বাতিল করা যাবে না। সব ডেটা স্থায়ীভাবে মুছে যাবে।
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* পাসওয়ার্ড ইনপুট */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  আপনার পাসওয়ার্ড দিন
                </label>
                <div className="relative mt-1">
                  <input
                    type={showDeletePassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border/40 bg-background/30 px-4 py-2.5 pr-10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    {showDeletePassword ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground/60 mt-1.5">
                  ডেটা ডিলিট করতে আপনার পাসওয়ার্ড প্রয়োজন
                </p>
              </div>

              {/* বাটন */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-border/40"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeletePassword('');
                  }}
                >
                  বাতিল
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 rounded-xl shadow-lg shadow-rose-500/10"
                  onClick={handleDeleteAllData}
                  disabled={isDeleting || !deletePassword}
                >
                  {isDeleting ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2" />
                      ডিলিট হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      নিশ্চিত করুন
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* লগআউট */}
      <div className="text-center">
        <Button
          variant="ghost"
          className="text-muted-foreground/50 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-300"
          onClick={logout}
        >
          <Shield className="mr-2 h-4 w-4" />
          লগআউট
        </Button>
        <span className="mx-2 text-muted-foreground/20">·</span>
        <span className="text-xs text-muted-foreground/30 font-mono">
          TakaMinder v2.0.0
        </span>
      </div>
    </div>
  );
};