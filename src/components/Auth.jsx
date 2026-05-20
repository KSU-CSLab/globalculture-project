import React, { useState, useEffect, useRef } from "react";
import { Globe, ShieldCheck, Mail, Key, Sparkles, UserPlus, HelpCircle, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export default function Auth({
  onLoginSuccess,
  registeredUsers,
  onRegisterUser,
  onResetPassword
}) {
  const [view, setView] = useState("login"); // login | signup | recovery
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Handle errors or success clears
  const triggerError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg("");
  };
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg("");
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginId.trim() || !loginPw.trim()) return;

    // Check credentials
    const foundUser = registeredUsers.find(
      (u) => u.id === loginId.trim() && u.password === loginPw.trim()
    );

    if (foundUser) {
      triggerSuccess("🎉 로그인 성공! 잠시 후 피드로 이동합니다.");
      setTimeout(() => {
        onLoginSuccess({
          id: foundUser.id,
          nickname: foundUser.nickname,
          email: foundUser.email
        });
      }, 800);
    } else {
      triggerError("❌ 아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] flex items-center justify-center p-4 select-none relative overflow-hidden">
      {/* Background ambient blur decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-100/40 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/30 blur-[120px]"></div>

      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-xl p-6 sm:p-8 z-10 transition-all duration-300">
        
        {/* Core Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-everytime-red text-white shadow-lg shadow-yellow-500/20 active:scale-95 transition-all">
            <Globe size={24} className="animate-spin-slow" />
          </div>
          <h1 className="text-xl font-extrabold text-everytime-red tracking-tight text-center leading-none">
            GloKulture
          </h1>
          <p className="text-[9px] font-extrabold text-everytime-textSub tracking-widest uppercase leading-none">
            글로컬 대학 소통망
          </p>
        </div>

        {/* Dynamic Alerts Banner */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-yellow-50 border border-yellow-150 text-[11px] text-everytime-red font-bold animate-slide-down flex items-start gap-1.5">
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-green-50 border border-green-150 text-[11px] text-green-700 font-bold animate-slide-down flex items-start gap-1.5">
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. LOGIN VIEW */}
        {view === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="아이디"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-everytime-red focus:ring-2 focus:ring-everytime-red/10 text-everytime-textMain font-semibold transition-all"
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-everytime-red focus:ring-2 focus:ring-everytime-red/10 text-everytime-textMain font-semibold transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-everytime-red hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-md shadow-yellow-500/10 active:scale-98 transition-all"
            >
              GloKulture 로그인
            </button>

            {/* Helper developer credentials tip */}
            <div className="text-[10px] text-center text-everytime-textSub bg-gray-50 p-2 rounded-lg border border-gray-100">
              💡 <span className="font-extrabold text-everytime-textMain">테스트 마스터 계정:</span> ID: <span className="font-bold underline text-everytime-red">glocal</span> / PW: <span className="font-bold underline text-everytime-red">password123</span>
            </div>

            {/* Links and routes */}
            <div className="flex items-center justify-center gap-3.5 text-[11px] font-bold text-everytime-textSub pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setView("signup");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="hover:text-everytime-red transition-colors"
              >
                회원가입
              </button>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <button
                type="button"
                onClick={() => {
                  setView("recovery");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="hover:text-everytime-red transition-colors"
              >
                아이디/비밀번호 찾기
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGN-UP VIEW (WITH SCHOOL EMAIL VERIFICATION) */}
        {view === "signup" && (
          <SignUpView
            onBack={() => setView("login")}
            registeredUsers={registeredUsers}
            onRegister={onRegisterUser}
            triggerError={triggerError}
            triggerSuccess={triggerSuccess}
          />
        )}

        {/* 3. RECOVERY VIEW (FIND ID / PASSWORD RESET) */}
        {view === "recovery" && (
          <RecoveryView
            onBack={() => setView("login")}
            registeredUsers={registeredUsers}
            onResetPassword={onResetPassword}
            triggerError={triggerError}
            triggerSuccess={triggerSuccess}
          />
        )}

      </div>
    </div>
  );
}

// ================= SUBCOMPONENT: SIGN-UP VIEW =================
function SignUpView({ onBack, registeredUsers, onRegister, triggerError, triggerSuccess }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  
  // Verification states
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3-minute timer
  const [isVerified, setIsVerified] = useState(false);
  
  const timerRef = useRef(null);

  // Countdown timer logic
  useEffect(() => {
    if (isEmailSent && timeLeft > 0 && !isVerified) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      triggerError("❌ 인증 유효 시간이 초과되었습니다. 인증번호를 재발송해주세요.");
      setIsEmailSent(false);
      setTimeLeft(180);
    }

    return () => clearInterval(timerRef.current);
  }, [isEmailSent, timeLeft, isVerified]);

  const handleSendCode = () => {
    if (!email.trim()) return;

    // School Email validation: requires .ac.kr or .edu
    const schoolEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(ac\.kr|edu)$/i;
    if (!schoolEmailRegex.test(email.trim())) {
      triggerError("⚠️ 학교 이메일 규격(.ac.kr 또는 .edu)을 준수해주십시오.");
      return;
    }

    // Check if email already in use
    const emailExists = registeredUsers.some(u => u.email === email.trim());
    if (emailExists) {
      triggerError("❌ 이미 가입된 학교 이메일입니다.");
      return;
    }

    // Success code send trigger
    setIsEmailSent(true);
    setTimeLeft(180);
    triggerSuccess("📨 학교 이메일로 인증 코드가 발송되었습니다. (3분 제한)");
  };

  const handleVerifyCode = () => {
    if (verifyCode.trim() === "123456") {
      setIsVerified(true);
      clearInterval(timerRef.current);
      triggerSuccess("✅ 학교 인증이 성공적으로 완료되었습니다! 가입을 마무리해 주세요.");
    } else {
      triggerError("❌ 인증번호가 틀렸습니다. 다시 확인 후 입력해주세요.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!id.trim() || !password.trim() || !nickname.trim() || !email.trim()) return;

    if (password !== pwConfirm) {
      triggerError("❌ 비밀번호가 확인란과 서로 다릅니다.");
      return;
    }

    if (id.length < 4) {
      triggerError("❌ 아이디는 4자 이상이어야 합니다.");
      return;
    }

    // Check if username duplicate
    if (registeredUsers.some(u => u.id === id.trim())) {
      triggerError("❌ 이미 등록된 아이디입니다.");
      return;
    }

    if (!isVerified) {
      triggerError("❌ 이메일 학교 인증을 거쳐주십시오.");
      return;
    }

    // Register User
    onRegister({
      id: id.trim(),
      password: password.trim(),
      nickname: nickname.trim(),
      email: email.trim()
    });

    triggerSuccess("🎉 회원가입 성공! 로그인 페이지로 이동합니다.");
    setTimeout(() => {
      onBack();
    }, 1200);
  };

  // Format timer output
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-1.5 pb-2 border-b border-gray-150 mb-1">
        <button type="button" onClick={onBack} className="text-gray-400 hover:text-everytime-textMain p-0.5 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <span className="text-xs font-extrabold text-everytime-textMain">GloKulture 회원가입</span>
      </div>

      <div className="space-y-2 text-left">
        {/* ID/PW inputs */}
        <div>
          <label className="text-[10px] font-extrabold text-everytime-textSub uppercase">아이디</label>
          <input
            type="text"
            placeholder="4자 이상 입력"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-everytime-red text-everytime-textMain font-semibold transition-all mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-extrabold text-everytime-textSub uppercase">비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-everytime-red text-everytime-textMain font-semibold transition-all mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] font-extrabold text-everytime-textSub uppercase">비밀번호 확인</label>
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={pwConfirm}
              onChange={(e) => setPwConfirm(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-everytime-red text-everytime-textMain font-semibold transition-all mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-extrabold text-everytime-textSub uppercase">닉네임</label>
          <input
            type="text"
            placeholder="커뮤니티 활동 닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-everytime-red text-everytime-textMain font-semibold transition-all mt-1"
          />
        </div>

        {/* Email verification structure */}
        <div>
          <label className="text-[10px] font-extrabold text-everytime-textSub uppercase">학교 이메일 인증 (.ac.kr / .edu)</label>
          <div className="flex gap-2 mt-1">
            <input
              type="email"
              placeholder="ex) student@univ.ac.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isVerified}
              className="flex-1 text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-everytime-red text-everytime-textMain font-semibold transition-all disabled:bg-gray-100 disabled:text-gray-400"
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={isVerified || !email.trim()}
              className="px-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm shrink-0"
            >
              <Send size={11} />
              인증코드 발송
            </button>
          </div>
        </div>

        {/* Timer entry panel */}
        {isEmailSent && !isVerified && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-2 mt-2 animate-slide-down">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-blue-900 flex items-center gap-1">
                ⏱️ 제한 시간: <span className="font-bold underline text-everytime-red">{formatTime(timeLeft)}</span>
              </span>
              <span className="text-[9px] text-blue-500 font-extrabold italic bg-white py-0.5 px-1.5 rounded border border-blue-100">
                테스트 코드: 123456
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="6자리 숫자 입력"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                className="flex-1 text-xs text-center tracking-[4px] font-bold px-3 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-lg shadow transition-all active:scale-95"
              >
                인증 확인
              </button>
            </div>
          </div>
        )}

        {/* Verified Badge */}
        {isVerified && (
          <div className="mt-2 p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-[11px] font-bold flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-green-600" />
            <span>학교 이메일 인증이 완벽히 통과되었습니다!</span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!isVerified}
        className="w-full py-3 bg-everytime-red hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs shadow-md shadow-yellow-500/10 active:scale-98 transition-all pt-2.5"
      >
        회원가입 완료
      </button>
    </form>
  );
}

// ================= SUBCOMPONENT: CREDENTIALS RECOVERY VIEW =================
function RecoveryView({ onBack, registeredUsers, onResetPassword, triggerError, triggerSuccess }) {
  const [tab, setTab] = useState("findid"); // findid | resetpw
  
  // Find ID
  const [emailInput, setEmailInput] = useState("");
  
  // Reset PW
  const [pwUserId, setPwUserId] = useState("");
  const [pwEmail, setPwEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const timerRef = useRef(null);

  // Timer useEffect
  useEffect(() => {
    if (isEmailSent && timeLeft > 0 && !isVerified) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      triggerError("❌ 인증 시간이 경과했습니다. 인증 코드를 재요청해 주십시오.");
      setIsEmailSent(false);
      setTimeLeft(180);
    }

    return () => clearInterval(timerRef.current);
  }, [isEmailSent, timeLeft, isVerified]);

  // Find ID Logic
  const handleFindId = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const matchedUser = registeredUsers.find((u) => u.email === emailInput.trim());
    if (matchedUser) {
      triggerSuccess(`🔍 회원님의 아이디는 [ ${matchedUser.id} ] 입니다.`);
    } else {
      triggerError("❌ 입력하신 이메일 정보와 매칭되는 대학 회원 데이터가 존재하지 않습니다.");
    }
  };

  // Reset PW - Step 1: Send verification email
  const handleSendResetCode = () => {
    if (!pwUserId.trim() || !pwEmail.trim()) {
      triggerError("⚠️ 아이디와 이메일 주소를 입력해 주십시오.");
      return;
    }

    // Matches database
    const userMatch = registeredUsers.find(
      (u) => u.id === pwUserId.trim() && u.email === pwEmail.trim()
    );

    if (userMatch) {
      setIsEmailSent(true);
      setTimeLeft(180);
      triggerSuccess("📨 비밀번호 재설정을 위한 메일 인증 코드가 전송되었습니다. (3분)");
    } else {
      triggerError("❌ 입력하신 회원정보와 일치하는 계정이 존재하지 않습니다.");
    }
  };

  // Reset PW - Step 2: Confirm code
  const handleVerifyResetCode = () => {
    if (verifyCode.trim() === "123456") {
      setIsVerified(true);
      clearInterval(timerRef.current);
      triggerSuccess("✅ 이메일 인증이 완료되었습니다. 새 비밀번호를 입력해주세요.");
    } else {
      triggerError("❌ 잘못된 인증 번호입니다.");
    }
  };

  // Reset PW - Step 3: Write new password
  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    if (newPassword !== newPasswordConfirm) {
      triggerError("❌ 신규 비밀번호 확인란과 불일치합니다.");
      return;
    }

    onResetPassword(pwUserId.trim(), newPassword.trim());
    triggerSuccess("🎉 비밀번호가 변경되었습니다! 새 로그인으로 접속해 주십시오.");
    setTimeout(() => {
      onBack();
    }, 1200);
  };

  return (
    <div className="space-y-4 animate-slide-up text-left">
      {/* Recovery title */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-gray-150 mb-1">
        <button type="button" onClick={onBack} className="text-gray-400 hover:text-everytime-textMain p-0.5 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <span className="text-xs font-extrabold text-everytime-textMain">아이디 / 비밀번호 찾기</span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 bg-gray-100 p-0.8 rounded-lg text-xs font-bold text-center">
        <button
          onClick={() => {
            setTab("findid");
            setErrorMsg("");
            setSuccessMsg("");
          }}
          className={`py-1.5 rounded-md transition-all ${
            tab === "findid" ? "bg-white text-everytime-red shadow-sm" : "text-everytime-textSub hover:text-everytime-textMain"
          }`}
        >
          아이디 찾기
        </button>
        <button
          onClick={() => {
            setTab("resetpw");
            setErrorMsg("");
            setSuccessMsg("");
          }}
          className={`py-1.5 rounded-md transition-all ${
            tab === "resetpw" ? "bg-white text-everytime-red shadow-sm" : "text-everytime-textSub hover:text-everytime-textMain"
          }`}
        >
          비밀번호 재설정
        </button>
      </div>

      {/* TAB A: FIND ID */}
      {tab === "findid" && (
        <form onSubmit={handleFindId} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-everytime-textSub uppercase">학교 이메일 주소</label>
            <input
              type="email"
              placeholder="가입 시 등록했던 학교 메일"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-everytime-red text-everytime-textMain font-semibold transition-all mt-1"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow transition-all"
          >
            아이디 조회하기
          </button>
        </form>
      )}

      {/* TAB B: RESET PASSWORD */}
      {tab === "resetpw" && (
        <div className="space-y-4 mt-2">
          {!isVerified ? (
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-extrabold text-everytime-textSub uppercase">아이디</label>
                <input
                  type="text"
                  placeholder="가입된 아이디"
                  value={pwUserId}
                  disabled={isEmailSent}
                  onChange={(e) => setPwUserId(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-everytime-red text-everytime-textMain font-semibold transition-all mt-1 disabled:bg-gray-150 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-everytime-textSub uppercase">가입 학교 이메일</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="email"
                    placeholder="student@univ.ac.kr"
                    value={pwEmail}
                    disabled={isEmailSent}
                    onChange={(e) => setPwEmail(e.target.value)}
                    className="flex-1 text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-everytime-red text-everytime-textMain font-semibold transition-all disabled:bg-gray-150 disabled:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleSendResetCode}
                    disabled={isEmailSent || !pwEmail.trim() || !pwUserId.trim()}
                    className="px-3 bg-slate-950 hover:bg-slate-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-[10px] font-bold transition-all shrink-0"
                  >
                    인증요청
                  </button>
                </div>
              </div>

              {/* 180s Reset code entry */}
              {isEmailSent && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-2 animate-slide-down">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-extrabold text-blue-900">
                      ⏱️ 유효 시간: <span className="font-bold underline text-everytime-red">{timeLeft}초</span>
                    </span>
                    <span className="text-[9px] text-blue-500 font-extrabold italic bg-white py-0.5 px-1 rounded border border-blue-100">
                      인증코드: 123456
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="인증코드"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      className="flex-1 text-xs font-bold text-center tracking-[4px] py-1.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyResetCode}
                      className="px-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg shadow transition-all active:scale-95"
                    >
                      확인
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Reset Input Panel */
            <form onSubmit={handleResetSubmit} className="space-y-4 animate-slide-down">
              <div>
                <label className="text-[10px] font-extrabold text-everytime-textSub uppercase">새 비밀번호</label>
                <input
                  type="password"
                  placeholder="신규 비밀번호 입력"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-everytime-red text-everytime-textMain font-semibold transition-all mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-everytime-textSub uppercase">새 비밀번호 확인</label>
                <input
                  type="password"
                  placeholder="동일 비밀번호 재입력"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-everytime-red text-everytime-textMain font-semibold transition-all mt-1"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-everytime-red hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-98"
              >
                비밀번호 재설정 완료
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
