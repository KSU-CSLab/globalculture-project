import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, CheckCircle2, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';

const CATEGORY_LABELS = {
  cultural: { label: '문화', cls: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  exchange:  { label: '언어교환', cls: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  career:    { label: '커리어', cls: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30' },
  social:    { label: '소셜', cls: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30' },
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const progressPct = (applicants, capacity) =>
  Math.min(100, Math.round(((applicants || 0) / (capacity || 1)) * 100));

export default function EventsSection({ user, showToast }) {
  const api = useApi();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [applying, setApplying] = useState(null); // event id being applied

  // Admin create form
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '', category: 'cultural', capacity: 100 });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getEvents();
      if (res.success) setEvents(res.events);
    } catch (err) {
      setError('이벤트를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (eventId) => {
    if (!user) { showToast('로그인이 필요합니다.', 'error'); return; }
    setApplying(eventId);
    try {
      const res = await api.applyEvent(eventId);
      if (res.success) {
        setEvents((prev) => prev.map((e) => e._id === eventId ? { ...e, applicants: (e.applicants || 0) + 1 } : e));
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast(err.message || '신청에 실패했습니다.', 'error');
    } finally {
      setApplying(null);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      const res = await api.deleteEvent(eventId);
      if (res.success) {
        setEvents((prev) => prev.filter((e) => e._id !== eventId));
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast('삭제에 실패했습니다.', 'error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createEvent(form);
      if (res.success) {
        setEvents((prev) => [res.event, ...prev]);
        setShowCreate(false);
        setForm({ title: '', description: '', date: '', location: '', category: 'cultural', capacity: 100 });
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast(err.message || '이벤트 생성에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center space-x-2">
            <Calendar size={16} className="text-brand-gold-dark dark:text-brand-gold" />
            <span>문화 이벤트 <span className="text-brand-gold-dark dark:text-brand-gold">Events</span></span>
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
            GET /api/events — 경성대 글로컬 이벤트 목록
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center space-x-1.5 rounded-xl bg-brand-gold px-3 py-2 text-[11px] font-black text-slate-900 hover:bg-brand-gold-dark transition-all shadow-md shadow-brand-gold/20 active:scale-95"
          >
            <Plus size={13} />
            <span>이벤트 등록</span>
          </button>
        )}
      </div>

      {/* Admin Create Form */}
      {showCreate && user?.role === 'admin' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-brand-gold/30 p-5 shadow-premium fade-in">
          <h3 className="text-xs font-black text-slate-800 dark:text-white mb-4">새 이벤트 등록 (POST /api/events)</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="이벤트 제목" className="col-span-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold" />
              <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="이벤트 설명" rows={3} className="col-span-2 w-full resize-none px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold" />
              <input required type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-gold" />
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="장소" className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-gold">
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                placeholder="모집 인원" className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-gold" />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="flex-1 rounded-xl bg-brand-gold py-2.5 text-xs font-bold text-slate-900 hover:bg-brand-gold-dark transition-all">등록 완료</button>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">취소</button>
            </div>
          </form>
        </div>
      )}

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-brand-gold" />
        </div>
      )}
      {error && !loading && (
        <div className="flex items-center space-x-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-4 text-xs text-red-600 dark:text-red-400 font-bold">
          <AlertCircle size={15} /><span>{error}</span>
        </div>
      )}

      {/* Events Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4">
          {events.length === 0 ? (
            <div className="py-16 text-center text-xs font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
              등록된 이벤트가 없습니다. 🎭
            </div>
          ) : (
            events.map((event) => {
              const catInfo = CATEGORY_LABELS[event.category] || CATEGORY_LABELS.social;
              const pct     = progressPct(event.applicants, event.capacity);
              const isFull  = pct >= 100;

              return (
                <div key={event._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-premium p-5 hover:border-brand-gold/30 hover:shadow-premium-hover transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Category + Title */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${catInfo.cls}`}>
                          {catInfo.label}
                        </span>
                        {isFull && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                            마감
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-white leading-snug">{event.title}</h3>
                      <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{event.description}</p>

                      {/* Meta */}
                      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        <span className="flex items-center space-x-1"><Calendar size={11} /><span>{formatDate(event.date)}</span></span>
                        <span className="flex items-center space-x-1"><MapPin size={11} /><span>{event.location}</span></span>
                        <span className="flex items-center space-x-1"><Users size={11} /><span>{event.applicants || 0} / {event.capacity} 명</span></span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-brand-gold'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[9px] font-bold text-slate-400">{pct}% 참가 신청됨</span>
                          <span className="text-[9px] font-bold text-slate-400">잔여 {Math.max(0, (event.capacity || 0) - (event.applicants || 0))} 석</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-colors"
                          title="이벤트 삭제 (Admin)"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleApply(event._id)}
                        disabled={isFull || applying === event._id}
                        className={`flex items-center space-x-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition-all active:scale-95 ${
                          isFull
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-brand-gold text-slate-900 hover:bg-brand-gold-dark shadow-md shadow-brand-gold/20'
                        }`}
                      >
                        {applying === event._id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : isFull ? (
                          <span>마감</span>
                        ) : (
                          <>
                            <CheckCircle2 size={12} />
                            <span>신청하기</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
