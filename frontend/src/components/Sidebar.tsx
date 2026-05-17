"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic2,
  FileText,
  TrendingUp,
  Zap,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/analyze", icon: Mic2, label: "New Analysis" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/sales-analysis", icon: TrendingUp, label: "Sales Analysis" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-50"
      style={{
        background: "linear-gradient(180deg, #13131f 0%, #0f0f1a 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight">VoiceAI</h1>
            <p className="text-xs text-slate-500">Audio Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                active
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <Icon
                size={18}
                className={clsx(
                  "shrink-0 transition-colors",
                  active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
        >
          <Settings size={18} />
          Settings
        </Link>
        <div className="mt-3 mx-1 px-3 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-xs text-indigo-300 font-medium">Powered by</p>
          <p className="text-xs text-slate-400 mt-0.5">Gemini 1.5 Pro</p>
        </div>
      </div>
    </aside>
  );
}
