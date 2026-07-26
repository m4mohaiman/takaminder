import React, { useEffect, useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactionStore } from '@/store/transactionStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Transaction } from '@/types';
import { TransactionFilters } from '@/components/transactions/transactionFilters/TransactionFilters';
import { TransactionList } from '@/components/transactions/transactionList/TransactionList';
import { TransactionForm } from '@/components/transactions/transactionForm/TransactionForm';

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

  // ইউজার আইডি সেট করুন
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user?.id, setUserId]);

  // ✅ মাস পরিবর্তনে ডেটা ফেচ করুন (শুধু currentMonth-এর জন্য)
  useEffect(() => {
    if (user?.id && selectedMonth) {
      fetchTransactions(user.id, selectedMonth, 'currentMonth');
    }
  }, [user?.id, selectedMonth, fetchTransactions]);

  // মাসের নাম প্রদর্শন
  const getMonthLabel = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // মাস পরিবর্তন
  const changeMonth = (offset: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  // ফিল্টার করা ট্রানজেকশন
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

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ট্রানজেকশন</h1>
          <p className="text-muted-foreground">
            {getMonthLabel(selectedMonth)} মাসের ট্রানজেকশন
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          নতুন ট্রানজেকশন
        </Button>
      </div>

      {/* মাস সিলেক্টর */}
      <div className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[150px] text-center">
            {getMonthLabel(selectedMonth)}
          </span>
          <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
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
        >
          আজকের মাস
        </Button>
      </div>

      {/* সামারি কার্ড */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ৳{totalIncome.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">মোট খরচ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              ৳{totalExpense.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">ব্যালেন্স</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ৳{balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ফিল্টার */}
      <TransactionFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        categories={categories}
      />

      {/* ট্রানজেকশন লিস্ট */}
      <TransactionList
        transactions={filteredTransactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

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