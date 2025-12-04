// components/coach/coach-layout.tsx
// Coach/Admin layout shell with left nav and top bar
// Version: 1.0
// Date: November 26, 2025

'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  ClipboardList,
  Flag,
  Film,
  Brain,
  Settings,
  Search,
  Calendar,
  ChevronDown,
  MessageCircle,
} from 'lucide-react';

interface CoachLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/coach', icon: Home },
  { label: 'Roster & Profiles', href: '/coach/players', icon: Users },
  { label: 'Assessments', href: '/coach/assessments', icon: ClipboardList },
  { label: 'Flags & Watchlist', href: '/coach/flags', icon: Flag },
  { label: 'Film Room', href: '/coach/film-room', icon: Film },
  { label: 'Coach Rick AI Lab', href: '/coach/lab', icon: Brain },
  { label: 'Settings', href: '/coach/settings', icon: Settings },
];

export function CoachLayout({ children }: CoachLayoutProps) {
  const pathname = usePathname();
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('All Programs');
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (href: string) => {
    if (href === '/coach') {
      return pathname === '/coach';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-black text-slate-50">
      {/* Left Navigation Sidebar */}
      <motion.aside
        className="w-64 border-r border-slate-800 bg-gradient-to-b from-slate-900 to-black flex flex-col"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-barrels-gold to-barrels-gold-light bg-clip-text text-transparent">
            Coach Rick Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">BARRELS Admin Portal</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-gradient-to-r from-barrels-gold/20 to-barrels-gold-light/10 border border-barrels-gold/30 text-barrels-gold'
                      : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                  }`}
                  whileHover={{ x: active ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">Logged in as Coach</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Rick Martinez</p>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <motion.header
          className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="px-6 py-4 flex items-center gap-4">
            {/* Program Selector */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-sm hover:bg-slate-700 transition-colors"
                onClick={() => {
                  // TODO: Implement program selector dropdown
                  console.log('Program selector clicked');
                }}
              >
                <span>{selectedProgram}</span>
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Date Range Picker */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-sm hover:bg-slate-700 transition-colors"
                onClick={() => {
                  // TODO: Implement date range picker
                  console.log('Date range picker clicked');
                }}
              >
                <Calendar size={16} />
                <span>Last 30 Days</span>
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Search Box */}
            <div className="flex-1 max-w-md relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search players or sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-barrels-gold/30 transition-all"
              />
            </div>

            {/* Ask Coach Rick AI Button */}
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-black rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-barrels-gold/20 transition-all"
            >
              <MessageCircle size={18} />
              <span>Ask Coach Rick AI</span>
            </button>
          </div>
        </motion.header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-black">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Right AI Panel (slides in from right) */}
      {showAIPanel && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAIPanel(false)}
          />

          {/* Panel */}
          <motion.aside
            className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 overflow-y-auto"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-barrels-gold">
                  Coach Rick AI
                </h2>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* AI Chat Interface (Stub) */}
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  Ask me anything about your hitters, trends, or what to focus on
                  next:
                </p>

                <textarea
                  placeholder="E.g., Which players have the weakest ground flow?"
                  className="w-full p-3 bg-slate-800 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-barrels-gold/30"
                  rows={4}
                />

                <button className="w-full px-4 py-2 bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-black rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-barrels-gold/20 transition-all">
                  Ask Coach Rick
                </button>

                {/* Mock Response */}
                <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">Coach Rick AI says:</p>
                  <p className="text-sm text-slate-200">
                    Based on the last 14 days, 3 hitters have lost ground flow
                    consistency. Their timing gaps are widening, and you're seeing
                    more early rotation. I'd focus on:
                  </p>
                  <ul className="mt-2 text-sm text-slate-300 space-y-1">
                    <li>• Player A: Ground flow drill block</li>
                    <li>• Player B: Load timing reset</li>
                    <li>• Player C: Check their fatigue levels</li>
                  </ul>
                  <p className="text-xs text-slate-500 mt-3">
                    TODO: Integrate with DeepAgent AI
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </div>
  );
}
