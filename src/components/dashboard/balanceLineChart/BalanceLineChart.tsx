import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useThemeStore } from '@/store/themeStore';
import { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BalanceLineChartProps {
  transactions: Transaction[];
}

export const BalanceLineChart: React.FC<BalanceLineChartProps> = ({ transactions }) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // সাজানো ট্রানজেকশন (তারিখ অনুযায়ী)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // ডেটা পয়েন্ট তৈরি করুন
  let balance = 0;
  const dataPoints = sortedTransactions.map(t => {
    if (t.type === 'income') {
      balance += t.amount;
    } else {
      balance -= t.amount;
    }
    return {
      date: new Date(t.date).toLocaleDateString(),
      balance: balance,
    };
  });

  const options: ApexOptions = {
    chart: {
      type: 'line',
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
    colors: ['#8B5CF6'],
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    markers: {
      size: 4,
      colors: ['#8B5CF6'],
      strokeColors: isDark ? '#1e293b' : '#ffffff',
      strokeWidth: 2,
    },
    xaxis: {
      categories: dataPoints.map(d => d.date),
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
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
  };

  const series = [
    {
      name: 'ব্যালেন্স',
      data: dataPoints.map(d => d.balance),
    },
  ];

  if (dataPoints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">ব্যালেন্স ট্রেন্ড</CardTitle>
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
        <CardTitle className="text-sm font-medium">ব্যালেন্স ট্রেন্ড</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={300}
        />
      </CardContent>
    </Card>
  );
};