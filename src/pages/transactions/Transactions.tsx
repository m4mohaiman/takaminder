import React, { useEffect, useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, Sparkles, Calendar, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactionStore } from '@/store/transactionStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types';
import { TransactionFilters } from '@/components/transactions/transactionFilters/TransactionFilters';
import { TransactionList } from '@/components/transactions/transactionList/TransactionList';
import { TransactionForm } from '@/components/transactions/transactionForm/TransactionForm';
import { cn } from '@/lib/utils';

export const Transactions = () => {
  const { user } = useAuth();
  const {
    transactions,
    isLoading,
    selectedMonth,
    totalIncome,
    totalExpense,
    balance,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setSelectedMonth,
    setUserId,
  } = useTransactionStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user?.id, setUserId]);

  useEffect(() => {
    if (user?.id && selectedMonth) {
      fetchTransactions(user.id, selectedMonth, 'currentMonth');
    }
  }, [user?.id, selectedMonth, fetchTransactions]);

  const getMonthLabel = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const changeMonth = (offset: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }
    return filtered;
  }, [transactions, searchQuery, filterType, filterCategory]);

  const categories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return Array.from(cats);
  }, [transactions]);

  const handleSave = async (data: any) => {
    if (editData) {
      await updateTransaction(editData.id, data);
      setEditData(null);
    } else {
      await addTransaction(data);
    }
    setIsFormOpen(false);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditData(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
  };

  // স্ট্যাটস কার্ড ডেটা
  const statsCards = [
    {
      title: 'মোট আয়',
      value: totalIncome,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgGradient: 'from-emerald-50/50 to-emerald-100/20 dark:from-emerald-950/20 dark:to-emerald-900/10',
      borderColor: 'border-emerald-200/30 dark:border-emerald-800/20',
      iconBg: 'bg-emerald-100/40 dark:bg-emerald-900/20',
    },
    {
      title: 'মোট খরচ',
      value: totalExpense,
      color: 'text-rose-600 dark:text-rose-400',
      bgGradient: 'from-rose-50/50 to-rose-100/20 dark:from-rose-950/20 dark:to-rose-900/10',
      borderColor: 'border-rose-200/30 dark:border-rose-800/20',
      iconBg: 'bg-rose-100/40 dark:bg-rose-900/20',
    },
    {
      title: 'ব্যালেন্স',
      value: balance,
      color: balance >= 0 
        ? 'text-emerald-600 dark:text-emerald-400' 
        : 'text-rose-600 dark:text-rose-400',
      bgGradient: balance >= 0
        ? 'from-emerald-50/50 to-emerald-100/20 dark:from-emerald-950/20 dark:to-emerald-900/10'
        : 'from-rose-50/50 to-rose-100/20 dark:from-rose-950/20 dark:to-rose-900/10',
      borderColor: balance >= 0
        ? 'border-emerald-200/30 dark:border-emerald-800/20'
        : 'border-rose-200/30 dark:border-rose-800/20',
      iconBg: balance >= 0
        ? 'bg-emerald-100/40 dark:bg-emerald-900/20'
        : 'bg-rose-100/40 dark:bg-rose-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* হেডার - সফট গ্রেডিয়েন্ট */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-primary/8 to-secondary/5 p-6 backdrop-blur border border-primary/5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-2xl" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              ট্রানজেকশন
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              {getMonthLabel(selectedMonth)} মাসের ট্রানজেকশন
            </p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            নতুন ট্রানজেকশন
          </Button>
        </div>
      </div>

      {/* মাস সিলেক্টর - সফট ডিজাইন */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-border/40 bg-gradient-to-r from-background via-background/80 to-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => changeMonth(-1)}
            className="hover:bg-primary/5 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[150px] text-center text-foreground/80">
            {getMonthLabel(selectedMonth)}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => changeMonth(1)}
            className="hover:bg-primary/5 rounded-xl"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            setSelectedMonth(currentMonth);
          }}
          className="text-muted-foreground hover:text-foreground rounded-xl"
        >
          <Sparkles className="h-3 w-3 mr-1.5" />
          আজকের মাস
        </Button>
      </div>

      {/* সামারি কার্ড - সফট কালার */}
      <div className="grid gap-4 md:grid-cols-3">
        {statsCards.map((stat, index) => (
          <Card 
            key={index}
            className={cn(
              "border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.01]",
              stat.borderColor,
              "bg-gradient-to-br",
              stat.bgGradient
            )}
          >
            <CardHeader className="py-3 px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground/70">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <p className={cn("text-2xl font-bold", stat.color)}>
                ৳{typeof stat.value === 'number' ? stat.value.toFixed(2) : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ফিল্টার */}
      <div className="p-4 rounded-2xl border border-border/40 bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/20">
        <TransactionFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          filterCategory={filterCategory}
          onFilterCategoryChange={setFilterCategory}
          categories={categories}
        />
      </div>

      {/* ট্রানজেকশন লিস্ট */}
      <div className="rounded-2xl border border-border/40 overflow-hidden bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/20">
        <TransactionList
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>

      {/* ট্রানজেকশন ফর্ম মডেল */}
      <TransactionForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditData(null);
        }}
        onSave={handleSave}
        editData={editData}
        isLoading={isLoading}
      />
    </div>
  );
};