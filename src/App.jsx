import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import CategoryTabs from "./components/CategoryTabs";
import PostCard from "./components/PostCard";
import { ComposeModal, InlineComposer } from "./components/ComposeModal";
import PopularPosts from "./components/PopularPosts";
import Auth from "./components/Auth";
import MyPage from "./components/MyPage";
import Messages, { ComposeMessageModal } from "./components/Messages";
import { mockPostsData } from "./data/mockPosts";
import {
  Globe,
  Flame,
  Heart,
  MessageSquare,
  User,
  LogOut,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Smartphone
} from "lucide-react";

export default function App() {
  // 1. Authentication & Users States
  const [currentUser, setCurrentUser] = useState(null); // null if guest
  const [currentView, setCurrentView] = useState("feed"); // "feed" | "mypage" | "messages"
  const [registeredUsers, setRegisteredUsers] = useState([
    {
      id: "glocal",
      password: "password123",
      nickname: "글로컬마스터",
      email: "glocal@univ.ac.kr"
    }
  ]);

  // 2. Feed States
  const [posts, setPosts] = useState(() => {
    return mockPostsData.map((post) => ({
      ...post,
      isLiked: false,
    }));
  });

  const [activeCategory, setActiveCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [targetLangOverride, setTargetLangOverride] = useState("ko");

  // 3. Messages (쪽지) State
  // Thread shape: { id, participants: [nicknameA, nicknameB], messages: [{ id, from, to, content, sentAt, read }] }
  const [messageThreads, setMessageThreads] = useState([]);
  const [composeTarget, setComposeTarget] = useState(null); // nickname string → opens ComposeMessageModal
  const [initialMsgRecipient, setInitialMsgRecipient] = useState(null); // auto-selects thread in Messages view

  const browserLanguage = typeof navigator !== "undefined" ? navigator.language : "ko-KR";

  // ── Toast ──────────────────────────────────────────────────────────────────
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // ── Auth Callbacks ─────────────────────────────────────────────────────────
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView("feed");
    triggerToast(`🔑 반갑습니다, ${user.nickname}님! 성공적으로 로그인되었습니다.`);
  };

  const handleRegisterUser = (newUser) => {
    setRegisteredUsers((prev) => [...prev, newUser]);
  };

  const handleResetPassword = (userId, newPassword) => {
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPassword } : u))
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView("feed");
    setSearchQuery("");
    triggerToast("🔓 안전하게 로그아웃되었습니다.");
  };

  // ── Nickname Sync ──────────────────────────────────────────────────────────
  const handleUpdateNickname = (newNickname) => {
    const isDuplicate = registeredUsers.some(
      (user) => user.nickname.toLowerCase() === newNickname.toLowerCase() && user.id !== currentUser.id
    );
    if (isDuplicate) return false;

    const oldNickname = currentUser.nickname;

    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, nickname: newNickname } : u))
    );
    setCurrentUser((prev) => ({ ...prev, nickname: newNickname }));
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        const updatedPost = { ...post };
        if (post.author === oldNickname) updatedPost.author = newNickname;
        if (post.comments?.length > 0) {
          updatedPost.comments = post.comments.map((c) =>
            c.author === oldNickname ? { ...c, author: newNickname } : c
          );
        }
        return updatedPost;
      })
    );
    // Also update message threads participant names
    setMessageThreads((prev) =>
      prev.map((t) => ({
        ...t,
        participants: t.participants.map((p) => (p === oldNickname ? newNickname : p)),
        messages: t.messages.map((m) => ({
          ...m,
          from: m.from === oldNickname ? newNickname : m.from,
          to: m.to === oldNickname ? newNickname : m.to,
        })),
      }))
    );
    return true;
  };

  // ── Account Deactivation ───────────────────────────────────────────────────
  const handleDeactivateAccount = (passwordConfirm) => {
    const userRecord = registeredUsers.find((u) => u.id === currentUser.id);
    if (!userRecord || userRecord.password !== passwordConfirm) return false;

    const oldNickname = currentUser.nickname;

    setRegisteredUsers((prev) => prev.filter((u) => u.id !== currentUser.id));
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        const updatedPost = { ...post };
        if (post.author === oldNickname) updatedPost.author = "(탈퇴한 회원)";
        if (post.comments?.length > 0) {
          updatedPost.comments = post.comments.map((c) =>
            c.author === oldNickname ? { ...c, author: "(탈퇴한 회원)" } : c
          );
        }
        return updatedPost;
      })
    );

    setCurrentUser(null);
    setCurrentView("feed");
    triggerToast("💔 계정이 안전하게 회원탈퇴 처리되었습니다. 이용해 주셔서 감사합니다.");
    return true;
  };

  // ── Feed Helpers ───────────────────────────────────────────────────────────
  const handleGoToPost = (postId) => {
    setCurrentView("feed");
    setTimeout(() => {
      const element = document.getElementById(`post-card-${postId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-2", "ring-everytime-red", "ring-offset-2", "rounded-xl");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-everytime-red", "ring-offset-2", "rounded-xl");
        }, 2500);
      }
    }, 150);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSearchQuery("");
    setCurrentView("feed");
  };

  const handleLikeToggle = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newLikeState = !post.isLiked;
          if (newLikeState) triggerToast("❤️ 이 게시글을 공감했습니다!");
          return { ...post, isLiked: newLikeState, likes: newLikeState ? post.likes + 1 : post.likes - 1 };
        }
        return post;
      })
    );
  };

  const handleAddPost = (newPost) => {
    const personalizedPost = { ...newPost, author: currentUser.nickname, isAnonymous: false };
    setPosts([personalizedPost, ...posts]);
    triggerToast("📝 새로운 게시글이 등록되었습니다!");
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    triggerToast("🗑️ 게시글이 삭제되었습니다.");
  };

  const handleDeleteComment = (postId, commentId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: post.comments.filter((c) => c.id !== commentId),
        };
      })
    );
    triggerToast("🗑️ 댓글이 삭제되었습니다.");
  };

  const handleAddComment = (postId, newComment) => {
    const personalizedComment = { ...newComment, author: currentUser.nickname };
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          triggerToast("💬 댓글이 등록되었습니다!");
          return { ...post, comments: [...post.comments, personalizedComment] };
        }
        return post;
      })
    );
  };

  const handleResetFeed = () => {
    setPosts(mockPostsData.map((post) => ({ ...post, isLiked: false })));
    triggerToast("🔄 게시판이 초기 데이터로 재설정되었습니다.");
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === "전체" || post.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ── Messages (쪽지) Handlers ───────────────────────────────────────────────

  /** Called from PostCard/CommentList when user clicks a nickname */
  const handleOpenCompose = (recipientNickname) => {
    if (!currentUser) return;
    if (recipientNickname === currentUser.nickname) {
      triggerToast("⚠️ 자기 자신에게는 쪽지를 보낼 수 없습니다.");
      return;
    }
    setComposeTarget(recipientNickname);
  };

  /** Called from ComposeMessageModal to actually send */
  const handleSendFromModal = (content) => {
    if (!composeTarget || !currentUser) return;
    const recipient = composeTarget;

    setMessageThreads((prev) => {
      // Find existing thread between the two
      const existing = prev.find(
        (t) => t.participants.includes(currentUser.nickname) && t.participants.includes(recipient)
      );
      const newMsg = {
        id: Date.now(),
        from: currentUser.nickname,
        to: recipient,
        content,
        sentAt: new Date().toISOString(),
        read: false,
      };

      if (existing) {
        return prev.map((t) =>
          t.id === existing.id ? { ...t, messages: [...t.messages, newMsg] } : t
        );
      } else {
        return [
          ...prev,
          {
            id: `thread-${Date.now()}`,
            participants: [currentUser.nickname, recipient],
            messages: [newMsg],
          },
        ];
      }
    });

    setComposeTarget(null);
    triggerToast(`✉️ ${recipient}님에게 쪽지를 보냈습니다!`);
  };

  /** Send from the Messages chat view (within thread) */
  const handleSendInThread = (threadId, content) => {
    if (!currentUser) return;

    setMessageThreads((prev) => {
      // Handle new thread creation (threadId starts with "new:")
      if (threadId.startsWith("new:")) {
        const recipient = threadId.replace("new:", "");
        const newMsg = {
          id: Date.now(),
          from: currentUser.nickname,
          to: recipient,
          content,
          sentAt: new Date().toISOString(),
          read: false,
        };
        const newThread = {
          id: `thread-${Date.now()}`,
          participants: [currentUser.nickname, recipient],
          messages: [newMsg],
        };
        return [...prev, newThread];
      }

      return prev.map((t) => {
        if (t.id !== threadId) return t;
        const other = t.participants.find((p) => p !== currentUser.nickname) || "";
        const newMsg = {
          id: Date.now(),
          from: currentUser.nickname,
          to: other,
          content,
          sentAt: new Date().toISOString(),
          read: false,
        };
        return { ...t, messages: [...t.messages, newMsg] };
      });
    });
  };

  const handleDeleteThread = (threadId) => {
    setMessageThreads((prev) => prev.filter((t) => t.id !== threadId));
    triggerToast("🗑️ 대화가 삭제되었습니다.");
  };

  const handleMarkRead = (threadId) => {
    if (!currentUser) return;
    setMessageThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          messages: t.messages.map((m) =>
            m.to === currentUser.nickname && !m.read ? { ...m, read: true } : m
          ),
        };
      })
    );
  };

  // Unread count for header badge
  const totalUnread = messageThreads.reduce((acc, t) => {
    if (!currentUser) return acc;
    return acc + t.messages.filter((m) => !m.read && m.to === currentUser.nickname).length;
  }, 0);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <Auth
        onLoginSuccess={handleLoginSuccess}
        registeredUsers={registeredUsers}
        onRegisterUser={handleRegisterUser}
        onResetPassword={handleResetPassword}
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-everytime-textMain flex flex-col antialiased">

      {/* 1. Top Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onBellClick={() => triggerToast("🔔 새로운 알림이 없습니다.")}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        currentUser={currentUser}
        onProfileClick={() => setCurrentView("mypage")}
        onMessagesClick={() => setCurrentView("messages")}
        unreadCount={totalUnread}
      />

      {/* 2. Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 bg-slate-900 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-2xl z-50 flex items-center gap-2 border border-slate-700 animate-slide-down">
          <span className="w-2 h-2 rounded-full bg-everytime-red animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. Compose Message Modal (triggered from nickname clicks) */}
      {composeTarget && (
        <ComposeMessageModal
          from={currentUser.nickname}
          to={composeTarget}
          onSend={handleSendFromModal}
          onClose={() => setComposeTarget(null)}
        />
      )}

      {/* 4. Main grid */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* === LEFT PANEL === */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-4">

          {/* Profile Card */}
          <div className="bg-white border border-everytime-border rounded-xl p-4 shadow-sm space-y-4">
            <div
              onClick={() => setCurrentView("mypage")}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-100 text-everytime-red flex items-center justify-center font-extrabold text-sm shadow-sm select-none">
                {currentUser.nickname.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-extrabold text-everytime-textMain">{currentUser.nickname}</span>
                <span className="text-[10px] text-everytime-textSub font-bold flex items-center gap-1 select-all">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  {currentUser.email}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center py-2 bg-gray-50/60 rounded-lg border border-gray-100 text-xs font-bold text-everytime-textMain select-none">
              <div
                onClick={() => setCurrentView("mypage")}
                className="border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-all rounded-l-lg py-1"
              >
                <span className="text-[10px] text-everytime-textSub block">내가 쓴 글</span>
                <span>{posts.filter((p) => p.author === currentUser.nickname).length}개</span>
              </div>
              <div
                onClick={() => setCurrentView("messages")}
                className="py-1 cursor-pointer hover:bg-gray-100 transition-all rounded-r-lg relative"
              >
                <span className="text-[10px] text-everytime-textSub block">쪽지함</span>
                <span className="text-everytime-red">
                  {totalUnread > 0 ? `${totalUnread}개 새 쪽지` : "쪽지함"}
                </span>
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-everytime-red text-white text-[9px] font-black flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => setCurrentView("mypage")}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs bg-yellow-50 hover:bg-yellow-100 border border-yellow-100 text-everytime-red rounded-lg transition-colors font-extrabold active:scale-95 shadow-sm"
              >
                ⚙️ 마이페이지 (My Page)
              </button>

              <button
                onClick={() => setCurrentView("messages")}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs bg-yellow-50 hover:bg-yellow-100 border border-yellow-100 text-everytime-red rounded-lg transition-colors font-extrabold active:scale-95 shadow-sm relative"
              >
                ✉️ 쪽지함 (Messages)
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-everytime-red text-white text-[9px] font-black flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </button>

              <button
                onClick={handleResetFeed}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs bg-gray-50 border border-gray-200 hover:bg-gray-100 text-everytime-textMain rounded-lg transition-colors font-bold active:scale-95 shadow-inner"
              >
                🔄 피드 리셋 (Reset)
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs bg-yellow-50 border border-yellow-100 hover:bg-yellow-100 text-everytime-red rounded-lg transition-colors font-extrabold active:scale-95"
              >
                <LogOut size={12} />
                로그아웃 (Logout)
              </button>
            </div>
          </div>

          {/* Boards List */}
          <div className="bg-white border border-everytime-border rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-everytime-textSub border-b border-gray-50 pb-2 flex items-center gap-1.5">
              <TrendingUp size={13} className="text-everytime-red" />
              나의 게시판 채널
            </h3>
            <nav className="flex flex-col gap-1 text-xs">
              {[
                { name: "전체", badge: "All" },
                { name: "공모전 팀원모집", badge: "Team" },
                { name: "자유게시판", badge: "Free" },
                { name: "언어교환/일상", badge: "Talk" }
              ].map((board) => {
                const isActive = activeCategory === board.name;
                return (
                  <button
                    key={board.name}
                    onClick={() => handleCategoryChange(board.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-bold text-left transition-all ${
                      isActive ? "bg-yellow-50 text-everytime-red" : "text-everytime-textMain hover:bg-gray-50"
                    }`}
                  >
                    <span>{board.name}</span>
                    <span className={`text-[9px] py-0.2 px-1.5 rounded uppercase ${isActive ? "bg-everytime-red text-white" : "bg-gray-100 text-gray-400"}`}>
                      {board.badge}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* === CENTER + RIGHT (conditional on view) === */}
        {currentView === "feed" ? (
          <>
            {/* Feed */}
            <main className="col-span-12 lg:col-span-6 flex flex-col gap-1.5 animate-fade-in">
              <div className="hidden lg:flex items-center justify-between px-2.5 py-1 text-xs text-everytime-textSub font-bold select-none">
                <div className="flex items-center gap-1.5">
                  <span>GloKulture</span>
                  <span>&gt;</span>
                  <span>글로컬 교류방</span>
                  <span>&gt;</span>
                  <span className="text-everytime-red">{activeCategory}</span>
                </div>
                {searchQuery && (
                  <span className="bg-yellow-100 text-everytime-red py-0.5 px-2 rounded-full font-bold">
                    "{searchQuery}" 검색 결과
                  </span>
                )}
              </div>

              <div className="lg:hidden">
                <CategoryTabs activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
              </div>

              <div className="hidden lg:block">
                <InlineComposer onAddPost={handleAddPost} />
              </div>

              <div className="space-y-1">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <div id={`post-card-${post.id}`} key={post.id} className="transition-all duration-300">
                      <PostCard
                        post={post}
                        onLikeToggle={handleLikeToggle}
                        onAddComment={handleAddComment}
                        onDeletePost={handleDeletePost}
                        onDeleteComment={handleDeleteComment}
                        currentUser={currentUser}
                        onOpenCompose={handleOpenCompose}
                      />
                    </div>
                  ))
                ) : (
                  <div className="py-12 bg-white rounded-xl border border-everytime-border text-center shadow-sm p-8">
                    <div className="w-14 h-14 bg-gray-50 flex items-center justify-center text-gray-300 rounded-full mx-auto mb-3">
                      <Globe size={24} />
                    </div>
                    <h4 className="text-xs font-bold text-everytime-textMain mb-1">피드에 등록된 글이 없습니다</h4>
                    <p className="text-[10px] text-everytime-textSub max-w-[220px] mx-auto leading-relaxed">
                      선택한 카테고리에 글이 없거나, 다른 검색 키워드로 입력해보세요.
                    </p>
                  </div>
                )}
              </div>
            </main>

            {/* Right Panel */}
            <aside className="lg:col-span-3 hidden lg:flex flex-col gap-4 animate-fade-in">
              <div className="bg-white border border-everytime-border rounded-xl p-4 shadow-sm space-y-4">
                <div className="flex items-center gap-1.5 pb-2.5 border-b border-gray-100">
                  <Sparkles size={16} className="text-blue-500 animate-pulse" />
                  <h3 className="text-xs font-extrabold text-everytime-textMain tracking-tight">AI 글로벌 번역 데스크</h3>
                </div>
                <div className="space-y-3.5 text-xs text-gray-600">
                  <div className="flex flex-col gap-1 py-1 px-2.5 bg-blue-50/50 rounded-lg border border-blue-100/50">
                    <span className="text-[10px] text-everytime-textSub font-bold">감지된 브라우저 언어</span>
                    <span className="font-extrabold text-blue-900 flex items-center gap-1 select-all">
                      🌐 {browserLanguage}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-everytime-textSub font-extrabold flex items-center gap-1">
                      <HelpCircle size={10} /> 기본 번역 타겟 언어 설정
                    </label>
                    <select
                      value={targetLangOverride}
                      onChange={(e) => {
                        setTargetLangOverride(e.target.value);
                        triggerToast(`🗣️ 기본 번역 언어가 ${e.target.value.toUpperCase()}로 변경되었습니다.`);
                      }}
                      className="w-full text-[11px] bg-gray-50 border border-gray-200 text-everytime-textMain py-2 px-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                    >
                      <option value="ko">한국어 (Korean)</option>
                      <option value="en">English (English)</option>
                      <option value="zh">中文 (Chinese)</option>
                      <option value="es">Español (Spanish)</option>
                    </select>
                    <p className="text-[9px] leading-relaxed text-everytime-textSub">
                      번역하기 클릭 시 자동으로 위 언어로 번역됩니다.
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-everytime-textSub hover:text-everytime-red rounded-lg transition-colors font-bold text-[10px] border border-gray-200 flex items-center justify-center gap-1"
                  >
                    <LogOut size={10} /> 로그아웃 (Sign Out)
                  </button>
                </div>
              </div>
              <PopularPosts posts={posts} />
            </aside>
          </>
        ) : currentView === "mypage" ? (
          <main className="col-span-12 lg:col-span-9 flex flex-col animate-fade-in">
            <MyPage
              currentUser={currentUser}
              posts={posts}
              onUpdateNickname={handleUpdateNickname}
              onDeactivateAccount={handleDeactivateAccount}
              onBackToFeed={() => setCurrentView("feed")}
              onGoToPost={handleGoToPost}
              onLikeToggle={handleLikeToggle}
              onAddComment={handleAddComment}
              onDeletePost={handleDeletePost}
              onDeleteComment={handleDeleteComment}
              triggerToast={triggerToast}
            />
          </main>
        ) : (
          /* Messages View */
          <main className="col-span-12 lg:col-span-9 flex flex-col animate-fade-in">
            <Messages
              currentUser={currentUser}
              threads={messageThreads}
              onSendMessage={handleSendInThread}
              onDeleteThread={handleDeleteThread}
              onMarkRead={handleMarkRead}
              onBackToFeed={() => setCurrentView("feed")}
              initialRecipient={initialMsgRecipient}
              onClearInitialRecipient={() => setInitialMsgRecipient(null)}
            />
          </main>
        )}

      </div>

      {/* Mobile FAB */}
      {currentView === "feed" && <ComposeModal onAddPost={handleAddPost} />}

      {/* Footer */}
      <footer className="w-full bg-white border-t border-everytime-border py-4 text-center mt-12 select-none">
        <p className="text-[10px] font-extrabold text-everytime-textSub">
          © 2026 GloKulture 글로컬 소통망 (Glocal Board) 데모 • AI 실시간 자동 번역 프론트엔드
        </p>
      </footer>
    </div>
  );
}
