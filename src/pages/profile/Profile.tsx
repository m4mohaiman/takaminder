import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, EyeOff, Loader2, Save, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

export const Profile = () => {
  const { user, updateProfile, userName, userInitial, isLoading } = useAuth();
  
  // প্রোফাইল স্টেট
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // পাসওয়ার্ড স্টেট
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // প্রোফাইল আপডেট
  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      toast.error('নাম দিন!');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile({ full_name: fullName.trim() });
      if (result.success) {
        setIsEditing(false);
        toast.success('প্রোফাইল আপডেট হয়েছে! ✅');
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // পাসওয়ার্ড ভ্যালিডেশন
  const validatePassword = (): boolean => {
    const errors: typeof passwordErrors = {};

    if (!currentPassword) {
      errors.currentPassword = 'বর্তমান পাসওয়ার্ড দিন';
    }

    if (!newPassword) {
      errors.newPassword = 'নতুন পাসওয়ার্ড দিন';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
    } else if (!/(?=.*[A-Z])/.test(newPassword)) {
      errors.newPassword = 'পাসওয়ার্ডে কমপক্ষে ১টি বড় হাতের অক্ষর থাকতে হবে';
    } else if (!/(?=.*[a-z])/.test(newPassword)) {
      errors.newPassword = 'পাসওয়ার্ডে কমপক্ষে ১টি ছোট হাতের অক্ষর থাকতে হবে';
    } else if (!/(?=.*[0-9])/.test(newPassword)) {
      errors.newPassword = 'পাসওয়ার্ডে কমপক্ষে ১টি সংখ্যা থাকতে হবে';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'পাসওয়ার্ড নিশ্চিত করুন';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'পাসওয়ার্ড মিলছে না';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // পাসওয়ার্ড চেঞ্জ
  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsChangingPassword(true);
    try {
      // প্রথমে বর্তমান পাসওয়ার্ড ভেরিফাই করুন
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        toast.error('বর্তমান পাসওয়ার্ড ভুল!');
        setIsChangingPassword(false);
        return;
      }

      // নতুন পাসওয়ার্ড আপডেট করুন
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(updateError.message || 'পাসওয়ার্ড আপডেট করতে ব্যর্থ!');
        return;
      }

      toast.success('পাসওয়ার্ড সফলভাবে আপডেট হয়েছে! 🔐');
      
      // ফর্ম রিসেট
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
      
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'পাসওয়ার্ড আপডেট করতে ব্যর্থ!');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">লগইন করুন</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      {/* প্রোফাইল কার্ড */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">প্রোফাইল</CardTitle>
          <p className="text-sm text-muted-foreground">
            আপনার ব্যক্তিগত তথ্য আপডেট করুন
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* অ্যাভাটার */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{userName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                সদস্য হন: {new Date(user.created_at).toLocaleDateString('bn-BD')}
              </p>
            </div>
          </div>

          {/* নাম এডিট */}
          <div className="space-y-2">
            <Label htmlFor="fullName">পূর্ণ নাম</Label>
            <div className="flex gap-2">
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="আপনার পূর্ণ নাম"
                disabled={!isEditing || isSaving}
                className="flex-1"
              />
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  এডিট
                </Button>
              ) : (
                <>
                  <Button onClick={handleUpdateProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        সেভ হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        সেভ
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setFullName(user.full_name || '');
                    }}
                    disabled={isSaving}
                  >
                    বাতিল
                  </Button>
                </>
              )}
            </div>
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                নাম পরিবর্তন করলে আপনার প্রোফাইল আপডেট হবে
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* পাসওয়ার্ড চেঞ্জ কার্ড */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Key className="h-5 w-5" />
            পাসওয়ার্ড পরিবর্তন
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            আপনার অ্যাকাউন্টের পাসওয়ার্ড আপডেট করুন
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* বর্তমান পাসওয়ার্ড */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">বর্তমান পাসওয়ার্ড</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (passwordErrors.currentPassword) {
                    setPasswordErrors({ ...passwordErrors, currentPassword: undefined });
                  }
                }}
                placeholder="••••••••"
                className={passwordErrors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
            )}
          </div>

          {/* নতুন পাসওয়ার্ড */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordErrors.newPassword) {
                    setPasswordErrors({ ...passwordErrors, newPassword: undefined });
                  }
                }}
                placeholder="••••••••"
                className={passwordErrors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
            )}
            <p className="text-xs text-muted-foreground">
              কমপক্ষে ৬ অক্ষর, ১টি বড় হাতের অক্ষর ও ১টি সংখ্যা থাকতে হবে
            </p>
          </div>

          {/* কনফার্ম পাসওয়ার্ড */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors({ ...passwordErrors, confirmPassword: undefined });
                  }
                }}
                placeholder="••••••••"
                className={passwordErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="w-full"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                পাসওয়ার্ড আপডেট হচ্ছে...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                পাসওয়ার্ড আপডেট করুন
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            পাসওয়ার্ড পরিবর্তন করলে আপনাকে আবার লগইন করতে হবে
          </p>
        </CardContent>
      </Card>
    </div>
  );
};