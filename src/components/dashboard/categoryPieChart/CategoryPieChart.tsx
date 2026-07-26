import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useThemeStore } from '@/store/themeStore';
import { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryPieChartProps {
  transactions: Transaction[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ transactions }) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // খরচের ক্যাটাগরি অনুযায়ী ডেটা গ্রুপ করুন
  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.category === t.category);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ category: t.category, amount: t.amount });
      }
      return acc;
    }, [] as { category: string; amount: number }[]);

  // কালার প্যালেট
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A80', '#B39DDB'];

  const options: ApexOptions = {
    chart: {
      type: 'pie',
      background: 'transparent',
      fontFamily: 'inherit',
    },
    labels: expenseData.map(d => d.category),
    colors: colors.slice(0, expenseData.length),
    theme: {
      mode: isDark ? 'dark' : 'light',
    },
    legend: {
      position: 'bottom',
      labels: {
        colors: isDark ? '#e2e8f0' : '#1e293b',
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `৳${val.toFixed(2)}`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '40%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'মোট খরচ',
              formatter: () => `৳${expenseData.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}`,
              color: isDark ? '#e2e8f0' : '#1e293b',
            },
          },
        },
      },
    },
  };

  const series = expenseData.map(d => d.amount);

  if (expenseData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">ক্যাটাগরি ভিত্তিক খরচ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">কোনো খরচের ডেটা নেই</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">ক্যাটাগরি ভিত্তিক খরচ</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactApexChart
          options={options}
          series={series}
          type="pie"
          height={350}
        />
      </CardContent>
    </Card>
  );
};