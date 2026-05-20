import React from "react";
import { Flame, Heart, MessageSquare, Globe } from "lucide-react";

export default function PopularPosts({ posts, onPostClick }) {
  // Sort posts by likes descending and pick the top 3
  const popularPosts = [...posts]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);

  const handleScrollToPost = (postId) => {
    const element = document.getElementById(`post-card-${postId}`);
    if (element) {
      // Scroll smoothly to post
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Briefly trigger a highlight bounce/shadow pulse in the post card
      element.classList.add("ring-2", "ring-everytime-red/30", "shadow-lg");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-everytime-red/30", "shadow-lg");
      }, 1500);
    }
  };

  return (
    <div className="bg-white border border-everytime-border rounded-xl p-4 shadow-sm space-y-4">
      {/* Title Header */}
      <div className="flex items-center gap-1.5 pb-2.5 border-b border-gray-100">
        <Flame size={16} className="text-everytime-red fill-everytime-red animate-pulse" />
        <h3 className="text-xs font-extrabold text-everytime-textMain tracking-tight">
          실시간 인기 글
        </h3>
      </div>

      {/* Popular Posts List */}
      <div className="space-y-3.5">
        {popularPosts.map((post, idx) => (
          <div
            key={post.id}
            onClick={() => handleScrollToPost(post.id)}
            className="group cursor-pointer block hover:bg-gray-50/50 p-1.5 rounded-lg transition-all duration-200"
          >
            {/* Post Meta */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-everytime-red bg-yellow-50 py-0.5 px-1.5 rounded">
                {idx + 1}위 • {post.category}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[9px] px-1 bg-gray-100 text-gray-500 rounded uppercase font-semibold">
                  {post.originalLanguage}
                </span>
                <span className="text-[10px] text-everytime-textSub">{post.time}</span>
              </div>
            </div>

            {/* Post Snippet */}
            <h4 className="text-[11px] font-bold text-everytime-textMain leading-snug group-hover:text-everytime-red transition-colors line-clamp-1 mb-1">
              {post.title}
            </h4>
            <p className="text-[10px] text-everytime-textSub line-clamp-2 leading-normal mb-1.5">
              {post.content}
            </p>

            {/* Post Reactions */}
            <div className="flex items-center gap-2.5 text-[9px] font-bold text-everytime-textSub">
              <span className="flex items-center gap-0.5 text-everytime-red">
                <Heart size={10} className="fill-everytime-red" />
                {post.likes}
              </span>
              <span className="flex items-center gap-0.5 text-cyan-600">
                <MessageSquare size={10} className="text-cyan-500" />
                {post.comments.length}
              </span>
            </div>
          </div>
        ))}

        {popularPosts.length === 0 && (
          <div className="text-center py-4 text-xs text-everytime-textSub">
            인기 게시물이 아직 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
