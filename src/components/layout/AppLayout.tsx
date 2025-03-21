import React from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Toaster } from "@/components/ui/sonner";
interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <MobileNav />
      </div>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  );
}
