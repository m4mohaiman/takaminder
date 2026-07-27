import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactionStore } from '@/store/transactionStore';
import { useBudgetStore } from '@/store/budgetStore';
import { Plus, Pencil, Trash2, Wallet,  AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { cn } from '@/lib/utils';
import { BudgetWithProgress } from '@/types';

export const Budgets = () => {
  const { user } = useAuth();
  const { transactions, fetchTransactions, selectedMonth } = useTransactionStore();
  const { budgets, isLoading, fetchBudgets, deleteBudget } = useBudgetStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // বর্তমান মাস ও বছর
  const [year, month] = selectedMonth.split('-').map(Number);

  useEffect(() => {
    if (user?.id) {
      fetchBudgets(user.id, month, year);
      fetchTransactions(user.id, selectedMonth, 'currentMonth');
    }
  }, [user?.id, selectedMonth]);

  // বাজেটের অগ্রগতি ক্যালকুলেট
  const budgetsWithProgress = useMemo<BudgetWithProgress[]>(() => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.category === budget.category && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const remaining = budget.amount - spent;
      
      let status: 'on-track' | 'warning' | 'exceeded' = 'on-track';
      if (progress >= 100) {
        status = 'exceeded';
      } else if (progress >= 80) {
        status = 'warning';
      }

      return { ...budget, spent, progress, remaining, status };
    });
  }, [budgets, transactions]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetsWithProgress.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-rose-600 bg-rose-500/10 border-rose-500/20';
      case 'warning': return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'bg-rose-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('আপনি কি এই বাজেট ডিলিট করতে চান?')) {
      await deleteBudget(id);
    }
  };

  const handleFormSuccess = () => {
    if (user?.id) {
      fetchBudgets(user.id, month, year);
    }
  };

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-primary/8 to-secondary/5 p-6 backdrop-blur border border-primary/5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              বাজেট
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Wallet className="h-4 w-4" />
              {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })} মাসের বাজেট ব্যবস্থাপনা
            </p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            নতুন বাজেট
          </Button>
        </div>
      </div>

      {/* সামারি কার্ড */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/40 rounded-2xl bg-gradient-to-br from-emerald-50/30 to-emerald-100/10 dark:from-emerald-950/10 dark:to-emerald-900/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">মোট বাজেট</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ৳{totalBudget.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 rounded-2xl bg-gradient-to-br from-amber-50/30 to-amber-100/10 dark:from-amber-950/10 dark:to-amber-900/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">মোট খরচ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ৳{totalSpent.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 rounded-2xl bg-gradient-to-br from-blue-50/30 to-blue-100/10 dark:from-blue-950/10 dark:to-blue-900/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">অবশিষ্ট</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
              ৳{totalRemaining.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* বাজেট লিস্ট */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/30 border-t-primary" />
        </div>
      ) : budgetsWithProgress.length === 0 ? (
        <Card className="border-border/40 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">কোনো বাজেট সেট করা নেই</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              আপনার খরচের জন্য বাজেট তৈরি করুন
            </p>
            <Button 
              variant="outline" 
              className="mt-4 rounded-xl"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              প্রথম বাজেট তৈরি করুন
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {budgetsWithProgress.map((budget) => (
            <Card 
              key={budget.id} 
              className="border-border/40 rounded-2xl hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {budget.category}
                    <Badge className={cn("text-xs font-normal", getStatusColor(budget.status))}>
                      {budget.status === 'exceeded' && 'বাজেট শেষ'}
                      {budget.status === 'warning' && 'প্রায় শেষ'}
                      {budget.status === 'on-track' && 'ঠিক আছে'}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    ৳{budget.spent.toFixed(2)} / ৳{budget.amount.toFixed(2)} খরচ হয়েছে
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-xl"
                    onClick={() => {
                      setEditData(budget);
                      setIsFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    onClick={() => handleDelete(budget.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">অগ্রগতি</span>
                    <span className={cn(
                      "font-medium",
                      budget.status === 'exceeded' ? 'text-rose-600' :
                      budget.status === 'warning' ? 'text-amber-600' :
                      'text-emerald-600'
                    )}>
                      {budget.progress.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(budget.progress, 100)} 
                    className={cn(
                      "h-2 rounded-full",
                      budget.status === 'exceeded' ? 'bg-rose-500/20' :
                      budget.status === 'warning' ? 'bg-amber-500/20' :
                      'bg-emerald-500/20'
                    )}
                    indicatorClassName={getProgressColor(budget.status)}
                  />
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-muted-foreground">
                    অবশিষ্ট: ৳{budget.remaining.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground/60">
                    {budget.status === 'exceeded' ? (
                      <span className="flex items-center gap-1 text-rose-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        বাজেট শেষ
                      </span>
                    ) : budget.status === 'warning' ? (
                      <span className="flex items-center gap-1 text-amber-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        সতর্কতা
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle className="h-3.5 w-3.5" />
                        ঠিক আছে
                      </span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* বাজেট ফর্ম */}
      <BudgetForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditData(null);
        }}
        editData={editData}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};