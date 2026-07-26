import { Outlet } from 'react-router-dom';
import { Header } from '../header/Header';
import { Sidebar } from '../sidebar/Sidebar';
import { Footer } from '../footer/Footer';
import { useAuth } from '@/hooks/useAuth';

export const RootLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
          <div className="flex-1 p-4 lg:p-6">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};