"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Church,
  CalendarDays,
  Clock,
  Settings,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import SessionProvider from "@/components/providers/SessionProvider";

const navItems = [
  { href: "/lac-admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lac-admin/churches", label: "\u00C9glises", icon: Church },
  { href: "/lac-admin/planning", label: "Planification", icon: CalendarDays },
  { href: "/lac-admin/slots", label: "Cr\u00E9neaux", icon: Clock },
  { href: "/lac-admin/settings", label: "Param\u00E8tres", icon: Settings },
];

function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/lac-admin") return pathname === "/lac-admin";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent"
          >
            LAC Admin
          </motion.span>
        )}
        <button
          onClick={() => {
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              setMobileOpen(false);
            } else {
              setCollapsed(!collapsed);
            }
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hidden md:block"
        >
          <ChevronLeft
            size={20}
            className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 md:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Icon size={20} className={active ? "text-indigo-600 dark:text-indigo-400" : ""} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="text-xs text-gray-400 dark:text-gray-500 px-3">
            Chez Misou - LAC
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 overflow-hidden z-30"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden fixed left-0 top-0 w-[280px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen z-50 overflow-hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function LacAdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("lac-dark-mode");
    if (stored === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("lac-dark-mode", String(darkMode));
  }, [darkMode]);

  return (
    <SessionProvider>
      <div className={darkMode ? "dark" : ""}>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />

          <div className="flex-1 flex flex-col min-w-0">
            {/* Top bar */}
            <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                >
                  <Menu size={20} />
                </button>
                <h1 className="text-sm font-semibold text-gray-500 dark:text-gray-400 hidden sm:block">
                  Lunch After Church - Administration
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                  title={darkMode ? "Mode clair" : "Mode sombre"}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">A</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
                </div>

                <Link
                  href="/api/auth/signout"
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="D\u00E9connexion"
                >
                  <LogOut size={18} />
                </Link>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>

        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100 !shadow-lg !border !border-gray-200 dark:!border-gray-700",
            duration: 3000,
          }}
        />
      </div>
    </SessionProvider>
  );
}
