import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CategoryTabs from './components/CategoryTabs';
import PostCard from './components/PostCard';
import CommentSection from './components/CommentSection';
import MessageModal from './components/MessageModal';
import { api, INITIAL_POSTS, INITIAL_COMMENTS } from './services/api';
import { PlusCircle, Globe, Flame, Languages, Sparkles, Send, CheckCircle2, Sun, Moon } from 'lucide-react';
import { LoginView, SignUpView, ForgotAccountView } from './components/AuthComponents';
import MyPageModal from './components/MyPageModal';

export default function App() {
  // App States
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [commentsMap, setCommentsMap] = useState(INITIAL_COMMENTS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedPostId, setExpandedPostId] = useState(1); // Keep first post expanded by default for demo
  
  // Theme State (Dark / Light)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Authentication states (new in 2nd scope)
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup' | 'forgot'
  
  // Translation Cache State
  const [postCache, setPostCache] = useState({});
  const [commentCache, setCommentCache] = useState({});

  // Message Modal States
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [msgReceiverName, setMsgReceiverName] = useState('');

  // Everytime-style accordion Write Form
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeCategory, setWriteCategory] = useState('free');
  const [writeLang, setWriteLang] = useState('ko');

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Sent Message Records (For MyPage tab)
  const [sentMessages, setSentMessages] = useState([
    { id: 1, receiverName: "익명 1", content: "안녕하세요! 공모전 팀원 구인글 보고 연락드립니다.", time: "1시간 전" },
    { id: 2, receiverName: "익명 2", content: "안녕하세요. 언어 교환 관심있어서 쪽지 보냅니다!", time: "어제" }
  ]);

  // MyPage Open state
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);

  // Handle DM Send Success from MessageModal
  const handleSendMessageSuccess = (messageText) => {
    const newMsg = {
      id: Date.now(),
      receiverName: msgReceiverName,
      content: messageText,
      time: "방금 전"
    };
    setSentMessages(prev => [newMsg, ...prev]);
    showToast(`${msgReceiverName} 님에게 쪽지를 성공적으로 전송했습니다!`, "success");
  };

  // Handle Post Click Focus from MyPage
  const handlePostClickFocus = (postId) => {
    setExpandedPostId(postId);
    setTimeout(() => {
      const element = document.getElementById(`post-card-${postId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary subtle golden glow effect to emphasize the post
        element.classList.add('ring-4', 'ring-brand-gold/40');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-brand-gold/40');
        }, 1500);
      }
    }, 150);
  };

  // Handle Membership Withdrawal
  const handleWithdrawal = () => {
    setIsMyPageOpen(false);
    setUser(null);
    setAuthView('login');
    showToast("회원 탈퇴가 정상적으로 완료되었습니다. 이용해 주셔서 감사합니다.", "success");
  };

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Auto-hide Toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // 1. Post Caching Handlers
  const handleCachePostTranslation = (postId, data) => {
    setPostCache((prev) => ({
      ...prev,
      [postId]: data
    }));
    showToast("글 번역 데이터가 성공적으로 처리되었습니다.", "success");
  };

  const handleCacheCommentTranslation = (commentId, data) => {
    setCommentCache((prev) => ({
      ...prev,
      [commentId]: data
    }));
    showToast("댓글 번역 데이터가 성공적으로 처리되었습니다.", "success");
  };

  // 2. Delete Post
  const handlePostDelete = async (postId) => {
    try {
      showToast("게시글 삭제 중...", "info");
      const result = await api.deletePost(postId);
      if (result.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        if (expandedPostId === postId) {
          setExpandedPostId(null);
        }
        showToast(result.message, "success");
      }
    } catch (err) {
      showToast("게시글 삭제에 실패했습니다.", "error");
    }
  };

  // 3. Delete Comment
  const handleCommentDelete = async (commentId) => {
    try {
      showToast("댓글 삭제 중...", "info");
      const result = await api.deleteComment(commentId);
      if (result.success) {
        // Find which post this comment belongs to
        let targetPostId = null;
        const newCommentsMap = { ...commentsMap };
        
        for (const postId in newCommentsMap) {
          const index = newCommentsMap[postId].findIndex(c => c.id === commentId);
          if (index !== -1) {
            newCommentsMap[postId] = newCommentsMap[postId].filter(c => c.id !== commentId);
            targetPostId = Number(postId);
            break;
          }
        }

        setCommentsMap(newCommentsMap);

        // Update comment counter inside corresponding post
        if (targetPostId) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === targetPostId
                ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) }
                : p
            )
          );
        }

        showToast(result.message, "success");
      }
    } catch (err) {
      showToast("댓글 삭제에 실패했습니다.", "error");
    }
  };

  // 4. Add Comment
  const handleCommentAdd = (postId, content, isAnonymous) => {
    const newCommentId = Date.now();
    const newComment = {
      id: newCommentId,
      author: isAnonymous 
        ? `익명 ${commentsMap[postId] ? commentsMap[postId].length + 1 : 1}` 
        : (user ? user.nickname : "익명 (나)"),
      authorId: user ? user.username : "user_101",
      isSelf: true,
      time: "방금 전",
      content,
      lang: "ko", // Default language for newly written content
      likes: 0
    };

    // Pre-cache Korean mock translation (original and translated are identical for demo)
    setCommentCache((prev) => ({
      ...prev,
      [newCommentId]: {
        translatedContent: `[Translation from KO] ${content}`
      }
    }));

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      )
    );

    showToast("댓글이 성공적으로 등록되었습니다!");
  };

  // 5. Toggle Like
  const handleLikeToggle = (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const liked = !p.liked;
          return {
            ...p,
            liked,
            likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1)
          };
        }
        return p;
      })
    );
  };

  // 6. DM Trigger
  const handleSendMessageTrigger = (receiverName) => {
    setMsgReceiverName(receiverName);
    setIsMsgModalOpen(true);
  };

  // 7. Post Creation (Simulated form submission)
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!writeTitle.trim() || !writeContent.trim()) return;

    const newPostId = Date.now();
    const newPost = {
      id: newPostId,
      category: writeCategory,
      author: user ? user.nickname : "익명 (작성자)",
      authorId: user ? user.username : "user_101",
      isSelf: true,
      time: "방금 전",
      title: writeTitle,
      content: writeContent,
      likes: 0,
      commentsCount: 0,
      liked: false,
      lang: writeLang,
      translatedTitle: `[Translation from ${writeLang.toUpperCase()}] ${writeTitle}`,
      translatedContent: `[Translation from ${writeLang.toUpperCase()}] ${writeContent}`
    };

    // Setup cache for newly created post
    setPostCache((prev) => ({
      ...prev,
      [newPostId]: {
        translatedTitle: `[번역] ${writeTitle} (Original: ${writeLang.toUpperCase()})`,
        translatedContent: `[실시간 번역 본문]: ${writeContent}`
      }
    }));

    setPosts([newPost, ...posts]);
    setCommentsMap((prev) => ({ ...prev, [newPostId]: [] }));
    setExpandedPostId(newPostId); // Expand the newly created post
    
    // Clear Write state
    setWriteTitle('');
    setWriteContent('');
    setIsWriteOpen(false);
    showToast("새로운 다국어 게시글이 등록되었습니다!");
  };

  // Filtering Logic
  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  // --- RENDERING ROUTE PATHS ---

  // 1. NON-LOGGED-IN VIEW (Premium Split Dashboard Landing Page with Dynamic Light/Dark Theme)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex md:flex-row flex-col relative overflow-hidden font-sans transition-colors duration-300">
        {/* Floating Premium Theme Toggle Capsule (Top Right) */}
        <div className="absolute top-6 right-6 z-50 flex items-center">
          <button
            onClick={handleToggleDarkMode}
            title={darkMode ? "화이트 모드로 전환" : "다크 모드로 전환"}
            className="flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-[10px] font-black transition-all active:scale-95 border bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-md hover:border-brand-gold dark:hover:border-brand-gold/60"
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
        </div>

        {/* Sparkles background decor */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Global Toast Banner for Auth Viewports */}
        {toast.show && (
          <div className="fixed top-6 left-4 right-4 z-50 flex items-center justify-center fade-in">
            <div className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold text-white flex items-center space-x-2 ${
              toast.type === 'success' ? 'bg-slate-900/90 border-brand-gold text-brand-yellow backdrop-blur-md dark:bg-slate-950/90' :
              toast.type === 'info' ? 'bg-slate-850 border-slate-700' : 'bg-red-500 border-red-600'
            }`}>
              <Sparkles size={13} className="text-brand-gold animate-spin" />
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Left column: Branding (Desktop only) */}
        <div className="hidden md:flex md:w-[50%] lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-r border-slate-200/60 dark:border-slate-800/80 text-slate-800 dark:text-white select-none transition-colors duration-300">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold text-slate-900 shadow-lg shadow-brand-gold/25 font-black text-xl">
              G
            </div>
            <span className="font-sans text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              Glo<span className="text-brand-gold-dark">Culture</span>
            </span>
          </div>

          <div className="my-auto max-w-xl space-y-6 relative z-10">
            <div className="inline-flex items-center space-x-2 rounded-full bg-brand-gold/10 px-3.5 py-1 text-xs font-bold text-brand-gold-dark border border-brand-gold/20">
              <Globe size={13} className="animate-spin text-brand-gold-dark" />
              <span>실시간 다국어 번역 지원 캠퍼스 커뮤니티</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-850 dark:text-white">
              국내 대학생과 유학생을<br />
              하나로 잇는 <span className="text-brand-gold-dark">글로컬쳐</span>
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
              언어의 장벽을 뛰어넘어 전 세계 캠퍼스 친구들과 자유롭게 소통하세요. 작성하는 모든 게시물과 댓글은 인공지능이 모국어로 실시간 번역해 드립니다!
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
                <span className="block text-2xl font-black text-brand-gold-dark mb-1">100%</span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">실시간 다국어 AI 자동번역</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
                <span className="block text-2xl font-black text-brand-gold-dark mb-1">Safe</span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">학교 이메일 기반 안심 커뮤니티</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">
            &copy; 2026 GloCulture Inc. All rights reserved.
          </div>

          {/* Floating backdrop globe */}
          <div className="absolute right-[-100px] bottom-[-100px] text-slate-200/30 dark:text-slate-800/10 pointer-events-none opacity-30">
            <Globe size={380} />
          </div>
        </div>

        {/* Right column: Auth Forms (Desktop & Mobile) */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 dark:bg-slate-950 relative md:w-[50%] lg:w-[45%] min-h-screen transition-colors duration-300">
          {/* Header (Only for Brand identity on mobile screen) */}
          <div className="md:hidden w-full max-w-md flex items-center justify-between mb-8 select-none">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold text-slate-900 shadow-md shadow-brand-gold/20 font-black">
                G
              </div>
              <span className="font-sans text-lg font-bold text-slate-800 dark:text-slate-100">
                Glo<span className="text-brand-gold-dark">Culture</span>
              </span>
            </div>
          </div>

          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-2xl p-2 sm:p-4 overflow-hidden relative flex flex-col transition-all duration-300">
            <div className="overflow-y-auto no-scrollbar flex-1 max-h-[85vh]">
              {authView === 'login' && (
                <LoginView
                  onLoginSuccess={(userData) => setUser(userData)}
                  onNavigateToSignUp={() => setAuthView('signup')}
                  onNavigateToForgot={() => setAuthView('forgot')}
                  showToast={showToast}
                />
              )}
              {authView === 'signup' && (
                <SignUpView
                  onNavigateToLogin={() => setAuthView('login')}
                  showToast={showToast}
                />
              )}
              {authView === 'forgot' && (
                <ForgotAccountView
                  onNavigateToLogin={() => setAuthView('login')}
                  showToast={showToast}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. LOGGED-IN VIEW (Full Desktop Dashboard Layout with Mobile Responsiveness)
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-x-hidden font-sans pb-16 lg:pb-0 transition-colors duration-300">
      {/* Visual background sparkles decor (premium aesthetic) */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Global Toast Banner */}
      {toast.show && (
        <div className="fixed top-6 left-4 right-4 z-50 flex items-center justify-center fade-in">
          <div className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold text-white flex items-center space-x-2 ${
            toast.type === 'success' ? 'bg-slate-900/90 border-brand-gold text-brand-yellow backdrop-blur-md dark:bg-slate-950/90' :
            toast.type === 'info' ? 'bg-slate-800/90 border-slate-700' : 'bg-red-500 border-red-600'
          }`}>
            <Sparkles size={13} className="text-brand-gold animate-spin" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header Component (spans full-width, centered inner content) */}
      <Header 
        onSearchClick={() => showToast("검색 기능은 개발 중입니다! 🔍")}
        onBellClick={() => showToast("새 알림이 없습니다. 🔔")}
        user={user}
        onLogout={() => {
          setUser(null);
          setAuthView('login');
          showToast("로그아웃 되었습니다.");
        }}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col lg:grid lg:grid-cols-12 lg:gap-6">
        
        {/* Left Sidebar: Categories (Desktop Only) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/80 shadow-premium sticky top-24 transition-colors duration-300">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 pl-1">
              카테고리 메뉴
            </h3>
            
            <div className="space-y-1">
              {[
                { id: 'all', name: '전체 피드' },
                { id: 'contest', name: '공모전 팀원모집' },
                { id: 'free', name: '자유게시판' },
                { id: 'exchange', name: '언어교환/일상' },
              ].map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      const postsInCat = cat.id === 'all' ? posts : posts.filter(p => p.category === cat.id);
                      if (!postsInCat.some(p => p.id === expandedPostId)) {
                        setExpandedPostId(postsInCat[0]?.id || null);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-brand-gold text-slate-900 shadow-md shadow-brand-gold/15'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-slate-900' : 'bg-slate-300 dark:bg-slate-700'}`}></span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center Content: Feed List */}
        <main className="col-span-12 lg:col-span-6 space-y-3.5">
          
          {/* Mobile Category Scroll (Mobile Only) */}
          <div className="lg:hidden">
            <CategoryTabs 
              activeCategory={activeCategory} 
              onCategoryChange={(cat) => {
                setActiveCategory(cat);
                const postsInCat = cat === 'all' ? posts : posts.filter(p => p.category === cat);
                if (!postsInCat.some(p => p.id === expandedPostId)) {
                  setExpandedPostId(postsInCat[0]?.id || null);
                }
              }}
            />
          </div>

          {/* Welcome Banner Card */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-5 text-white shadow-premium relative overflow-hidden select-none border border-slate-800/80">
            <div className="relative z-10">
              <div className="flex items-center space-x-1.5">
                <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-[9px] font-bold text-brand-gold border border-brand-gold/30">
                  Global Feed
                </span>
                <span className="text-[10px] text-slate-300 font-semibold flex items-center">
                  <Globe size={10} className="mr-1 animate-pulse" />
                  실시간 다국어 지원 피드
                </span>
              </div>
              <h3 className="mt-2 text-xs font-black tracking-tight text-white sm:text-sm">
                유학생 친구들과 자유롭게 소통하세요!
              </h3>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-300 font-medium">
                게시글 아래 <span className="text-brand-gold font-bold">🌐 번역하기 / Translate</span> 버튼을 누르면 인공지능이 즉시 여러분의 모국어로 번역해 줍니다!
              </p>
            </div>
            {/* Transparent decorative background logo */}
            <div className="absolute right-[-20px] bottom-[-20px] text-slate-700/20 opacity-30 select-none pointer-events-none">
              <Globe size={110} />
            </div>
          </div>

          {/* 3. EVERYTIME-STYLE ACCORDION WRITE FORM */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-premium overflow-hidden transition-all duration-300">
            {!isWriteOpen ? (
              <div 
                onClick={() => setIsWriteOpen(true)}
                className="p-3.5 flex items-center justify-between cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 select-none"
              >
                <span className="text-xs font-bold pl-1">새 글을 작성해 보세요... (다국어 실시간 지원)</span>
                <PlusCircle size={18} className="text-brand-gold-dark dark:text-brand-gold animate-bounce" />
              </div>
            ) : (
              <form onSubmit={handleCreatePost} className="p-4 space-y-3.5 fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-black text-slate-800 dark:text-white">새 교류글 올리기 ✍️</span>
                  <button
                    type="button"
                    onClick={() => setIsWriteOpen(false)}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    취소
                  </button>
                </div>

                {/* Category & Language Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1">카테고리</label>
                    <select
                      value={writeCategory}
                      onChange={(e) => setWriteCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-gold"
                    >
                      <option value="contest">공모전 팀원모집</option>
                      <option value="free">자유게시판</option>
                      <option value="exchange">언어교환/일상</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1">작성 언어</label>
                    <select
                      value={writeLang}
                      onChange={(e) => setWriteLang(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-gold"
                    >
                      <option value="ko">한국어 (KO)</option>
                      <option value="en">English (EN)</option>
                      <option value="zh">中文 (ZH)</option>
                      <option value="vi">Tiếng Việt (VI)</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <input
                    type="text"
                    required
                    value={writeTitle}
                    onChange={(e) => setWriteTitle(e.target.value)}
                    placeholder="제목을 입력하세요..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  />
                </div>

                {/* Content */}
                <div>
                  <textarea
                    required
                    value={writeContent}
                    onChange={(e) => setWriteContent(e.target.value)}
                    rows={4}
                    placeholder="내용을 입력하세요. 외국인 친구들도 실시간 번역을 통해 이 글을 볼 수 있습니다."
                    className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-gold py-2.5 text-xs font-bold text-slate-900 shadow-md shadow-brand-gold/15 hover:bg-brand-gold-dark active:scale-[0.99] transition-all"
                >
                  게시글 등록하기
                </button>
              </form>
            )}
          </div>

          {/* Posts Feed */}
          {filteredPosts.length === 0 ? (
            <div className="py-20 text-center text-xs font-medium text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-8 shadow-premium">
              선택한 카테고리에 등록된 게시글이 없습니다.<br />첫 소통글을 직접 등록해 보세요! ✍️
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

                  {/* Expanded Comment View Container */}
                  {isExpanded && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/80 shadow-premium transition-all duration-300 transform scale-[0.99] origin-top">
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
        </main>

        {/* Right Sidebar: Profile & Tips Widgets (Desktop Only) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          
          {/* 1. User Profile Widget - Clickable to open MyPage */}
          <div 
            onClick={() => setIsMyPageOpen(true)}
            title="마이페이지 열기 ⚙️"
            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/80 shadow-premium hover:shadow-premium-hover hover:border-brand-gold/45 text-center space-y-3.5 transition-all duration-300"
          >
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-brand-gold/10 text-brand-gold-dark flex items-center justify-center font-black text-lg mb-2.5 border border-brand-gold/30 group-hover:scale-105 group-hover:bg-brand-gold/20 transition-all duration-300">
                {user?.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}
              </div>
              <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center justify-center space-x-1">
                <span>{user?.nickname}</span>
                <span className="text-[9px] font-black text-brand-gold-dark dark:text-brand-gold/90 bg-brand-gold/15 px-1.5 py-0.5 rounded ml-1 group-hover:bg-brand-gold/30 transition-all">⚙️ 마이페이지</span>
              </h4>
              <span className="text-[9.5px] font-bold text-slate-400 mt-0.5">{user?.email || 'student@school.ac.kr'}</span>
              <span className="mt-2 inline-flex items-center space-x-1 rounded-full bg-green-50 dark:bg-green-950/20 px-2 py-0.5 text-[8.5px] font-bold text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/50">
                <CheckCircle2 size={9} />
                <span>학교 인증완료</span>
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Avoid triggering MyPage modal open
                setUser(null);
                setAuthView('login');
                showToast("로그아웃 되었습니다.");
              }}
              className="w-full rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors"
            >
              로그아웃 (Logout)
            </button>
          </div>

          {/* 2. HOT 게시물 위젯 (Everytime Style 인기글) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/80 shadow-premium space-y-3 transition-colors duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5">
                <Flame size={14} className="text-red-500 fill-current animate-pulse" />
                <h4 className="text-xs font-black tracking-tight text-slate-800 dark:text-white">HOT 인기글</h4>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Realtime</span>
            </div>
            
            <div className="space-y-2.5">
              {posts.filter(p => p.likes > 0).sort((a, b) => b.likes - a.likes).slice(0, 3).length === 0 ? (
                <div className="py-4 text-center text-[10px] font-bold text-slate-400">
                  아직 공감받은 인기글이 없습니다. 🔥
                </div>
              ) : (
                posts
                  .filter(p => p.likes > 0)
                  .sort((a, b) => b.likes - a.likes)
                  .slice(0, 3)
                  .map((post, idx) => (
                    <div 
                      key={post.id}
                      onClick={() => {
                        setExpandedPostId(post.id);
                        setTimeout(() => {
                          const element = document.getElementById(`post-card-${post.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 100);
                      }}
                      className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors flex items-start space-x-2"
                    >
                      <span className="text-xs font-extrabold text-brand-gold-dark dark:text-brand-gold w-4 text-center">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-brand-gold-dark dark:group-hover:text-brand-gold transition-colors truncate">
                          {post.title}
                        </span>
                        <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 mt-0.5">
                          <span>{post.author}</span>
                          <span>•</span>
                          <span className="text-red-500 font-bold">❤️ {post.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* 3. GloCulture Exchange Tip Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/80 shadow-premium space-y-2.5 transition-colors duration-300">
            <div className="flex items-center space-x-1.5">
              <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-[8px] font-bold text-brand-gold-dark dark:text-brand-gold border border-brand-gold/30">
                GloCulture Tip
              </span>
            </div>
            <h4 className="text-[11px] font-black tracking-tight text-slate-800 dark:text-white">다국어 교류를 잘하는 비결 🌐</h4>
            <p className="text-[9.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
              글을 쓸 때 맞춤법과 띄어쓰기를 정확하게 작성해 주시면 AI 번역의 정확도가 훨씬 높아집니다! 외국인 친구들과 서로의 언어와 문화를 나누어 보세요.
            </p>
          </div>
        </aside>

      </div>

      {/* Floating Write Action Button (Only visible on mobile screens since desktop has inline form) */}
      <button
        onClick={() => {
          setIsWriteOpen(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showToast("상단 글쓰기 폼이 열렸습니다!", "info");
        }}
        className="lg:hidden fixed bottom-20 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-850 text-brand-gold shadow-lg shadow-slate-900/30 dark:shadow-black/50 hover:bg-slate-800 hover:text-brand-gold-dark transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Write post"
      >
        <PlusCircle size={22} className="stroke-[2.25]" />
      </button>

      {/* Message / DM Slide-up Modal */}
      <MessageModal
        isOpen={isMsgModalOpen}
        onClose={() => setIsMsgModalOpen(false)}
        receiverName={msgReceiverName}
        onMessageSent={handleSendMessageSuccess}
      />

      {/* Premium MyPage Modal */}
      <MyPageModal
        isOpen={isMyPageOpen}
        onClose={() => setIsMyPageOpen(false)}
        user={user}
        posts={posts}
        sentMessages={sentMessages}
        onPostClick={handlePostClickFocus}
        onWithdrawal={handleWithdrawal}
      />
      
      {/* Premium Bottom navigation bar (Fixed at bottom only on mobile/tablet) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800 py-3 px-6 flex items-center justify-between backdrop-blur-md shadow-lg transition-colors duration-300">
        <div className="flex flex-col items-center cursor-pointer text-brand-gold-dark dark:text-brand-gold">
          <Globe size={18} className="stroke-[2.25]" />
          <span className="text-[8px] font-bold mt-1">커뮤니티</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors" onClick={() => showToast("동아리 정보 서비스 준비 중입니다. ✈️")}>
          <Sparkles size={18} />
          <span className="text-[8px] font-bold mt-1">캠퍼스 라이프</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors" onClick={() => showToast("쪽지함 서비스 준비 중입니다. ✉️")}>
          <Send size={18} />
          <span className="text-[8px] font-bold mt-1">쪽지함</span>
        </div>
      </div>

    </div>
  );
}
