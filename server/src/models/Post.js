/**
 * models/Post.js — 커뮤니티 게시글 모델
 */
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, '제목을 입력해주세요.'],
      trim: true,
      maxlength: [100, '제목은 100자 이하여야 합니다.'],
    },
    content: {
      type: String,
      required: [true, '내용을 입력해주세요.'],
    },
    category: {
      type: String,
      enum: ['notice', 'free', 'question', 'exchange', 'promotion'],
      default: 'free',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    images: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    viewCount: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// 텍스트 검색 인덱스
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
