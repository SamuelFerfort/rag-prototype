import React from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Toaster } from "@/components/ui/sonner";
interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <MobileNav />
      </div>

      {/* Main content */}
      <main className="flex-1 pt-16 px-4 sm:px-6 w-[95%] mx-auto">{children}</main>

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  );
}
