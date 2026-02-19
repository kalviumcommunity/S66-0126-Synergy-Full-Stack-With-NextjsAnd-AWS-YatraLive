'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Train,
  Settings,
  Activity,
  BarChart3,
  LogOut,
  Menu,
  X,
  User,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (data.success) {
          setAdmin(data.data.admin);
        } else {
          // Not authenticated, redirect to login
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    // Don't check auth on login page
    if (!pathname.includes('/login')) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Don't show sidebar on login page
  if (pathname.includes('/login')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(mobileMenuOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-40 lg:translate-x-0"
          >
            {/* Admin info */}
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {admin?.name}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {admin?.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <NavItem
                href="/admin"
                icon={<LayoutDashboard />}
                text="Dashboard"
                active={pathname === '/admin'}
                onClick={() => setMobileMenuOpen(false)}
              />
              <NavItem
                href="/admin/trains"
                icon={<Train />}
                text="Train Management"
                active={pathname.includes('/trains')}
                onClick={() => setMobileMenuOpen(false)}
              />
              <NavItem
                href="/admin/simulation"
                icon={<Settings />}
                text="Simulation Control"
                active={pathname.includes('/simulation')}
                onClick={() => setMobileMenuOpen(false)}
              />
              <NavItem
                href="/admin/system"
                icon={<Activity />}
                text="System Status"
                active={pathname.includes('/system')}
                onClick={() => setMobileMenuOpen(false)}
              />
              <NavItem
                href="/admin/analytics"
                icon={<BarChart3 />}
                text="Analytics"
                active={pathname.includes('/analytics')}
                onClick={() => setMobileMenuOpen(false)}
              />
            </nav>

            {/* Logout button */}
            <div className="absolute bottom-0 w-64 p-4 border-t dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="lg:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, text, active, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span>{text}</span>
    </Link>
  );
}
