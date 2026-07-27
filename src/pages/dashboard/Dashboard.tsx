import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactionStore } from '@/store/transactionStore';
import { useDateFilter } from '@/hooks/useDateFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowUp, ArrowDown, TrendingUp, Sparkles, Zap, Award } from 'lucide-react';
import { DateFilter } from '@/components/dashboard/dateFilter/DateFilter';
import { CategoryPieChart } from '@/components/dashboard/categoryPieChart/CategoryPieChart';
import { MonthlyBarChart } from '@/components/dashboard/monthlyBarChart/MonthlyBarChart';
import { BalanceLineChart } from '@/components/dashboard/balanceLineChart/BalanceLineChart';
import { AreaChart } from '@/components/dashboard/areaChart/AreaChart';
import { cn } from '@/lib/utils';

export const Dashboard = () => {
  const { user } = useAuth();
  const {
    transactions,
    isLoading,
    totalIncome,
    totalExpense,
    balance,
    selectedMonth,
    fetchTransactions,
    setSelectedMonth,
    setUserId,
  } = useTransactionStore();

  const [isMounted, setIsMounted] = useState(false);

  const {
    timeFilter,
    customRange,
    monthOptions,
    filteredTransactions,
    handleMonthChange,
    handleTimeFilterChange,
    handleCustomRangeChange,
  } = useDateFilter(transactions, fetchTransactions, user?.id);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user?.id, setUserId]);

  useEffect(() => {
    if (user?.id && isMounted) {
      fetchTransactions(user.id, selectedMonth, 'currentMonth');
    }
  }, [user?.id, isMounted]);

  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredBalance = filteredIncome - filteredExpense;
  const filteredTotal = filteredTransactions.length;

  const getMonthLabel = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getFilterLabel = () => {
    if (timeFilter === 'currentMonth') {
      return getMonthLabel(selectedMonth);
    }
    if (timeFilter === 'last3Months') return 'শেষ ৩ মাস';
    if (timeFilter === 'last6Months') return 'শেষ ৬ মাস';
    if (timeFilter === 'last12Months') return 'শেষ ১২ মাস';
    if (timeFilter === 'custom' && customRange.start && customRange.end) {
      return `${new Date(customRange.start).toLocaleDateString()} - ${new Date(customRange.end).toLocaleDateString()}`;
    }
    return '';
  };

  // স্ট্যাটস কার্ড ডেটা
  const statsCards = [
    {
      title: 'মোট ব্যালেন্স',
      value: filteredBalance,
      icon: Wallet,
      color: filteredBalance >= 0 ? 'text-emerald-600' : 'text-rose-600',
      bgGradient: filteredBalance >= 0 
        ? 'from-emerald-500/10 to-emerald-500/5' 
        : 'from-rose-500/10 to-rose-500/5',
      borderColor: filteredBalance >= 0 ? 'border-emerald-500/20' : 'border-rose-500/20',
    },
    {
      title: 'মোট আয়',
      value: filteredIncome,
      icon: ArrowUp,
      color: 'text-emerald-600',
      bgGradient: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
    },
    {
      title: 'মোট খরচ',
      value: filteredExpense,
      icon: ArrowDown,
      color: 'text-rose-600',
      bgGradient: 'from-rose-500/10 to-rose-500/5',
      borderColor: 'border-rose-500/20',
      iconBg: 'bg-rose-500/10',
    },
    {
      title: 'মোট ট্রানজেকশন',
      value: filteredTotal,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgGradient: 'from-indigo-500/10 to-indigo-500/5',
      borderColor: 'border-indigo-500/20',
      iconBg: 'bg-indigo-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground animate-pulse">ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* হেডার - আপডেটেড */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 p-6 backdrop-blur border border-primary/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              ড্যাশবোর্ড
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <span>স্বাগতম</span>
              <span className="font-semibold text-foreground">{user?.full_name || 'User'}</span>
              <span>! আপনার আর্থিক সারাংশ</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border backdrop-blur">
            <Award className="h-4 w-4 text-primary" />
            <span>সর্বশেষ আপডেট: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* ডেট ফিল্টার */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border bg-gradient-to-r from-background via-background/80 to-background backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DateFilter
          selectedMonth={selectedMonth}
          timeFilter={timeFilter}
          monthOptions={monthOptions}
          onMonthChange={(month) => {
            handleMonthChange(month);
            setSelectedMonth(month);
          }}
          onTimeFilterChange={(filter) => {
            handleTimeFilterChange(filter);
          }}
          onCustomRangeChange={(start, end) => {
            handleCustomRangeChange(start, end);
          }}
        />

        <span className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {getFilterLabel()} - ({filteredTotal}টি ট্রানজেকশন)
        </span>
      </div>

      {/* স্ট্যাটস কার্ড - আপডেটেড */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const isCurrency = stat.title !== 'মোট ট্রানজেকশন';
          
          return (
            <Card 
              key={index}
              className={cn(
                "group relative overflow-hidden border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                stat.borderColor,
                "bg-gradient-to-br",
                stat.bgGradient
              )}
            >
              {/* ডেকোরেটিভ এলিমেন্ট */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  stat.iconBg || "bg-primary/5 group-hover:bg-primary/10"
                )}>
                  <Icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  {isCurrency && '৳'}
                  {typeof stat.value === 'number' 
                    ? stat.value.toFixed(2) 
                    : stat.value}
                  <Sparkles className="h-3 w-3 text-primary/30 animate-pulse" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                  {stat.title === 'মোট ব্যালেন্স' 
                    ? (stat.value >= 0 ? 'লাভে আছেন 🚀' : 'লোকসানে আছেন 📉')
                    : `ফিল্টারকৃত ডেটা`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* চার্ট সারি ১ - আপডেটেড */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-card rounded-xl border overflow-hidden">
            <CategoryPieChart transactions={filteredTransactions} />
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-card rounded-xl border overflow-hidden">
            <MonthlyBarChart transactions={filteredTransactions} />
          </div>
        </div>
      </div>

      {/* চার্ট সারি ২ - আপডেটেড */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-card rounded-xl border overflow-hidden">
            <BalanceLineChart transactions={filteredTransactions} />
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-card rounded-xl border overflow-hidden">
            <AreaChart transactions={filteredTransactions} />
          </div>
        </div>
      </div>

      {/* সাম্প্রতিক ট্রানজেকশন - আপডেটেড */}
      <Card className="relative overflow-hidden border-primary/10 bg-gradient-to-b from-background to-secondary/5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl" />
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            সাম্প্রতিক ট্রানজেকশন
            <span className="text-xs font-normal text-muted-foreground ml-2">
              (সর্বশেষ ৫টি)
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground">এই সময়ে কোনো ট্রানজেকশন নেই</p>
              <p className="text-sm text-muted-foreground mt-1">
                নতুন ট্রানজেকশন যোগ করতে ট্রানজেকশন পেজে যান
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.slice(0, 5).map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                    "hover:scale-[1.01] hover:shadow-md",
                    "bg-gradient-to-r from-background to-background/50",
                    transaction.type === 'income'
                      ? "hover:border-emerald-500/30"
                      : "hover:border-rose-500/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2.5 rounded-xl transition-all duration-300",
                      transaction.type === 'income'
                        ? "bg-emerald-500/10 group-hover:bg-emerald-500/20"
                        : "bg-rose-500/10 group-hover:bg-rose-500/20"
                    )}>
                      {transaction.type === 'income' ? (
                        <ArrowUp className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{transaction.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description || 'বিবরণ নেই'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold text-base",
                      transaction.type === 'income'
                        ? "text-emerald-600"
                        : "text-rose-600"
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}৳{transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};