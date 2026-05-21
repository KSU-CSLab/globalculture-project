import React from 'react';

const CATEGORIES = [
  { id: 'all', name: '전체' },
  { id: 'contest', name: '공모전 팀원모집' },
  { id: 'free', name: '자유게시판' },
  { id: 'exchange', name: '언어교환/일상' },
];

export default function CategoryTabs({ activeCategory, onCategoryChange }) {
  return (
    <div className="relative border-b border-slate-100 bg-white px-2 py-2">
      {/* Horizontal Scroll container */}
      <div className="no-scrollbar flex space-x-1.5 overflow-x-auto scroll-smooth py-0.5 px-2">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`relative flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ease-out select-none active:scale-95 ${
                isActive
                  ? 'bg-brand-gold text-slate-900 shadow-sm shadow-brand-gold/30 font-bold'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
