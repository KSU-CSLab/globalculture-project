import React from 'react';
import { Search, Bell, LogOut, Sun, Moon } from 'lucide-react';

export default function Header({ onSearchClick, onBellClick, user, onLogout, darkMode, onToggleDarkMode }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 py-3.5 backdrop-blur-md transition-all duration-300">
      <div className="max-w-[1180px] mx-auto flex items-center justify-between w-full">
        {/* Brand Logo with golden highlight */}
        <div className="flex items-center space-x-6 select-none">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold text-slate-900 shadow-md shadow-brand-gold/20">
              <span className="font-extrabold text-lg tracking-wider">G</span>
            </div>
            <h1 className="font-sans text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Glo<span className="text-brand-gold-dark">Culture</span>
            </h1>
          </div>

          {/* Everytime Style Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center space-x-5 text-xs font-black text-slate-500 dark:text-slate-400">
              <span className="text-brand-gold-dark dark:text-brand-gold cursor-pointer border-b-2 border-brand-gold pb-1 px-1">게시판</span>
              <span className="hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors px-1">캠퍼스 라이프</span>
              <span className="hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors px-1">쪽지함</span>
            </nav>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Premium Theme Toggle Capsule */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? "화이트 모드로 전환" : "다크 모드로 전환"}
            className="flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-[10px] font-black transition-all active:scale-95 border bg-slate-50 dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm hover:border-brand-gold dark:hover:border-brand-gold/60"
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              <>
                <Sun size={13} className="text-brand-gold stroke-[2.5]" />
                <span>화이트 모드</span>
              </>
            ) : (
              <>
                <Moon size={13} className="text-slate-500 dark:text-slate-400 stroke-[2.5]" />
                <span>다크 모드</span>
              </>
            )}
          </button>

          {user && (
            <>
              <button
                onClick={onSearchClick}
                className="group relative rounded-full p-2 text-slate-500 dark:text-slate-400 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white active:scale-95"
                aria-label="Search"
              >
                <Search size={18} className="stroke-[2.25]" />
                <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-transparent group-hover:bg-brand-gold-dark transition-all duration-200"></span>
              </button>
              <button
                onClick={onBellClick}
                className="group relative rounded-full p-2 text-slate-500 dark:text-slate-400 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white active:scale-95"
                aria-label="Notifications"
              >
                <Bell size={18} className="stroke-[2.25]" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-gold-dark ring-2 ring-white animate-pulse"></span>
              </button>
              
              {/* Logout Button (Only if user logged in) */}
              <button
                onClick={onLogout}
                title="로그아웃"
                className="group relative rounded-full p-2 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 active:scale-95 transition-all"
                aria-label="Logout"
              >
                <LogOut size={18} className="stroke-[2.25]" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

