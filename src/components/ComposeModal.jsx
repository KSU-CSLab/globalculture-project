import React, { useState } from "react";
import { PenTool, X, Send } from "lucide-react";

// 1. Mobile & Tablet Floating Action Composer Button & Sheet Drawer
export function ComposeModal({ onAddPost }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("자유게시판");
  const [lang, setLang] = useState("ko");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost = {
      id: Date.now(),
      category,
      author: "익명",
      isAnonymous: true,
      time: "방금 전",
      title,
      content,
      likes: 0,
      commentsCount: 0,
      originalLanguage: lang,
      isLiked: false,
      translations: {},
      comments: [],
    };

    onAddPost(newPost);
    
    // Reset state
    setTitle("");
    setContent("");
    setCategory("자유게시판");
    setLang("ko");
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button (FAB) - Hidden on Desktop screens */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-13 h-13 rounded-full bg-everytime-red text-white flex items-center justify-center shadow-xl hover:bg-amber-600 transition-all duration-200 active:scale-90 hover:scale-105 z-35 cursor-pointer border border-yellow-400/20"
        aria-label="Write new post"
      >
        <PenTool size={22} strokeWidth={2.5} />
      </button>

      {/* Drawer Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-end justify-center animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-2xl max-h-[85%] overflow-y-auto p-5 shadow-2xl animate-slide-up border-t border-gray-100 pb-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-everytime-red animate-ping"></span>
                <h2 className="text-sm font-extrabold text-everytime-textMain">새 글 쓰기</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-everytime-textSub hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Post Creation Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category & Language Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-everytime-textSub uppercase">
                    게시판 카테고리
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="text-xs bg-gray-50 border border-gray-200 text-everytime-textMain py-2 px-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-everytime-red/30 font-bold"
                  >
                    <option value="자유게시판">자유게시판</option>
                    <option value="공모전 팀원모집">공모전 팀원모집</option>
                    <option value="언어교환/일상">언어교환/일상</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-everytime-textSub uppercase">
                    작성 언어
                  </label>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="text-xs bg-gray-50 border border-gray-200 text-everytime-textMain py-2 px-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-everytime-red/30 font-bold"
                  >
                    <option value="ko">한국어 (Korean)</option>
                    <option value="en">English (English)</option>
                    <option value="zh">中文 (Chinese)</option>
                    <option value="es">Español (Spanish)</option>
                  </select>
                </div>
              </div>

              {/* Title input */}
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="글 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full text-sm font-extrabold border-b border-gray-200 py-2.5 focus:outline-none focus:border-everytime-red text-everytime-textMain placeholder-gray-300 transition-colors"
                />
              </div>

              {/* Content text-area */}
              <div className="flex flex-col gap-1">
                <textarea
                  placeholder="본문 내용을 다국어로 자유롭게 입력해 보세요. 유학생과 국내 학생이 실시간 AI로 번역해서 읽을 수 있습니다. (예: Halal 한식 맛집 추천글, Language Exchange 구인 등)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={5}
                  className="w-full text-xs py-2.5 focus:outline-none text-everytime-textMain placeholder-gray-300 resize-none border border-gray-150 rounded-xl p-3 focus:border-everytime-red focus:ring-1 focus:ring-everytime-red/20 transition-all"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-1/3 py-2.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-everytime-textMain rounded-lg transition-colors active:scale-95"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !content.trim()}
                  className="w-2/3 py-2.5 text-xs font-bold bg-everytime-red hover:bg-amber-600 text-white rounded-lg transition-colors active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md"
                >
                  완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// 2. Desktop-Only Inline Feed Composer Widget (Accordion Expandable)
export function InlineComposer({ onAddPost }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("자유게시판");
  const [lang, setLang] = useState("ko");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost = {
      id: Date.now(),
      category,
      author: "익명",
      isAnonymous: true,
      time: "방금 전",
      title,
      content,
      likes: 0,
      commentsCount: 0,
      originalLanguage: lang,
      isLiked: false,
      translations: {},
      comments: [],
    };

    onAddPost(newPost);

    // Reset Form
    setTitle("");
    setContent("");
    setCategory("자유게시판");
    setLang("ko");
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setCategory("자유게시판");
    setLang("ko");
    setIsExpanded(false);
  };

  return (
    <div className="bg-white border border-everytime-border rounded-xl shadow-sm mb-4 overflow-hidden transition-all duration-350 ease-in-out">
      {/* 1. Closed state placeholder */}
      {!isExpanded ? (
        <div
          onClick={() => setIsExpanded(true)}
          className="p-4 flex items-center justify-between cursor-pointer group hover:bg-gray-50/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-everytime-red group-hover:bg-yellow-50 transition-colors">
              <PenTool size={16} />
            </div>
            <span className="text-xs text-everytime-textSub group-hover:text-everytime-textMain font-medium transition-colors select-none">
              새 글을 작성해 보세요... (다국어 게시 가능)
            </span>
          </div>
          <button className="text-[10px] font-bold py-1 px-2.5 rounded bg-gray-100 group-hover:bg-everytime-red group-hover:text-white transition-all text-everytime-textSub">
            글쓰기
          </button>
        </div>
      ) : (
        /* 2. Expanded State Full-composer Form */
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 animate-slide-down">
          {/* Header & Settings Panel */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-50">
            <span className="text-[11px] font-extrabold text-everytime-red flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-everytime-red animate-pulse"></span>
              글로컬 피드에 새 글 포스팅
            </span>
            <div className="flex items-center gap-2">
              {/* Category selector */}
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-extrabold text-everytime-textSub">카테고리:</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-[10px] bg-gray-50 border border-gray-200 text-everytime-textMain py-1 px-2 rounded focus:outline-none focus:ring-1 focus:ring-everytime-red/30 font-bold"
                >
                  <option value="자유게시판">자유게시판</option>
                  <option value="공모전 팀원모집">공모전 팀원모집</option>
                  <option value="언어교환/일상">언어교환/일상</option>
                </select>
              </div>

              {/* Language selector */}
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-extrabold text-everytime-textSub">언어:</span>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="text-[10px] bg-gray-50 border border-gray-200 text-everytime-textMain py-1 px-2 rounded focus:outline-none focus:ring-1 focus:ring-everytime-red/30 font-bold"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>

          {/* Title Input */}
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full text-xs font-bold border-b border-gray-100 pb-2 focus:outline-none focus:border-everytime-red text-everytime-textMain placeholder-gray-300"
          />

          {/* Content TextArea */}
          <textarea
            placeholder="유학생과 국내 학생이 나누고 싶은 자유 주제, 팀 모집, 혹은 언어 교환 글을 자유롭게 작성해보세요. 인공지능이 번역해 줍니다."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="w-full text-[11px] py-1 focus:outline-none text-everytime-textMain placeholder-gray-300 resize-none rounded-lg focus:ring-0"
          />

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
            <button
              type="button"
              onClick={handleCancel}
              className="py-1 px-3 text-[10px] font-extrabold bg-gray-100 hover:bg-gray-200 text-everytime-textMain rounded transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className="py-1 px-4 text-[10px] font-extrabold bg-everytime-red hover:bg-amber-600 text-white rounded transition-colors disabled:bg-gray-100 disabled:text-gray-400 flex items-center gap-1 shadow-sm"
            >
              <Send size={9} />
              작성완료
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
