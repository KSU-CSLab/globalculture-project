import React from 'react';
import { useAppContext } from '../context/AppContext';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';
import { PlusCircle, Globe } from 'lucide-react';

export default function CommunityPage() {
  const {
    posts,
    commentsMap,
    activeCategory,
    expandedPostId,
    setExpandedPostId,
    isWriteOpen,
    setIsWriteOpen,
    writeTitle,
    setWriteTitle,
    writeContent,
    setWriteContent,
    writeCategory,
    setWriteCategory,
    writeLang,
    setWriteLang,
    postCache,
    commentCache,
    showToast,
    handleCachePostTranslation,
    handleCacheCommentTranslation,
    handlePostDelete,
    handleCommentDelete,
    handleCommentAdd,
    handleLikeToggle,
    handleSendMessageTrigger,
    handleCreatePost,
  } = useAppContext();

  // Filtered posts
  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-5 text-white shadow-premium relative overflow-hidden select-none border border-slate-800/80">
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-xs font-bold text-brand-gold border border-brand-gold/30">Community Feed</span>
            <span className="text-xs text-slate-300 font-semibold flex items-center">
              <Globe size={11} className="mr-1 animate-pulse" />실시간 다국어 지원
            </span>
          </div>
          <h3 className="mt-2 text-xs font-black tracking-tight text-white sm:text-sm">
            유학생 친구들과 자유롭게 소통하세요!
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-300 font-medium">
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
              <button type="button" onClick={() => setIsWriteOpen(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white">취소</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">카테고리</label>
                <select value={writeCategory} onChange={(e) => setWriteCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-gold">
                  <option value="contest">공모전 팀원모집</option>
                  <option value="free">자유게시판</option>
                  <option value="exchange">언어교환/일상</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">작성 언어</label>
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

      {/* Mobile Write FAB */}
      <button
        onClick={() => { setIsWriteOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); showToast('상단 글쓰기 폼이 열렸습니다!', 'info'); }}
        className="lg:hidden fixed bottom-20 right-5 z-45 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-800 text-brand-gold shadow-lg hover:bg-slate-800 hover:text-brand-gold-dark transition-all hover:scale-105 active:scale-95"
        aria-label="글쓰기"
      >
        <PlusCircle size={22} className="stroke-[2.25]" />
      </button>
    </div>
  );
}
