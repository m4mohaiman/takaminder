import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBudgetStore } from '@/store/budgetStore';
import { useTransactionStore } from '@/store/transactionStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: any;
  onSuccess: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  open,
  onOpenChange,
  editData,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { addBudget, updateBudget } = useBudgetStore();
  const { transactions, fetchTransactions, selectedMonth } = useTransactionStore();
  
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // ✅ ক্যাটাগরি লিস্ট (ট্রানজেকশন থেকে + কাস্টম)
  const existingCategories = transactions
    .filter(t => t.type === 'expense')
    .map(t => t.category)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort();

  // ✅ ডায়ালগ খোলার সময় ট্রানজেকশন রিফ্রেশ করুন
  useEffect(() => {
    if (open && user?.id) {
      fetchTransactions(user.id, selectedMonth, 'currentMonth');
    }
  }, [open, user?.id, selectedMonth]);

  useEffect(() => {
    if (editData) {
      setCategory(editData.category);
      setAmount(editData.amount.toString());
      setShowCustomInput(false);
      setCustomCategory('');
    } else {
      setCategory('');
      setAmount('');
      setShowCustomInput(false);
      setCustomCategory('');
    }
  }, [editData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // ✅ কাস্টম ক্যাটাগরি চেক
    const finalCategory = showCustomInput ? customCategory.trim() : category;
    
    if (!finalCategory) {
      toast.error('ক্যাটাগরি নির্বাচন করুন বা লিখুন!');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('সঠিক টাকা দিন!');
      return;
    }

    setIsSubmitting(true);
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      
      if (editData) {
        await updateBudget(editData.id, { amount: parseFloat(amount) });
      } else {
        await addBudget({
          user_id: user.id,
          category: finalCategory,
          amount: parseFloat(amount),
          month,
          year,
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-border/40 bg-background/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            {editData ? 'বাজেট আপডেট করুন' : 'নতুন বাজেট তৈরি করুন'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ক্যাটাগরি */}
          <div className="space-y-2">
            <Label className="text-muted-foreground/80">
              ক্যাটাগরি
            </Label>
            
            {!showCustomInput ? (
              <div className="space-y-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={cn(
                    "rounded-xl border-border/40 bg-background/30",
                    !category && "text-muted-foreground"
                  )}>
                    <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40">
                    {existingCategories.length > 0 ? (
                      existingCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">
                        কোনো ক্যাটাগরি নেই। প্রথমে একটি ট্রানজেকশন যোগ করুন বা নতুন ক্যাটাগরি লিখুন।
                      </div>
                    )}
                  </SelectContent>
                </Select>
                
                {/* ✅ নতুন ক্যাটাগরি যোগ করার অপশন */}
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 mt-1"
                >
                  <Plus className="h-3 w-3" />
                  নতুন ক্যাটাগরি লিখুন
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="নতুন ক্যাটাগরি লিখুন..."
                  className="rounded-xl border-border/40 bg-background/30"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomCategory('');
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ক্যাটাগরি নির্বাচন করুন
                </button>
              </div>
            )}
          </div>

          {/* টাকা */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-muted-foreground/80">
              বাজেট (৳)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl border-border/40 bg-background/30"
              required
            />
          </div>

          {/* বাটন */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl border-border/40 hover:bg-primary/5"
              onClick={() => {
                onOpenChange(false);
                setShowCustomInput(false);
                setCustomCategory('');
              }}
            >
              বাতিল
            </Button>
            <Button 
              type="submit" 
              className="flex-1 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20"
              disabled={isSubmitting || (!category && !customCategory) || !amount}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  সেভ হচ্ছে...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {editData ? 'আপডেট করুন' : 'তৈরি করুন'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};