import React from "react";
import { Search, Bell, Globe, User, LogOut, MessageCircle } from "lucide-react";

export default function Header({
  searchQuery,
  setSearchQuery,
  onBellClick,
  activeCategory,
  onCategoryChange,
  currentUser,
  onProfileClick,
  onMessagesClick,
  unreadCount = 0,
}) {
  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-everytime-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-[64px]">

        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onCategoryChange("전체")}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-95 active:scale-95 transition-all"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-everytime-red text-white shadow-md shadow-yellow-500/20">
              <Globe size={20} className="animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-everytime-red leading-tight">
                GloKulture
              </span>
              <span className="text-[10px] text-everytime-textSub font-bold tracking-widest uppercase leading-none">
                글로컬 교류방
              </span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onCategoryChange("전체")}
              className={`px-4 py-2 text-[13px] font-extrabold rounded-lg transition-all ${
                activeCategory === "전체"
                  ? "text-everytime-red bg-yellow-50"
                  : "text-everytime-textMain hover:bg-gray-100 hover:text-everytime-red"
              }`}
            >
              게시판 Home
            </button>
            <button
              onClick={() => onCategoryChange("공모전 팀원모집")}
              className={`px-4 py-2 text-[13px] font-extrabold rounded-lg transition-all ${
                activeCategory === "공모전 팀원모집"
                  ? "text-everytime-red bg-yellow-50"
                  : "text-everytime-textMain hover:bg-gray-100 hover:text-everytime-red"
              }`}
            >
              팀원 모집
            </button>
            <button
              onClick={() => onCategoryChange("언어교환/일상")}
              className={`px-4 py-2 text-[13px] font-extrabold rounded-lg transition-all ${
                activeCategory === "언어교환/일상"
                  ? "text-everytime-red bg-yellow-50"
                  : "text-everytime-textMain hover:bg-gray-100 hover:text-everytime-red"
              }`}
            >
              언어교환
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">

          {/* Search Bar (Desktop) */}
          <div className="relative hidden sm:block w-48 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="글 제목, 내용 검색..."
              className="w-full text-xs pl-9 pr-8 py-2 bg-gray-100/80 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-everytime-red/30 focus:ring-2 focus:ring-everytime-red/10 text-everytime-textMain placeholder-gray-400 font-semibold transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-everytime-textMain"
              >
                ✕
              </button>
            )}
          </div>

          {/* Messages Icon */}
          <button
            onClick={onMessagesClick}
            className="relative p-2 rounded-xl hover:bg-yellow-50 text-everytime-textMain active:scale-95 transition-all"
            aria-label="쪽지함 열기"
            title="쪽지함"
          >
            <MessageCircle size={20} strokeWidth={2} className={unreadCount > 0 ? "text-everytime-red" : ""} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-everytime-red text-white text-[9px] font-black flex items-center justify-center px-0.5 leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Bell */}
          <button
            onClick={onBellClick}
            className="p-2 rounded-xl hover:bg-gray-100 text-everytime-textMain relative active:scale-95 transition-all"
            aria-label="View notifications"
          >
            <Bell size={20} strokeWidth={2} />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-everytime-red"></span>
          </button>

          {/* Profile capsule */}
          <div
            onClick={onProfileClick}
            className="flex items-center gap-2 border-l border-gray-200 pl-3 cursor-pointer hover:bg-gray-50 py-1.5 px-2.5 rounded-xl transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-yellow-100 text-everytime-red flex items-center justify-center font-extrabold text-xs select-none">
              {currentUser ? currentUser.nickname.slice(0, 2).toUpperCase() : "익"}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-extrabold text-everytime-textMain">
                {currentUser ? currentUser.nickname : "로그인필요"}
              </span>
              <span className="text-[9px] text-everytime-textSub font-bold">학교 인증회원</span>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
