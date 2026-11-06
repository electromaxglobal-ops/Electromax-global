import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Globe,
  Sun,
  Moon,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Database,
  Building,
  User as UserIcon,
} from 'lucide-react';
import { Language, translations } from '../../utils/translations.ts';
import { User, Company } from '../../types/erp.ts';

interface HeaderProps {
  currentTab: string;
  lang: Language;
  onToggleLang: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenMobileSidebar: () => void;
  user: User | null;
  company: Company | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  lang,
  onToggleLang,
  isDarkMode,
  onToggleDarkMode,
  onOpenMobileSidebar,
  user,
  company,
  searchQuery,
  onSearchChange,
}) => {
  const t = translations[lang];
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Cloud SQL Connected',
      desc: 'PostgreSQL instance running in region asia-south1',
      time: 'Just now',
      type: 'success',
    },
    {
      id: 2,
      title: 'Low Stock Alert',
      desc: 'Snow Wave Carbon Instant Glow Room Heater 1000W reached 100 units reorder limit',
      time: '12 min ago',
      type: 'warning',
    },
    {
      id: 3,
      title: 'Stock Adjustment Posted',
      desc: 'Physical audit #ADJ-108422 posted to immutable ledger',
      time: '45 min ago',
      type: 'info',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#0B192C] border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16 gap-4">
        {/* Left: Mobile trigger, Brand Logo & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Official Logo on Header (Both Desktop & Mobile) */}
          <div className="flex items-center gap-2.5">
            <img
              src="/electromax-logo.png"
              alt="Electromax Global Logo"
              className="h-8 w-8 object-contain rounded-md"
            />
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="font-extrabold tracking-wide text-slate-800 dark:text-slate-200 uppercase">
                {company?.tradeName || 'ELECTROMAX GLOBAL'}
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-orange-600 dark:text-orange-400 font-semibold capitalize">
                {currentTab}
              </span>
            </div>
            <div className="sm:hidden font-extrabold text-xs tracking-wide text-slate-800 dark:text-slate-200 uppercase">
              ElectroMax
            </div>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Statutory Badge */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">FY 2026-27</span>
            <span className="text-slate-400">•</span>
            <span>RJ (08)</span>
            <span className="text-slate-400">•</span>
            <span className="font-mono">INR (₹)</span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-orange-500" />
            <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 z-50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    System Alerts & Notifications
                  </span>
                  <span className="text-[10px] text-orange-500 font-semibold cursor-pointer">
                    Clear all
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1.5 truncate">
                          {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                          {n.type === 'info' && <Database className="w-3.5 h-3.5 text-blue-500" />}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {n.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          {(() => {
            const isLegacyOrInvalid = !user || !user.fullName || user.fullName.toLowerCase().includes('kailash');
            const displayFullName = isLegacyOrInvalid ? 'Mr. Sushil Goyal' : user.fullName;
            const displayDesignation = isLegacyOrInvalid
              ? 'Founder & Director'
              : (user.designation?.toLowerCase().includes('managing director') ? 'Founder & Director' : user.designation);
            const initials = displayFullName === 'Mr. Sushil Goyal' ? 'SG' : (displayFullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SG');

            return (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 border border-orange-500/50 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {initials}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[130px]">
                      {displayFullName}
                    </div>
                    <div className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold truncate">
                      {displayDesignation}
                    </div>
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 z-50 space-y-2">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <img src="/electromax-logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {displayFullName}
                          </div>
                          <div className="text-[10px] text-orange-500 font-bold">
                            {displayDesignation}
                          </div>
                        </div>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate pt-1">
                        {user?.email || 'electromaxglobal@gmail.com'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Shield className="w-3 h-3" />
                        <span>Role: Super Admin (Executive Authorization)</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 px-1 space-y-0.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">Company: ELECTROMAX GLOBAL</div>
                      <div className="text-orange-500 font-medium">Founder & Director: Mr. Sushil Goyal</div>
                      <div>Location: Jaipur, Rajasthan, India</div>
                      <div className="text-[10px] text-slate-400">Base Currency: INR (₹) • FY 2026-27</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </header>
  );
};
