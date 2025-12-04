'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Users, BarChart3, FileText, Settings, Eye, LogOut, FileBarChart, Upload, MapPin } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

interface AdminShellProps {
  session: any;
  children: React.ReactNode;
}

export default function AdminShell({ session, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, path: '/admin' },
    { id: 'players', label: 'Players', icon: Users, path: '/admin/players' },
    { id: 'sessions', label: 'Sessions', icon: FileText, path: '/admin/sessions' },
    { id: 'pods', label: 'PODs', icon: MapPin, path: '/admin/pods' },
    { id: 'reports', label: 'Reports', icon: FileBarChart, path: '/admin/reports' },
    { id: 'uploads', label: 'Uploads', icon: Upload, path: '/admin/uploads' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-[#1A1A1A] border-b border-[#9D6FDB]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/admin" className="flex items-center space-x-3">
              <Image
                src="/branding/logo-mark-icon.png"
                alt="CatchBarrels"
                width={40}
                height={40}
                className="rounded"
              />
              <div>
                <h1 className="text-lg font-bold text-[#9D6FDB]">Coach Control Room</h1>
                <p className="text-xs text-gray-400">CatchBarrels Admin</p>
              </div>
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#E8B14E]/10 hover:bg-[#E8B14E]/20 text-[#E8B14E] text-sm transition"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">View as Athlete</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                  <p className="text-xs text-[#9D6FDB] capitalize">{(session?.user as any)?.role || 'coach'}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/admin-login' })}
                  className="p-2 hover:bg-[#9D6FDB]/10 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide pb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);
              
              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  className={`
                    relative flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition
                    ${
                      active
                        ? 'text-[#9D6FDB]'
                        : 'text-gray-400 hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeAdminTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#9D6FDB] to-[#B88EE8]"
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
