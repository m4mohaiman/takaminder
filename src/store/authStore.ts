import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isInitialized: boolean;
  userRole: string | null;
  
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  fetchUserRole: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
      userRole: null,

      setUser: (user) => set({ user }),

      fetchUserRole: async (userId: string) => {
        if (!userId) return;
        
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();

          if (!error && data) {
            set({ userRole: data.role });
          } else {
            set({ userRole: 'user' });
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          set({ userRole: 'user' });
        }
      },

      initializeAuth: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true });
        
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) throw sessionError;
          
          if (session?.user) {
            await get().fetchUserRole(session.user.id);

            // ✅ UPSERT ব্যবহার করুন
            const { data: userData, error: userError } = await supabase
              .from('users')
              .upsert(
                {
                  id: session.user.id,
                  email: session.user.email,
                  full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                  avatar_url: session.user.user_metadata?.avatar_url || null,
                },
                { onConflict: 'id' }
              )
              .select()
              .single();
            
            if (userError) throw userError;
            
            set({ 
              user: userData as User, 
              session, 
              isLoading: false, 
              isInitialized: true 
            });
          } else {
            set({ user: null, session: null, isLoading: false, isInitialized: true });
          }

          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_IN' && session?.user) {
              await get().fetchUserRole(session.user.id);

              const { data: userData, error } = await supabase
                .from('users')
                .upsert(
                  {
                    id: session.user.id,
                    email: session.user.email,
                    full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                    avatar_url: session.user.user_metadata?.avatar_url || null,
                  },
                  { onConflict: 'id' }
                )
                .select()
                .single();
              
              if (!error && userData) {
                set({ user: userData as User, session });
              }
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, session: null, userRole: null });
            }
          });
          
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isLoading: false, isInitialized: true });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: password,
          });

          if (error) {
            let errorMessage = 'লগইন ব্যর্থ হয়েছে!';
            if (error.message.includes('Invalid login credentials')) {
              errorMessage = 'ইমেইল বা পাসওয়ার্ড ভুল!';
            } else if (error.message.includes('Email not confirmed')) {
              errorMessage = 'ইমেইল কনফার্ম করা হয়নি! আপনার ইমেইল চেক করুন।';
            }
            toast.error(errorMessage);
            return { success: false, error: error.message };
          }

          if (!data.user) {
            toast.error('লগইন ব্যর্থ হয়েছে!');
            return { success: false, error: 'No user data' };
          }

          await get().fetchUserRole(data.user.id);

          // ✅ UPSERT ব্যবহার করুন
          const { data: userData, error: userError } = await supabase
            .from('users')
            .upsert(
              {
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || email.split('@')[0],
                avatar_url: data.user.user_metadata?.avatar_url || null,
              },
              { onConflict: 'id' }
            )
            .select()
            .single();

          if (userError) {
            console.error('Profile error:', userError);
            toast.error('প্রোফাইল লোড করতে সমস্যা হয়েছে!');
            return { success: false, error: userError.message };
          }

          set({ user: userData as User, session: data.session });
          toast.success(`স্বাগতম ${userData.full_name || ''}! 👋`);
          return { success: true };

        } catch (error: any) {
          console.error('Login error:', error);
          toast.error(error.message || 'লগইন ব্যর্থ হয়েছে!');
          return { success: false, error: error.message };
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true });
        
        try {
          const cleanEmail = email.trim().toLowerCase();
          
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
              data: {
                full_name: fullName.trim(),
              },
            },
          });

          if (error) {
            let errorMessage = 'রেজিস্ট্রেশন ব্যর্থ হয়েছে!';
            if (error.status === 429 || error.message.includes('rate limit')) {
              errorMessage = 'অনেকগুলো রিকোয়েস্ট হয়েছে। দয়া করে ৫-১০ মিনিট পর চেষ্টা করুন। ⏳';
            } else if (error.message.includes('User already registered')) {
              errorMessage = 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে!';
            } else if (error.message.includes('email_address_invalid')) {
              errorMessage = 'ইমেইল ঠিকানা সঠিক নয়! একটি বৈধ ইমেইল দিন।';
            }
            toast.error(errorMessage);
            return { success: false, error: error.message };
          }

          if (!data.user) {
            toast.error('রেজিস্ট্রেশন ব্যর্থ হয়েছে!');
            return { success: false, error: 'No user data' };
          }

          // ✅ UPSERT ব্যবহার করুন (INSERT এর পরিবর্তে)
          const { data: userData, error: userError } = await supabase
            .from('users')
            .upsert(
              {
                id: data.user.id,
                email: data.user.email,
                full_name: fullName.trim(),
                avatar_url: null,
              },
              { onConflict: 'id' }
            )
            .select()
            .single();

          if (userError) {
            console.error('Profile creation error:', userError);
            toast.error('প্রোফাইল তৈরি করতে সমস্যা হয়েছে!');
            return { success: false, error: userError.message };
          }

          // ✅ রোল চেক করুন (আগে থেকে আছে কিনা)
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (!existingRole) {
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert([
                {
                  user_id: data.user.id,
                  role: 'user',
                },
              ]);

            if (roleError) {
              console.error('Role creation error:', roleError);
            }
          }

          set({ 
            user: userData as User, 
            session: data.session,
            userRole: existingRole?.role || 'user'
          });
          
          toast.success('অ্যাকাউন্ট তৈরি হয়েছে! স্বাগতম 🎉');
          return { success: true };

        } catch (error: any) {
          console.error('Registration error:', error);
          if (error?.status === 429 || error?.message?.includes('rate limit')) {
            toast.error('অনেকগুলো রিকোয়েস্ট হয়েছে। দয়া করে ৫-১০ মিনিট পর চেষ্টা করুন। ⏳');
          } else {
            toast.error(error.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে!');
          }
          return { success: false, error: error.message };
        } finally {
          set({ isLoading: false });
        }
      },

      googleLogin: async () => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin + '/dashboard',
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            },
          });

          if (error) {
            toast.error('Google লগইন ব্যর্থ হয়েছে!');
            return { success: false, error: error.message };
          }

          return { success: true };

        } catch (error: any) {
          console.error('Google login error:', error);
          toast.error(error.message || 'Google লগইন ব্যর্থ হয়েছে!');
          return { success: false, error: error.message };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ user: null, session: null, userRole: null });
          toast.success('লগআউট হয়েছে! 👋');
        } catch (error: any) {
          console.error('Logout error:', error);
          toast.error(error.message || 'লগআউট ব্যর্থ হয়েছে!');
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true });
        
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: window.location.origin + '/reset-password',
          });

          if (error) {
            toast.error(error.message || 'পাসওয়ার্ড রিসেট ইমেইল পাঠাতে ব্যর্থ!');
            return { success: false, error: error.message };
          }

          toast.success('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে! 📧');
          return { success: true };

        } catch (error: any) {
          console.error('Reset password error:', error);
          toast.error(error.message || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে!');
          return { success: false, error: error.message };
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) {
          toast.error('ইউজার লগইন নেই!');
          return { success: false, error: 'No user logged in' };
        }

        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

          if (error) throw error;

          if (updates.full_name) {
            const { error: authError } = await supabase.auth.updateUser({
              data: { full_name: updates.full_name },
            });
            if (authError) console.warn('Auth metadata update failed:', authError);
          }

          set({ user: data as User });
          toast.success('প্রোফাইল আপডেট হয়েছে! ✅');
          return { success: true };

        } catch (error: any) {
          console.error('Profile update error:', error);
          toast.error(error.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে!');
          return { success: false, error: error.message };
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isInitialized: state.isInitialized,
        userRole: state.userRole,
      }),
    }
  )
);