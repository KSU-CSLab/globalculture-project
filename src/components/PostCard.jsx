import React, { useState, useRef, useEffect } from "react";
import {
  Heart, MessageSquare, Globe, RotateCcw, Send,
  User, MoreVertical, Trash2, MessageCircle
} from "lucide-react";
import CommentList from "./CommentList";
import { api } from "../api/mockApi";

export default function PostCard({
  post,
  onAddComment,
  onLikeToggle,
  onDeletePost,
  onDeleteComment,
  currentUser,
  onOpenCompose,
}) {
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedData, setTranslatedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLang, setCommentLang] = useState("ko");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const isOwnPost = currentUser && post.author === currentUser.nickname;
  const canMessage =
    currentUser &&
    onOpenCompose &&
    !isOwnPost &&
    post.author !== "(탈퇴한 회원)";

  // Translation
  const handleTranslate = async () => {
    if (translatedData) { setIsTranslated(!isTranslated); return; }
    setIsLoading(true);
    try {
      const userLang = navigator.language.split("-")[0];
      const targetLang = post.originalLanguage === "ko"
        ? (userLang === "ko" ? "en" : userLang) : "ko";
      const response = await api.post(`/api/posts/${post.id}/translate`, {
        targetLang, sourceLanguage: post.originalLanguage,
        title: post.title, content: post.content,
      });
      if (response.data?.success) {
        setTranslatedData({
          title: response.data.translatedTitle,
          content: response.data.translatedContent,
          targetLanguage: response.data.targetLanguage,
        });
        setIsTranslated(true);
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Comment submit
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, {
      id: Date.now(),
      author: "익명",
      time: "방금 전",
      content: commentText,
      originalLanguage: commentLang,
      translations: {},
    });
    setCommentText("");
  };

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-everytime-border mb-3 overflow-hidden transition-all duration-300 hover:shadow-md">

      {/* 삭제 확인 오버레이 */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-red-100 animate-fade-in">
          <Trash2 size={24} className="text-red-400" />
          <p className="text-sm font-extrabold text-everytime-textMain">이 게시글을 삭제할까요?</p>
          <p className="text-[11px] text-gray-400 font-bold">삭제 후에는 복구할 수 없습니다.</p>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowDeleteConfirm(false); onDeletePost(post.id); }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold rounded-lg active:scale-95 transition-all"
            >
              삭제하기
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg active:scale-95 transition-all"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 1. Card Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
            <User size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-everytime-textMain">{post.author}</span>
              <span className="text-[9px] px-1 bg-gray-100 text-gray-600 rounded uppercase font-bold tracking-wider">
                {post.originalLanguage}
              </span>
            </div>
            <span className="text-[10px] text-everytime-textSub">{post.time}</span>
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 bg-yellow-50 text-everytime-red rounded-full font-bold select-none">
            {post.category}
          </span>

          {/* ── 내 글: 삭제 버튼 바로 노출 ── */}
          {isOwnPost && onDeletePost && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-extrabold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95"
              title="내 게시글 삭제"
            >
              <Trash2 size={12} />
              삭제
            </button>
          )}

          {/* ── 남의 글: ⋮ 쪽지 메뉴 ── */}
          {canMessage && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-everytime-textMain active:scale-90 transition-all"
                aria-label="더보기 메뉴"
              >
                <MoreVertical size={15} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 z-30 w-48 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-slide-down">
                  <button
                    onClick={() => { setMenuOpen(false); onOpenCompose(post.author); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-everytime-textMain hover:bg-yellow-50 hover:text-everytime-red transition-colors text-left"
                  >
                    <MessageCircle size={13} className="text-everytime-red shrink-0" />
                    <span>{post.author}님께 쪽지 보내기</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Card Content */}
      <div className="px-4 py-2">
        {isLoading ? (
          <div className="space-y-2 py-1 animate-pulse-slow">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          <div className="transition-all duration-300 ease-in-out">
            {isTranslated && translatedData ? (
              <div>
                <h3 className="text-[13px] font-bold text-blue-900 leading-snug mb-1">{translatedData.title}</h3>
                <p className="text-xs text-blue-950 leading-relaxed whitespace-pre-line">{translatedData.content}</p>
                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-everytime-blueText font-bold bg-everytime-blueBg w-max py-0.5 px-2 rounded-md">
                  <Globe size={11} className="animate-pulse" />
                  <span>AI 자동 번역 완료 ({translatedData.targetLanguage.toUpperCase()})</span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-[13px] font-bold text-everytime-textMain leading-snug mb-1">{post.title}</h3>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{post.content}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Translate Button */}
      <div className="px-4 py-2">
        <button
          onClick={handleTranslate}
          disabled={isLoading}
          className={`flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-lg transition-all duration-200 active:scale-95 ${
            isTranslated
              ? "bg-everytime-blueBg text-everytime-blueText border border-blue-200"
              : "bg-gray-100 text-everytime-textSub hover:bg-gray-200 hover:text-everytime-textMain"
          }`}
        >
          {isTranslated
            ? <><RotateCcw size={12} /><span>원문 보기 / Show Original</span></>
            : <><Globe size={12} /><span>🌐 번역하기 / Translate</span></>}
        </button>
      </div>

      {/* 4. Reactions Bar */}
      <div className="px-4 py-2.5 flex items-center gap-4 border-t border-gray-50 text-[11px] text-everytime-textSub font-semibold">
        <button
          onClick={() => onLikeToggle(post.id)}
          className="flex items-center gap-1 text-gray-500 hover:text-everytime-red transition-colors active:scale-90"
        >
          <Heart size={13} className={`transition-all ${post.isLiked ? "fill-everytime-red text-everytime-red" : ""}`} />
          <span className={post.isLiked ? "text-everytime-red font-bold" : ""}>공감 {post.likes}</span>
        </button>
        <div className="flex items-center gap-1 text-gray-500">
          <MessageSquare size={13} className="text-cyan-500" />
          <span>댓글 {post.comments.length}</span>
        </div>
      </div>

      {/* 5. Comments */}
      <div>
        <CommentList
          comments={post.comments}
          postId={post.id}
          postLanguage={post.originalLanguage}
          currentUser={currentUser}
          onOpenCompose={onOpenCompose}
          onDeleteComment={onDeleteComment}
        />
        <form
          onSubmit={handleCommentSubmit}
          className="bg-gray-50 p-3 flex items-center gap-2 border-t border-gray-100"
        >
          <select
            value={commentLang}
            onChange={(e) => setCommentLang(e.target.value)}
            className="text-[10px] bg-white border border-gray-200 text-everytime-textMain py-1 px-1.5 rounded focus:outline-none focus:ring-1 focus:ring-everytime-red font-bold"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="es">Español</option>
          </select>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-everytime-textMain focus:outline-none focus:ring-1 focus:ring-everytime-red placeholder-gray-400"
          />
          <button
            type="submit"
            className="p-1.5 bg-everytime-red text-white rounded-lg hover:bg-amber-600 transition-colors active:scale-90"
            disabled={!commentText.trim()}
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </div>
  );
}
