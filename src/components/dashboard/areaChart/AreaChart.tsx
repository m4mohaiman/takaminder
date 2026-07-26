import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useThemeStore } from '@/store/themeStore';
import { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AreaChartProps {
  transactions: Transaction[];
}

export const AreaChart: React.FC<AreaChartProps> = ({ transactions }) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // তারিখ অনুযায়ী সাজানো
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const dates = sortedTransactions.map(t => new Date(t.date).toLocaleDateString());
  const incomeData = sortedTransactions.map(t => t.type === 'income' ? t.amount : 0);
  const expenseData = sortedTransactions.map(t => t.type === 'expense' ? t.amount : 0);

  const options: ApexOptions = {
    chart: {
      type: 'area',
      background: 'transparent',
      fontFamily: 'inherit',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    theme: {
      mode: isDark ? 'dark' : 'light',
    },
    colors: ['#22C55E', '#EF4444'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      categories: dates,
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
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
  };

  const series = [
    {
      name: 'আয়',
      data: incomeData,
    },
    {
      name: 'খরচ',
      data: expenseData,
    },
  ];

  if (sortedTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">আয়-খরচ ট্রেন্ড</CardTitle>
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
        <CardTitle className="text-sm font-medium">আয়-খরচ ট্রেন্ড</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={300}
        />
      </CardContent>
    </Card>
  );
};