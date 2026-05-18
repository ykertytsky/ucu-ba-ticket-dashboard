"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Огляд", icon: LayoutDashboard },
  { href: "/dashboard/agents", label: "Виконавці", icon: Users },
  { href: "/dashboard/categories", label: "Категорії", icon: FolderKanban },
  { href: "/dashboard/settings", label: "Налаштування", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-zinc-200 bg-zinc-950 text-zinc-50 lg:block">
      <div className="flex h-full flex-col px-5 py-6">
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="rounded-2xl bg-violet-500/20 p-3 text-violet-200">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">UCU IT Helpdesk</p>
            <p className="text-lg font-semibold text-white">Dashboard</p>
          </div>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-violet-500 text-white"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4">
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Вийти
          </Link>
        </div>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
          Завантажуйте XML-експорти HESK і відстежуйте операційну картину без ручних Excel-звітів.
        </div>
      </div>
    </aside>
  );
}
