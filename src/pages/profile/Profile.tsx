import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Eye,
  EyeOff,
  Loader2,
  Save,
  Key,
  User,
  Mail,
  Calendar,
  Sparkles,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { notificationService } from "@/services/notificationService";
import { cn } from "@/lib/utils";

export const Profile = () => {
  const { user, updateProfile, userName, userInitial, isLoading } = useAuth();

  // প্রোফাইল স্টেট
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // পাসওয়ার্ড স্টেট
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      toast.error("নাম দিন!");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile({ full_name: fullName.trim() });

      if (result.success) {
        notificationService.notifyProfileUpdate("full_name");
        setIsEditing(false);
        toast.success("প্রোফাইল আপডেট হয়েছে! ✅");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("প্রোফাইল আপডেট করতে ব্যর্থ!");
    } finally {
      setIsSaving(false);
    }
  };

  // পাসওয়ার্ড ভ্যালিডেশন
  const validatePassword = (): boolean => {
    const errors: typeof passwordErrors = {};

    if (!currentPassword) {
      errors.currentPassword = "বর্তমান পাসওয়ার্ড দিন";
    }

    if (!newPassword) {
      errors.newPassword = "নতুন পাসওয়ার্ড দিন";
    } else if (newPassword.length < 6) {
      errors.newPassword = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে";
    } else if (!/(?=.*[A-Z])/.test(newPassword)) {
      errors.newPassword = "পাসওয়ার্ডে কমপক্ষে ১টি বড় হাতের অক্ষর থাকতে হবে";
    } else if (!/(?=.*[a-z])/.test(newPassword)) {
      errors.newPassword = "পাসওয়ার্ডে কমপক্ষে ১টি ছোট হাতের অক্ষর থাকতে হবে";
    } else if (!/(?=.*[0-9])/.test(newPassword)) {
      errors.newPassword = "পাসওয়ার্ডে কমপক্ষে ১টি সংখ্যা থাকতে হবে";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "পাসওয়ার্ড নিশ্চিত করুন";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "পাসওয়ার্ড মিলছে না";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // পাসওয়ার্ড চেঞ্জ
  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsChangingPassword(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        toast.error("বর্তমান পাসওয়ার্ড ভুল!");
        setIsChangingPassword(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(updateError.message || "পাসওয়ার্ড আপডেট করতে ব্যর্থ!");
        return;
      }

      notificationService.notifyProfileUpdate("password");
      toast.success("পাসওয়ার্ড সফলভাবে আপডেট হয়েছে! 🔐");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
    } catch (error: any) {
      console.error("Password change error:", error);
      toast.error(error.message || "পাসওয়ার্ড আপডেট করতে ব্যর্থ!");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <User className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground">লগইন করুন</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      {/* প্রোফাইল কার্ড */}
      <Card className="border-border/40 rounded-2xl overflow-hidden bg-gradient-to-br from-background via-background/80 to-secondary/5 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <CardHeader className="relative">
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-primary/70" />
            প্রোফাইল
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            আপনার ব্যক্তিগত তথ্য আপডেট করুন
          </p>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* অ্যাভাটার */}
          <div className="flex items-center gap-5 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/5">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-2 ring-primary/10">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold truncate">{userName}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground/60 mt-0.5">
                <Calendar className="h-3 w-3" />
                <span>
                  সদস্য হন:{" "}
                  {new Date(user.created_at).toLocaleDateString("bn-BD")}
                </span>
              </div>
            </div>
            <Sparkles className="h-4 w-4 text-primary/30 animate-pulse" />
          </div>

          {/* নাম এডিট */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-muted-foreground/80">
              পূর্ণ নাম
            </Label>
            <div className="flex gap-2">
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="আপনার পূর্ণ নাম"
                disabled={!isEditing || isSaving}
                className={cn(
                  "flex-1 rounded-xl border-border/40 bg-background/30",
                  isEditing && "border-primary/30 focus-visible:ring-primary/20"
                )}
              />
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="rounded-xl border-border/40 hover:bg-primary/5"
                >
                  এডিট
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isSaving}
                    className="rounded-xl shadow-lg shadow-primary/10"
                  >
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
                      setFullName(user.full_name || "");
                    }}
                    disabled={isSaving}
                    className="rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    বাতিল
                  </Button>
                </>
              )}
            </div>
            {isEditing && (
              <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                নাম পরিবর্তন করলে আপনার প্রোফাইল আপডেট হবে
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* পাসওয়ার্ড চেঞ্জ কার্ড */}
      <Card className="border-border/40 rounded-2xl overflow-hidden bg-gradient-to-br from-background via-background/80 to-secondary/5 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <CardHeader className="relative">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-500/70" />
            পাসওয়ার্ড পরিবর্তন
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            আপনার অ্যাকাউন্টের পাসওয়ার্ড আপডেট করুন
          </p>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* বর্তমান পাসওয়ার্ড */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-muted-foreground/80">
              বর্তমান পাসওয়ার্ড
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (passwordErrors.currentPassword) {
                    setPasswordErrors({
                      ...passwordErrors,
                      currentPassword: undefined,
                    });
                  }
                }}
                placeholder="••••••••"
                className={cn(
                  "rounded-xl border-border/40 bg-background/30 pr-10",
                  passwordErrors.currentPassword && "border-rose-500/50 focus-visible:ring-rose-500/20"
                )}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="text-sm text-rose-500/80">
                {passwordErrors.currentPassword}
              </p>
            )}
          </div>

          {/* নতুন পাসওয়ার্ড */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-muted-foreground/80">
              নতুন পাসওয়ার্ড
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordErrors.newPassword) {
                    setPasswordErrors({
                      ...passwordErrors,
                      newPassword: undefined,
                    });
                  }
                }}
                placeholder="••••••••"
                className={cn(
                  "rounded-xl border-border/40 bg-background/30 pr-10",
                  passwordErrors.newPassword && "border-rose-500/50 focus-visible:ring-rose-500/20"
                )}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-sm text-rose-500/80">
                {passwordErrors.newPassword}
              </p>
            )}
            <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              কমপক্ষে ৬ অক্ষর, ১টি বড় হাতের অক্ষর ও ১টি সংখ্যা থাকতে হবে
            </p>
          </div>

          {/* কনফার্ম পাসওয়ার্ড */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-muted-foreground/80">
              পাসওয়ার্ড নিশ্চিত করুন
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors({
                      ...passwordErrors,
                      confirmPassword: undefined,
                    });
                  }
                }}
                placeholder="••••••••"
                className={cn(
                  "rounded-xl border-border/40 bg-background/30 pr-10",
                  passwordErrors.confirmPassword && "border-rose-500/50 focus-visible:ring-rose-500/20"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-sm text-rose-500/80">
                {passwordErrors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={
              isChangingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="w-full rounded-xl shadow-lg shadow-amber-500/10 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
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

          <p className="text-xs text-muted-foreground/50 text-center flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            পাসওয়ার্ড পরিবর্তন করলে আপনাকে আবার লগইন করতে হবে
          </p>
        </CardContent>
      </Card>
    </div>
  );
};