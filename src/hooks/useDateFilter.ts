import { useState, useMemo, useEffect } from 'react';
import { Transaction, TimeFilter } from '@/types';

export const useDateFilter = (
  transactions: Transaction[],
  fetchTransactions?: (userId: string, month?: string, filter?: TimeFilter, startDate?: string, endDate?: string) => Promise<void>,
  userId?: string | null
) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('currentMonth');
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  // মাসের অপশন তৈরি করুন
  const monthOptions = useMemo(() => {
    const options: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      options.push(value);
    }
    return options;
  }, []);

  // ✅ ফিল্টার পরিবর্তনে ডেটা ফেচ করুন
  useEffect(() => {
    if (!userId || !fetchTransactions) return;

    if (timeFilter === 'currentMonth') {
      // currentMonth হলে selectedMonth অনুযায়ী ফেচ
      fetchTransactions(userId, selectedMonth, timeFilter);
    } else if (timeFilter === 'last3Months') {
      // গত ৩ মাসের ডেটা ফেচ
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const startDate = threeMonthsAgo.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      fetchTransactions(userId, undefined, timeFilter, startDate, endDate);
    } else if (timeFilter === 'last6Months') {
      // গত ৬ মাসের ডেটা ফেচ
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      const startDate = sixMonthsAgo.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      fetchTransactions(userId, undefined, timeFilter, startDate, endDate);
    } else if (timeFilter === 'last12Months') {
      // গত ১২ মাসের ডেটা ফেচ
      const now = new Date();
      const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      const startDate = twelveMonthsAgo.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      fetchTransactions(userId, undefined, timeFilter, startDate, endDate);
    } else if (timeFilter === 'custom' && customRange.start && customRange.end) {
      // কাস্টম রেঞ্জের ডেটা ফেচ
      fetchTransactions(userId, undefined, timeFilter, customRange.start, customRange.end);
    }
  }, [timeFilter, selectedMonth, customRange, userId, fetchTransactions]);

  // ফিল্টার অনুযায়ী ডেটা ফিল্টার করুন
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (timeFilter === 'currentMonth') {
      const [year, month] = selectedMonth.split('-').map(Number);
      filtered = filtered.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === year && date.getMonth() === month - 1;
      });
    } else if (timeFilter === 'last3Months') {
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      filtered = filtered.filter(t => {
        const date = new Date(t.date);
        return date >= threeMonthsAgo && date <= now;
      });
    } else if (timeFilter === 'last6Months') {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      filtered = filtered.filter(t => {
        const date = new Date(t.date);
        return date >= sixMonthsAgo && date <= now;
      });
    } else if (timeFilter === 'last12Months') {
      const now = new Date();
      const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      filtered = filtered.filter(t => {
        const date = new Date(t.date);
        return date >= twelveMonthsAgo && date <= now;
      });
    } else if (timeFilter === 'custom' && customRange.start && customRange.end) {
      const start = new Date(customRange.start);
      const end = new Date(customRange.end);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => {
        const date = new Date(t.date);
        return date >= start && date <= end;
      });
    }

    return filtered;
  }, [transactions, timeFilter, selectedMonth, customRange]);

  // ফিল্টার পরিবর্তন ফাংশন
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setTimeFilter('currentMonth');
  };

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    if (filter !== 'custom') {
      setCustomRange({ start: '', end: '' });
    }
  };

  const handleCustomRangeChange = (start: string, end: string) => {
    setCustomRange({ start, end });
    setTimeFilter('custom');
  };

  return {
    selectedMonth,
    timeFilter,
    customRange,
    monthOptions,
    filteredTransactions,
    handleMonthChange,
    handleTimeFilterChange,
    handleCustomRangeChange,
  };
};