import React, { useState, useEffect } from 'react';
import { Handshake, Globe, ExternalLink, Plus, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { api } from '../services/api';

const CAT_STYLES = {
  education: { label: '교육',   cls: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  ngo:       { label: 'NGO',    cls: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30' },
  business:  { label: '기업',   cls: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  research:  { label: '연구',   cls: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  media:     { label: '미디어', cls: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30' },
};

const COUNTRY_FLAGS = { '대한민국': '🇰🇷', '미국': '🇺🇸', '중국': '🇨🇳', '일본': '🇯🇵', '베트남': '🇻🇳', '국제': '🌐' };

export default function PartnersSection({ user, showToast }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]         = useState({ name: '', description: '', country: '대한민국', category: 'education', website: '' });

  useEffect(() => { loadPartners(); }, []);

  const loadPartners = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.getPartners();
      if (res.success) setPartners(res.partners);
    } catch { setError('파트너 정보를 불러오는 데 실패했습니다.'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createPartner(form);
      if (res.success) {
        setPartners((prev) => [...prev, res.partner]);
        setShowCreate(false);
        setForm({ name: '', description: '', country: '대한민국', category: 'education', website: '' });
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast(err.message || '파트너 등록에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center space-x-2">
            <Handshake size={16} className="text-brand-gold-dark dark:text-brand-gold" />
            <span>글로벌 파트너 <span className="text-brand-gold-dark dark:text-brand-gold">Partners</span></span>
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
            GET /api/partners — 경성대 글로컬 파트너사 네트워크
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center space-x-1.5 rounded-xl bg-brand-gold px-3 py-2 text-[11px] font-black text-slate-900 hover:bg-brand-gold-dark transition-all shadow-md shadow-brand-gold/20 active:scale-95"
          >
            <Plus size={13} />
            <span>파트너 등록</span>
          </button>
        )}
      </div>

      {/* Admin Create Form */}
      {showCreate && user?.role === 'admin' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-brand-gold/30 p-5 shadow-premium fade-in">
          <h3 className="text-xs font-black text-slate-800 dark:text-white mb-4">새 파트너 등록 (POST /api/partners)</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="파트너사 이름"
                className="col-span-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold" />
              <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="파트너사 설명" rows={3}
                className="col-span-2 resize-none px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold" />
              <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-gold">
                {Object.keys(COUNTRY_FLAGS).map((c) => <option key={c} value={c}>{COUNTRY_FLAGS[c]} {c}</option>)}
              </select>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-gold">
                {Object.entries(CAT_STYLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="웹사이트 URL"
                className="col-span-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-gold" />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="flex-1 rounded-xl bg-brand-gold py-2.5 text-xs font-bold text-slate-900 hover:bg-brand-gold-dark transition-all">등록 완료</button>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">취소</button>
            </div>
          </form>
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

      {/* Partners Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {partners.length === 0 ? (
            <div className="col-span-2 py-16 text-center text-xs font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
              등록된 파트너사가 없습니다. 🤝
            </div>
          ) : (
            partners.map((partner) => {
              const catInfo    = CAT_STYLES[partner.category] || CAT_STYLES.education;
              const countryFlag = COUNTRY_FLAGS[partner.country] || '🌍';

              return (
                <div key={partner._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-premium p-5 hover:border-brand-gold/30 hover:shadow-premium-hover transition-all duration-300 flex flex-col"
                >
                  {/* Logo placeholder + Name */}
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center flex-shrink-0">
                      <Building2 size={18} className="text-brand-gold-dark dark:text-brand-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-slate-800 dark:text-white truncate">{partner.name}</h3>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8.5px] font-extrabold border ${catInfo.cls}`}>
                          {catInfo.label}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">
                          {countryFlag} {partner.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 flex-1">
                    {partner.description}
                  </p>

                  {/* Website Link */}
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center space-x-1.5 text-[10px] font-bold text-brand-gold-dark dark:text-brand-gold hover:underline"
                    >
                      <Globe size={11} />
                      <span>파트너 사이트 방문</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
