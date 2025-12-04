"use client";

import { usePathname } from "next/navigation";
import { BarrelsHeader } from "./BarrelsHeader";
import { SupportButton } from "@/components/support-button";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Pages that should NOT show the main header and support button
const NO_HEADER_ROUTES = [
  "/auth/login",
  "/auth/admin-login",
  "/auth/signup",
  "/welcome",
  "/onboarding",
];

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  // Check if current path should hide header
  const shouldHideHeader = NO_HEADER_ROUTES.some((route) =>
    pathname?.startsWith(route)
  );

  return (
    <>
      {!shouldHideHeader && <BarrelsHeader />}
      {children}
      {!shouldHideHeader && <SupportButton />}
    </>
  );
}
