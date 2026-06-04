import React, { useState } from 'react';
import { X, Smartphone, Download, QrCode, Info, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function AppDownloadModal({ isOpen, onClose, apkUrl }) {
  const [dontShowToday, setDontShowToday] = useState(false);

  console.log('AppDownloadModal component render. isOpen:', isOpen);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowToday) {
      try {
        const todayStr = new Date().toDateString();
        localStorage.setItem('ksu_hide_app_download_today', todayStr);
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
    onClose();
  };

  // Generate QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0f172a&data=${encodeURIComponent(apkUrl || window.location.origin + '/ksu-culture-hub.apk')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg overflow-hidden bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl transition-all duration-300 transform scale-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Glows */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

        {/* Top Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-10"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8 overflow-y-auto no-scrollbar flex-1 space-y-6">
          {/* Title Area */}
          <div className="flex items-start space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold-dark dark:text-brand-gold border border-brand-gold/30 flex-shrink-0">
              <Smartphone size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="inline-block bg-brand-gold/20 text-brand-gold-dark dark:text-brand-gold text-[9px] font-black px-2 py-0.5 rounded-full mb-1 border border-brand-gold/30">
                Hybrid App Release
              </span>
              <h2 className="text-lg font-black text-slate-850 dark:text-white leading-tight">
                경성대학교 글로컬 컬쳐 허브 앱 출시!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                하이브리드 앱(APK)을 직접 설치하고 더 빠르고 편리하게 소통하세요.
              </p>
            </div>
          </div>

          {/* QR Code and Mobile Download Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-800/80">
            {/* QR Code Section */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center space-y-2 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-850 pb-4 sm:pb-0 sm:pr-4">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                <img
                  src={qrCodeUrl}
                  alt="Download App QR Code"
                  className="w-32 h-32 select-none"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-550 dark:text-slate-400 flex items-center">
                <QrCode size={11} className="mr-1 text-brand-gold" />
                카메라로 QR 스캔
              </span>
            </div>

            {/* Steps & Direct Download */}
            <div className="sm:col-span-7 space-y-3.5">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center">
                <Info size={12} className="mr-1 text-brand-gold" />
                간편 설치 가이드
              </h4>
              <ol className="space-y-2">
                {[
                  { step: 1, text: '위 QR 코드를 모바일 카메라로 스캔합니다.' },
                  { step: 2, text: '다운로드된 APK 파일을 실행하여 설치를 시작합니다.' },
                  { step: 3, text: '경고창이 뜨면 "출처를 알 수 없는 앱 설치 허용"을 선택합니다.' }
                ].map(({ step, text }) => (
                  <li key={step} className="flex items-start text-[11px] font-medium text-slate-650 dark:text-slate-400 leading-relaxed">
                    <span className="flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-brand-gold text-slate-900 text-[9px] font-black mr-2 mt-0.5 shadow-sm">
                      {step}
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>

              {/* Direct APK Link */}
              <div className="pt-1.5">
                <a
                  href={apkUrl || '/ksu-culture-hub.apk'}
                  download="ksu-culture-hub.apk"
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-gold dark:text-slate-900 dark:hover:bg-brand-gold-dark text-white text-xs font-black transition-all shadow-md active:scale-[0.98] select-none"
                >
                  <Download size={14} className="animate-bounce" />
                  <span>APK 직접 다운로드 (모바일용)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Info Notice banner */}
          <div className="flex items-start space-x-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-3 text-[10px] text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
            <CheckCircle2 size={14} className="flex-shrink-0 text-brand-gold mt-0.5" />
            <span>
              본 앱은 경성대학교 학생들의 다국어 커뮤니티 활동 및 혜택 제공을 위해 반응형 웹 서비스를 코르도바(Cordova)로 패키징한 하이브리드 앱입니다. 안심하고 설치하셔도 좋습니다!
            </span>
          </div>
        </div>

        {/* Footer controls */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold select-none">
          {/* Don't show again today checkbox */}
          <label className="flex items-center space-x-2 cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-brand-gold focus:ring-brand-gold focus:ring-offset-0 dark:bg-slate-900 dark:border-slate-750 cursor-pointer"
            />
            <span>오늘 하루 이 창을 보지 않기</span>
          </label>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
