import React, { useState, useRef, useEffect } from "react";
import {
  Globe, RotateCcw, User,
  MoreVertical, MessageCircle, Trash2
} from "lucide-react";
import { api } from "../api/mockApi";

// ─── Single Comment Item ─────────────────────────────────────────────────────
function CommentItem({ comment, postLanguage, currentUser, onOpenCompose, onDeleteComment }) {
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedContent, setTranslatedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef(null);

  // Close ⋮ menu on outside click
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

  const isOwnComment = currentUser && comment.author === currentUser.nickname;
  const canMessage =
    currentUser &&
    onOpenCompose &&
    !isOwnComment &&
    comment.author !== "(탈퇴한 회원)";

  // Translation
  const handleTranslate = async () => {
    if (translatedContent) { setIsTranslated(!isTranslated); return; }
    setIsLoading(true);
    try {
      const userLang = navigator.language.split("-")[0];
      const targetLang = comment.originalLanguage === "ko"
        ? (userLang === "ko" ? "en" : userLang) : "ko";
      const response = await api.post(`/api/comments/${comment.id}/translate`, {
        targetLang, sourceLanguage: comment.originalLanguage, content: comment.content,
      });
      if (response.data?.success) {
        setTranslatedContent(response.data.translatedContent);
        setIsTranslated(true);
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-2.5 border-b border-gray-100 last:border-0 relative">

      {/* 삭제 확인 미니 오버레이 */}
      {showConfirm && (
        <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-between gap-2 px-3 animate-fade-in border border-red-100">
          <span className="text-[11px] font-extrabold text-everytime-textMain flex items-center gap-1.5">
            <Trash2 size={12} className="text-red-400" />
            댓글을 삭제할까요?
          </span>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => { setShowConfirm(false); onDeleteComment(comment.id); }}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-extrabold rounded-lg active:scale-95 transition-all"
            >
              삭제
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold rounded-lg active:scale-95 transition-all"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Comment Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
            <User size={12} />
          </div>
          <span className="text-[11px] font-bold text-everytime-textMain">
            {comment.author}
          </span>
          {comment.originalLanguage && (
            <span className="text-[9px] px-1 bg-gray-200 text-gray-600 rounded uppercase font-medium">
              {comment.originalLanguage}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-everytime-textSub">{comment.time}</span>

          {/* ── 내 댓글: 삭제 버튼 바로 노출 ── */}
          {isOwnComment && onDeleteComment && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-extrabold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all active:scale-90"
              title="내 댓글 삭제"
            >
              <Trash2 size={11} />
              삭제
            </button>
          )}

          {/* ── 남의 댓글: ⋮ 쪽지 메뉴 ── */}
          {canMessage && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-everytime-textMain active:scale-90 transition-all"
                aria-label="댓글 더보기"
              >
                <MoreVertical size={13} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-6 z-30 w-44 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-slide-down">
                  <button
                    onClick={() => { setMenuOpen(false); onOpenCompose(comment.author); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-everytime-textMain hover:bg-yellow-50 hover:text-everytime-red transition-colors text-left"
                  >
                    <MessageCircle size={13} className="text-everytime-red shrink-0" />
                    <span>{comment.author}님께 쪽지</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comment Content */}
      <div className="text-xs text-everytime-textMain leading-relaxed break-words pr-2 pl-7">
        {isLoading ? (
          <div className="space-y-1.5 py-1 animate-pulse-slow">
            <div className="h-3.5 bg-gray-200 rounded w-full"></div>
            <div className="h-3.5 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          <div className="transition-all duration-200">
            {isTranslated ? (
              <div>
                <p className="text-gray-800">{translatedContent}</p>
                <div className="mt-1 flex items-center gap-1 text-[9px] text-blue-600 font-semibold bg-blue-50 py-0.5 px-1.5 rounded w-max">
                  <Globe size={10} /> AI 자동 번역됨
                </div>
              </div>
            ) : (
              <p className="text-gray-700">{comment.content}</p>
            )}
          </div>
        )}
      </div>

      {/* Translate Button */}
      <div className="mt-1.5 pl-7">
        <button
          onClick={handleTranslate}
          disabled={isLoading}
          className={`flex items-center gap-1 text-[10px] font-semibold py-0.5 px-1.5 rounded transition-all active:scale-95 ${
            isTranslated
              ? "bg-everytime-blueBg text-everytime-blueText border border-blue-100"
              : "bg-gray-50 hover:bg-gray-100 text-everytime-textSub border border-gray-200"
          }`}
        >
          {isTranslated
            ? <><RotateCcw size={10} /><span>원문 보기 / Show Original</span></>
            : <><Globe size={10} /><span>번역하기 / Translate</span></>}
        </button>
      </div>
    </div>
  );
}

// ─── Comment List ────────────────────────────────────────────────────────────
export default function CommentList({
  comments,
  postId,
  postLanguage,
  currentUser,
  onOpenCompose,
  onDeleteComment,
}) {
  if (!comments || comments.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-everytime-textSub bg-gray-50/50 rounded-b-xl border-t border-gray-100">
        첫 번째 댓글을 남겨보세요!
      </div>
    );
  }

  return (
    <div className="bg-[#FAFBFB] px-4 py-2 border-t border-gray-100 space-y-1">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postLanguage={postLanguage}
          currentUser={currentUser}
          onOpenCompose={onOpenCompose}
          onDeleteComment={
            onDeleteComment
              ? (commentId) => onDeleteComment(postId, commentId)
              : null
          }
        />
      ))}
    </div>
  );
}
