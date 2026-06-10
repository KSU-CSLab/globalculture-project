import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Trash2, Send, Globe, Languages } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useAppContext } from '../context/AppContext';

// Individual Comment Item Component
function CommentItem({ comment, onDelete, onSendMessage, translationCache, onCacheTranslation }) {
  const { showToast } = useAppContext();
  const api = useApi();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);

  const menuRef = useRef(null);
  const commentId = String(comment.id || comment._id);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleTranslateToggle = async () => {
    console.log("[디버깅] 현재 댓글 ID:", commentId);

    if (isTranslated) {
      setIsTranslated(false);
      return;
    }

    if (translationCache[commentId]) {
      setIsTranslated(true);
      return;
    }

    const contentToTranslate = comment.content || '';
    if (!contentToTranslate.trim()) {
      showToast("번역할 댓글 내용이 비어 있습니다.", "warning");
      return;
    }

    setIsTranslating(true);
    try {
      const data = await api.getTranslation('comment', commentId, contentToTranslate);
      onCacheTranslation(commentId, data);
      setIsTranslated(true);
      const translatedText = data.translatedContent;
      console.log("[디버깅] 번역된 텍스트 반영 성공:", translatedText);
    } catch (err) {
      console.error("Comment translation error:", err);
      showToast(err.message || "댓글 번역에 실패했습니다. API 키 설정을 확인해 주세요.", "error");
    } finally {
      setIsTranslating(false);
    }
  };

  const currentContent = isTranslated && translationCache[commentId]
    ? translationCache[commentId].translatedContent
    : comment.content;

  const getLanguageLabel = (langCode) => {
    const labels = { ko: '한국어', en: 'English', zh: '中文', vi: 'Tiếng Việt' };
    return labels[langCode] || langCode;
  };

  return (
    <div className="relative rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100/60 dark:border-slate-800 transition-all duration-200">
      {/* Comment Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Circular avatar with first initial */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 font-bold text-xs text-slate-500 dark:text-slate-400">
            {comment.author.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{comment.author}</span>
              {comment.isSelf && (
                <span className="rounded bg-brand-gold-light dark:bg-brand-gold/10 px-1.5 py-0.5 text-[10px] font-black text-brand-gold-dark dark:text-brand-gold ring-1 ring-brand-gold/15">
                  MY
                </span>
              )}
              <span className="text-[10px] rounded bg-slate-200/60 dark:bg-slate-800/80 px-1.5 py-0.5 text-slate-500 dark:text-slate-400 font-medium uppercase">
                {getLanguageLabel(comment.lang || "ko")}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{comment.time}</span>
          </div>
        </div>

        {/* Comment Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-350 transition-colors"
          >
            <MoreVertical size={15} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 z-30 w-36 origin-top-right rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850 p-1 shadow-lg ring-1 ring-black/5 fade-in">
              {comment.isSelf ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(commentId);
                  }}
                  className="flex w-full items-center space-x-1.5 rounded-md px-2.5 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>댓글 삭제</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSendMessage(comment.author);
                  }}
                  className="flex w-full items-center space-x-1.5 rounded-md px-2.5 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <Send size={13} className="text-slate-500 dark:text-slate-455" />
                  <span>쪽지 보내기</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comment Body */}
      <div className="mt-2.5">
        <p className={`font-sans text-xs leading-relaxed text-slate-700 dark:text-slate-300 transition-all duration-300 ${isTranslated ? 'fade-in' : ''}`}>
          {isTranslating ? (
            <span className="space-y-1 block py-1">
              <span className="block h-3 w-full rounded shimmer dark:bg-slate-800"></span>
              <span className="block h-3 w-4/5 rounded shimmer dark:bg-slate-800"></span>
            </span>
          ) : (
            currentContent
          )}
        </p>
      </div>

      {/* Comment Translate Action */}
      <div className="mt-2.5 flex justify-start">
        <button
          onClick={handleTranslateToggle}
          disabled={isTranslating}
          className={`flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 select-none ${isTranslated
            ? 'bg-brand-gold-light dark:bg-brand-gold/10 text-slate-800 dark:text-brand-gold border border-brand-gold/25 hover:bg-brand-gold/15'
            : 'bg-slate-200/50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
        >
          {isTranslating ? (
            <>
              <Globe size={12} className="animate-spin" />
              <span>번역 중...</span>
            </>
          ) : isTranslated ? (
            <>
              <Languages size={12} className="text-brand-gold-dark" />
              <span>원문 보기</span>
            </>
          ) : (
            <>
              <Globe size={12} />
              <span>번역하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Main Comment Section Wrapper
export default function CommentSection({
  comments = [],
  onAddComment,
  onDeleteComment,
  onSendMessage,
  commentCache,
  onCacheCommentTranslation
}) {
  const [newCommentText, setNewCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    onAddComment(newCommentText, isAnonymous);
    setNewCommentText('');
  };

  return (
    <div className="mt-5 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          댓글 <span className="text-brand-gold-dark">{comments.length}</span>
        </h3>
      </div>

      {/* Comment List */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-0.5">
        {comments.length === 0 ? (
          <div className="py-8 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
            첫 댓글을 남겨 해외 유학생 친구들과 소통해보세요! 🌏
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={String(comment.id || comment._id)}
              comment={comment}
              onDelete={onDeleteComment}
              onSendMessage={onSendMessage}
              translationCache={commentCache}
              onCacheTranslation={onCacheCommentTranslation}
            />
          ))
        )}
      </div>

      {/* Comment Input Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="flex items-center space-x-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-gold focus:ring-brand-gold focus:ring-offset-slate-900"
            />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">익명으로 작성</span>
          </label>
        </div>

        <div className="flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1 focus-within:border-brand-gold focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-brand-gold/30 transition-all duration-200">
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="댓글을 입력하세요... (다국어 번역 지원)"
            className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-550 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className="rounded-lg bg-brand-gold px-3.5 py-2 text-xs font-bold text-slate-900 shadow-sm shadow-brand-gold/20 hover:bg-brand-gold-dark transition-colors active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
}
