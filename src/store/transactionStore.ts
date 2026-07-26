import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';
import toast from 'react-hot-toast';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  selectedMonth: string;
  userId: string | null;
  
  fetchTransactions: (userId: string, month?: string, filter?: string, startDate?: string, endDate?: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  calculateStats: (transactions?: Transaction[]) => void;
  setSelectedMonth: (month: string) => void;
  setUserId: (userId: string | null) => void;
  getFilteredTransactions: () => Transaction[];
  getMonthlyStats: () => { income: number; expense: number; balance: number; count: number };
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  userId: null,
  selectedMonth: (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  })(),

  setUserId: (userId) => set({ userId }),

  // ✅ আপডেটেড fetchTransactions
  fetchTransactions: async (userId, month, filter = 'currentMonth', startDate, endDate) => {
    if (!userId) {
      console.warn('No userId provided to fetchTransactions');
      return;
    }
    
    set({ isLoading: true, userId });
    
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      // ✅ ফিল্টার অনুযায়ী কোয়েরি তৈরি করুন
      if (filter === 'currentMonth' && month) {
        const [year, monthNum] = month.split('-').map(Number);
        const startDateStr = `${year}-${String(monthNum).padStart(2, '0')}-01`;
        const endDateStr = new Date(year, monthNum, 0).toISOString().split('T')[0];
        query = query.gte('date', startDateStr).lte('date', endDateStr);
        
        // selectedMonth সেট করুন
        set({ selectedMonth: month });
      } else if (filter === 'last3Months' || filter === 'last6Months' || filter === 'last12Months') {
        if (startDate && endDate) {
          query = query.gte('date', startDate).lte('date', endDate);
        }
        // selectedMonth সেট করবেন না (রাখুন যেমন আছে)
      } else if (filter === 'custom' && startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate);
      } else {
        // ডিফল্ট: currentMonth
        const now = new Date();
        const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const [year, monthNum] = defaultMonth.split('-').map(Number);
        const startDateStr = `${year}-${String(monthNum).padStart(2, '0')}-01`;
        const endDateStr = new Date(year, monthNum, 0).toISOString().split('T')[0];
        query = query.gte('date', startDateStr).lte('date', endDateStr);
        set({ selectedMonth: defaultMonth });
      }

      const { data, error } = await query;

      if (error) throw error;
      
      set({ 
        transactions: data || [],
      });
      get().calculateStats();
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('ট্রানজেকশন লোড করতে ব্যর্থ!');
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (transaction) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) {
        console.error('Add error:', error);
        toast.error('ট্রানজেকশন যোগ করতে ব্যর্থ!');
        throw error;
      }
      
      const { userId, selectedMonth, fetchTransactions } = get();
      if (userId) {
        await fetchTransactions(userId, selectedMonth, 'currentMonth');
      }
      
      toast.success('ট্রানজেকশন যোগ হয়েছে! ✅');
    } catch (error) {
      console.error('Add transaction error:', error);
      throw error;
    }
  },

  updateTransaction: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        toast.error('ট্রানজেকশন আপডেট করতে ব্যর্থ!');
        throw error;
      }

      const { userId, selectedMonth, fetchTransactions } = get();
      if (userId) {
        await fetchTransactions(userId, selectedMonth, 'currentMonth');
      }
      
      toast.success('ট্রানজেকশন আপডেট হয়েছে! ✏️');
    } catch (error) {
      console.error('Update transaction error:', error);
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        toast.error('ট্রানজেকশন ডিলিট করতে ব্যর্থ!');
        throw error;
      }

      const { userId, selectedMonth, fetchTransactions } = get();
      if (userId) {
        await fetchTransactions(userId, selectedMonth, 'currentMonth');
      }
      
      toast.success('ট্রানজেকশন ডিলিট হয়েছে! 🗑️');
    } catch (error) {
      console.error('Delete transaction error:', error);
      throw error;
    }
  },

  calculateStats: (transactions) => {
    const txns = transactions || get().transactions;
    const totalIncome = txns
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = txns
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    set({ totalIncome, totalExpense, balance });
  },

  setSelectedMonth: (month) => {
    set({ selectedMonth: month });
    const { userId } = get();
    if (userId) {
      get().fetchTransactions(userId, month, 'currentMonth');
    }
  },

  getFilteredTransactions: () => {
    return get().transactions;
  },

  getMonthlyStats: () => {
    const { transactions } = get();
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense,
      count: transactions.length,
    };
  },
}));