import React, { useState } from 'react';
import { X, FileText, Send, Trash2, AlertTriangle, ShieldAlert, User, Globe, Save, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const ROLE_LABELS = { admin: '관리자 👑', staff: '교직원 🏫', student: '재학생 🎓' };
const LANG_LABELS  = { ko: '한국어 🇰🇷', en: 'English 🇺🇸', zh: '中文 🇨🇳', vi: 'Tiếng Việt 🇻🇳' };

export default function MyPageModal({
  isOpen,
  onClose,
  user,
  setUser,
  posts,
  sentMessages,
  onPostClick,
  onWithdrawal,
  showToast,
}) {
  const [activeTab, setActiveTab]     = useState('posts'); // 'posts' | 'messages' | 'profile'
  const [showConfirmWithdraw, setShowConfirmWithdraw] = useState(false);

  // Profile edit states
  const [editNickname, setEditNickname]       = useState(user?.nickname || '');
  const [editLang, setEditLang]               = useState(user?.preferredLanguage || 'ko');
  const [isSaving, setIsSaving]               = useState(false);

  if (!isOpen) return null;

  const myPosts = posts.filter((post) => post.authorId === user?.id || post.authorId === user?.username || post.isSelf);

  const handleSaveProfile = async () => {
    if (!editNickname.trim()) { showToast('닉네임을 입력해주세요.', 'error'); return; }
    setIsSaving(true);
    try {
      const res = await api.updateMe({ nickname: editNickname, preferredLanguage: editLang });
      if (res.success) {
        setUser((prev) => ({ ...prev, nickname: editNickname, preferredLanguage: editLang }));
        showToast('프로필이 수정되었습니다!', 'success');
      }
    } catch (err) {
      showToast(err.message || '프로필 수정에 실패했습니다.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl transform rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xl p-6 transition-all duration-300 flex flex-col max-h-[90vh] select-none">

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
              <p className="text-[10px] text-slate-400 font-bold flex flex-wrap items-center gap-1.5 mt-0.5">
                <span>{user?.email}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">@ks.ac.kr 인증 완료 🎓</span>
                <span>•</span>
                <span className="bg-brand-gold/20 text-brand-gold-dark dark:text-brand-gold px-1.5 py-0.5 rounded text-[8.5px] font-extrabold">
                  {ROLE_LABELS[user?.role] || '재학생 🎓'}
                </span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Withdrawal Confirm Overlay */}
        {showConfirmWithdraw ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center space-y-4 fade-in">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center border border-red-200 dark:border-red-900/50 animate-pulse">
              <ShieldAlert size={36} />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-black text-red-600 dark:text-red-400">정말로 회원 탈퇴를 진행하시겠습니까?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                탈퇴 시 계정 정보가 즉시 파기되며 로그인 화면으로 이동됩니다.<br />
                기존 게시글·쪽지 데이터와의 매핑이 소멸됩니다.
              </p>
            </div>
            <div className="flex space-x-3 w-full max-w-sm pt-2">
              <button onClick={() => setShowConfirmWithdraw(false)} className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all">
                취소 (돌아가기)
              </button>
              <button onClick={onWithdrawal} className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-red-500 hover:bg-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all">
                <Trash2 size={13} /><span>탈퇴 완료</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 mb-4">
              {[
                { key: 'posts',    icon: FileText, label: `내 글 (${myPosts.length})` },
                { key: 'messages', icon: Send,     label: `쪽지 (${sentMessages.length})` },
                { key: 'profile',  icon: User,     label: '프로필 수정' },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-xs font-black border-b-2 transition-all ${
                    activeTab === key
                      ? 'border-brand-gold text-brand-gold-dark dark:text-brand-gold'
                      : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon size={13} /><span>{label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar min-h-[200px] max-h-[50vh]">

              {/* POSTS TAB */}
              {activeTab === 'posts' && (
                myPosts.length === 0 ? (
                  <div className="py-16 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
                    아직 작성하신 글이 없습니다. ✍️
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => { onPostClick(post.id); onClose(); }}
                        className="p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-brand-gold/5 hover:border-brand-gold/40 cursor-pointer transition-all flex justify-between items-start space-x-2"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="block text-[11px] font-black text-slate-800 dark:text-slate-200 truncate">{post.title}</span>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">{post.content}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {post.category === 'free' ? '자유' : post.category === 'contest' ? '공모전' : '언어교환'}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400">{post.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* MESSAGES TAB */}
              {activeTab === 'messages' && (
                sentMessages.length === 0 ? (
                  <div className="py-16 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
                    보낸 쪽지 내역이 없습니다. ✉️
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sentMessages.map((msg) => (
                      <div key={msg.id} className="p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-brand-gold-dark dark:text-brand-gold">@{msg.receiverName} 님에게 전송</span>
                          <span className="text-[9px] font-semibold text-slate-400">{msg.time}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-600 dark:text-slate-350 leading-relaxed font-medium">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* PROFILE EDIT TAB — PUT /api/users/me */}
              {activeTab === 'profile' && (
                <div className="space-y-5 py-2">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-1">
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">읽기 전용 정보</span>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-[10px] font-bold text-slate-500">이메일</span>
                      <span className="text-[10px] font-black text-slate-800 dark:text-white">{user?.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-slate-500">역할</span>
                      <span className="text-[10px] font-black text-slate-800 dark:text-white">{ROLE_LABELS[user?.role]}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">수정 가능한 정보 (PUT /api/users/me)</span>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 pl-1">닉네임</label>
                      <input
                        type="text"
                        value={editNickname}
                        onChange={(e) => setEditNickname(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 pl-1 flex items-center space-x-1">
                        <Globe size={11} className="text-brand-gold-dark dark:text-brand-gold" /><span>선호 언어</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(LANG_LABELS).map(([val, label]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setEditLang(val)}
                            className={`rounded-xl p-2.5 border text-left text-[11px] font-bold transition-all ${
                              editLang === val
                                ? 'border-brand-gold bg-brand-gold/10 dark:bg-brand-gold/15 text-brand-gold-dark dark:text-brand-gold'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:border-brand-gold/50'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="w-full flex items-center justify-center space-x-2 rounded-xl bg-brand-gold py-3 text-xs font-bold text-slate-900 hover:bg-brand-gold-dark active:scale-[0.99] transition-all shadow-md shadow-brand-gold/15 disabled:opacity-60"
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      <span>{isSaving ? '저장 중...' : '변경사항 저장'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">KSU Culture Hub — 경성대학교 글로컬 커뮤니티</span>
              <button
                onClick={() => setShowConfirmWithdraw(true)}
                className="flex items-center space-x-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
              >
                <Trash2 size={11} /><span>회원 탈퇴</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
