import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi, INITIAL_POSTS, INITIAL_COMMENTS } from '../hooks/useApi';

const AppContext = createContext();

export function AppProvider({ children }) {
  const navigate = useNavigate();
  const api = useApi();

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);

  // ── Community / Posts ─────────────────────────────────────────────────────
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [commentsMap, setCommentsMap] = useState(INITIAL_COMMENTS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedPostId, setExpandedPostId] = useState(1);

  // Write form
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeCategory, setWriteCategory] = useState('free');
  const [writeLang, setWriteLang] = useState('ko');

  // Translation caches
  const [postCache, setPostCache] = useState({});
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
  const [backendOnline, setBackendOnline] = useState(null);

  // ─── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast((p) => ({ ...p, show: false })), 3500);
    return () => clearTimeout(t);
  }, [toast.show]);

  useEffect(() => {
    api.healthCheck()
      .then((data) => setBackendOnline(data?.status === 'ok' || true))
      .catch(() => setBackendOnline(false));
  }, []);

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

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    navigate('/community');
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    navigate('/auth/login');
    showToast('로그아웃 되었습니다.');
  };

  const handleWithdrawal = () => {
    setIsMyPageOpen(false);
    setUser(null);
    navigate('/auth/login');
    showToast('회원 탈퇴가 완료되었습니다.', 'success');
  };

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
          const idx = newMap[postId].findIndex((c) => (c.id || c._id) === commentId);
          if (idx !== -1) {
            newMap[postId] = newMap[postId].filter((c) => (c.id || c._id) !== commentId);
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
    setIsMyPageOpen(false);
    setMsgReceiverName(senderName);
    setIsMsgModalOpen(true);
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
      await api.createPost({
        title: writeTitle,
        content: writeContent,
        category: writeCategory,
        lang: writeLang,
      });
    } catch { }

    setPosts([newPost, ...posts]);
    setCommentsMap((p) => ({ ...p, [newPost.id]: [] }));
    setExpandedPostId(newPost.id);
    setWriteTitle('');
    setWriteContent('');
    setIsWriteOpen(false);
    showToast('게시글이 등록되었습니다!');
  };

  const handlePostClickFocus = (postId) => {
    navigate('/community');
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

  return (
    <AppContext.Provider
      value={{
        user, setUser,
        isAppDownloadOpen, setIsAppDownloadOpen,
        posts, setPosts,
        commentsMap, setCommentsMap,
        activeCategory, setActiveCategory,
        expandedPostId, setExpandedPostId,
        isWriteOpen, setIsWriteOpen,
        writeTitle, setWriteTitle,
        writeContent, setWriteContent,
        writeCategory, setWriteCategory,
        writeLang, setWriteLang,
        postCache, setPostCache,
        commentCache, setCommentCache,
        isMsgModalOpen, setIsMsgModalOpen,
        msgReceiverName, setMsgReceiverName,
        sentMessages, setSentMessages,
        receivedMessages, setReceivedMessages,
        isMyPageOpen, setIsMyPageOpen,
        darkMode, setDarkMode,
        toast, setToast,
        backendOnline, setBackendOnline,
        showToast,
        handleToggleDarkMode,
        handleLoginSuccess,
        handleLogout,
        handleWithdrawal,
        handleCachePostTranslation,
        handleCacheCommentTranslation,
        handlePostDelete,
        handleCommentDelete,
        handleCommentAdd,
        handleLikeToggle,
        handleSendMessageTrigger,
        handleSendMessageSuccess,
        handleReplyMessage,
        handleCreatePost,
        handlePostClickFocus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
