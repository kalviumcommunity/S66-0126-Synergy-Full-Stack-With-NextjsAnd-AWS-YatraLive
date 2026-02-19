import { ReactNode } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Train, Settings, Activity, BarChart3, LogOut } from 'lucide-react';

interface AdminLayoutProps { children: ReactNode }

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Station Master</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Control Room</p>
        </div>
        <nav className="mt-6">
          <NavItem href="/admin" icon={<LayoutDashboard />} text="Dashboard" />
          <NavItem href="/admin/trains" icon={<Train />} text="Train Management" />
          <NavItem href="/admin/simulation" icon={<Settings />} text="Simulation Control" />
          <NavItem href="/admin/system" icon={<Activity />} text="System Status" />
          <NavItem href="/admin/analytics" icon={<BarChart3 />} text="Analytics" />
          <div className="absolute bottom-0 w-64 p-6 border-t dark:border-gray-700">
            <NavItem href="/" icon={<LogOut />} text="Exit Admin" />
          </div>
        </nav>
      </aside>
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}

interface NavItemProps { href: string; icon: React.ReactNode; text: string }
function NavItem({ href, icon, text }: NavItemProps) {
  return (
    <Link href={href} className="flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <span className="w-5 h-5">{icon}</span>
      <span>{text}</span>
    </Link>
  );
}
