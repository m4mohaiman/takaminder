import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useThemeStore } from '@/store/themeStore';
import { Moon, Sun, LogOut } from 'lucide-react';

export const Settings = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">সেটিংস</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">থিম</h3>
              <p className="text-sm text-muted-foreground">
                {theme === 'dark' ? 'ডার্ক মোড' : 'লাইট মোড'}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          <div className="border-t pt-4">
            <Button variant="destructive" className="w-full" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              লগআউট করুন
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};