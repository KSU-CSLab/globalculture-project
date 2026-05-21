import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Heart, MessageCircle, Globe, Trash2, Send, Languages } from 'lucide-react';
import { api } from '../services/api';

export default function PostCard({
  post,
  onDelete,
  onSendMessage,
  isExpanded,
  onToggleExpand,
  translationCache,
  onCacheTranslation,
  onLikeToggle
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  
  const menuRef = useRef(null);

  // Click Outside custom logic to close dropdown menu
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

  // Handle Translate API with caching simulation
  const handleTranslateToggle = async (e) => {
    e.stopPropagation(); // Prevent card expansion toggle

    if (isTranslated) {
      // Toggle back to original text immediately
      setIsTranslated(false);
      return;
    }

    // Check if translation is already cached
    if (translationCache[post.id]) {
      setIsTranslated(true);
      return;
    }

    // If not cached, call simulated API with loading effect
    setIsTranslating(true);
    try {
      // Mock API call simulation with axios pattern
      const data = await api.getTranslation('post', post.id, post.content);
      
      // Store in cache
      onCacheTranslation(post.id, data);
      setIsTranslated(true);
    } catch (error) {
      console.error("Translation API error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Get current text content based on translation status
  const currentTitle = isTranslated && translationCache[post.id] 
    ? translationCache[post.id].translatedTitle 
    : post.title;

  const currentContent = isTranslated && translationCache[post.id] 
    ? translationCache[post.id].translatedContent 
    : post.content;

  // Language display name
  const getLanguageLabel = (langCode) => {
    const labels = { ko: '한국어', en: 'English', zh: '中文', vi: 'Tiếng Việt' };
    return labels[langCode] || langCode;
  };

  return (
    <article 
      onClick={onToggleExpand}
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 border transition-all duration-300 select-none ${
        isExpanded 
          ? 'border-brand-gold/60 ring-2 ring-brand-gold/10 shadow-premium-hover scale-[1.005]' 
          : 'border-slate-200/60 dark:border-slate-850 shadow-premium hover:shadow-premium-hover hover:border-slate-300 dark:hover:border-slate-800 cursor-pointer active:scale-[0.998]'
      }`}
    >
      {/* Header Area */}
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center space-x-2.5">
          {/* Avatar Profile placeholder */}
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-500 dark:text-slate-400 ring-2 ring-slate-50 dark:ring-slate-900/50">
            {post.author.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{post.author}</span>
              {post.isSelf && (
                <span className="rounded bg-brand-gold-light dark:bg-brand-gold/10 px-1.5 py-0.5 text-[8.5px] font-black text-brand-gold-dark dark:text-brand-gold ring-1 ring-brand-gold/20">
                  MY
                </span>
              )}
              {/* Language Tag */}
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[8.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                {getLanguageLabel(post.lang)}
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium">{post.time}</span>
          </div>
        </div>

        {/* Triple dot menu wrapper */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Avoid card click expansion
              setIsMenuOpen(!isMenuOpen);
            }}
            className="rounded-full p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="More options"
          >
            <MoreVertical size={16} />
          </button>

          {/* Dropdown Menu Popup */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 z-30 w-36 origin-top-right rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850 p-1 shadow-xl ring-1 ring-black/5 fade-in">
              {post.isSelf ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onDelete(post.id);
                  }}
                  className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>글 삭제</span>
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onSendMessage(post.author);
                  }}
                  className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <Send size={13} className="text-slate-500 dark:text-slate-400" />
                  <span>쪽지 보내기</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-3.5">
        {/* Title */}
        <h2 className={`font-sans text-[13px] font-black text-slate-800 dark:text-white tracking-tight leading-snug transition-all duration-300 ${isTranslated ? 'fade-in' : ''}`}>
          {isTranslating ? (
            <span className="block h-4 w-3/4 rounded shimmer dark:bg-slate-800"></span>
          ) : (
            currentTitle
          )}
        </h2>

        {/* Content Body */}
        <p className={`mt-2 font-sans text-xs text-slate-650 dark:text-slate-300 leading-relaxed transition-all duration-300 ${isTranslated ? 'fade-in' : ''}`}>
          {isTranslating ? (
            <span className="space-y-1.5 block">
              <span className="block h-3.5 w-full rounded shimmer dark:bg-slate-800"></span>
              <span className="block h-3.5 w-5/6 rounded shimmer dark:bg-slate-800"></span>
              <span className="block h-3.5 w-2/3 rounded shimmer dark:bg-slate-800"></span>
            </span>
          ) : (
            currentContent
          )}
        </p>
      </div>

      {/* Translation Action Toggle Button */}
      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3">
        <button
          onClick={handleTranslateToggle}
          disabled={isTranslating}
          className={`flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-bold transition-all duration-300 select-none ${
            isTranslated
              ? 'bg-brand-gold-light dark:bg-brand-gold/10 text-slate-800 dark:text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/20'
              : 'bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          {isTranslating ? (
            <>
              <Globe size={12} className="animate-spin text-slate-600 dark:text-slate-400" />
              <span>번역 중...</span>
            </>
          ) : isTranslated ? (
            <>
              <Languages size={12} className="text-brand-gold-dark dark:text-brand-gold" />
              <span>원문 보기 / Original</span>
            </>
          ) : (
            <>
              <Globe size={12} />
              <span>🌐 번역하기 / Translate</span>
            </>
          )}
        </button>

        {/* Action Counters (Likes, Comments) */}
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLikeToggle(post.id);
            }}
            className={`flex items-center space-x-1 text-xs font-semibold tracking-wide transition-all active:scale-90 ${
              post.liked ? 'text-red-500' : 'text-slate-400 dark:text-slate-500 hover:text-red-400'
            }`}
          >
            <Heart size={13} className={post.liked ? 'fill-current' : ''} />
            <span>{post.likes}</span>
          </button>
          <div className="flex items-center space-x-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <MessageCircle size={13} className="lucide-comment" />
            <span>{post.commentsCount}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
