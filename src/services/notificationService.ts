import { useNotificationStore } from '@/store/notificationStore';
import { Transaction } from '@/types';

export class NotificationService {
  private static instance: NotificationService;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new NotificationService();
    }
    return this.instance;
  }

  // ট্রানজেকশন নোটিফিকেশন
  notifyTransaction(transaction: Transaction) {
    const isIncome = transaction.type === 'income';
    const amount = transaction.amount.toFixed(2);
    
    // বড় ট্রানজেকশন চেক
    if (transaction.amount >= 10000) {
      useNotificationStore.getState().addNotification({
        title: `বড় ${isIncome ? 'আয়' : 'খরচ'}! 💰`,
        message: `${isIncome ? 'আয়' : 'খরচ'}: ৳${amount} - ${transaction.category}`,
        type: 'warning',
        data: { transactionId: transaction.id },
      });
    }

    // সাধারণ নোটিফিকেশন
    useNotificationStore.getState().addNotification({
      title: isIncome ? 'আয় যোগ হয়েছে 📈' : 'খরচ হয়েছে 📉',
      message: `${isIncome ? 'আয়' : 'খরচ'}: ৳${amount} - ${transaction.category}`,
      type: 'success',
      data: { transactionId: transaction.id },
    });
  }

  // বাজেট অ্যালার্ট
  notifyBudgetAlert(category: string, spent: number, budget: number, percentage: number) {
    let type: 'warning' | 'error' = 'warning';
    let message = '';
    let title = '';

    if (percentage >= 100) {
      type = 'error';
      title = 'বাজেট শেষ! 🚨';
      message = `${category}: ৳${spent.toFixed(2)} / ৳${budget.toFixed(2)} - বাজেট শেষ হয়েছে!`;
    } else if (percentage >= 80) {
      title = 'বাজেট প্রায় শেষ! ⚠️';
      message = `${category}: ৳${spent.toFixed(2)} / ৳${budget.toFixed(2)} - ${percentage.toFixed(0)}% খরচ হয়েছে`;
    }

    if (title) {
      useNotificationStore.getState().addNotification({
        title,
        message,
        type,
        data: { category },
      });
    }
  }

  // প্রোফাইল আপডেট নোটিফিকেশন
  notifyProfileUpdate(field: string) {
    const messages: Record<string, string> = {
      full_name: 'আপনার নাম আপডেট হয়েছে',
      email: 'আপনার ইমেইল আপডেট হয়েছে',
      password: 'আপনার পাসওয়ার্ড আপডেট হয়েছে',
      avatar: 'আপনার প্রোফাইল ছবি আপডেট হয়েছে',
    };

    useNotificationStore.getState().addNotification({
      title: 'প্রোফাইল আপডেট ✅',
      message: messages[field] || 'প্রোফাইল আপডেট হয়েছে',
      type: 'success',
    });
  }

  // জেনেরিক নোটিফিকেশন
  notify(title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') {
    useNotificationStore.getState().addNotification({
      title,
      message,
      type,
    });
  }
}

export const notificationService = NotificationService.getInstance();