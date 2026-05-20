import React, { useState } from "react";
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Key,
  ArrowLeft,
  Trash2,
  Edit3,
  MessageSquare,
  FileText,
  ChevronRight
} from "lucide-react";
import PostCard from "./PostCard";

export default function MyPage({
  currentUser,
  posts,
  onUpdateNickname,
  onDeactivateAccount,
  onBackToFeed,
  onGoToPost,
  onLikeToggle,
  onAddComment,
  onDeletePost,
  onDeleteComment,
  triggerToast
}) {
  const [activeTab, setActiveTab] = useState("posts"); // "posts" or "comments"
  const [nickname, setNickname] = useState(currentUser.nickname);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState("");
  
  // Deactivation States
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeCheckbox, setAgreeCheckbox] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");

  // Filter My Posts
  const myPosts = posts.filter((post) => post.author === currentUser.nickname);

  // Filter My Comments
  const myComments = [];
  posts.forEach((post) => {
    post.comments.forEach((comment) => {
      if (comment.author === currentUser.nickname) {
        myComments.push({
          commentId: comment.id,
          postId: post.id,
          postTitle: post.title,
          content: comment.content,
          time: comment.time,
          lang: comment.originalLanguage
        });
      }
    });
  });

  // Handle Nickname Update
  const handleNicknameSubmit = (e) => {
    e.preventDefault();
    setNicknameError("");

    const trimmed = nickname.trim();
    if (!trimmed) {
      setNicknameError("닉네임을 입력해주세요.");
      return;
    }
    if (trimmed.length < 2) {
      setNicknameError("닉네임은 2자 이상이어야 합니다.");
      return;
    }
    if (trimmed.length > 10) {
      setNicknameError("닉네임은 10자 이하여야 합니다.");
      return;
    }
    if (trimmed === currentUser.nickname) {
      setIsEditingNickname(false);
      return;
    }

    const success = onUpdateNickname(trimmed);
    if (success) {
      setIsEditingNickname(false);
      triggerToast(`✏️ 닉네임이 성공적으로 변경되었습니다: ${trimmed}`);
    } else {
      setNicknameError("이미 사용 중인 닉네임입니다.");
    }
  };

  // Handle Deactivation Submit
  const handleDeactivationSubmit = (e) => {
    e.preventDefault();
    setDeactivateError("");

    if (!confirmPassword) {
      setDeactivateError("비밀번호를 입력해주세요.");
      return;
    }
    if (!agreeCheckbox) {
      setDeactivateError("탈퇴 안내 동의 체크박스에 체크해주셔야 합니다.");
      return;
    }

    const success = onDeactivateAccount(confirmPassword);
    if (!success) {
      setDeactivateError("입력하신 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Navigation Bar (Go back) */}
      <div className="flex items-center justify-between bg-white border border-everytime-border rounded-xl p-4 shadow-sm select-none">
        <button
          onClick={onBackToFeed}
          className="flex items-center gap-2 text-xs font-extrabold text-everytime-textSub hover:text-everytime-red transition-colors active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>메인 피드로 돌아가기</span>
        </button>
        <span className="text-xs font-extrabold text-everytime-red">내 정보 마이페이지</span>
      </div>

      {/* 2. Academic Passport Card */}
      <div className="bg-white border border-everytime-border rounded-xl shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-bl-full flex items-center justify-center select-none pointer-events-none">
          <ShieldCheck size={48} className="text-everytime-red/10 translate-x-2 -translate-y-2 rotate-12" />
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              {/* Everytime custom visual avatar */}
              <div className="w-16 h-16 rounded-2xl bg-yellow-50 border border-yellow-100 text-everytime-red flex items-center justify-center font-black text-2xl shadow-inner select-none">
                {currentUser.nickname.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {isEditingNickname ? (
                    <form onSubmit={handleNicknameSubmit} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="text-sm font-bold border-b-2 border-everytime-red focus:outline-none bg-gray-50 px-2 py-0.5 rounded text-everytime-textMain"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="text-[11px] font-extrabold px-2.5 py-1 bg-everytime-red text-white rounded hover:bg-amber-600 transition-colors"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNickname(currentUser.nickname);
                          setIsEditingNickname(false);
                          setNicknameError("");
                        }}
                        className="text-[11px] font-extrabold px-2.5 py-1 bg-gray-100 text-gray-500 rounded hover:bg-gray-200 transition-colors"
                      >
                        취소
                      </button>
                    </form>
                  ) : (
                    <>
                      <h2 className="text-lg font-black text-everytime-textMain">
                        {currentUser.nickname}
                      </h2>
                      <button
                        onClick={() => setIsEditingNickname(true)}
                        className="p-1 hover:bg-gray-100 rounded-lg text-everytime-textSub hover:text-everytime-red transition-all active:scale-90"
                        title="닉네임 변경"
                      >
                        <Edit3 size={14} />
                      </button>
                    </>
                  )}
                </div>
                {nicknameError && <p className="text-[10px] text-everytime-red font-bold">{nicknameError}</p>}
                
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-bold border border-green-100 flex items-center gap-1 select-none">
                    <CheckCircle2 size={10} className="fill-green-500 text-white" />
                    학교 메일 인증 완료 (Verified)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-yellow-50 text-everytime-red rounded-full font-bold border border-yellow-100 select-none">
                    글로컬 패밀리
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Academic Seal & Summary */}
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 flex flex-col justify-center min-w-[200px] text-xs font-bold text-everytime-textMain space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-everytime-textSub font-bold text-[10px]">계정 아이디</span>
                <span className="text-slate-700 font-extrabold">{currentUser.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-everytime-textSub font-bold text-[10px]">학적 이메일</span>
                <span className="text-slate-600 font-extrabold select-all">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-everytime-textSub font-bold text-[10px]">인증 학력 구분</span>
                <span className="text-slate-600 font-extrabold">국내/외국인 학생인증</span>
              </div>
            </div>
          </div>

          {/* Activity counters */}
          <div className="grid grid-cols-2 gap-4 text-center pt-4 text-xs font-extrabold text-everytime-textMain select-none">
            <div
              onClick={() => setActiveTab("posts")}
              className={`py-3 rounded-xl border cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                activeTab === "posts"
                  ? "bg-yellow-50/50 border-everytime-red text-everytime-red shadow-sm"
                  : "bg-gray-50/50 border-gray-100 hover:bg-gray-50 text-everytime-textSub"
              }`}
            >
              <FileText size={18} className="mx-auto mb-1 opacity-80" />
              <span className="text-[10px] block opacity-75">내가 쓴 게시글</span>
              <span className="text-sm font-black">{myPosts.length}개</span>
            </div>
            <div
              onClick={() => setActiveTab("comments")}
              className={`py-3 rounded-xl border cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                activeTab === "comments"
                  ? "bg-yellow-50/50 border-everytime-red text-everytime-red shadow-sm"
                  : "bg-gray-50/50 border-gray-100 hover:bg-gray-50 text-everytime-textSub"
              }`}
            >
              <MessageSquare size={18} className="mx-auto mb-1 opacity-80" />
              <span className="text-[10px] block opacity-75">내가 쓴 댓글</span>
              <span className="text-sm font-black">{myComments.length}개</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. My Activities Feed Panels */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-everytime-border pb-2 select-none">
          <h3 className="text-xs font-black text-everytime-textMain tracking-tight">
            {activeTab === "posts" ? "내가 작성한 게시글 목록" : "내가 작성한 댓글 목록"}
          </h3>
          <span className="text-[10px] text-everytime-textSub font-bold">
            총 {activeTab === "posts" ? myPosts.length : myComments.length}개의 데이터
          </span>
        </div>

        {activeTab === "posts" ? (
          <div className="space-y-1.5">
            {myPosts.length > 0 ? (
              myPosts.map((post) => (
                <div key={post.id} className="relative group">
                  <PostCard
                    post={post}
                    onLikeToggle={onLikeToggle}
                    onAddComment={onAddComment}
                    onDeletePost={onDeletePost}
                    onDeleteComment={onDeleteComment}
                    currentUser={currentUser}
                  />
                  {/* Option to view/jump to the post inside Main Feed */}
                  <button
                    onClick={() => onGoToPost(post.id)}
                    className="absolute top-4 right-20 bg-gray-50 hover:bg-gray-100 text-[10px] font-extrabold py-1 px-2.5 rounded-lg border border-gray-200 text-everytime-textMain transition-all active:scale-95 shadow-sm opacity-0 group-hover:opacity-100 flex items-center gap-1 select-none"
                  >
                    <span>본문 보러가기</span>
                    <ChevronRight size={10} />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 bg-white rounded-xl border border-everytime-border text-center p-8">
                <FileText size={24} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold text-everytime-textMain">작성하신 게시글이 아직 없습니다.</p>
                <p className="text-[10px] text-everytime-textSub mt-1">글로컬 커뮤니티 피드에서 첫 글을 작성해 보세요!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {myComments.length > 0 ? (
              myComments.map((comment) => (
                <div
                  key={comment.commentId}
                  onClick={() => onGoToPost(comment.postId)}
                  className="bg-white border border-everytime-border hover:border-everytime-red/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-start gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase font-bold tracking-wider">
                        {comment.lang}
                      </span>
                      <span className="text-[10px] text-everytime-textSub font-bold">{comment.time}</span>
                    </div>
                    <p className="text-xs font-bold text-everytime-textMain leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>
                    <div className="text-[9px] bg-yellow-50/40 text-everytime-red font-bold px-2 py-1 rounded w-max select-none">
                      📌 원본 글: {comment.postTitle}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 mt-1" />
                </div>
              ))
            ) : (
              <div className="py-12 bg-white rounded-xl border border-everytime-border text-center p-8">
                <MessageSquare size={24} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold text-everytime-textMain">작성하신 댓글이 아직 없습니다.</p>
                <p className="text-[10px] text-everytime-textSub mt-1">학우들의 유용한 피드 글에 적극적으로 번역 소통을 시작해보세요!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Danger Zone (Account Deactivation) */}
      <div className="bg-yellow-50/50 border border-yellow-250 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-yellow-500/5 px-4 py-3 border-b border-yellow-200 flex items-center gap-2 select-none">
          <AlertTriangle size={16} className="text-everytime-red" />
          <h3 className="text-xs font-extrabold text-everytime-red">DANGER ZONE (위험 구역 - 계정 영구 탈퇴)</h3>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-1.5 text-xs text-amber-950 font-bold leading-relaxed">
            <p>• 계정을 삭제하시면 회원 데이터 및 로그인 정보는 시스템에서 즉각 영구 삭제(파괴)됩니다.</p>
            <p>• 학우 여러분이 작성하신 게시글과 댓글은 기존 스레드의 흐름을 보존하기 위해 강제 삭제되지 않으며, 작성자 이름만 자동으로 <span className="text-everytime-red font-black">"(탈퇴한 회원)"</span>으로 안전하게 마스킹 처리되어 개인 식별이 완전 방지됩니다.</p>
            <p>• 탈퇴 후에는 모든 권한이 영구 소멸되며, 이 행위는 취소하거나 복구할 수 없습니다.</p>
          </div>

          {!isDeactivating ? (
            <button
              onClick={() => setIsDeactivating(true)}
              className="flex items-center gap-1.5 py-2 px-4 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-extrabold shadow-sm active:scale-95 select-none"
            >
              <Trash2 size={13} />
              <span>GloKulture 계정 회원 탈퇴하기</span>
            </button>
          ) : (
            <form onSubmit={handleDeactivationSubmit} className="bg-white border border-yellow-200 rounded-xl p-4 space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-everytime-textMain">
                  🔒 보안을 위해 비밀번호를 다시 한 번 입력해 주세요
                </label>
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="현재 비밀번호 입력"
                    className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-everytime-textMain placeholder-gray-400 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={agreeCheckbox}
                  onChange={(e) => setAgreeCheckbox(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 accent-amber-600"
                />
                <label htmlFor="agree-checkbox" className="text-[11px] font-extrabold text-gray-600 leading-tight select-none cursor-pointer">
                  안내 사항을 모두 읽었으며 이에 동의하고, 본 GloKulture 글로컬 소통망 계정을 영구 탈퇴 처리할 것을 엄숙히 확인합니다.
                </label>
              </div>

              {deactivateError && <p className="text-[10px] text-everytime-red font-bold">{deactivateError}</p>}

              <div className="flex items-center gap-2 select-none">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 py-2 px-4 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-extrabold shadow-sm active:scale-95"
                >
                  <Trash2 size={13} />
                  <span>최종 탈퇴 처리 승인 (Delete)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeactivating(false);
                    setConfirmPassword("");
                    setAgreeCheckbox(false);
                    setDeactivateError("");
                  }}
                  className="py-2 px-4 text-xs bg-gray-100 hover:bg-gray-200 text-everytime-textSub hover:text-everytime-textMain rounded-lg transition-colors font-bold active:scale-95"
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}
