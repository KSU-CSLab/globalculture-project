import React from 'react';
import { Search, Bell, LogOut, Sun, Moon, Globe, Sparkles, Calendar, Gift, Handshake, Users } from 'lucide-react';

const ROLE_BADGES = {
  admin:   { label: '관리자', cls: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30' },
  staff:   { label: '교직원', cls: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30' },
  student: { label: '재학생', cls: 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30' },
};

// Navigation items — show active section
const NAV_ITEMS = [
  { id: 'community', label: '커뮤니티',   icon: Globe },
  { id: 'events',    label: '이벤트',     icon: Calendar },
  { id: 'benefits',  label: '전용 혜택',  icon: Gift },
  { id: 'partners',  label: '글로벌 파트너', icon: Handshake },
];

export default function Header({
  onSearchClick,
  onBellClick,
  user,
  onLogout,
  darkMode,
  onToggleDarkMode,
  activeSection,
  onSectionChange,
}) {
  const roleBadge = user?.role ? ROLE_BADGES[user.role] : ROLE_BADGES['student'];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 py-3 backdrop-blur-md transition-all duration-300">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between w-full">

        {/* Brand + Nav */}
        <div className="flex items-center space-x-6 select-none">
          {/* Logo */}
          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <img src="/logo.png" alt="Kyungsung University Logo" className="h-8 w-8 object-contain" />
            <h1 className="font-sans text-sm font-extrabold tracking-tight text-slate-800 dark:text-white leading-none">
              KSU <span className="text-brand-gold-dark">Culture Hub</span>
            </h1>
          </div>

          {/* Desktop Navigation (Logged-in only) */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1 text-xs font-black">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    onClick={() => onSectionChange?.(id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-brand-gold-dark dark:text-brand-gold bg-brand-gold/10 dark:bg-brand-gold/15'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={13} className="stroke-[2.25]" />
                    <span>{label}</span>
                    {isActive && <span className="w-1 h-1 rounded-full bg-brand-gold-dark dark:bg-brand-gold" />}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? '화이트 모드' : '다크 모드'}
            className="flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-[10px] font-black transition-all active:scale-95 border bg-slate-50 dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm hover:border-brand-gold dark:hover:border-brand-gold/60"
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              <><Sun size={13} className="text-brand-gold stroke-[2.5]" /><span>라이트</span></>
            ) : (
              <><Moon size={13} className="stroke-[2.5]" /><span>다크</span></>
            )}
          </button>

          {user && (
            <>
              {/* Role Badge */}
              <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold ${roleBadge.cls}`}>
                {roleBadge.label}
              </span>

              {/* Search */}
              <button
                onClick={onSearchClick}
                className="group relative rounded-full p-2 text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white active:scale-95"
                aria-label="Search"
              >
                <Search size={17} className="stroke-[2.25]" />
              </button>

              {/* Bell */}
              <button
                onClick={onBellClick}
                className="group relative rounded-full p-2 text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white active:scale-95"
                aria-label="Notifications"
              >
                <Bell size={17} className="stroke-[2.25]" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-gold-dark ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                title="로그아웃"
                className="group relative rounded-full p-2 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 active:scale-95 transition-all"
                aria-label="Logout"
              >
                <LogOut size={17} className="stroke-[2.25]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation Tabs (Logged-in only) */}
      {user && (
        <div className="md:hidden mt-2 flex items-center space-x-1 overflow-x-auto no-scrollbar pb-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => onSectionChange?.(id)}
                className={`flex-shrink-0 flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                  isActive
                    ? 'text-brand-gold-dark dark:text-brand-gold bg-brand-gold/10 dark:bg-brand-gold/15'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon size={11} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
