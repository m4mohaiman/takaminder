import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactionStore } from '@/store/transactionStore';
import { useDateFilter } from '@/hooks/useDateFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { DateFilter } from '@/components/dashboard/dateFilter/DateFilter';
import { CategoryPieChart } from '@/components/dashboard/categoryPieChart/CategoryPieChart';
import { MonthlyBarChart } from '@/components/dashboard/monthlyBarChart/MonthlyBarChart';
import { BalanceLineChart } from '@/components/dashboard/balanceLineChart/BalanceLineChart';
import { AreaChart } from '@/components/dashboard/areaChart/AreaChart';


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

  // ✅ ডেট ফিল্টার হুক
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

  // ✅ ইউজার আইডি সেট করুন
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user?.id, setUserId]);

  // ✅ শুধু initial load-এর জন্য
  useEffect(() => {
    if (user?.id && isMounted) {
      // currentMonth ডেটা ফেচ
      fetchTransactions(user.id, selectedMonth, 'currentMonth');
    }
  }, [user?.id, isMounted]);

  // ফিল্টার ডেটা থেকে স্ট্যাটস ক্যালকুলেট
  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredBalance = filteredIncome - filteredExpense;
  const filteredTotal = filteredTransactions.length;

  // মাসের নাম প্রদর্শন
  const getMonthLabel = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  };

  // ফিল্টার টেক্সট
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground">
            স্বাগতম {user?.full_name || 'User'}! আপনার আর্থিক সারাংশ
          </p>
        </div>
      </div>

      {/* ✅ ডেট ফিল্টার */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg bg-card">
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

        {/* ফিল্টার ইনফো */}
        <span className="text-sm text-muted-foreground">
          {getFilterLabel()} - ({filteredTotal}টি ট্রানজেকশন)
        </span>
      </div>

      {/* স্ট্যাটস কার্ড */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট ব্যালেন্স</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${filteredBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ৳{filteredBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredBalance >= 0 ? 'আপনি লাভে আছেন' : 'আপনি লোকসানে আছেন'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ৳{filteredIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.filter(t => t.type === 'income').length}টি ট্রানজেকশন
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট খরচ</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ৳{filteredExpense.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.filter(t => t.type === 'expense').length}টি ট্রানজেকশন
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট ট্রানজেকশন</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTotal}
            </div>
            <p className="text-xs text-muted-foreground">
              ফিল্টারকৃত ট্রানজেকশন
            </p>
          </CardContent>
        </Card>
      </div>

      {/* চার্ট সারি ১ */}
      <div className="grid gap-6 md:grid-cols-2">
        <CategoryPieChart transactions={filteredTransactions} />
        <MonthlyBarChart transactions={filteredTransactions} />
      </div>

      {/* চার্ট সারি ২ */}
      <div className="grid gap-6 md:grid-cols-2">
        <BalanceLineChart transactions={filteredTransactions} />
        <AreaChart transactions={filteredTransactions} />
      </div>

      {/* সাম্প্রতিক ট্রানজেকশন */}
      <Card>
        <CardHeader>
          <CardTitle>সাম্প্রতিক ট্রানজেকশন</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">এই সময়ে কোনো ট্রানজেকশন নেই</p>
              <p className="text-sm text-muted-foreground mt-1">
                নতুন ট্রানজেকশন যোগ করতে ট্রানজেকশন পেজে যান
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 dark:bg-green-900/20' 
                        : 'bg-red-100 dark:bg-red-900/20'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description || 'বিবরণ নেই'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
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