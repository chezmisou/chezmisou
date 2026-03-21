'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Church,
  CalendarDays,
  Clock,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  ChevronLeft,
  Home,
  Package,
  UtensilsCrossed,
  Store,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Auth context so child pages can access the password for API calls
const AuthContext = createContext<{ password: string }>({ password: '' });
export function useAdminAuth() { return useContext(AuthContext); }

const ADMIN_PASSWORD = 'churchlunch2024';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/commandes', label: 'Commandes', icon: Package, exact: true },
  { href: '/admin/commandes/traiteur', label: 'Traiteur', icon: UtensilsCrossed, indent: true },
  { href: '/admin/commandes/epicerie', label: 'Épicerie fine', icon: Store, indent: true },
  { href: '/admin/eglises', label: 'Églises', icon: Church },
  { href: '/admin/planning', label: 'Planification', icon: CalendarDays },
  { href: '/admin/creneaux', label: 'Créneaux', icon: Clock },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
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

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <span className="text-lg font-bold text-[#D4A017]">
            🍗 LAC Admin
          </span>
        )}
        {collapsed && <span className="text-lg">🍗</span>}
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              setMobileOpen(false);
            } else {
              setCollapsed(!collapsed);
            }
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hidden md:block"
        >
          <ChevronLeft
            size={20}
            className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
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
          const active = isActive(item.href, item.exact);
          const indent = 'indent' in item && item.indent;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                indent && !collapsed ? 'pl-9 pr-3 py-2' : 'px-3 py-2.5'
              } ${
                active
                  ? 'bg-[#D4A017]/10 text-[#D4A017] dark:bg-[#D4A017]/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={indent ? 16 : 20} className={active ? 'text-[#D4A017]' : ''} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-all"
        >
          <Home size={20} />
          {!collapsed && <span>Retour au site</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
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
              transition={{ duration: 0.2, ease: 'easeInOut' }}
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lac-dark-mode');
    if (stored === 'true') setDarkMode(true);
    const auth = sessionStorage.getItem('lac-admin-auth');
    if (auth === 'true') setAuthenticated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('lac-dark-mode', String(darkMode));
  }, [darkMode]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem('lac-admin-auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Mot de passe incorrect');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1210] p-4">
        <div className="bg-[#2a2018] rounded-2xl p-8 max-w-sm w-full shadow-2xl">
          <h1 className="text-2xl font-bold text-[#D4A017] text-center mb-2">🔒 Admin</h1>
          <p className="text-[#a89080] text-center text-sm mb-6">Lunch After Church</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full px-4 py-3 rounded-xl bg-[#3d3028] border border-[#5a4838] text-[#f5e6d3] placeholder-[#a89080] focus:border-[#D4A017] focus:outline-none mb-4"
              autoFocus
            />
            {authError && <p className="text-red-400 text-sm mb-3 text-center">{authError}</p>}
            <button type="submit" className="w-full bg-[#D4A017] text-white py-3 rounded-xl font-semibold hover:bg-[#b8890f] transition-colors">
              Se connecter
            </button>
          </form>
          <Link href="/" className="block text-center mt-4 text-sm text-[#a89080] hover:text-[#D4A017] transition-colors">
            ← Retour au site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ password: ADMIN_PASSWORD }}>
      <div className={darkMode ? 'dark' : ''}>
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
                  Lunch After Church — Administration
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                  title={darkMode ? 'Mode clair' : 'Mode sombre'}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="w-7 h-7 rounded-full bg-[#D4A017]/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#D4A017]">A</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
                </div>

                <button
                  onClick={() => {
                    sessionStorage.removeItem('lac-admin-auth');
                    setAuthenticated(false);
                    setPassword('');
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Déconnexion"
                >
                  <X size={18} />
                </button>
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
            className: '!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100 !shadow-lg !border !border-gray-200 dark:!border-gray-700',
            duration: 3000,
          }}
        />
      </div>
    </AuthContext.Provider>
  );
}
