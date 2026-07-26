import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    session,
    isLoading,
    isInitialized,
    userRole,
    login,
    register,
    googleLogin,
    logout,
    resetPassword,
    updateProfile,
    setUser,
    initializeAuth,
    fetchUserRole,
  } = useAuthStore();

  // ইউজার ফুল নাম (যদি থাকে)
  const userName = user?.full_name || user?.email?.split('@')[0] || 'User';

  // ইউজারের প্রথম অক্ষর (অ্যাভাটারের জন্য)
  const userInitial = user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  // ইউজার লগইন কিনা চেক
  const isAuthenticated = !!user;

  // ইউজারের ইমেইল কনফার্মড কিনা
  const isEmailConfirmed = session?.user?.email_confirmed_at != null;

  // ইউজার রোল চেক
  const isAdmin = userRole === 'admin';
  const isUser = userRole === 'user';

  return {
    // স্টেট
    user,
    session,
    isLoading,
    isInitialized,
    userRole,
    isAuthenticated,
    isEmailConfirmed,
    isAdmin,
    isUser,
    userName,
    userInitial,
    
    // অ্যাকশন (Zustand স্টোর থেকে সরাসরি)
    login,
    register,
    googleLogin,
    logout,
    resetPassword,
    updateProfile,
    setUser,
    initializeAuth,
    fetchUserRole,
  };
};