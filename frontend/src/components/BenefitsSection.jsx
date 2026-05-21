import React, { useState, useEffect } from 'react';
import { Gift, Tag, Clock, Users, Loader2, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { api } from '../services/api';

const CAT_STYLES = {
  food:      { label: '음식/카페',   cls: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  education: { label: '교육',        cls: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  transport: { label: '교통',        cls: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30' },
  culture:   { label: '문화',        cls: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  shopping:  { label: '쇼핑',        cls: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30' },
};

const ROLE_LABELS = { student: '재학생', staff: '교직원', admin: '관리자' };

export default function BenefitsSection({ user, showToast }) {
  const [benefits, setBenefits]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [claiming, setClaiming]   = useState(null);
  const [claimedCodes, setClaimedCodes] = useState({}); // benefitId → couponCode

  useEffect(() => { loadBenefits(); }, []);

  const loadBenefits = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.getBenefits();
      if (res.success) setBenefits(res.benefits);
    } catch { setError('혜택 정보를 불러오는 데 실패했습니다.'); }
    finally { setLoading(false); }
  };

  const handleClaim = async (benefitId, eligibleRoles) => {
    if (!user) { showToast('로그인이 필요합니다.', 'error'); return; }
    if (eligibleRoles && !eligibleRoles.includes(user.role)) {
      showToast(`이 혜택은 ${eligibleRoles.map((r) => ROLE_LABELS[r]).join(', ')} 대상입니다.`, 'error');
      return;
    }
    if (claimedCodes[benefitId]) {
      showToast('이미 수령한 혜택입니다.', 'info'); return;
    }
    setClaiming(benefitId);
    try {
      const res = await api.claimBenefit(benefitId);
      if (res.success) {
        setClaimedCodes((prev) => ({ ...prev, [benefitId]: res.couponCode }));
        setBenefits((prev) => prev.map((b) => b._id === benefitId ? { ...b, claimedCount: (b.claimedCount || 0) + 1 } : b));
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast(err.message || '혜택 수령에 실패했습니다.', 'error');
    } finally {
      setClaiming(null);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => showToast('쿠폰 코드가 복사되었습니다!', 'success'));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center space-x-2">
          <Gift size={16} className="text-brand-gold-dark dark:text-brand-gold" />
          <span>전용 혜택 <span className="text-brand-gold-dark dark:text-brand-gold">Benefits</span></span>
        </h2>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
          GET /api/benefits — 경성대 학생·교직원 전용 혜택 (할인/쿠폰)
        </p>
      </div>

      {/* Role notice */}
      {user && (
        <div className="flex items-center space-x-2 rounded-xl bg-brand-gold/8 dark:bg-brand-gold/10 border border-brand-gold/20 p-3">
          <CheckCircle2 size={13} className="text-brand-gold-dark dark:text-brand-gold flex-shrink-0" />
          <p className="text-[10.5px] font-bold text-brand-gold-dark dark:text-brand-gold">
            {ROLE_LABELS[user.role] || '재학생'} 계정 — 해당 역할 전용 혜택을 수령할 수 있습니다.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-gold" /></div>
      )}
      {error && !loading && (
        <div className="flex items-center space-x-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-4 text-xs text-red-600 dark:text-red-400 font-bold">
          <AlertCircle size={15} /><span>{error}</span>
        </div>
      )}

      {/* Benefits List */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4">
          {benefits.length === 0 ? (
            <div className="py-16 text-center text-xs font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
              등록된 혜택이 없습니다. 🎁
            </div>
          ) : (
            benefits.map((benefit) => {
              const catInfo  = CAT_STYLES[benefit.category] || CAT_STYLES.culture;
              const claimed  = claimedCodes[benefit._id];
              const canClaim = !claimed && benefit.eligibleRoles?.includes(user?.role);

              return (
                <div key={benefit._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-premium p-5 hover:border-brand-gold/30 hover:shadow-premium-hover transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Badge row */}
                      <div className="flex items-center flex-wrap gap-1.5 mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${catInfo.cls}`}>
                          {catInfo.label}
                        </span>
                        {benefit.eligibleRoles?.map((r) => (
                          <span key={r} className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {ROLE_LABELS[r]}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-sm font-black text-slate-800 dark:text-white leading-snug">{benefit.title}</h3>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{benefit.description}</p>

                      {/* Meta */}
                      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                        <span className="flex items-center space-x-1">
                          <Tag size={10} /><span className="text-brand-gold-dark dark:text-brand-gold font-extrabold">{benefit.discount}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users size={10} /><span>{benefit.claimedCount || 0}명 수령</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock size={10} /><span>~{benefit.validUntil}</span>
                        </span>
                      </div>
                      <p className="mt-1 text-[9.5px] font-bold text-slate-400">제공: {benefit.partnerName}</p>

                      {/* Claimed Coupon Code */}
                      {claimed && (
                        <div className="mt-3 flex items-center space-x-2 rounded-xl bg-brand-gold/10 border border-brand-gold/30 px-3 py-2 fade-in">
                          <span className="text-[10px] font-mono font-extrabold text-brand-gold-dark dark:text-brand-gold tracking-widest">{claimed}</span>
                          <button onClick={() => copyCode(claimed)} className="ml-auto text-slate-400 hover:text-brand-gold-dark transition-colors">
                            <Copy size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Claim Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleClaim(benefit._id, benefit.eligibleRoles)}
                        disabled={claiming === benefit._id || !!claimed}
                        className={`flex items-center space-x-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition-all active:scale-95 whitespace-nowrap ${
                          claimed
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50 cursor-default'
                            : canClaim
                            ? 'bg-brand-gold text-slate-900 hover:bg-brand-gold-dark shadow-md shadow-brand-gold/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {claiming === benefit._id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : claimed ? (
                          <><CheckCircle2 size={12} /><span>수령 완료</span></>
                        ) : (
                          <><Gift size={12} /><span>혜택 수령</span></>
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
