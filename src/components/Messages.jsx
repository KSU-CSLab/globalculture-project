import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Send,
  MessageCircle,
  User,
  Inbox,
  Search,
  Trash2,
  Clock,
  CheckCheck,
  Check,
  X,
  Mail,
  MailOpen,
} from "lucide-react";

// ─── Helper ─────────────────────────────────────────────────────────────────
function formatTime(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}시간 전`;
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Left panel: conversation list */
function ConversationList({ threads, currentUser, selectedId, onSelect, searchTerm, setSearchTerm }) {
  const filtered = threads.filter((t) => {
    const other = t.participants.find((p) => p !== currentUser.nickname) || "";
    return other.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalUnread = threads.reduce((acc, t) => {
    return acc + t.messages.filter((m) => !m.read && m.to === currentUser.nickname).length;
  }, 0);

  return (
    <div className="flex flex-col h-full border-r border-everytime-border bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-everytime-textMain flex items-center gap-2">
            <Inbox size={15} className="text-everytime-red" />
            쪽지함
            {totalUnread > 0 && (
              <span className="text-[10px] bg-everytime-red text-white font-extrabold px-1.5 py-0.5 rounded-full">
                {totalUnread}
              </span>
            )}
          </h2>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="대화 상대 검색..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] font-bold bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-everytime-red/20 focus:border-everytime-red/40 text-everytime-textMain placeholder-gray-400"
          />
        </div>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
            <MessageCircle size={28} className="text-gray-200 mb-2" />
            <p className="text-[11px] font-bold text-everytime-textSub">
              {searchTerm ? "검색 결과가 없습니다." : "아직 쪽지가 없습니다."}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">게시글의 닉네임을 클릭해 쪽지를 보내보세요!</p>
          </div>
        ) : (
          filtered.map((thread) => {
            const other = thread.participants.find((p) => p !== currentUser.nickname) || thread.participants[0];
            const lastMsg = thread.messages[thread.messages.length - 1];
            const unread = thread.messages.filter((m) => !m.read && m.to === currentUser.nickname).length;
            const isSelected = thread.id === selectedId;

            return (
              <button
                key={thread.id}
                onClick={() => onSelect(thread.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 border-b border-gray-50 text-left transition-all duration-150 ${
                  isSelected ? "bg-yellow-50/70 border-l-2 border-l-everytime-red" : "hover:bg-gray-50/80"
                }`}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-yellow-100 text-everytime-red flex items-center justify-center font-extrabold text-xs shrink-0 select-none">
                  {other.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold ${unread > 0 ? "text-everytime-textMain" : "text-everytime-textSub"}`}>
                      {other}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold shrink-0">
                      {lastMsg ? formatTime(lastMsg.sentAt) : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-[10px] truncate max-w-[140px] ${unread > 0 ? "font-bold text-everytime-textMain" : "font-bold text-gray-400"}`}>
                      {lastMsg
                        ? `${lastMsg.from === currentUser.nickname ? "나: " : ""}${lastMsg.content}`
                        : "대화를 시작하세요."}
                    </p>
                    {unread > 0 && (
                      <span className="text-[9px] bg-everytime-red text-white font-extrabold px-1.5 py-0.5 rounded-full shrink-0">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/** Right panel: chat bubble view */
function ChatView({ thread, currentUser, onSendMessage, onDeleteThread }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const other = thread
    ? thread.participants.find((p) => p !== currentUser.nickname) || thread.participants[0]
    : "";

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [thread?.messages?.length]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !thread) return;
    onSendMessage(thread.id, trimmed);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50/50">
        <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center text-everytime-red/30 mb-4">
          <MessageCircle size={32} />
        </div>
        <h3 className="text-sm font-black text-everytime-textMain mb-1">쪽지를 선택하세요</h3>
        <p className="text-[11px] text-everytime-textSub max-w-[200px] leading-relaxed">
          왼쪽에서 대화를 선택하거나, 게시글의 닉네임을 클릭해 새 쪽지를 시작하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      {/* Chat header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-yellow-100 text-everytime-red flex items-center justify-center font-extrabold text-xs select-none">
            {other.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-extrabold text-everytime-textMain">{other}</p>
            <p className="text-[10px] text-everytime-textSub font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              GloKulture 회원
            </p>
          </div>
        </div>
        <button
          onClick={() => onDeleteThread(thread.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all active:scale-90"
          title="대화 삭제"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3">
        {thread.messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[11px] text-gray-400 font-bold">
              {other}님과의 대화를 시작해보세요 👋
            </p>
          </div>
        )}

        {thread.messages.map((msg, idx) => {
          const isMine = msg.from === currentUser.nickname;
          const showAvatar =
            !isMine && (idx === 0 || thread.messages[idx - 1].from !== msg.from);

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Other person avatar (shown once per consecutive block) */}
              {!isMine && (
                <div className={`w-7 h-7 rounded-full bg-yellow-100 text-everytime-red flex items-center justify-center font-extrabold text-[10px] shrink-0 select-none ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                  {other.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className={`flex flex-col gap-0.5 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                <div
                  className={`px-3 py-2 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
                    isMine
                      ? "bg-everytime-red text-white rounded-br-md"
                      : "bg-white text-everytime-textMain border border-gray-100 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
                <div className={`flex items-center gap-1 text-[9px] text-gray-400 font-bold ${isMine ? "flex-row-reverse" : ""}`}>
                  <span>{formatTime(msg.sentAt)}</span>
                  {isMine && (
                    msg.read
                      ? <CheckCheck size={10} className="text-blue-400" />
                      : <Check size={10} />
                  )}
                </div>
              </div>

              {/* Spacer for my message side */}
              {isMine && <div className="w-7 shrink-0" />}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-end gap-3 shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="쪽지를 입력하세요... (Enter로 전송)"
          rows={1}
          className="flex-1 text-xs font-bold bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-everytime-red/20 focus:border-everytime-red/40 text-everytime-textMain placeholder-gray-400 max-h-28 overflow-y-auto no-scrollbar"
          style={{ lineHeight: "1.5" }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-everytime-red text-white hover:bg-amber-600 active:scale-90 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Messages Component ─────────────────────────────────────────────────
export default function Messages({
  currentUser,
  threads,
  onSendMessage,
  onDeleteThread,
  onMarkRead,
  onBackToFeed,
  initialRecipient,
  onClearInitialRecipient,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileView, setMobileView] = useState("list"); // "list" | "chat"

  // If opened with a pre-selected recipient (from clicking nickname), auto-select or create thread
  useEffect(() => {
    if (initialRecipient) {
      // Look for existing thread with this recipient
      const existing = threads.find((t) =>
        t.participants.includes(initialRecipient) && t.participants.includes(currentUser.nickname)
      );
      if (existing) {
        setSelectedId(existing.id);
      } else {
        // Signal app to create a new thread
        setSelectedId(`new:${initialRecipient}`);
      }
      setMobileView("chat");
      onClearInitialRecipient?.();
    }
  }, [initialRecipient]);

  // When thread selected, mark messages as read
  useEffect(() => {
    if (selectedId && !selectedId.startsWith("new:")) {
      onMarkRead(selectedId);
    }
  }, [selectedId]);

  const selectedThread = threads.find((t) => t.id === selectedId) || null;

  const handleSelect = (id) => {
    setSelectedId(id);
    setMobileView("chat");
  };

  return (
    <div className="space-y-0">
      {/* Page header bar */}
      <div className="flex items-center justify-between bg-white border border-everytime-border rounded-xl p-4 shadow-sm select-none mb-4">
        <button
          onClick={onBackToFeed}
          className="flex items-center gap-2 text-xs font-extrabold text-everytime-textSub hover:text-everytime-red transition-colors active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>메인 피드로 돌아가기</span>
        </button>
        <span className="text-xs font-extrabold text-everytime-red flex items-center gap-1.5">
          <Mail size={13} />
          쪽지함 (Messages)
        </span>
      </div>

      {/* Main chat UI */}
      <div className="bg-white border border-everytime-border rounded-xl shadow-sm overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
        <div className="grid grid-cols-1 md:grid-cols-5 h-full">
          
          {/* Left: conversation list (hidden on mobile when chat open) */}
          <div className={`md:col-span-2 h-full ${mobileView === "chat" ? "hidden md:block" : "block"}`}>
            <ConversationList
              threads={threads}
              currentUser={currentUser}
              selectedId={selectedId}
              onSelect={handleSelect}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>

          {/* Right: chat view */}
          <div className={`md:col-span-3 h-full border-l border-gray-100 relative ${mobileView === "list" ? "hidden md:block" : "block"}`}>
            {/* Mobile: back to list button */}
            {mobileView === "chat" && (
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden absolute top-3 left-3 z-10 flex items-center gap-1 text-[10px] font-extrabold text-everytime-textSub hover:text-everytime-red bg-white/90 backdrop-blur border border-gray-200 rounded-lg px-2 py-1 active:scale-95 transition-all"
              >
                <ArrowLeft size={11} /> 목록
              </button>
            )}
            <ChatView
              thread={selectedThread}
              currentUser={currentUser}
              onSendMessage={onSendMessage}
              onDeleteThread={onDeleteThread}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Standalone compose modal (쪽지 보내기) - used from nickname clicks */
export function ComposeMessageModal({ from, to, onSend, onClose }) {
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!content.trim()) return;
    onSend(content.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[90vw] max-w-md mx-auto overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 text-everytime-red flex items-center justify-center font-extrabold text-xs select-none">
              {to.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-extrabold text-everytime-textMain">{to}님에게 쪽지 보내기</p>
              <p className="text-[10px] text-everytime-textSub font-bold">from: {from}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 active:scale-90 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`${to}님에게 전달할 쪽지 내용을 입력하세요...`}
            autoFocus
            rows={4}
            className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-everytime-red/20 focus:border-everytime-red/40 text-everytime-textMain placeholder-gray-400"
          />
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSend}
              disabled={!content.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-everytime-red hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl transition-all active:scale-95 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={13} /> 쪽지 보내기
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-bold rounded-xl transition-all active:scale-95"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
