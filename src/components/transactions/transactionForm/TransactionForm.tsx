import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Transaction } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const transactionSchema = z.object({
  amount: z.number().positive('টাকা ধনাত্মক হতে হবে'),
  category: z.string().min(1, 'ক্যাটাগরি নির্বাচন করুন'),
  description: z.string().optional(),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'তারিখ নির্বাচন করুন'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  editData?: Transaction | null;
  isLoading?: boolean;
}

const categories = {
  income: ['বেতন', 'ফ্রিল্যান্স', 'বিনিয়োগ', 'উপহার', 'অন্যান্য'],
  expense: ['খাবার', 'ভাড়া', 'পরিবহন', 'শপিং', 'বিনোদন', 'স্বাস্থ্য', 'ইউটিলিটি', 'অন্যান্য'],
};

export const TransactionForm: React.FC<TransactionFormProps> = ({
  open,
  onOpenChange,
  onSave,
  editData,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>(
    editData?.type || 'expense'
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: editData || {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    },
  });

const onSubmit = async (data: TransactionFormData) => {
  if (!user) {
    toast.error('লগইন করুন!');
    return;
  }

  const transactionData = {
    ...data,
    user_id: user.id, // ✅ নিশ্চিত করুন এই লাইন আছে
  };

  await onSave(transactionData);
  reset();
  onOpenChange(false);
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'ট্রানজেকশন এডিট করুন' : 'নতুন ট্রানজেকশন'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* টাইপ */}
          <div className="space-y-2">
            <Label>টাইপ</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={selectedType === 'income' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => {
                  setSelectedType('income');
                  setValue('type', 'income');
                }}
              >
                আয়
              </Button>
              <Button
                type="button"
                variant={selectedType === 'expense' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => {
                  setSelectedType('expense');
                  setValue('type', 'expense');
                }}
              >
                খরচ
              </Button>
            </div>
            <input type="hidden" {...register('type')} />
          </div>

          {/* ক্যাটাগরি */}
          <div className="space-y-2">
            <Label htmlFor="category">ক্যাটাগরি</Label>
            <Select
              onValueChange={(value) => setValue('category', value)}
              defaultValue={editData?.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {categories[selectedType].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* টাকা */}
          <div className="space-y-2">
            <Label htmlFor="amount">টাকা</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* বিবরণ */}
          <div className="space-y-2">
            <Label htmlFor="description">বিবরণ (অপশনাল)</Label>
            <Input
              id="description"
              placeholder="কেন এই ট্রানজেকশন..."
              {...register('description')}
            />
          </div>

          {/* তারিখ */}
          <div className="space-y-2">
            <Label htmlFor="date">তারিখ</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};