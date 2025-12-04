
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Upload, History, TrendingUp, User } from 'lucide-react';
import { triggerHaptic } from '@/lib/mobile-utils';

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession() || {};
  
  // Hide bottom nav for admins/coaches (they have their own shell)
  const isAdmin = (session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'coach';
  
  if (isAdmin && pathname?.startsWith('/admin')) {
    return null;  // Don't show player nav in admin area
  }

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/video/upload', icon: Upload, label: 'New Lesson' },
    { href: '/video', icon: History, label: 'History' },
    { href: '/progress', icon: TrendingUp, label: 'Progress' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  const handleNavClick = () => {
    triggerHaptic('light');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a2332] border-t border-gray-800 z-50 safe-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all touch-target active:scale-95 ${
                isActive
                  ? 'text-[#F5A623]'
                  : 'text-gray-400 active:text-gray-200'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
