import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  
  const { login, googleLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    await googleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4 relative overflow-hidden">
      {/* ডেকোরেটিভ ব্যাকগ্রাউন্ড এলিমেন্ট */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md shadow-2xl border-border/40 rounded-2xl bg-gradient-to-br from-background/95 via-background/90 to-secondary/5 backdrop-blur supports-[backdrop-filter]:bg-background/80 relative overflow-hidden">
        {/* ডেকোরেটিভ এলিমেন্ট */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-bl from-blue-500/5 to-purple-500/5 rounded-full blur-2xl" />
        
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
              <span className="relative text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                TakaMinder
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            স্বাগতম 👋
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            আপনার অ্যাকাউন্টে লগইন করুন
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ইমেইল ফিল্ড */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground/80 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                ইমেইল
              </Label>
              <div className={cn(
                "relative rounded-xl border transition-all duration-300",
                isFocused.email 
                  ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20" 
                  : "border-border/40 hover:border-primary/30"
              )}>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, email: true })}
                  onBlur={() => setIsFocused({ ...isFocused, email: false })}
                  placeholder="your@email.com"
                  required
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-4 pr-10"
                />
                {email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                )}
              </div>
            </div>

            {/* পাসওয়ার্ড ফিল্ড */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-muted-foreground/80 flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  পাসওয়ার্ড
                </Label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-primary/60 hover:text-primary transition-colors"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </Link>
              </div>
              <div className={cn(
                "relative rounded-xl border transition-all duration-300",
                isFocused.password 
                  ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20" 
                  : "border-border/40 hover:border-primary/30"
              )}>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, password: true })}
                  onBlur={() => setIsFocused({ ...isFocused, password: false })}
                  placeholder="••••••••"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-4 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* লগইন বাটন */}
            <Button 
              type="submit" 
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 text-white font-medium h-11 group"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  লগইন হচ্ছে...
                </>
              ) : (
                <>
                  <span>লগইন করুন</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>

            {/* ডিভাইডার */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background/80 px-3 text-muted-foreground/50 backdrop-blur">
                  অথবা
                </span>
              </div>
            </div>

            {/* Google বাটন */}
            <Button 
              type="button" 
              variant="outline"
              className="w-full rounded-xl border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 h-11 group"
              onClick={handleGoogleLogin}
              disabled={isSubmitting || isLoading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="group-hover:scale-105 transition-transform duration-300">
                Google দিয়ে লগইন
              </span>
            </Button>

            {/* রেজিস্টার লিংক */}
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                অ্যাকাউন্ট নেই?{' '}
                <Link 
                  to="/register" 
                  className="text-primary hover:text-primary/80 font-medium hover:underline underline-offset-4 transition-all duration-300 inline-flex items-center gap-1"
                >
                  <span>রেজিস্টার করুন</span>
                  <Sparkles className="h-3 w-3" />
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};