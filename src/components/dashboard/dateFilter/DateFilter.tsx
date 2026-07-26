import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimeFilter } from '@/types';

interface DateFilterProps {
  selectedMonth: string;
  timeFilter: TimeFilter;
  monthOptions: string[];
  onMonthChange: (month: string) => void;
  onTimeFilterChange: (filter: TimeFilter) => void;
  onCustomRangeChange: (start: string, end: string) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  selectedMonth,
  timeFilter,
  monthOptions,
  onMonthChange,
  onTimeFilterChange,
  onCustomRangeChange,
}) => {
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const timeFilterLabels = {
    currentMonth: 'এই মাস',
    last3Months: 'শেষ ৩ মাস',
    last6Months: 'শেষ ৬ মাস',
    last12Months: 'শেষ ১২ মাস',
    custom: 'কাস্টম',
  };

  const getDisplayText = () => {
    if (timeFilter === 'currentMonth') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const date = new Date(year, month - 1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    return timeFilterLabels[timeFilter];
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* টাইম ফিল্টার ড্রপডাউন */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            {getDisplayText()}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onTimeFilterChange('currentMonth')}>
            এই মাস
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTimeFilterChange('last3Months')}>
            শেষ ৩ মাস
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTimeFilterChange('last6Months')}>
            শেষ ৬ মাস
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTimeFilterChange('last12Months')}>
            শেষ ১২ মাস
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            onTimeFilterChange('custom');
            setIsCustomOpen(true);
          }}>
            কাস্টম
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* মাস সিলেক্টর (শুধু currentMonth-এ দেখাবে) */}
      {timeFilter === 'currentMonth' && (
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="মাস নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((month) => {
              const [year, monthNum] = month.split('-').map(Number);
              const label = new Date(year, monthNum - 1).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              });
              return (
                <SelectItem key={month} value={month}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}

      {/* কাস্টম ডেট রেঞ্জ পপওভার */}
      {timeFilter === 'custom' && (
        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              কাস্টম রেঞ্জ
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="startDate">শুরুর তারিখ</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endDate">শেষের তারিখ</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  if (customStart && customEnd) {
                    onCustomRangeChange(customStart, customEnd);
                    setIsCustomOpen(false);
                  }
                }}
                disabled={!customStart || !customEnd}
              >
                প্রয়োগ করুন
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* ফিল্টার রিসেট */}
      {(timeFilter !== 'currentMonth' || selectedMonth !== monthOptions[0]) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const now = new Date();
            const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            onMonthChange(defaultMonth);
            onTimeFilterChange('currentMonth');
          }}
        >
          রিসেট
        </Button>
      )}
    </div>
  );
};