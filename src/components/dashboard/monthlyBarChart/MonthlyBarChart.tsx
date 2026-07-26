import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useThemeStore } from '@/store/themeStore';
import { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthlyBarChartProps {
  transactions: Transaction[];
}

export const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({ transactions }) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // মাস অনুযায়ী ডেটা গ্রুপ করুন
  const monthlyData = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      acc[month].income += t.amount;
    } else {
      acc[month].expense += t.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  // মাসের নাম সাজানো
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const months = Object.keys(monthlyData).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      background: 'transparent',
      fontFamily: 'inherit',
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    theme: {
      mode: isDark ? 'dark' : 'light',
    },
    colors: ['#22C55E', '#EF4444'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: months,
      labels: {
        style: {
          colors: isDark ? '#e2e8f0' : '#1e293b',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => `৳${val}`,
        style: {
          colors: isDark ? '#e2e8f0' : '#1e293b',
        },
      },
    },
    legend: {
      position: 'top',
      labels: {
        colors: isDark ? '#e2e8f0' : '#1e293b',
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `৳${val.toFixed(2)}`,
      },
    },
  };

  const series = [
    {
      name: 'আয়',
      data: months.map(m => monthlyData[m].income || 0),
    },
    {
      name: 'খরচ',
      data: months.map(m => monthlyData[m].expense || 0),
    },
  ];

  if (Object.keys(monthlyData).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">মাসিক আয়-খরচ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">কোনো ডেটা নেই</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">মাসিক আয়-খরচ</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={300}
        />
      </CardContent>
    </Card>
  );
};