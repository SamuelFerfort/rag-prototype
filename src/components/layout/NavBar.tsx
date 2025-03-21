"use client";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Settings, Link } from "lucide-react";

export function NavBar() {
  const pathname = usePathname();

  // Navigation items
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Proyectos",
      href: "/projects",
      icon: <FolderKanban className="h-5 w-5" />,
    },
    {
      name: "Configuración",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <nav className="ml-10 hidden md:flex items-center gap-5">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-2 text-sm font-medium ${
            pathname === item.href
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {item.icon}
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
