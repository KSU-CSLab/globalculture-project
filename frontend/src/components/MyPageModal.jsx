import React, { useState } from 'react';
import { X, FileText, Send, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function MyPageModal({
  isOpen,
  onClose,
  user,
  posts,
  sentMessages,
  onPostClick,
  onWithdrawal
}) {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'messages'
  const [showConfirmWithdraw, setShowConfirmWithdraw] = useState(false);

  if (!isOpen) return null;

  // Filter posts written by the logged-in user
  const myPosts = posts.filter(post => post.authorId === user?.username || post.isSelf);

  const handleWithdrawClick = () => {
    setShowConfirmWithdraw(true);
  };

  const handleCancelWithdraw = () => {
    setShowConfirmWithdraw(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm fade-in">
      {/* Click outside overlay to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-2xl transform rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xl p-6 transition-all duration-300 flex flex-col max-h-[85vh] select-none">
        
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold-dark flex items-center justify-center font-black text-sm border border-brand-gold/20">
              {user?.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white">
                {user?.nickname} 님의 마이페이지
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex flex-wrap items-center gap-1.5 mt-0.5">
                <span>{user?.email || 'student@school.ac.kr'}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">학교 인증 완료 🎓</span>
                <span>•</span>
                <span className="bg-brand-gold/20 dark:bg-brand-gold/15 text-brand-gold-dark dark:text-brand-gold px-1.5 py-0.5 rounded text-[8.5px] font-extrabold">
                  선호 언어: {
                    user?.preferredLanguage === 'ko' ? '한국어 (KO) 🇰🇷' :
                    user?.preferredLanguage === 'en' ? 'English (EN) 🇺🇸' :
                    user?.preferredLanguage === 'zh' ? '中文 (ZH) 🇨🇳' :
                    user?.preferredLanguage === 'vi' ? 'Tiếng Việt (VI) 🇻🇳' : '한국어 (KO) 🇰🇷'
                  }
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Double Confirm Withdrawal Dialog (Overlay on top of modal contents if triggered) */}
        {showConfirmWithdraw ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center space-y-4 fade-in">
            <div className="w-16 h-16 rounded-full bg-red-55/10 dark:bg-red-950/20 text-red-500 flex items-center justify-center border border-red-200 dark:border-red-900/50 animate-pulse">
              <ShieldAlert size={36} />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-black text-red-600 dark:text-red-400">정말로 회원 탈퇴를 진행하시겠습니까?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                탈퇴 시 회원의 계정 정보가 즉시 파기되며 로그인 화면으로 리다이렉트됩니다.<br />
                작성하셨던 기존 게시글 및 쪽지 데이터와의 매핑이 소멸되어 더이상 관리가 불가능하오니 신중하게 선택해 주세요.
              </p>
            </div>
            <div className="flex space-x-3 w-full max-w-sm pt-2">
              <button
                onClick={handleCancelWithdraw}
                className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 py-3 text-xs font-bold text-slate-650 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all"
              >
                취소 (돌아가기)
              </button>
              <button
                onClick={onWithdrawal}
                className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-red-500 hover:bg-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
              >
                <Trash2 size={13} />
                <span>회원 탈퇴 완료</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 mb-4">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-black border-b-2 transition-all ${
                  activeTab === 'posts'
                    ? 'border-brand-gold text-brand-gold-dark dark:text-brand-gold'
                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <FileText size={14} />
                <span>내가 쓴 글 ({myPosts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-black border-b-2 transition-all ${
                  activeTab === 'messages'
                    ? 'border-brand-gold text-brand-gold-dark dark:text-brand-gold'
                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Send size={14} />
                <span>보낸 쪽지 목록 ({sentMessages.length})</span>
              </button>
            </div>

            {/* List Body Area */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-2.5 min-h-[250px] max-h-[45vh]">
              {activeTab === 'posts' ? (
                myPosts.length === 0 ? (
                  <div className="py-16 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
                    아직 GloCulture에 작성하신 글이 없습니다. ✍️
                  </div>
                ) : (
                  myPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => {
                        onPostClick(post.id);
                        onClose();
                      }}
                      className="p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-brand-gold/5 hover:border-brand-gold/40 cursor-pointer transition-all flex justify-between items-start space-x-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="block text-[11px] font-black text-slate-800 dark:text-slate-200 truncate">
                          {post.title}
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                          {post.content}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {post.category === 'free' ? '자유' : post.category === 'contest' ? '공모전' : '언어교환'}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400">{post.time}</span>
                      </div>
                    </div>
                  ))
                )
              ) : (
                sentMessages.length === 0 ? (
                  <div className="py-16 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
                    보낸 쪽지 내역이 없습니다. ✉️
                  </div>
                ) : (
                  sentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-brand-gold-dark dark:text-brand-gold">
                          @{msg.receiverName} 님에게 전송
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400">{msg.time}</span>
                      </div>
                      <p className="text-[10.5px] text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                        {msg.content}
                      </p>
                    </div>
                  ))
                )
              )}
            </div>

            {/* Footer containing Withdrawal trigger button */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                GloCulture 안전 커뮤니티 파트너십
              </span>
              <button
                onClick={handleWithdrawClick}
                className="flex items-center space-x-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
              >
                <Trash2 size={11} />
                <span>회원 탈퇴</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
