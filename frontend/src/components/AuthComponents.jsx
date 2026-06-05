import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Mail, Key, ChevronLeft, Check, CheckCircle2, Clock, AlertCircle, Sparkles, Globe, ShieldCheck } from 'lucide-react';
import { api, KSU_EMAIL_DOMAIN, validateKsuEmail } from '../services/api';

// Helper for countdown timer display (MM:SS)
const formatTimer = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Role display helper
const ROLE_LABELS = {
  student: '재학생 (Student) 🎓',
  staff:   '교직원 (Staff)   🏫',
  admin:   '관리자 (Admin)  👑',
};

// ----------------------------------------------------------------------
// A. LOGIN VIEW
// ----------------------------------------------------------------------
export function LoginView({ onLoginSuccess, onNavigateToSignUp, onNavigateToForgot, showToast }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const response = await api.login(email, password);
      if (response.success) {
        showToast(response.message, 'success');
        onLoginSuccess(response.user);
      }
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다. 다시 시도해주세요.');
      showToast(err.message || '로그인 실패', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (type) => {
    if (type === 'admin')   { setEmail('admin@ks.ac.kr');   setPassword('password123'); }
    if (type === 'student') { setEmail('student1@ks.ac.kr'); setPassword('password123'); }
    if (type === 'staff')   { setEmail('staff1@ks.ac.kr');  setPassword('password123'); }
    setError('');
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-8 select-none fade-in">
      {/* Visual Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-lg shadow-slate-100 dark:shadow-none animate-bounce mb-3 border border-slate-200/60 dark:border-slate-800">
          <img src="/logo.png" alt="Kyungsung University Logo" className="h-full w-full object-contain" />
        </div>
        <h2 className="font-sans text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
          KSU <span className="text-brand-gold-dark">Culture Hub</span>
        </h2>
        <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
          경성대학교 글로컬 문화 허브<br />
          <span className="text-brand-gold-dark dark:text-brand-gold font-bold">@ks.ac.kr</span> 이메일로 로그인하세요
        </p>
      </div>

      {/* Login Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-premium">
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
              학교 이메일 (Email)
            </label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@ks.ac.kr"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-gold/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
              비밀번호 (Password)
            </label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-gold/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 p-2.5 text-[11px] font-semibold text-red-600 dark:text-red-400 fade-in">
              <AlertCircle size={13} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* KSU domain notice */}
          <div className="flex items-center space-x-1.5 rounded-lg bg-brand-gold/8 dark:bg-brand-gold/10 border border-brand-gold/20 p-2.5">
            <ShieldCheck size={12} className="text-brand-gold-dark dark:text-brand-gold flex-shrink-0" />
            <span className="text-[10px] font-bold text-brand-gold-dark dark:text-brand-gold">
              경성대학교(@ks.ac.kr) 이메일 전용 플랫폼입니다
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-brand-gold py-3.5 text-xs font-bold text-slate-900 shadow-md shadow-brand-gold/20 hover:bg-brand-gold-dark hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>로그인 중...</span>
              </>
            ) : (
              <span>로그인 (Sign In)</span>
            )}
          </button>
        </form>

        {/* Quick Demo fills */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-2 text-center uppercase tracking-wider">
            빠른 데모 계정 (Demo Accounts)
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { key: 'admin',   label: '👑 관리자' },
              { key: 'student', label: '🎓 재학생' },
              { key: 'staff',   label: '🏫 교직원' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleQuickFill(key)}
                className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold py-1.5 text-slate-600 dark:text-slate-300 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="mt-6 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-4">
        <button onClick={onNavigateToSignUp} className="hover:text-brand-gold-dark dark:hover:text-brand-gold transition-colors">
          학교 메일로 가입하기
        </button>
        <div className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
        <button onClick={onNavigateToForgot} className="hover:text-brand-gold-dark dark:hover:text-brand-gold transition-colors">
          아이디/비밀번호 찾기
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// B. SIGN UP VIEW — @ks.ac.kr 도메인 + 역할 선택
// ----------------------------------------------------------------------
export function SignUpView({ onNavigateToLogin, showToast }) {
  const [email, setEmail]               = useState('');
  const [nickname, setNickname]         = useState('');
  const [password, setPassword]         = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole]                 = useState('student');
  const [preferredLanguage, setPreferredLanguage] = useState('ko');

  // Verification
  const [isCodeSent, setIsCodeSent]         = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified]   = useState(false);
  const [timerSeconds, setTimerSeconds]     = useState(180);
  const [isTimerActive, setIsTimerActive]   = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [error, setError]                   = useState('');

  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (isTimerActive && timerSeconds > 0) {
      timerRef.current = setInterval(() => setTimerSeconds((p) => p - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerActive(false);
      setIsCodeSent(false);
      showToast('인증 시간이 초과되었습니다. 다시 시도해 주세요.', 'error');
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerActive, timerSeconds]);

  const handleSendCode = async () => {
    if (!email.trim()) { setError('이메일 주소를 입력해 주세요.'); return; }
    if (!validateKsuEmail(email)) {
      setError(`경성대학교 이메일(${KSU_EMAIL_DOMAIN})만 가입이 가능합니다.`);
      return;
    }
    setError('');
    try {
      const res = await api.sendVerificationEmail(email);
      if (res.success) {
        setIsCodeSent(true);
        setTimerSeconds(180);
        setIsTimerActive(true);
        showToast(res.message, 'success');
      }
    } catch (err) { setError(err.message); }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) { setError('인증 번호를 입력해 주세요.'); return; }
    setError('');
    try {
      const res = await api.verifyEmailCode(email, verificationCode);
      if (res.success) {
        setIsEmailVerified(true);
        setIsTimerActive(false);
        showToast(res.message, 'success');
      }
    } catch (err) { setError(err.message); }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim() || !password.trim()) { setError('모든 정보를 입력해 주세요.'); return; }
    if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (!isEmailVerified) { setError('이메일 인증을 완료해야 합니다.'); return; }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await api.register({ email, nickname, password, role, preferredLanguage });
      if (res.success) {
        showToast(res.message, 'success');
        onNavigateToLogin();
      }
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-start px-6 py-6 overflow-y-auto no-scrollbar fade-in">
      {/* Back */}
      <div className="mb-4">
        <button onClick={onNavigateToLogin} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-bold transition-colors">
          <ChevronLeft size={16} className="mr-0.5" />로그인으로 돌아가기
        </button>
      </div>

      <div className="mb-5 px-1">
        <h2 className="text-lg font-black text-slate-800 dark:text-white">경성대학교 회원가입</h2>
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
          <span className="text-brand-gold-dark dark:text-brand-gold font-bold">@ks.ac.kr</span> 이메일 인증 후 가입이 가능합니다.<br />
          역할(student/staff)에 따라 이용 가능한 혜택이 달라집니다.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-premium mb-6">
        <form onSubmit={handleRegisterSubmit} className="space-y-4">

          {/* EMAIL VERIFICATION SECTION */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 pl-0.5 flex items-center">
              <Mail size={12} className="mr-1 text-brand-gold-dark dark:text-brand-gold" />
              경성대학교 이메일 주소 <span className="text-red-500 ml-1">*필수</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="email"
                disabled={isEmailVerified}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`학번@ks.ac.kr`}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold disabled:opacity-60 transition-all"
              />
            </div>

            {/* KSU domain badge */}
            <div className="mt-1.5 flex items-center space-x-1">
              <ShieldCheck size={11} className="text-brand-gold-dark dark:text-brand-gold" />
              <span className="text-[9px] font-bold text-brand-gold-dark dark:text-brand-gold">@ks.ac.kr 도메인만 허용</span>
            </div>

            {!isEmailVerified && (
              <button type="button" onClick={handleSendCode} className="mt-2.5 w-full text-center rounded-xl bg-slate-800 dark:bg-slate-700 text-brand-gold text-[10px] font-bold py-2.5 hover:bg-slate-700 dark:hover:bg-slate-600 active:scale-95 transition-all">
                {isCodeSent ? '인증 코드 재발송 (Resend)' : '인증번호 발송 (Send Code)'}
              </button>
            )}

            {isCodeSent && !isEmailVerified && (
              <div className="mt-3.5 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/80 fade-in space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pl-0.5">
                  <span>인증번호 입력</span>
                  <span className="flex items-center text-red-500 font-extrabold font-mono">
                    <Clock size={11} className="mr-0.5" />
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
                <div className="flex space-x-1.5">
                  <input
                    type="text"
                    maxLength={4}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="인증번호 4자리 (데모: 1234)"
                    className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold tracking-widest text-center font-bold"
                  />
                  <button type="button" onClick={handleVerifyCode} className="rounded-lg bg-brand-gold text-slate-900 text-[10px] font-bold px-4 py-2 hover:bg-brand-gold-dark transition-colors">
                    인증 확인
                  </button>
                </div>
              </div>
            )}

            {isEmailVerified && (
              <div className="mt-2.5 flex items-center justify-center space-x-1.5 rounded-lg bg-green-50/80 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 p-2.5 text-xs text-green-600 dark:text-green-400 font-bold fade-in">
                <CheckCircle2 size={15} />
                <span>인증 완료 — {email}</span>
              </div>
            )}
          </div>

          {/* USER DETAILS — unlock after email verified */}
          <div className={`space-y-3.5 transition-all duration-300 ${isEmailVerified ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'}`}>
            <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 pl-0.5 uppercase tracking-wide">회원 정보 입력</span>

            {/* Nickname */}
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="사용할 닉네임 (Nickname)"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900"
            />

            {/* Password */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 설정"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900"
            />
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 확인"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900"
            />

            {/* Role Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                역할 선택 (Role)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'student', label: '재학생', icon: '🎓', desc: 'Student' },
                  { val: 'staff',   label: '교직원', icon: '🏫', desc: 'Staff' },
                ].map(({ val, label, icon, desc }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRole(val)}
                    className={`rounded-xl p-3 border text-left transition-all ${
                      role === val
                        ? 'border-brand-gold bg-brand-gold/10 dark:bg-brand-gold/15'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-brand-gold/50'
                    }`}
                  >
                    <span className="block text-lg">{icon}</span>
                    <span className={`block text-[11px] font-black mt-1 ${role === val ? 'text-brand-gold-dark dark:text-brand-gold' : 'text-slate-700 dark:text-slate-300'}`}>{label}</span>
                    <span className="block text-[9px] font-bold text-slate-400">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5 pl-1 flex items-center">
                <Globe size={12} className="mr-1 text-brand-gold-dark dark:text-brand-gold" />
                선호 언어
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900 appearance-none cursor-pointer"
              >
                <option value="ko">한국어 (Korean) 🇰🇷</option>
                <option value="en">English (영어) 🇺🇸</option>
                <option value="zh">中文 (Chinese / 중국어) 🇨🇳</option>
                <option value="vi">Tiếng Việt (Vietnamese / 베트남어) 🇻🇳</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 p-2.5 text-[11px] font-semibold text-red-600 dark:text-red-400 fade-in">
              <AlertCircle size={13} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !isEmailVerified}
            className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-brand-gold py-3.5 text-xs font-bold text-slate-900 shadow-md shadow-brand-gold/15 hover:bg-brand-gold-dark active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            {isSubmitting ? <span>가입 등록 중...</span> : <span>회원가입 완료 (Register)</span>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// C. FORGOT ACCOUNT VIEW
// ----------------------------------------------------------------------
export function ForgotAccountView({ onNavigateToLogin, showToast }) {
  const [activeTab, setActiveTab] = useState('id');

  const [idEmail, setIdEmail]         = useState('');
  const [foundIdText, setFoundIdText] = useState('');

  const [pwUsername, setPwUsername]   = useState('');
  const [pwEmail, setPwEmail]         = useState('');
  const [pwSuccessMsg, setPwSuccessMsg] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab); setError(''); setFoundIdText(''); setPwSuccessMsg('');
  };

  const handleFindId = async (e) => {
    e.preventDefault();
    if (!idEmail.trim()) { setError('이메일을 입력해 주세요.'); return; }
    setIsSubmitting(true); setError(''); setFoundIdText('');
    try {
      const res = await api.findId(idEmail);
      if (res.success) setFoundIdText(res.message);
    } catch (err) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleFindPassword = async (e) => {
    e.preventDefault();
    if (!pwUsername.trim() || !pwEmail.trim()) { setError('아이디와 이메일을 모두 입력해 주세요.'); return; }
    setIsSubmitting(true); setError(''); setPwSuccessMsg('');
    try {
      const res = await api.resetPassword(pwUsername, pwEmail);
      if (res.success) setPwSuccessMsg(res.message);
    } catch (err) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex-1 flex flex-col justify-start px-6 py-6 fade-in">
      <div className="mb-4">
        <button onClick={onNavigateToLogin} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-bold transition-colors">
          <ChevronLeft size={16} className="mr-0.5" />로그인으로 돌아가기
        </button>
      </div>

      <div className="mb-5 px-1">
        <h2 className="text-lg font-black text-slate-800 dark:text-white">계정 정보 찾기</h2>
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-550 mt-1 leading-relaxed">
          가입 시 사용한 <span className="text-brand-gold-dark dark:text-brand-gold font-bold">@ks.ac.kr</span> 이메일로 계정을 찾을 수 있습니다.
        </p>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-950 rounded-xl p-1 mb-5">
        {[{ val: 'id', label: '아이디 찾기' }, { val: 'pw', label: '비밀번호 재설정' }].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => handleTabChange(val)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === val
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-premium">
        {activeTab === 'id' ? (
          <form onSubmit={handleFindId} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 pl-0.5">
                가입 시 사용한 학교 이메일
              </label>
              <input
                type="email"
                value={idEmail}
                onChange={(e) => setIdEmail(e.target.value)}
                placeholder="example@ks.ac.kr"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900"
              />
            </div>
            {error && <div className="flex items-center space-x-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 p-2.5 text-[10.5px] font-semibold text-red-600 dark:text-red-400 fade-in"><AlertCircle size={13} /><span>{error}</span></div>}
            {foundIdText && (
              <div className="flex items-center space-x-2 rounded-xl bg-brand-gold/10 border border-brand-gold/30 p-4 text-xs text-slate-800 dark:text-brand-gold font-bold fade-in">
                <Sparkles size={15} className="text-brand-gold-dark animate-pulse flex-shrink-0" />
                <span>{foundIdText}</span>
              </div>
            )}
            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-brand-gold py-3 text-xs font-bold text-slate-900 hover:bg-brand-gold-dark transition-all shadow-md shadow-brand-gold/15 disabled:opacity-60">
              {isSubmitting ? '조회 중...' : '아이디 확인'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleFindPassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 pl-0.5">이메일 주소</label>
              <input type="email" value={pwEmail} onChange={(e) => setPwEmail(e.target.value)} placeholder="example@ks.ac.kr"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 pl-0.5">아이디 (Email Local Part)</label>
              <input type="text" value={pwUsername} onChange={(e) => setPwUsername(e.target.value)} placeholder="아이디 또는 이메일 로컬 파트"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900" />
            </div>
            {error && <div className="flex items-center space-x-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 p-2.5 text-[10.5px] font-semibold text-red-600 dark:text-red-400 fade-in"><AlertCircle size={13} /><span>{error}</span></div>}
            {pwSuccessMsg && (
              <div className="flex items-center space-x-2 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 p-4 text-xs text-green-700 dark:text-green-400 font-bold fade-in">
                <CheckCircle2 size={15} className="flex-shrink-0" /><span>{pwSuccessMsg}</span>
              </div>
            )}
            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-brand-gold py-3 text-xs font-bold text-slate-900 hover:bg-brand-gold-dark transition-all shadow-md shadow-brand-gold/15 disabled:opacity-60">
              {isSubmitting ? '조회 중...' : '임시 비밀번호 이메일 받기'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
