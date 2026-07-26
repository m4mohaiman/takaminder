import { Heart } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col sm:flex-row items-center justify-between py-4 px-4 sm:px-6 text-sm text-muted-foreground gap-2">
        <div className="flex items-center gap-1">
          © {currentYear} TakaMinder. All rights reserved.
        </div>
        <div className="flex items-center gap-1">
          Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by{' '}
          <span className="font-medium text-foreground">TakaMinder Team</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};