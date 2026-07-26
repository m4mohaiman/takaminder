import React from 'react';
import { ArrowDown, ArrowUp, Wallet, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface StatsCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: any[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalIncome,
  totalExpense,
  balance,
  transactions,
}) => {
  const totalTransactions = transactions.length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">৳{balance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {balance >= 0 ? 'You are in profit' : 'You are in loss'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <ArrowUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">৳{totalIncome.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            From {transactions.filter(t => t.type === 'income').length} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
          <ArrowDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">৳{totalExpense.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            From {transactions.filter(t => t.type === 'expense').length} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTransactions}</div>
          <p className="text-xs text-muted-foreground">
            Total transactions recorded
          </p>
        </CardContent>
      </Card>
    </div>
  );
};