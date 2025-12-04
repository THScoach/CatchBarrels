"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { TrendingUp, User, Menu } from "lucide-react";

const NAV_TABS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/lesson/new", label: "New Lesson" },
  { href: "/lesson/history", label: "History" },
];

const HAMBURGER_MENU_ITEMS = [
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
  { href: "/video", label: "Videos" },
  { href: "/drills", label: "Drills" },
  { href: "/coaching", label: "Coaching" },
];

export function BarrelsHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession() || {};

  // Check if user is a coach
  const isCoach = (session?.user as any)?.isCoach || false;

  // Get user initials for avatar
  const getInitials = () => {
    if (!session?.user?.name) return "U";
    const names = session.user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  // TODO: Fetch actual momentum score from user data
  const momentumScore = 84;

  return (
    <header className="sticky top-0 z-40 bg-[#0F0F0F] h-16 border-b border-slate-800/50">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Logo */}
        <Link
          href="/dashboard"
          className="flex items-center"
          aria-label="CatchBarrels – Momentum Transfer System"
        >
          {/* Desktop: Horizontal Logo */}
          <div className="hidden sm:block relative h-10 w-auto flex-shrink-0">
            <Image
              src="/branding/logo-horizontal.png"
              alt="CatchBarrels Logo"
              width={240}
              height={60}
              className="object-contain h-full w-auto"
              priority
            />
          </div>
          
          {/* Mobile: Icon Only */}
          <div className="sm:hidden relative h-9 w-9 flex-shrink-0">
            <Image
              src="/branding/logo-mark-icon.png"
              alt="CatchBarrels"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Center: Main Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_TABS.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== "/dashboard" && pathname?.startsWith(tab.href));

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-sm font-semibold transition-all px-3 py-2 rounded-lg ${
                  active
                    ? "text-amber-400 bg-amber-400/10"
                    : "text-slate-300 hover:text-slate-100 hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Momentum Score + Profile + Hamburger */}
        <div className="flex items-center gap-3">
          {/* Momentum Score Badge (Desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-500/70 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-300">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Momentum</span>
            <span className="text-slate-200">{momentumScore}</span>
          </div>

          {/* Profile Icon */}
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold uppercase text-slate-200 border border-slate-700 hover:border-amber-500/50 transition-colors"
            title={session?.user?.name || "Profile"}
          >
            <User className="h-4 w-4" />
          </Link>

          {/* Hamburger Menu */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/70 bg-black/40 text-slate-200 hover:bg-slate-900 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden border-t border-slate-800/50 bg-[#0F0F0F]">
        <nav className="flex">
          {NAV_TABS.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== "/dashboard" && pathname?.startsWith(tab.href));

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 text-center text-xs font-semibold py-3 border-b-2 transition-all ${
                  active
                    ? "border-amber-400 text-amber-400 bg-amber-400/5"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Hamburger Slide-down Menu */}
      {open && (
        <div className="border-t border-slate-800 bg-[#0F0F0F] shadow-lg">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 text-sm font-medium text-slate-100 sm:px-6">
            {/* Main tabs in mobile menu */}
            <div className="md:hidden mb-2 pb-2 border-b border-slate-800">
              {NAV_TABS.map((tab) => {
                const active =
                  pathname === tab.href ||
                  (tab.href !== "/dashboard" && pathname?.startsWith(tab.href));
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2 ${
                      active
                        ? "bg-amber-500/10 text-amber-300"
                        : "hover:bg-slate-900"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            {/* Additional menu items */}
            {HAMBURGER_MENU_ITEMS.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 ${
                    active
                      ? "bg-amber-500/10 text-amber-300"
                      : "hover:bg-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Coach Admin Link */}
            {isCoach && (
              <div className="mt-2 pt-2 border-t border-slate-800">
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 ${
                    pathname?.startsWith("/admin")
                      ? "bg-barrels-gold/10 text-barrels-gold"
                      : "hover:bg-slate-900 text-barrels-gold"
                  }`}
                >
                  🎯 Coach Admin
                </Link>
              </div>
            )}

            {/* Momentum Score (Mobile) */}
            <div className="sm:hidden mt-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                <span className="text-slate-400">Momentum Transfer:</span>
                <span className="font-semibold text-amber-300">{momentumScore}</span>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-3 self-start rounded-full border border-slate-700 px-3 py-1.5 text-xs uppercase tracking-wide text-slate-300 hover:bg-slate-900 transition-colors"
            >
              Close
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
