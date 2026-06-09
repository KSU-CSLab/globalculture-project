import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import MessageModal from './MessageModal';
import MyPageModal from './MyPageModal';
import AppDownloadModal from './AppDownloadModal';
import CategoryTabs from './CategoryTabs';
import { useAppContext } from '../context/AppContext';
import {
  Globe, Calendar, Gift, Handshake, CheckCircle2,
  Smartphone, Activity, Wifi, WifiOff, Flame, Sparkles
} from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user, setUser,
    isAppDownloadOpen, setIsAppDownloadOpen,
    posts,
    expandedPostId, setExpandedPostId,
    activeCategory, setActiveCategory,
    isMsgModalOpen, setIsMsgModalOpen,
    msgReceiverName,
    sentMessages,
    receivedMessages,
    isMyPageOpen, setIsMyPageOpen,
    darkMode,
    toast,
    backendOnline,
    showToast,
    handleToggleDarkMode,
    handleLogout,
    handleWithdrawal,
    handleSendMessageSuccess,
    handleReplyMessage,
    handlePostClickFocus,
  } = useAppContext();

  // Determine active section based on current path
  const currentPath = location.pathname.replace(/^\/+/, '');
  const activeSection = currentPath || 'community';

  // ── Toast Banner ──────────────────────────────────────────────────────────
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
        onSectionChange={(sectionId) => navigate(`/${sectionId}`)}
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
                <span className="block text-xs font-black text-slate-800 dark:text-white truncate">{user?.nickname}</span>
                <span className="block text-[9px] font-bold text-slate-400 truncate">{user?.email}</span>
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
                      onClick={() => navigate(`/${id}`)}
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

            {/* Community categories (only when on community page) */}
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

          {/* Child pages nested in Route */}
          <Outlet />
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
                      onClick={() => {
                        handlePostClickFocus(post.id);
                      }}
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
              onClick={() => navigate(`/${id}`)}
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
