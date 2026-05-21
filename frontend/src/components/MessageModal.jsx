import React, { useState, useEffect } from 'react';
import { Send, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function MessageModal({ isOpen, onClose, receiverName, onMessageSent }) {
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [errorMessage, setErrorMessage] = useState('');

  // Reset modal state on open/close
  useEffect(() => {
    if (isOpen) {
      setMessageText('');
      setStatus('idle');
      setErrorMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setErrorMessage('쪽지 내용을 입력해주세요.');
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setStatus('idle');

    try {
      const response = await api.sendMessage(receiverName, messageText);
      if (response.success) {
        setStatus('success');
        setTimeout(() => {
          onMessageSent(response.message);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setErrorMessage('쪽지 전송에 실패했습니다. 다시 시도해주세요.');
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4 fade-in">
      {/* Click outside overlay to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-md transform rounded-t-2xl bg-white p-6 shadow-2xl transition-all duration-300 sm:rounded-2xl sm:scale-100">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold-light text-slate-800">
              <Send size={15} className="stroke-[2.25] text-brand-gold-dark" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              <span className="text-brand-gold-dark">@{receiverName}</span> 님에게 쪽지 보내기
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        {status === 'success' ? (
          <div className="my-8 flex flex-col items-center justify-center py-4 text-center fade-in">
            <CheckCircle2 size={48} className="text-green-500 mb-2 animate-bounce" />
            <h4 className="text-md font-bold text-slate-800">쪽지 전송 완료!</h4>
            <p className="text-xs text-slate-500 mt-1">상대방에게 쪽지가 안전하게 전달되었습니다.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                disabled={isSubmitting}
                maxLength={200}
                placeholder="상대방을 존중하는 마음을 담아 쪽지를 작성해주세요. (한국어, 영어 등 원하는 언어로 소통해보세요!)"
                className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/30 disabled:opacity-60 transition-all duration-200"
              />
              <span className="absolute bottom-3 right-3 text-[10px] font-medium text-slate-400">
                {messageText.length} / 200
              </span>
            </div>

            {/* Error message */}
            {status === 'error' && (
              <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 fade-in">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-600 hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !messageText.trim()}
                className="flex-[2] flex items-center justify-center space-x-1.5 rounded-xl bg-brand-gold py-3 text-xs font-bold text-slate-900 hover:bg-brand-gold-dark shadow-md shadow-brand-gold/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-slate-900" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>보내는 중...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>보내기</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
