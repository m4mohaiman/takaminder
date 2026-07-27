import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Budget } from '../types';
import toast from 'react-hot-toast';
import { notificationService } from '@/services/notificationService';

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  
  fetchBudgets: (userId: string, month: number, year: number) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'spent'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  updateSpent: (userId: string, category: string, month: number, year: number) => Promise<void>;
  getBudgetByCategory: (category: string) => Budget | undefined;
  getTotalBudget: () => number;
  getTotalSpent: () => number;
  getRemainingBudget: () => number;
  clearBudgets: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  isLoading: false,
  error: null,

  // ✅ বাজেট ফেচ করুন
  fetchBudgets: async (userId, month, year) => {
    if (!userId) {
      console.warn('No userId provided to fetchBudgets');
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year);

      if (error) throw error;
      
      set({ budgets: data || [] });
      
      // প্রতিটি বাজেটের জন্য spent আপডেট করুন
      for (const budget of data || []) {
        await get().updateSpent(userId, budget.category, month, year);
      }
      
    } catch (error: any) {
      console.error('Error fetching budgets:', error);
      set({ error: error.message });
      toast.error('বাজেট লোড করতে ব্যর্থ!');
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ নতুন বাজেট যোগ করুন
  addBudget: async (budget) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          ...budget,
          spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        budgets: [...state.budgets, data],
      }));
      
      // বাজেট অ্যালার্ট চেক
      if (data.amount > 0) {
        notificationService.notify(
          'নতুন বাজেট তৈরি ✅',
          `${data.category} এর জন্য ৳${data.amount.toFixed(2)} বাজেট সেট করা হয়েছে`,
          'success'
        );
      }
      
      toast.success('বাজেট সেট হয়েছে! 🎯');
    } catch (error: any) {
      console.error('Error adding budget:', error);
      toast.error(error.message || 'বাজেট যোগ করতে ব্যর্থ!');
      throw error;
    }
  },

  // ✅ বাজেট আপডেট করুন
  updateBudget: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.id === id ? { ...b, ...data } : b
        ),
      }));

      toast.success('বাজেট আপডেট হয়েছে! ✏️');
    } catch (error: any) {
      console.error('Error updating budget:', error);
      toast.error(error.message || 'বাজেট আপডেট করতে ব্যর্থ!');
      throw error;
    }
  },

  // ✅ বাজেট ডিলিট করুন
  deleteBudget: async (id) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
      }));

      toast.success('বাজেট ডিলিট হয়েছে! 🗑️');
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      toast.error(error.message || 'বাজেট ডিলিট করতে ব্যর্থ!');
      throw error;
    }
  },

  // ✅ spent আপডেট করুন
  updateSpent: async (userId, category, month, year) => {
    try {
      // এই ক্যাটাগরির জন্য সব ট্রানজেকশন বের করুন
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      if (txError) throw txError;

      const spent = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // বাজেট আপডেট করুন
      const { error: updateError } = await supabase
        .from('budgets')
        .update({ 
          spent, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('category', category)
        .eq('month', month)
        .eq('year', year);

      if (updateError) throw updateError;

      // লোকাল স্টেট আপডেট করুন
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.category === category && b.month === month && b.year === year
            ? { ...b, spent }
            : b
        ),
      }));

      // বাজেট অ্যালার্ট চেক
      const budget = get().budgets.find(
        b => b.category === category && b.month === month && b.year === year
      );
      
      if (budget && budget.amount > 0) {
        const percentage = (spent / budget.amount) * 100;
        if (percentage >= 100) {
          notificationService.notifyBudgetAlert(category, spent, budget.amount, percentage);
        } else if (percentage >= 80) {
          notificationService.notifyBudgetAlert(category, spent, budget.amount, percentage);
        }
      }

    } catch (error: any) {
      console.error('Error updating spent:', error);
    }
  },

  // ✅ ক্যাটাগরি অনুযায়ী বাজেট খুঁজুন
  getBudgetByCategory: (category) => {
    return get().budgets.find(b => b.category === category);
  },

  // ✅ মোট বাজেট
  getTotalBudget: () => {
    return get().budgets.reduce((sum, b) => sum + b.amount, 0);
  },

  // ✅ মোট খরচ
  getTotalSpent: () => {
    return get().budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  },

  // ✅ অবশিষ্ট বাজেট
  getRemainingBudget: () => {
    const { budgets } = get();
    return budgets.reduce((sum, b) => sum + (b.amount - (b.spent || 0)), 0);
  },

  // ✅ সব বাজেট ক্লিয়ার করুন
  clearBudgets: () => {
    set({ budgets: [], isLoading: false, error: null });
  },
}));