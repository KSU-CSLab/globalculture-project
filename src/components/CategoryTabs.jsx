import React from "react";

const CATEGORIES = ["전체", "공모전 팀원모집", "자유게시판", "언어교환/일상"];

export default function CategoryTabs({ activeCategory, onCategoryChange }) {
  return (
    <div className="bg-white border-b border-everytime-border sticky top-[53px] z-20">
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`flex-shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 ${
                isActive
                  ? "bg-everytime-red text-white shadow-sm font-bold"
                  : "bg-gray-100 text-everytime-textSub hover:bg-gray-200 hover:text-everytime-textMain"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
