import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactionStore } from '@/store/transactionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, Wallet, Calendar, Download, Printer,
  Sparkles, Award, PieChart, BarChart3, Activity, FileText
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategoryPieChart } from '@/components/dashboard/categoryPieChart/CategoryPieChart';
import { MonthlyBarChart } from '@/components/dashboard/monthlyBarChart/MonthlyBarChart';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

export const Reports = () => {
  const { user } = useAuth();
  const { transactions, fetchTransactions, selectedMonth, setSelectedMonth } = useTransactionStore();
  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');
  const [isPrinting, setIsPrinting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchTransactions(user.id, selectedMonth, 'currentMonth');
    }
  }, [user?.id, selectedMonth]);

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

    const categorySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      topCategories,
      totalTransactions: transactions.length,
      transactions,
    };
  }, [transactions]);

  const getMonthLabel = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // ✅ পিডিএফ ডাউনলোড
const downloadPDF = async () => {
  if (!reportRef.current) return;
  
  setIsPrinting(true);
  try {
    const element = reportRef.current;
    
    // ✅ OKLAB কালার ফিক্স
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      // ✅ গুরুত্বপূর্ণ: OKLAB/OKLCH কে সাপোর্ট করার জন্য
      ignoreElements: (el: Element) => {
        // কোনো এলিমেন্ট ইগনোর করার প্রয়োজন নেই
        return false;
      },
      onclone: (clonedDoc) => {
        // ✅ ক্লোন করা ডকুমেন্টে সব OKLAB কালারকে HEX বা RGB তে কনভার্ট করুন
        const style = document.createElement('style');
        style.textContent = `
          /* সব এলিমেন্টের কালার HEX এ কনভার্ট করুন */
          * {
            color: #1e293b !important;
            background-color: #ffffff !important;
            border-color: #e2e8f0 !important;
          }
          /* গ্রেডিয়েন্ট কালার */
          .bg-gradient-to-r, .bg-gradient-to-br, .bg-gradient-to-bl {
            background: #ffffff !important;
          }
          /* চার্টের জন্য */
          .apexcharts-canvas {
            filter: none !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save(`TakaMinder_Report_${getMonthLabel(selectedMonth)}.pdf`);
  } catch (error) {
    console.error('PDF download error:', error);
    // ✅ এরর হলে প্রিন্ট অপশন দেখান
    alert('PDF ডাউনলোডে সমস্যা হয়েছে। দয়া করে "প্রিন্ট" বাটন ব্যবহার করে Save as PDF করুন।');
  } finally {
    setIsPrinting(false);
  }
};


const downloadDirectPDF = () => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 15;
  
  // ========== হেডার ==========
  doc.setFontSize(22);
  doc.setTextColor('#2563eb');
  doc.text('TakaMinder', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(16);
  doc.setTextColor('#1e293b');
  doc.text(`আর্থিক রিপোর্ট - ${getMonthLabel(selectedMonth)}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  
  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  doc.text(`প্রস্তুত: ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  
  doc.setDrawColor('#e2e8f0');
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;
  
  // ========== স্ট্যাটস টেবিল ==========
  const statsData = [
    ['মেট্রিক', 'টাকা'],
    ['মোট আয়', `৳${stats.totalIncome.toFixed(2)}`],
    ['মোট খরচ', `৳${stats.totalExpense.toFixed(2)}`],
    ['ব্যালেন্স', `৳${stats.balance.toFixed(2)}`],
    ['সেভিংস রেট', `${stats.savingsRate.toFixed(1)}%`],
    ['মোট ট্রানজেকশন', `${stats.totalTransactions}`],
  ];
  
  (doc as any).autoTable({
    startY: yPos,
    head: [statsData[0]],
    body: statsData.slice(1),
    theme: 'striped',
    styles: { fontSize: 11, cellPadding: 5 },
    headStyles: { fillColor: '#2563eb', textColor: '#ffffff', fontSize: 12, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80, halign: 'left' },
      1: { cellWidth: 'auto', halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 12;
  
  // ========== টপ ক্যাটাগরি ==========
  if (stats.topCategories.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor('#1e293b');
    doc.text('শীর্ষ খরচের ক্যাটাগরি', 20, yPos);
    yPos += 6;
    
    const categoryData = stats.topCategories.map(([category, amount]) => {
      const percentage = stats.totalExpense > 0 ? (amount / stats.totalExpense) * 100 : 0;
      return [category, `৳${amount.toFixed(2)}`, `${percentage.toFixed(1)}%`];
    });
    
    (doc as any).autoTable({
      startY: yPos,
      head: [['ক্যাটাগরি', 'টাকা', 'শতাংশ']],
      body: categoryData,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: '#64748b', textColor: '#ffffff', fontSize: 11 },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 'auto', halign: 'right' },
        2: { cellWidth: 'auto', halign: 'right' },
      },
      margin: { left: 20, right: 20 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 8;
  }
  
  // ========== ট্রানজেকশন লিস্ট (শেষ ১০টি) ==========
  const recentTxns = stats.transactions.slice(0, 10);
  if (recentTxns.length > 0) {
    // চেক করুন পেজে জায়গা আছে কিনা
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor('#1e293b');
    doc.text('সাম্প্রতিক ট্রানজেকশন', 20, yPos);
    yPos += 6;
    
    const txnData = recentTxns.map(t => [
      new Date(t.date).toLocaleDateString('bn-BD'),
      t.category,
      t.description || '-',
      t.type === 'income' ? 'আয়' : 'খরচ',
      `${t.type === 'income' ? '+' : '-'}৳${t.amount.toFixed(2)}`
    ]);
    
    (doc as any).autoTable({
      startY: yPos,
      head: [['তারিখ', 'ক্যাটাগরি', 'বিবরণ', 'টাইপ', 'টাকা']],
      body: txnData,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: '#94a3b8', textColor: '#ffffff', fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 20 },
        4: { cellWidth: 'auto', halign: 'right' },
      },
      margin: { left: 20, right: 20 },
    });
  }
  
  // ========== ফুটার (সব পেজে) ==========
  const pageCount = doc.internal.pages.length;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor('#94a3b8');
    doc.text(
      `TakaMinder · ${new Date().toLocaleString()} · পৃষ্ঠা ${i} / ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }
  
  doc.save(`TakaMinder_Report_${getMonthLabel(selectedMonth)}.pdf`);
};




  // ✅ প্রিন্ট
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-primary/8 to-secondary/5 p-6 backdrop-blur border border-primary/5 print:bg-white print:shadow-none">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl print:hidden" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent print:text-black">
              রিপোর্ট
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1 print:text-gray-500">
              <BarChart3 className="h-4 w-4 print:hidden" />
              আপনার আর্থিক বিশ্লেষণ
            </p>
          </div>
          
          {/* ✅ অ্যাকশন বাটন (প্রিন্টে লুকাবে) */}
          <div className="flex items-center gap-2 print:hidden">
            <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
              <SelectTrigger className="w-[140px] rounded-xl border-border/40 bg-background/30">
                <SelectValue placeholder="টাইপ" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                <SelectItem value="monthly">মাসিক</SelectItem>
                <SelectItem value="yearly">বার্ষিক</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="rounded-xl border-border/40 hover:bg-primary/5"
              onClick={downloadPDF}
              disabled={isPrinting}
            >
              <Download className="h-4 w-4 mr-2" />
              পিডিএফ ডাউনলোড
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl border-border/40 hover:bg-primary/5"
              onClick={handlePrint}
              disabled={isPrinting}
            >
              <Printer className="h-4 w-4 mr-2" />
              প্রিন্ট
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ রিপোর্ট কন্টেন্ট (প্রিন্টের জন্য) */}
      <div 
        ref={reportRef} 
        className="print:bg-white print:p-8 print:shadow-none"
        style={{ 
          fontFamily: "'Arial', sans-serif",
          backgroundColor: 'white',
          color: '#1e293b'
        }}
      >
        {/* রিপোর্ট হেডার (শুধু প্রিন্টে দেখাবে) */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">TakaMinder</h1>
          <h2 className="text-xl font-semibold text-gray-700 mt-2">
            আর্থিক রিপোর্ট - {getMonthLabel(selectedMonth)}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            প্রস্তুত: {new Date().toLocaleDateString('bn-BD')}
          </p>
          <hr className="my-4 border-gray-300" />
        </div>

        {/* কুইক স্ট্যাটস */}
        <div className="grid gap-4 md:grid-cols-4 print:grid-cols-4">
          <Card className="border-border/40 rounded-2xl bg-gradient-to-br from-emerald-50/30 to-emerald-100/10 dark:from-emerald-950/10 dark:to-emerald-900/5 print:bg-white print:border print:border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground print:text-gray-500">মোট আয়</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 print:text-green-600">
                    ৳{stats.totalIncome.toFixed(2)}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/10 print:hidden">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 rounded-2xl bg-gradient-to-br from-rose-50/30 to-rose-100/10 dark:from-rose-950/10 dark:to-rose-900/5 print:bg-white print:border print:border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground print:text-gray-500">মোট খরচ</p>
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 print:text-red-600">
                    ৳{stats.totalExpense.toFixed(2)}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-rose-500/10 print:hidden">
                  <TrendingDown className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 rounded-2xl bg-gradient-to-br from-blue-50/30 to-blue-100/10 dark:from-blue-950/10 dark:to-blue-900/5 print:bg-white print:border print:border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground print:text-gray-500">সেভিংস রেট</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 print:text-blue-600">
                    {stats.savingsRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-blue-500/10 print:hidden">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 rounded-2xl bg-gradient-to-br from-purple-50/30 to-purple-100/10 dark:from-purple-950/10 dark:to-purple-900/5 print:bg-white print:border print:border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground print:text-gray-500">ট্রানজেকশন</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 print:text-purple-600">
                    {stats.totalTransactions}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-purple-500/10 print:hidden">
                  <Wallet className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* চার্ট */}
        <div className="grid gap-6 md:grid-cols-2 print:grid-cols-2 mt-6">
          <Card className="border-border/40 rounded-2xl print:border print:border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary print:hidden" />
                ক্যাটাগরি ভিত্তিক খরচ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart transactions={transactions} />
            </CardContent>
          </Card>

          <Card className="border-border/40 rounded-2xl print:border print:border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary print:hidden" />
                {reportType === 'monthly' ? 'মাসিক আয়-খরচ' : 'বার্ষিক আয়-খরচ'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyBarChart transactions={transactions} />
            </CardContent>
          </Card>
        </div>

        {/* টপ ক্যাটাগরি */}
        <Card className="border-border/40 rounded-2xl mt-6 print:border print:border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary print:hidden" />
              শীর্ষ খরচের ক্যাটাগরি
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">কোনো খরচের ডেটা নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topCategories.map(([category, amount], index) => {
                  const colors = [
                    'from-blue-500 to-blue-400',
                    'from-purple-500 to-purple-400',
                    'from-emerald-500 to-emerald-400',
                    'from-amber-500 to-amber-400',
                    'from-rose-500 to-rose-400',
                  ];
                  const percentage = stats.totalExpense > 0 
                    ? (amount / stats.totalExpense) * 100 
                    : 0;

                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className={cn(
                            "w-2 h-2 rounded-full bg-gradient-to-r",
                            colors[index % colors.length]
                          )} />
                          {category}
                        </span>
                        <span className="font-medium">
                          ৳{amount.toFixed(2)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                            colors[index % colors.length]
                          )}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ প্রিন্ট ফুটার */}
        <div className="hidden print:block mt-8 text-center text-sm text-gray-400 border-t border-gray-200 pt-4">
          <p>Generated by TakaMinder · {new Date().toLocaleString()}</p>
          <p className="text-xs">© 2026 TakaMinder. All rights reserved.</p>
        </div>
      </div>

      {/* ফুটার */}
      <div className="text-center text-xs text-muted-foreground/40 font-mono print:hidden">
        {getMonthLabel(selectedMonth)} · সর্বশেষ আপডেট: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};