export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  spent: number;
  month: string;
  year: number;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  role?:string;
}


export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  spent: number;
  month: string;
  year: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export type TimeFilter = 'currentMonth' | 'last3Months' | 'last6Months' | 'last12Months' | 'custom';