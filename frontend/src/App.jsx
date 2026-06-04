import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CategoryTabs from './components/CategoryTabs';
import PostCard from './components/PostCard';
import CommentSection from './components/CommentSection';
import MessageModal from './components/MessageModal';
import MyPageModal from './components/MyPageModal';
import EventsSection from './components/EventsSection';
import BenefitsSection from './components/BenefitsSection';
import PartnersSection from './components/PartnersSection';
import { LoginView, SignUpView, ForgotAccountView } from './components/AuthComponents';
import AppDownloadModal from './components/AppDownloadModal';
import { api, INITIAL_POSTS, INITIAL_COMMENTS } from './services/api';
import {
  PlusCircle, Globe, Flame, Sparkles, Send,
  CheckCircle2, Sun, Moon, Calendar, Gift, Handshake, Users,
  Activity, Wifi, WifiOff, Smartphone,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION IDs matching Header nav
// ─────────────────────────────────────────────────────────────────────────────
const SECTIONS = ['community', 'events', 'benefits', 'partners'];

export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser]         = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);

  console.log('App render. isAppDownloadOpen state:', isAppDownloadOpen);

  // ── Active section (nav) ──────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('community');

  // ── Community / Posts ─────────────────────────────────────────────────────
  const [posts, setPosts]           = useState(INITIAL_POSTS);
  const [commentsMap, setCommentsMap] = useState(INITIAL_COMMENTS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedPostId, setExpandedPostId] = useState(1);

  // Write form
  const [isWriteOpen, setIsWriteOpen]   = useState(false);
  const [writeTitle, setWriteTitle]     = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeCategory, setWriteCategory] = useState('free');
  const [writeLang, setWriteLang]       = useState('ko');

  // Translation caches
  const [postCache, setPostCache]       = useState({});
  const [commentCache, setCommentCache] = useState({});

  // ── Messaging ─────────────────────────────────────────────────────────────
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [msgReceiverName, setMsgReceiverName] = useState('');
  const [sentMessages, setSentMessages] = useState([
    { id: 1, receiverName: '익명 1', content: '안녕하세요! 공모전 팀원 구인글 보고 연락드립니다.', time: '1시간 전' },
    { id: 2, receiverName: '익명 2', content: '언어 교환 관심있어서 쪽지 보냅니다!', time: '어제' },
  ]);
  const [receivedMessages, setReceivedMessages] = useState([
    { id: 101, senderName: 'Sarah Jones', content: '안녕하세요! 공모전 팀원 구인글 보고 연락드립니다. 프론트엔드 파트 지원하고 싶어요!', time: '1시간 전' },
    { id: 102, senderName: 'Nguyen Min', content: '캠퍼스 투어 관련해서 궁금한 점이 있어서 쪽지 보냅니다.', time: '어제' },
  ]);

  // ── MyPage ────────────────────────────────────────────────────────────────
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch (e) {
      console.error('Failed to get theme from localStorage:', e);
      return false;
    }
  });

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // ── Backend health status ─────────────────────────────────────────────────
  const [backendOnline, setBackendOnline] = useState(null); // null = unknown

  // ─── Effects ──────────────────────────────────────────────────────────────

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Auto-hide toast
  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast((p) => ({ ...p, show: false })), 3500);
    return () => clearTimeout(t);
  }, [toast.show]);

  // Health-check backend on mount
  useEffect(() => {
    api.healthCheck()
      .then((data) => setBackendOnline(data?.status === 'ok' || true))
      .catch(() => setBackendOnline(false));
  }, []);

  // Auto open download modal on first visit for non-logged-in users
  useEffect(() => {
    if (!user) {
      try {
        const hideToday = localStorage.getItem('ksu_hide_app_download_today');
        const todayStr = new Date().toDateString();
        if (hideToday !== todayStr) {
          const timer = setTimeout(() => {
            setIsAppDownloadOpen(true);
          }, 1200);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.error('Failed to access localStorage:', e);
        // Fallback: auto-open anyway
        const timer = setTimeout(() => {
          setIsAppDownloadOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const handleToggleDarkMode = () => setDarkMode((p) => !p);

  // ─── Auth handlers ────────────────────────────────────────────────────────

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActiveSection('community');
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setAuthView('login');
    showToast('로그아웃 되었습니다.');
  };

  const handleWithdrawal = () => {
    setIsMyPageOpen(false);
    setUser(null);
    setAuthView('login');
    showToast('회원 탈퇴가 완료되었습니다.', 'success');
  };

  // ─── Post/Comment handlers ────────────────────────────────────────────────

  const handleCachePostTranslation = (postId, data) => {
    setPostCache((p) => ({ ...p, [postId]: data }));
  };

  const handleCacheCommentTranslation = (commentId, data) => {
    setCommentCache((p) => ({ ...p, [commentId]: data }));
  };

  const handlePostDelete = async (postId) => {
    try {
      showToast('게시글 삭제 중...', 'info');
      const res = await api.deletePost(postId);
      if (res.success) {
        setPosts((p) => p.filter((x) => x.id !== postId));
        if (expandedPostId === postId) setExpandedPostId(null);
        showToast(res.message, 'success');
      }
    } catch { showToast('게시글 삭제에 실패했습니다.', 'error'); }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      const res = await api.deleteComment(commentId);
      if (res.success) {
        const newMap = { ...commentsMap };
        let targetPostId = null;
        for (const postId in newMap) {
          const idx = newMap[postId].findIndex((c) => c.id === commentId);
          if (idx !== -1) {
            newMap[postId] = newMap[postId].filter((c) => c.id !== commentId);
            targetPostId = Number(postId);
            break;
          }
        }
        setCommentsMap(newMap);
        if (targetPostId) {
          setPosts((p) => p.map((x) =>
            x.id === targetPostId ? { ...x, commentsCount: Math.max(0, x.commentsCount - 1) } : x
          ));
        }
        showToast(res.message, 'success');
      }
    } catch { showToast('댓글 삭제에 실패했습니다.', 'error'); }
  };

  const handleCommentAdd = (postId, content, isAnonymous) => {
    const newId = Date.now();
    const newComment = {
      id: newId,
      author: isAnonymous
        ? `익명 ${(commentsMap[postId]?.length || 0) + 1}`
        : (user?.nickname || '익명'),
      authorId: user?.id || user?.username || 'guest',
      isSelf: true,
      time: '방금 전',
      content,
      lang: 'ko',
      likes: 0,
    };
    setCommentCache((p) => ({ ...p, [newId]: { translatedContent: `[Translation from KO] ${content}` } }));
    setCommentsMap((p) => ({ ...p, [postId]: [...(p[postId] || []), newComment] }));
    setPosts((p) => p.map((x) => x.id === postId ? { ...x, commentsCount: x.commentsCount + 1 } : x));
    showToast('댓글이 등록되었습니다!');
  };

  const handleLikeToggle = (postId) => {
    setPosts((p) => p.map((x) => {
      if (x.id !== postId) return x;
      const liked = !x.liked;
      return { ...x, liked, likes: liked ? x.likes + 1 : Math.max(0, x.likes - 1) };
    }));
  };

  const handleSendMessageTrigger = (receiverName) => {
    setMsgReceiverName(receiverName);
    setIsMsgModalOpen(true);
  };

  const handleSendMessageSuccess = (messageText) => {
    setSentMessages((p) => [
      { id: Date.now(), receiverName: msgReceiverName, content: messageText, time: '방금 전' },
      ...p,
    ]);
    showToast(`${msgReceiverName} 님에게 쪽지를 전송했습니다!`, 'success');
  };

  const handleReplyMessage = (senderName) => {
    setIsMyPageOpen(false); // Close MyPage
    setMsgReceiverName(senderName); // Set receiver
    setIsMsgModalOpen(true); // Open Message Modal
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!writeTitle.trim() || !writeContent.trim()) return;

    const newPost = {
      id: Date.now(),
      category: writeCategory,
      author: user?.nickname || '익명',
      authorId: user?.id || user?.username || 'guest',
      isSelf: true,
      time: '방금 전',
      title: writeTitle,
      content: writeContent,
      likes: 0,
      commentsCount: 0,
      liked: false,
      lang: writeLang,
      translatedTitle: `[Translation from ${writeLang.toUpperCase()}] ${writeTitle}`,
      translatedContent: `[Translation from ${writeLang.toUpperCase()}] ${writeContent}`,
    };

    try {
      // Try real API first (falls back to mock automatically)
      await api.createPost({
        title: writeTitle,
        content: writeContent,
        category: writeCategory,
        lang: writeLang,
      });
    } catch {}

    setPosts([newPost, ...posts]);
    setCommentsMap((p) => ({ ...p, [newPost.id]: [] }));
    setExpandedPostId(newPost.id);
    setWriteTitle('');
    setWriteContent('');
    setIsWriteOpen(false);
    showToast('게시글이 등록되었습니다!');
  };

  const handlePostClickFocus = (postId) => {
    setActiveSection('community');
    setExpandedPostId(postId);
    setTimeout(() => {
      const el = document.getElementById(`post-card-${postId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-brand-gold/40');
        setTimeout(() => el.classList.remove('ring-4', 'ring-brand-gold/40'), 1500);
      }
    }, 150);
  };

  // Filtered posts
  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  // ─────────────────────────────────────────────────────────────────────────
  // TOAST COMPONENT (shared)
  // ─────────────────────────────────────────────────────────────────────────
  const ToastBanner = () => toast.show ? (
    <div className="fixed top-6 left-4 right-4 z-[60] flex items-center justify-center fade-in pointer-events-none">
      <div className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold flex items-center space-x-2 ${
        toast.type === 'success' ? 'bg-slate-900/95 border-brand-gold text-brand-yellow backdrop-blur-md dark:bg-slate-950/95' :
        toast.type === 'info'    ? 'bg-slate-800/95 border-slate-700 text-white backdrop-blur-md' :
                                   'bg-red-500/95 border-red-600 text-white backdrop-blur-md'
      }`}>
        <Sparkles size={13} className="text-brand-gold animate-spin" />
        <span>{toast.message}</span>
      </div>
    </div>
  ) : null;

  // ─────────────────────────────────────────────────────────────────────────
  // NOT LOGGED IN — Auth Landing
  // ─────────────────────────────────────────────────────────────────────────
  if (!user) {
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold text-slate-900 shadow-lg shadow-brand-gold/25 font-black text-xl">K</div>
            <span className="font-sans text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              KSU <span className="text-brand-gold-dark">Culture Hub</span>
            </span>
          </div>

          {/* Hero copy */}
          <div className="my-auto max-w-xl space-y-6 relative z-10">
            <div className="inline-flex items-center space-x-2 rounded-full bg-brand-gold/10 px-3.5 py-1 text-xs font-bold text-brand-gold-dark border border-brand-gold/20">
              <Globe size={13} className="animate-spin text-brand-gold-dark" />
              <span>경성대학교 공식 글로컬 문화 교류 플랫폼</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-850 dark:text-white">
              경성대학교<br />글로컬 <span className="text-brand-gold-dark">컬처 허브</span>
            </h2>

            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
              학생·교직원 전용 혜택, 문화 이벤트, 다국어 커뮤니티 게시판,<br />
              글로벌 파트너 연계까지 — <span className="text-brand-gold-dark dark:text-brand-gold font-bold">@ks.ac.kr</span> 이메일로 시작하세요.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: Users,    label: '학생·교직원 전용', desc: '역할 기반 서비스' },
                { icon: Calendar, label: '문화 이벤트',       desc: 'Events & Apply' },
                { icon: Gift,     label: '전용 혜택',         desc: 'Discount & Coupon' },
                { icon: Handshake,label: '글로벌 파트너',     desc: 'Global Network' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
                  <Icon size={18} className="text-brand-gold-dark dark:text-brand-gold mb-2" />
                  <span className="block text-sm font-black text-slate-800 dark:text-white">{label}</span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{desc}</span>
                </div>
              ))}
            </div>

            {/* Hybrid App QR Code & Download Section */}
            <div className="bg-white/85 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-4 border border-brand-gold/30 dark:border-brand-gold/25 shadow-premium flex items-center space-x-4">
              <div className="bg-white p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex-shrink-0 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&color=0f172a&data=${encodeURIComponent(import.meta.env.VITE_APK_URL || `${window.location.origin}/ksu-culture-hub.apk`)}`}
                  alt="APK QR Code"
                  className="w-16 h-16 select-none"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block bg-brand-gold text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded-full mb-1">Android APK</span>
                <h4 className="text-xs font-black text-slate-850 dark:text-white truncate">하이브리드 앱 출시!</h4>
                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                  QR을 스캔하여 모바일 앱을 직접 설치하세요.
                </p>
                <div className="flex items-center space-x-2.5 mt-2">
                  <a
                    href="/ksu-culture-hub.apk"
                    download="ksu-culture-hub.apk"
                    className="text-[10px] font-black text-brand-gold-dark dark:text-brand-gold hover:underline flex items-center"
                  >
                    APK 직접 다운로드 →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">
            © 2026 KSU Culture Hub — 경성대학교 글로컬 문화 허브
          </div>

          {/* Backdrop globe */}
          <div className="absolute right-[-100px] bottom-[-100px] text-slate-200/20 dark:text-slate-800/10 pointer-events-none">
            <Globe size={380} />
          </div>
        </div>

        {/* RIGHT — Auth Forms */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
          {/* Mobile brand */}
          <div className="md:hidden w-full max-w-md flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold text-slate-900 font-black">K</div>
              <span className="font-sans text-lg font-bold text-slate-800 dark:text-slate-100">
                KSU <span className="text-brand-gold-dark">Culture Hub</span>
              </span>
            </div>
          </div>

          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-2xl p-2 sm:p-4 overflow-hidden flex flex-col transition-all duration-300">
            <div className="overflow-y-auto no-scrollbar flex-1 max-h-[88vh]">
              {authView === 'login'  && <LoginView onLoginSuccess={handleLoginSuccess} onNavigateToSignUp={() => setAuthView('signup')} onNavigateToForgot={() => setAuthView('forgot')} showToast={showToast} />}
              {authView === 'signup' && <SignUpView onNavigateToLogin={() => setAuthView('login')} showToast={showToast} />}
              {authView === 'forgot' && <ForgotAccountView onNavigateToLogin={() => setAuthView('login')} showToast={showToast} />}
            </div>
          </div>

          {/* Quick APK Download Badge */}
          <button
            onClick={() => setIsAppDownloadOpen(true)}
            className="mt-6 flex items-center space-x-2 rounded-full px-4.5 py-2 border bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-350 text-[10px] font-black shadow-md hover:border-brand-gold hover:text-brand-gold-dark dark:hover:text-brand-gold active:scale-95 transition-all select-none"
          >
            <Smartphone size={13} className="text-brand-gold-dark dark:text-brand-gold animate-bounce" />
            <span>📱 모바일 하이브리드 앱(APK) 다운로드</span>
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOGGED IN — Main Dashboard
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-x-hidden font-sans pb-20 lg:pb-0 transition-colors duration-300">
      <ToastBanner />

      {/* Background glows */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-brand-gold/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <Header
        onSearchClick={() => showToast('검색 기능 개발 중입니다! 🔍')}
        onBellClick={() => showToast('새 알림이 없습니다. 🔔')}
        user={user}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Backend Status Banner */}
      {backendOnline === false && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 px-4 py-2 flex items-center justify-center space-x-2">
          <WifiOff size={13} className="text-amber-600 dark:text-amber-400" />
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
            백엔드 서버 연결 불가 — 데모(Mock) 모드로 실행 중 | Backend offline — Running in demo mode
          </span>
        </div>
      )}
      {backendOnline === true && (
        <div className="bg-green-50 dark:bg-green-950/30 border-b border-green-200 dark:border-green-900/50 px-4 py-1.5 flex items-center justify-center space-x-2">
          <Wifi size={12} className="text-green-600 dark:text-green-400" />
          <span className="text-[10px] font-bold text-green-700 dark:text-green-300">
            백엔드 서버 연결됨 — GET /api/health ✓
          </span>
        </div>
      )}

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col lg:grid lg:grid-cols-12 lg:gap-6">

        {/* ── LEFT SIDEBAR (Desktop) ── */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/80 shadow-premium sticky top-24 transition-colors duration-300 space-y-4">

            {/* User card */}
            <div
              onClick={() => setIsMyPageOpen(true)}
              className="group cursor-pointer flex items-center space-x-3 p-3 rounded-xl hover:bg-brand-gold/5 hover:border-brand-gold/30 border border-transparent transition-all"
              title="마이페이지 열기"
            >
              <div className="w-9 h-9 rounded-full bg-brand-gold/10 text-brand-gold-dark flex items-center justify-center font-black text-sm border border-brand-gold/30 group-hover:scale-105 transition-transform">
                {user?.nickname?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-black text-slate-800 dark:text-white truncate">{user.nickname}</span>
                <span className="block text-[9px] font-bold text-slate-400 truncate">{user.email}</span>
              </div>
              <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <h3 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 pl-1">메뉴</h3>
              <div className="space-y-1">
                {[
                  { id: 'community', label: '커뮤니티', icon: Globe },
                  { id: 'events',    label: '이벤트',   icon: Calendar },
                  { id: 'benefits',  label: '전용 혜택', icon: Gift },
                  { id: 'partners',  label: '파트너',    icon: Handshake },
                ].map(({ id, label, icon: Icon }) => {
                  const isActive = activeSection === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveSection(id)}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-brand-gold text-slate-900 shadow-md shadow-brand-gold/15'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={14} className="flex-shrink-0" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Community categories (only when on community tab) */}
            {activeSection === 'community' && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <h3 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 pl-1">카테고리</h3>
                <div className="space-y-1">
                  {[
                    { id: 'all',      name: '전체 피드' },
                    { id: 'contest',  name: '공모전 팀원모집' },
                    { id: 'free',     name: '자유게시판' },
                    { id: 'exchange', name: '언어교환/일상' },
                  ].map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          const filtered = cat.id === 'all' ? posts : posts.filter((p) => p.category === cat.id);
                          if (!filtered.some((p) => p.id === expandedPostId)) {
                            setExpandedPostId(filtered[0]?.id || null);
                          }
                        }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-slate-800 dark:bg-slate-700 text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-brand-gold' : 'bg-slate-300 dark:bg-slate-700'}`} />
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* App Download Link */}
            <button
              onClick={() => setIsAppDownloadOpen(true)}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-br from-amber-500/10 to-brand-gold/10 hover:from-amber-500/20 hover:to-brand-gold/20 dark:from-slate-950 dark:to-slate-950/80 border border-brand-gold/25 py-2.5 text-xs font-black text-slate-800 dark:text-brand-gold transition-colors"
            >
              <Smartphone size={13} className="text-brand-gold-dark dark:text-brand-gold flex-shrink-0 animate-bounce" />
              <span>모바일 앱 설치 (APK)</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors"
            >
              로그아웃 (Logout)
            </button>
          </div>
        </aside>

        {/* ── CENTER CONTENT ── */}
        <main className="col-span-12 lg:col-span-6 space-y-4">

          {/* Mobile Category Tabs (community only) */}
          {activeSection === 'community' && (
            <div className="lg:hidden">
              <CategoryTabs
                activeCategory={activeCategory}
                onCategoryChange={(cat) => {
                  setActiveCategory(cat);
                  const filtered = cat === 'all' ? posts : posts.filter((p) => p.category === cat);
                  if (!filtered.some((p) => p.id === expandedPostId)) {
                    setExpandedPostId(filtered[0]?.id || null);
                  }
                }}
              />
            </div>
          )}

          {/* ── COMMUNITY SECTION ── */}
          {activeSection === 'community' && (
            <>
              {/* Welcome Banner */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-5 text-white shadow-premium relative overflow-hidden select-none border border-slate-800/80">
                <div className="relative z-10">
                  <div className="flex items-center space-x-2">
                    <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-[9px] font-bold text-brand-gold border border-brand-gold/30">Community Feed</span>
                    <span className="text-[10px] text-slate-300 font-semibold flex items-center">
                      <Globe size={10} className="mr-1 animate-pulse" />실시간 다국어 지원
                    </span>
                  </div>
                  <h3 className="mt-2 text-xs font-black tracking-tight text-white sm:text-sm">
                    유학생 친구들과 자유롭게 소통하세요!
                  </h3>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-300 font-medium">
                    <span className="text-brand-gold font-bold">🌐 번역하기 / Translate</span> 버튼으로 AI 실시간 번역 지원
                  </p>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] text-slate-700/20 pointer-events-none">
                  <Globe size={110} />
                </div>
              </div>

              {/* Write Form */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-premium overflow-hidden transition-all duration-300">
                {!isWriteOpen ? (
                  <div
                    onClick={() => setIsWriteOpen(true)}
                    className="p-3.5 flex items-center justify-between cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 select-none"
                  >
                    <span className="text-xs font-bold pl-1">새 글을 작성해 보세요...</span>
                    <PlusCircle size={18} className="text-brand-gold-dark dark:text-brand-gold animate-bounce" />
                  </div>
                ) : (
                  <form onSubmit={handleCreatePost} className="p-4 space-y-3.5 fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-xs font-black text-slate-800 dark:text-white">새 교류글 올리기 ✍️</span>
                      <button type="button" onClick={() => setIsWriteOpen(false)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white">취소</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-1">카테고리</label>
                        <select value={writeCategory} onChange={(e) => setWriteCategory(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-gold">
                          <option value="contest">공모전 팀원모집</option>
                          <option value="free">자유게시판</option>
                          <option value="exchange">언어교환/일상</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-1">작성 언어</label>
                        <select value={writeLang} onChange={(e) => setWriteLang(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-gold">
                          <option value="ko">한국어 (KO)</option>
                          <option value="en">English (EN)</option>
                          <option value="zh">中文 (ZH)</option>
                          <option value="vi">Tiếng Việt (VI)</option>
                        </select>
                      </div>
                    </div>
                    <input
                      type="text" required value={writeTitle} onChange={(e) => setWriteTitle(e.target.value)}
                      placeholder="제목을 입력하세요..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900 transition-colors"
                    />
                    <textarea
                      required value={writeContent} onChange={(e) => setWriteContent(e.target.value)}
                      rows={4} placeholder="내용을 입력하세요..."
                      className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900 transition-colors"
                    />
                    <button type="submit" className="w-full rounded-xl bg-brand-gold py-2.5 text-xs font-bold text-slate-900 shadow-md shadow-brand-gold/15 hover:bg-brand-gold-dark active:scale-[0.99] transition-all">
                      게시글 등록하기 (POST /api/posts)
                    </button>
                  </form>
                )}
              </div>

              {/* Posts Feed */}
              {filteredPosts.length === 0 ? (
                <div className="py-16 text-center text-xs font-medium text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-8 shadow-premium">
                  선택한 카테고리에 게시글이 없습니다.<br />첫 소통글을 직접 등록해 보세요! ✍️
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const isExpanded = expandedPostId === post.id;
                  return (
                    <div key={post.id} id={`post-card-${post.id}`} className="space-y-2 transition-all duration-300">
                      <PostCard
                        post={post}
                        onDelete={handlePostDelete}
                        onSendMessage={handleSendMessageTrigger}
                        isExpanded={isExpanded}
                        onToggleExpand={() => setExpandedPostId(isExpanded ? null : post.id)}
                        translationCache={postCache}
                        onCacheTranslation={handleCachePostTranslation}
                        onLikeToggle={handleLikeToggle}
                      />
                      {isExpanded && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/80 shadow-premium">
                          <CommentSection
                            comments={commentsMap[post.id] || []}
                            onAddComment={(text, isAnon) => handleCommentAdd(post.id, text, isAnon)}
                            onDeleteComment={handleCommentDelete}
                            onSendMessage={handleSendMessageTrigger}
                            commentCache={commentCache}
                            onCacheCommentTranslation={handleCacheCommentTranslation}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* ── EVENTS SECTION ── */}
          {activeSection === 'events' && (
            <EventsSection user={user} showToast={showToast} />
          )}

          {/* ── BENEFITS SECTION ── */}
          {activeSection === 'benefits' && (
            <BenefitsSection user={user} showToast={showToast} />
          )}

          {/* ── PARTNERS SECTION ── */}
          {activeSection === 'partners' && (
            <PartnersSection user={user} showToast={showToast} />
          )}
        </main>

        {/* ── RIGHT SIDEBAR (Desktop) ── */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4">

          {/* API Status Widget (Admin Only) */}
          {user?.role === 'admin' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/80 shadow-premium transition-colors duration-300">
              <div className="flex items-center space-x-2 mb-3">
                <Activity size={13} className="text-brand-gold-dark dark:text-brand-gold" />
                <h4 className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">백엔드 API 상태</h4>
              </div>
              <div className="space-y-1.5">
                {[
                  { method: 'POST', path: '/api/auth/login',    status: backendOnline === true ? 'live' : backendOnline === false ? 'offline' : 'unknown' },
                  { method: 'GET',  path: '/api/users/me',      status: backendOnline === true ? 'live' : backendOnline === false ? 'offline' : 'unknown' },
                  { method: 'GET',  path: '/api/events',        status: backendOnline === true ? 'live' : backendOnline === false ? 'offline' : 'unknown' },
                  { method: 'GET',  path: '/api/benefits',      status: backendOnline === true ? 'live' : backendOnline === false ? 'offline' : 'unknown' },
                  { method: 'GET',  path: '/api/posts',         status: backendOnline === true ? 'live' : backendOnline === false ? 'offline' : 'unknown' },
                  { method: 'GET',  path: '/api/partners',      status: backendOnline === true ? 'live' : backendOnline === false ? 'offline' : 'unknown' },
                  { method: 'GET',  path: '/api/health',        status: backendOnline === true ? 'live' : backendOnline === false ? 'offline' : 'unknown' },
                ].map(({ method, path, status }) => (
                  <div key={path} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[8px] font-extrabold px-1 py-0.5 rounded ${
                        method === 'GET'    ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' :
                        method === 'POST'   ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'  :
                        method === 'PUT'    ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400' :
                                              'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                      }`}>{method}</span>
                      <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">{path}</span>
                    </div>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      status === 'live'    ? 'bg-green-500 animate-pulse' :
                      status === 'offline' ? 'bg-red-500' :
                      status === 'active'  ? 'bg-brand-gold' :
                                            'bg-slate-400'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOT Posts Widget (community only) */}
          {activeSection === 'community' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/80 shadow-premium space-y-3 transition-colors duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center space-x-1.5">
                  <Flame size={14} className="text-red-500 fill-current animate-pulse" />
                  <h4 className="text-xs font-black tracking-tight text-slate-800 dark:text-white">HOT 인기글</h4>
                </div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Realtime</span>
              </div>
              <div className="space-y-2.5">
                {posts.filter((p) => p.likes > 0).sort((a, b) => b.likes - a.likes).slice(0, 3).length === 0 ? (
                  <div className="py-4 text-center text-[10px] font-bold text-slate-400">아직 인기글이 없습니다. 🔥</div>
                ) : (
                  posts.filter((p) => p.likes > 0).sort((a, b) => b.likes - a.likes).slice(0, 3).map((post, idx) => (
                    <div
                      key={post.id}
                      onClick={() => { setActiveSection('community'); setExpandedPostId(post.id); setTimeout(() => { document.getElementById(`post-card-${post.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100); }}
                      className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors flex items-start space-x-2"
                    >
                      <span className="text-xs font-extrabold text-brand-gold-dark dark:text-brand-gold w-4 text-center">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-brand-gold-dark dark:group-hover:text-brand-gold transition-colors truncate">{post.title}</span>
                        <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 mt-0.5">
                          <span>{post.author}</span><span>•</span><span className="text-red-500 font-bold">❤️ {post.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tip Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/80 shadow-premium space-y-2.5 transition-colors duration-300">
            <div className="flex items-center space-x-1.5">
              <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-[8px] font-bold text-brand-gold-dark dark:text-brand-gold border border-brand-gold/30">
                KSU Culture Hub
              </span>
            </div>
            <h4 className="text-[11px] font-black tracking-tight text-slate-800 dark:text-white">다국어 교류를 잘하는 비결 🌐</h4>
            <p className="text-[9.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
              맞춤법과 띄어쓰기를 정확하게 작성하면 AI 번역 정확도가 높아집니다! 외국인 친구들과 서로의 언어·문화를 나눠보세요.
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile Write FAB (community only) */}
      {activeSection === 'community' && (
        <button
          onClick={() => { setIsWriteOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); showToast('상단 글쓰기 폼이 열렸습니다!', 'info'); }}
          className="lg:hidden fixed bottom-20 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-800 text-brand-gold shadow-lg hover:bg-slate-800 hover:text-brand-gold-dark transition-all hover:scale-105 active:scale-95"
          aria-label="글쓰기"
        >
          <PlusCircle size={22} className="stroke-[2.25]" />
        </button>
      )}

      {/* Message / DM Modal */}
      <MessageModal
        isOpen={isMsgModalOpen}
        onClose={() => setIsMsgModalOpen(false)}
        receiverName={msgReceiverName}
        onMessageSent={handleSendMessageSuccess}
      />

      {/* MyPage Modal */}
      <MyPageModal
        isOpen={isMyPageOpen}
        onClose={() => setIsMyPageOpen(false)}
        user={user}
        setUser={setUser}
        posts={posts}
        sentMessages={sentMessages}
        receivedMessages={receivedMessages}
        onReplyMessage={handleReplyMessage}
        onPostClick={handlePostClickFocus}
        onWithdrawal={handleWithdrawal}
        showToast={showToast}
      />

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={isAppDownloadOpen}
        onClose={() => setIsAppDownloadOpen(false)}
        apkUrl={import.meta.env.VITE_APK_URL || `${window.location.origin}/ksu-culture-hub.apk`}
      />

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800 py-2 px-2 flex items-center justify-around backdrop-blur-md shadow-lg transition-colors duration-300">
        {[
          { id: 'community', label: '커뮤니티', icon: Globe },
          { id: 'events',    label: '이벤트',   icon: Calendar },
          { id: 'benefits',  label: '혜택',     icon: Gift },
          { id: 'partners',  label: '파트너',   icon: Handshake },
        ].map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-brand-gold-dark dark:text-brand-gold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <Icon size={18} className="stroke-[2.25]" />
              <span className={`text-[8px] font-bold mt-0.5 ${isActive ? 'text-brand-gold-dark dark:text-brand-gold' : ''}`}>{label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-brand-gold mt-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
