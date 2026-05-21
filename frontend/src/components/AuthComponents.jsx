import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Mail, Key, ChevronLeft, Check, CheckCircle2, Clock, AlertCircle, Sparkles, Globe } from 'lucide-react';
import { api } from '../services/api';

// Helper for countdown timer display (MM:SS)
const formatTimer = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// ----------------------------------------------------------------------
// A. LOGIN VIEW
// ----------------------------------------------------------------------
export function LoginView({ onLoginSuccess, onNavigateToSignUp, onNavigateToForgot, showToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.login(username, password);
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

  const handleQuickDemoFill = (type) => {
    if (type === 'admin') {
      setUsername('admin');
      setPassword('password123');
    } else if (type === 'demo') {
      setUsername('gloculture');
      setPassword('password123');
    }
    setError('');
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-8 select-none fade-in">
      {/* Visual Header Intro */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold text-slate-900 shadow-lg shadow-brand-gold/25 animate-bounce mb-3">
          <span className="font-extrabold text-2xl tracking-wider">G</span>
        </div>
        <h2 className="font-sans text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
          Glo<span className="text-brand-gold-dark">Culture</span>
        </h2>
        <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
          국내 대학생과 해외 유학생이 소통하는<br />다국어 교류 커뮤니티 포털
        </p>
      </div>

      {/* Login Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-premium">
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          {/* Username Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
              아이디 (ID)
            </label>
            <div className="relative flex items-center">
              <User size={15} className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-gold/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Input */}
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

          {/* Error Notice */}
          {error && (
            <div className="flex items-center space-x-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 p-2.5 text-[11px] font-semibold text-red-600 dark:text-red-400 fade-in">
              <AlertCircle size={13} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-brand-gold py-3.5 text-xs font-bold text-slate-900 shadow-md shadow-brand-gold/20 hover:bg-brand-gold-dark hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-slate-900" fill="none" viewBox="0 0 24 24">
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

        {/* Demo Fast Fills (Convenient testing UI) */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 text-center uppercase tracking-wider">
            빠른 데모 채우기
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoFill('admin')}
              className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold py-1.5 text-slate-600 dark:text-slate-350 transition-colors"
            >
              👑 관리자 계정
            </button>
            <button
              onClick={() => handleQuickDemoFill('demo')}
              className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold py-1.5 text-slate-600 dark:text-slate-350 transition-colors"
            >
              🎓 유학생 계정
            </button>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="mt-6 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-4">
        <button onClick={onNavigateToSignUp} className="hover:text-brand-gold-dark dark:hover:text-brand-gold transition-colors">
          학교 메일로 가입하기
        </button>
        <div className="h-3 w-px bg-slate-200 dark:bg-slate-800"></div>
        <button onClick={onNavigateToForgot} className="hover:text-brand-gold-dark dark:hover:text-brand-gold transition-colors">
          아이디/비밀번호 찾기
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// B. SIGN UP VIEW (WITH SCHOOL EMAIL VERIFICATION TIMER)
// ----------------------------------------------------------------------
export function SignUpView({ onNavigateToLogin, showToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  
  // School Email Input state
  const [email, setEmail] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('ko');
  
  // Verification Code flow states
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  // Countdown Timer
  const [timerSeconds, setTimerSeconds] = useState(180); // 3 minutes
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const timerRef = useRef(null);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer counter hook
  useEffect(() => {
    if (isTimerActive && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerActive(false);
      setIsCodeSent(false); // Force resend
      showToast('인증 시간이 초과되었습니다. 다시 시도해 주세요.', 'error');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, timerSeconds]);

  const fullEmailAddress = email;

  // Step 1: Send verification code to university email
  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('대학 이메일 주소를 입력해 주세요.');
      return;
    }

    setError('');
    setIsCodeSent(false);

    try {
      const response = await api.sendVerificationEmail(fullEmailAddress);
      if (response.success) {
        setIsCodeSent(true);
        setTimerSeconds(180); // reset 3 minutes
        setIsTimerActive(true);
        
        // Show demo notification code
        showToast(response.message, 'success');
      }
    } catch (err) {
      setError(err.message || '인증번호 발송에 실패했습니다.');
    }
  };

  // Step 2: Verify code entered
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('인증 번호를 입력해 주세요.');
      return;
    }

    setError('');
    try {
      const response = await api.verifyEmailCode(fullEmailAddress, verificationCode);
      if (response.success) {
        setIsEmailVerified(true);
        setIsTimerActive(false);
        showToast(response.message, 'success');
      }
    } catch (err) {
      setError(err.message || '인증 실패');
    }
  };

  // Step 3: Complete Sign-up registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim() || !nickname.trim()) {
      setError('모든 회원 정보를 성실하게 입력해 주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    if (!isEmailVerified) {
      setError('대학 이메일 인증을 완료해야 가입이 가능합니다.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.signup({
        username,
        password,
        nickname,
        email: fullEmailAddress,
        preferredLanguage
      });
      if (response.success) {
        showToast(response.message, 'success');
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
      
      {/* Top back navigation */}
      <div className="mb-4">
        <button
          onClick={onNavigateToLogin}
          className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-bold transition-colors"
        >
          <ChevronLeft size={16} className="mr-0.5" />
          로그인으로 돌아가기
        </button>
      </div>

      {/* Header */}
      <div className="mb-5 px-1">
        <h2 className="text-lg font-black text-slate-800 dark:text-white">학교 이메일로 회원가입</h2>
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
          GloCulture는 실제 대학생들이 모인 안전하고 정직한 다국어 커뮤니티 포털을 표방하므로 대학 도메인 이메일 인증이 필수입니다.
        </p>
      </div>

      {/* Registration Card Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-premium mb-6">
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          
          {/* Email Verification Section */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 pl-0.5 flex items-center">
              <Mail size={12} className="mr-1 text-brand-gold-dark dark:text-brand-gold" />
              대학교 이메일 주소 (필수)
            </label>
            <div className="relative flex items-center">
              <input
                type="email"
                disabled={isEmailVerified}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="학교 이메일을 직접 입력하세요 (예: user@snu.ac.kr)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-gold disabled:opacity-60 transition-all duration-200"
              />
            </div>

            {/* Email Code send triggers */}
            {!isEmailVerified && (
              <button
                type="button"
                onClick={handleSendCode}
                className="mt-2.5 w-full text-center rounded-xl bg-slate-800 dark:bg-slate-700 text-brand-gold text-[10px] font-bold py-2.5 hover:bg-slate-700 dark:hover:bg-slate-600 active:scale-95 transition-all shadow-sm"
              >
                {isCodeSent ? '인증 코드 재발송 (Resend Code)' : '인증번호 발송 (Send Code)'}
              </button>
            )}

            {/* Step 2: Code input and countdown timer */}
            {isCodeSent && !isEmailVerified && (
              <div className="mt-3.5 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/80 fade-in space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 pl-0.5">
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
                    className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-gold tracking-widest text-center font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    className="rounded-lg bg-brand-gold text-slate-900 text-[10px] font-bold px-4 py-2 hover:bg-brand-gold-dark transition-colors"
                  >
                    인증 확인
                  </button>
                </div>
              </div>
            )}

            {/* Email Verification Completed Banner */}
            {isEmailVerified && (
              <div className="mt-2.5 flex items-center justify-center space-x-1.5 rounded-lg bg-green-50/80 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 p-2.5 text-xs text-green-600 dark:text-green-400 font-bold tracking-tight fade-in">
                <CheckCircle2 size={15} />
                <span>학교 이메일 인증 완료 ({fullEmailAddress})</span>
              </div>
            )}
          </div>

          {/* User Fields (Only enabled/unlocked when email is verified!) */}
          <div className={`space-y-3.5 transition-all duration-300 ${isEmailVerified ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'}`}>
            <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 pl-0.5 uppercase tracking-wide">
              회원 상세 정보 입력
            </span>

            {/* Nickname */}
            <div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="사용할 닉네임 (Nickname)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900"
              />
            </div>

            {/* Username */}
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="사용할 아이디 (ID)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900"
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 설정"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900"
              />
            </div>

            {/* Password Confirm */}
            <div>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 확인"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900"
              />
            </div>

            {/* Preferred Language Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1.5 pl-1 flex items-center">
                <Globe size={12} className="mr-1 text-brand-gold-dark dark:text-brand-gold" />
                선호 언어 (Preferred Language)
              </label>
              <div className="relative flex items-center">
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900 appearance-none cursor-pointer"
                >
                  <option value="ko">한국어 (Korean) 🇰🇷</option>
                  <option value="en">English (영어) 🇺🇸</option>
                  <option value="zh">中文 (Chinese / 중국어) 🇨🇳</option>
                  <option value="vi">Tiếng Việt (Vietnamese / 베트남어) 🇻🇳</option>
                </select>
                <div className="pointer-events-none absolute right-3 flex items-center text-slate-400 dark:text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Form Error Notices */}
          {error && (
            <div className="flex items-center space-x-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 p-2.5 text-[11px] font-semibold text-red-600 dark:text-red-400 fade-in">
              <AlertCircle size={13} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Signup Complete Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isEmailVerified}
            className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-brand-gold py-3.5 text-xs font-bold text-slate-900 shadow-md shadow-brand-gold/15 hover:bg-brand-gold-dark active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
          >
            {isSubmitting ? (
              <span>가입 등록 중...</span>
            ) : (
              <span>가입 및 회원가입 완료</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// C. FORGOT ACCOUNT VIEW (FIND ID / PASSWORD RETRIEVAL)
// ----------------------------------------------------------------------
export function ForgotAccountView({ onNavigateToLogin, showToast }) {
  const [activeTab, setActiveTab] = useState('id'); // 'id' | 'pw'
  
  // Find ID states
  const [idEmailLocal, setIdEmailLocal] = useState('');
  const [idEmailDomain, setIdEmailDomain] = useState('@snu.ac.kr');
  const [foundIdText, setFoundIdText] = useState('');

  // Find PW states
  const [pwUsername, setPwUsername] = useState('');
  const [pwEmailLocal, setPwEmailLocal] = useState('');
  const [pwEmailDomain, setPwEmailDomain] = useState('@snu.ac.kr');
  const [pwSuccessMsg, setPwSuccessMsg] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset tab errors
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setFoundIdText('');
    setPwSuccessMsg('');
  };

  // Trigger Find ID
  const handleFindId = async (e) => {
    e.preventDefault();
    const fullEmail = `${idEmailLocal}${idEmailDomain}`;

    if (!idEmailLocal.trim()) {
      setError('이메일을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setFoundIdText('');
    try {
      const response = await api.findId(fullEmail);
      if (response.success) {
        setFoundIdText(response.message);
      }
    } catch (err) {
      setError(err.message || '아이디 찾기에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger Find PW
  const handleFindPassword = async (e) => {
    e.preventDefault();
    const fullEmail = `${pwEmailLocal}${pwEmailDomain}`;

    if (!pwUsername.trim() || !pwEmailLocal.trim()) {
      setError('아이디와 이메일을 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setPwSuccessMsg('');

    try {
      const response = await api.resetPassword(pwUsername, fullEmail);
      if (response.success) {
        setPwSuccessMsg(response.message);
      }
    } catch (err) {
      setError(err.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-start px-6 py-6 fade-in">
      <div className="mb-4">
        <button
          onClick={onNavigateToLogin}
          className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-bold transition-colors"
        >
          <ChevronLeft size={16} className="mr-0.5" />
          로그인으로 돌아가기
        </button>
      </div>

      {/* Header */}
      <div className="mb-5 px-1">
        <h2 className="text-lg font-black text-slate-800 dark:text-white">계정 정보 찾기</h2>
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-550 mt-1 leading-relaxed">
          가입 시 인증에 사용하셨던 대학교 메일을 활용하여 아이디를 확인하거나 비밀번호 재설정 이메일을 받아보실 수 있습니다.
        </p>
      </div>

      {/* Selector Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-950 rounded-xl p-1 mb-5">
        <button
          onClick={() => handleTabChange('id')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'id'
              ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white'
          }`}
        >
          아이디 찾기
        </button>
        <button
          onClick={() => handleTabChange('pw')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'pw'
              ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white'
          }`}
        >
          비밀번호 재설정
        </button>
      </div>

      {/* Tabs Content */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-premium">
        {activeTab === 'id' ? (
          /* 1. FIND ID FORM */
          <form onSubmit={handleFindId} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 pl-0.5">
                가입 시 인증한 대학 이메일 주소
              </label>
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  value={idEmailLocal}
                  onChange={(e) => setIdEmailLocal(e.target.value)}
                  placeholder="이메일 입력"
                  className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900"
                />
                <select
                  value={idEmailDomain}
                  onChange={(e) => setIdEmailDomain(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-1 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="@snu.ac.kr">@snu.ac.kr</option>
                  <option value="@yonsei.ac.kr">@yonsei.ac.kr</option>
                  <option value="@korea.ac.kr">@korea.ac.kr</option>
                  <option value="@ewha.ac.kr">@ewha.ac.kr</option>
                  <option value="@gloculture.edu">@gloculture.edu</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 p-2.5 text-[10.5px] font-semibold text-red-600 dark:text-red-400 fade-in">
                <AlertCircle size={13} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {foundIdText && (
              <div className="flex items-center space-x-2 rounded-xl bg-brand-gold-light/60 dark:bg-brand-gold/10 border border-brand-gold/30 p-4 text-xs text-slate-800 dark:text-brand-gold font-bold fade-in">
                <Sparkles size={15} className="text-brand-gold-dark dark:text-brand-gold animate-pulse flex-shrink-0" />
                <span>{foundIdText}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-brand-gold py-3 text-xs font-bold text-slate-900 hover:bg-brand-gold-dark transition-all active:scale-98 shadow-md shadow-brand-gold/15"
            >
              {isSubmitting ? '조회 중...' : '아이디 확인'}
            </button>
          </form>
        ) : (
          /* 2. FIND PASSWORD FORM */
          <form onSubmit={handleFindPassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 pl-0.5">
                아이디 (Username)
              </label>
              <input
                type="text"
                value={pwUsername}
                onChange={(e) => setPwUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 pl-0.5">
                인증 완료한 대학 이메일 주소
              </label>
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  value={pwEmailLocal}
                  onChange={(e) => setPwEmailLocal(e.target.value)}
                  placeholder="이메일 입력"
                  className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900"
                />
                <select
                  value={pwEmailDomain}
                  onChange={(e) => setPwEmailDomain(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-1 py-2 text-xs text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="@snu.ac.kr">@snu.ac.kr</option>
                  <option value="@yonsei.ac.kr">@yonsei.ac.kr</option>
                  <option value="@korea.ac.kr">@korea.ac.kr</option>
                  <option value="@ewha.ac.kr">@ewha.ac.kr</option>
                  <option value="@gloculture.edu">@gloculture.edu</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 p-2.5 text-[10.5px] font-semibold text-red-600 dark:text-red-400 fade-in">
                <AlertCircle size={13} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {pwSuccessMsg && (
              <div className="flex items-center space-x-2 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 p-4 text-xs text-green-700 dark:text-green-400 font-bold fade-in">
                <CheckCircle2 size={15} className="flex-shrink-0 text-green-600 dark:text-green-400" />
                <span>{pwSuccessMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-brand-gold py-3 text-xs font-bold text-slate-900 hover:bg-brand-gold-dark transition-all active:scale-98 shadow-md shadow-brand-gold/15"
            >
              {isSubmitting ? '조회 중...' : '임시 비밀번호 이메일 받기'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
