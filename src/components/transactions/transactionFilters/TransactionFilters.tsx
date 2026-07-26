import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


interface TransactionFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: 'all' | 'income' | 'expense';
  onFilterTypeChange: (type: 'all' | 'income' | 'expense') => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  categories: string[];
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterCategory,
  onFilterCategoryChange,
  categories,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* সার্চ */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="সার্চ করুন..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* টাইপ ফিল্টার */}
      <Select
        value={filterType}
        onValueChange={(value) => onFilterTypeChange(value as any)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="টাইপ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">সব</SelectItem>
          <SelectItem value="income">আয়</SelectItem>
          <SelectItem value="expense">খরচ</SelectItem>
        </SelectContent>
      </Select>

      {/* ক্যাটাগরি ফিল্টার */}
      <Select
        value={filterCategory}
        onValueChange={(value) => onFilterCategoryChange(value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="ক্যাটাগরি" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* রিসেট */}
      {(searchQuery || filterType !== 'all' || filterCategory !== 'all') && (
        <Button
          variant="ghost"
          onClick={() => {
            onSearchChange('');
            onFilterTypeChange('all');
            onFilterCategoryChange('all');
          }}
        >
          রিসেট
        </Button>
      )}
    </div>
  );
};