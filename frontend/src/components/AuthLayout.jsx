import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Globe, Sun, Moon, Calendar, Gift, Handshake, Users, Smartphone, Sparkles } from 'lucide-react';

export default function AuthLayout() {
  const navigate = useNavigate();
  const {
    darkMode,
    handleToggleDarkMode,
    toast,
    setIsAppDownloadOpen,
  } = useAppContext();

  // ── Toast Banner ──────────────────────────────────────────────────────────
  const ToastBanner = () => toast.show ? (
    <div className="fixed top-6 left-4 right-4 z-[60] flex items-center justify-center fade-in pointer-events-none">
      <div className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold flex items-center space-x-2 ${toast.type === 'success' ? 'bg-slate-900/95 border-brand-gold text-brand-yellow backdrop-blur-md dark:bg-slate-950/95' :
        toast.type === 'info' ? 'bg-slate-800/95 border-slate-700 text-white backdrop-blur-md' :
          'bg-red-500/95 border-red-600 text-white backdrop-blur-md'
        }`}>
        <Sparkles size={13} className="text-brand-gold animate-spin" />
        <span>{toast.message}</span>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex md:flex-row flex-col relative overflow-hidden font-sans transition-colors duration-300">
      <ToastBanner />

      {/* Theme toggle */}
      <div className="absolute top-5 right-5 z-50">
        <button
          onClick={handleToggleDarkMode}
          className="flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-[10px] font-black transition-all active:scale-95 border bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-md hover:border-brand-gold"
        >
          {darkMode ? <><Sun size={13} className="text-brand-gold" /><span>라이트</span></> : <><Moon size={13} /><span>다크</span></>}
        </button>
      </div>

      {/* Background glows */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT — Brand Panel (desktop) */}
      <div className="hidden md:flex md:w-[52%] flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-r border-slate-200/60 dark:border-slate-800/80 transition-colors duration-300">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Kyungsung University Logo" className="h-10 w-10 object-contain" />
          <span className="font-sans text-2xl font-black tracking-tight text-slate-800 dark:text-white">
            KSU <span className="text-brand-gold-dark">Culture Hub</span>
          </span>
        </div>

        {/* Hero copy */}
        <div className="my-auto max-w-xl space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 rounded-full bg-brand-gold/10 px-3.5 py-1 text-sm font-bold text-brand-gold-dark border border-brand-gold/20">
            <Globe size={13} className="text-brand-gold-dark" />
            <span>경성대학교 B공식 글로컬 문화 교류 플랫폼</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-850 dark:text-white">
            경성대학교<br />글로컬 <span className="text-brand-gold-dark">컬처 허브</span>
          </h2>

          <p className="text-md leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
            학생·교직원 전용 혜택, 문화 이벤트, 다국어 커뮤니티 게시판,<br />
            글로벌 파트너 연계까지 — <span className="text-brand-gold-dark dark:text-brand-gold font-bold">@ks.ac.kr</span> 이메일로 시작하세요.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { icon: Users, label: '학생·교직원 전용', desc: '역할 기반 서비스' },
              { icon: Calendar, label: '문화 이벤트', desc: 'Events & Apply' },
              { icon: Gift, label: '전용 혜택', desc: 'Discount & Coupon' },
              { icon: Handshake, label: '글로벌 파트너', desc: 'Global Network' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
                <Icon size={28} className="text-brand-gold-dark dark:text-brand-gold mb-2" />
                <span className="block text-md font-black text-slate-800 dark:text-white">{label}</span>
                <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400">{desc}</span>
              </div>
            ))}
          </div>

          {/* Mobile Web QR Code Section — 스캔하면 휴대폰 브라우저에서 바로 열림 */}
          <div className="bg-white/85 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-5 border border-brand-gold/30 dark:border-brand-gold/25 shadow-premium flex items-center space-x-4">
            <div className="bg-white p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex-shrink-0 flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&color=0f172a&data=${encodeURIComponent(window.location.origin)}`}
                alt="Mobile Web QR Code"
                className="w-20 h-20 select-none"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block bg-brand-gold text-slate-900 text-xs font-black px-1.5 py-0.5 rounded-full mb-1">Mobile Web</span>
              <h4 className="text-md font-black text-slate-850 dark:text-white truncate">휴대폰에서 바로 사용!</h4>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-tight">
                QR을 스캔하면 휴대폰 브라우저에서 바로 열립니다. 설치가 필요 없어요.
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-400 dark:text-slate-500 font-bold pl-12 pb-12 hidden md:block">
          © 2026 KSU Culture Hub — 경성대학교 글로컬 문화 허브
        </div>

        {/* Backdrop globe */}
        <div className="absolute right-[-100px] bottom-[-100px] text-slate-200/20 dark:text-slate-800/10 pointer-events-none">
          <Globe size={480} />
        </div>
      </div>

      {/* RIGHT — Auth Forms */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
        {/* Mobile brand */}
        <div className="md:hidden w-full max-w-md flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Kyungsung University Logo" className="h-10 w-10 object-contain" />
            <span className="font-sans text-2xl font-bold text-slate-800 dark:text-slate-100">
              KSU <span className="text-brand-gold-dark">Culture Hub</span>
            </span>
          </div>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-2xl p-2 sm:p-4 overflow-hidden flex flex-col transition-all duration-300">
          <div className="overflow-y-auto no-scrollbar flex-1 max-h-[88vh]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
