import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi, INITIAL_POSTS, INITIAL_COMMENTS } from '../hooks/useApi';

const AppContext = createContext();

// relative time formatting helper
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  if (diffMs < 0) return '방금 전';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Post mapper helper
const mapBackendPostToFrontend = (post, currentUser) => {
  const authorName = post.author?.name || '익명';
  const authorId = post.author?._id || post.author || 'guest';
  const isSelf = currentUser && (authorId === currentUser.id);
  const liked = currentUser && post.likes ? post.likes.includes(currentUser.id) : false;

  return {
    id: post._id,
    category: post.category,
    author: authorName,
    authorId: authorId,
    isSelf,
    time: formatTimeAgo(post.createdAt),
    title: post.title,
    content: post.content || '',
    likes: post.likes ? post.likes.length : 0,
    commentsCount: post.comments ? post.comments.length : 0,
    liked,
    lang: post.lang || 'ko',
  };
};

// Comment mapper helper
const mapBackendCommentToFrontend = (comment, currentUser) => {
  const authorId = comment.author?._id || comment.author || 'guest';
  const isSelf = currentUser && (authorId === currentUser.id);

  let authorName = '익명';
  if (!comment.isAnonymous) {
    authorName = comment.author?.name || '익명';
  }

  return {
    id: comment._id,
    author: authorName,
    authorId: authorId,
    isSelf,
    time: formatTimeAgo(comment.createdAt),
    content: comment.content,
    lang: comment.lang || 'ko',
  };
};

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
  const [expandedPostId, setExpandedPostId] = useState(null);

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

  // Restore user session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('ksu_access_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('ksu_access_token');
            localStorage.removeItem('ksu_refresh_token');
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          localStorage.removeItem('ksu_access_token');
          localStorage.removeItem('ksu_refresh_token');
        }
      }
    };
    restoreSession();
  }, [api]);

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      const res = await api.getPosts({ limit: 100 });
      if (res.success && res.posts) {
        const mapped = res.posts.map(p => mapBackendPostToFrontend(p, user));
        setPosts(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  // Fetch full post details when expanded
  useEffect(() => {
    if (!expandedPostId) return;

    const fetchPostDetail = async () => {
      try {
        const res = await api.getPost(expandedPostId);
        if (res.success && res.post) {
          const detailed = res.post;
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p.id === expandedPostId
                ? {
                  ...p,
                  content: detailed.content,
                  likes: detailed.likes ? detailed.likes.length : 0,
                  commentsCount: detailed.comments ? detailed.comments.length : 0,
                  liked: user && detailed.likes ? detailed.likes.includes(user.id) : false,
                }
                : p
            )
          );

          const mappedComments = (detailed.comments || []).map((c) =>
            mapBackendCommentToFrontend(c, user)
          );
          setCommentsMap((prevMap) => ({
            ...prevMap,
            [expandedPostId]: mappedComments,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch post detail:', err);
      }
    };

    fetchPostDetail();
  }, [expandedPostId, user]);

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
    const stringId = String(commentId);
    setCommentCache((p) => ({ ...p, [stringId]: data }));
  };

  const handlePostDelete = async (postId) => {
    try {
      showToast('게시글 삭제 중...', 'info');
      const res = await api.deletePost(postId);
      if (res.success) {
        setPosts((p) => p.filter((x) => x.id !== postId));
        if (expandedPostId === postId) setExpandedPostId(null);
        showToast(res.message || '게시글이 삭제되었습니다.', 'success');
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      showToast('게시글 삭제에 실패했습니다.', 'error');
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      let targetPostId = null;
      for (const postId in commentsMap) {
        if (commentsMap[postId].some((c) => (c.id || c._id) === commentId)) {
          targetPostId = postId;
          break;
        }
      }

      if (!targetPostId) return;

      const res = await api.deleteComment(targetPostId, commentId);
      if (res.success) {
        const newMap = { ...commentsMap };
<<<<<<< HEAD
        newMap[targetPostId] = newMap[targetPostId].filter((c) => (c.id || c._id) !== commentId);
=======
        let targetPostId = null;
        for (const postId in newMap) {
          const idx = newMap[postId].findIndex((c) => String(c.id || c._id) === String(commentId));
          if (idx !== -1) {
            newMap[postId] = newMap[postId].filter((c) => String(c.id || c._id) !== String(commentId));
            targetPostId = Number(postId);
            break;
          }
        }
>>>>>>> b9ec22e (fix: 댓글 번역 최종 로직 반영)
        setCommentsMap(newMap);

        setPosts((p) => p.map((x) =>
          x.id === targetPostId ? { ...x, commentsCount: Math.max(0, x.commentsCount - 1) } : x
        ));
        showToast(res.message || '댓글이 삭제되었습니다.', 'success');
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      showToast('댓글 삭제에 실패했습니다.', 'error');
    }
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
    setCommentCache((p) => ({ ...p, [String(newId)]: { translatedContent: `[Translation from KO] ${content}` } }));
    setCommentsMap((p) => ({ ...p, [postId]: [...(p[postId] || []), newComment] }));
    setPosts((p) => p.map((x) => x.id === postId ? { ...x, commentsCount: x.commentsCount + 1 } : x));
    showToast('댓글이 등록되었습니다!');
  };

  const handleLikeToggle = async (postId) => {
    try {
      const res = await api.toggleLike(postId);
      if (res.success) {
        setPosts((prevPosts) => prevPosts.map((x) => {
          if (x.id !== postId) return x;
          return { ...x, liked: res.liked, likes: res.likeCount };
        }));
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
      showToast('좋아요 처리에 실패했습니다.', 'error');
    }
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

    try {
      const res = await api.createPost({
        title: writeTitle,
        content: writeContent,
        category: writeCategory,
        lang: writeLang,
      });

      if (res.success && res.post) {
        const mappedNewPost = mapBackendPostToFrontend(res.post, user);
        mappedNewPost.content = res.post.content; // Ensure content is set

        setPosts((prevPosts) => [mappedNewPost, ...prevPosts]);
        setCommentsMap((prevMap) => ({ ...prevMap, [mappedNewPost.id]: [] }));
        setExpandedPostId(mappedNewPost.id);

        setWriteTitle('');
        setWriteContent('');
        setIsWriteOpen(false);
        showToast('게시글이 등록되었습니다!');
      }
    } catch (err) {
      console.error('Failed to create post:', err);
      showToast('게시글 등록에 실패했습니다.', 'error');
    }
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
