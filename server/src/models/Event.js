/**
 * models/Event.js — 문화 이벤트 모델
 */
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, '이벤트 제목을 입력해주세요.'],
      trim: true,
      maxlength: [100, '제목은 100자 이하여야 합니다.'],
    },
    description: {
      type: String,
      required: [true, '이벤트 설명을 입력해주세요.'],
    },
    category: {
      type: String,
      enum: ['culture', 'language', 'sports', 'food', 'music', 'art', 'academic', 'etc'],
      default: 'culture',
    },
    location: {
      type: String,
      required: [true, '개최 장소를 입력해주세요.'],
    },
    startDate: {
      type: Date,
      required: [true, '시작일을 입력해주세요.'],
    },
    endDate: {
      type: Date,
      required: [true, '종료일을 입력해주세요.'],
    },
    capacity: {
      type: Number,
      required: [true, '정원을 입력해주세요.'],
      min: [1, '정원은 1명 이상이어야 합니다.'],
    },
    applicants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    thumbnail: {
      type: String,
      default: null,
    },
    tags: [{ type: String, trim: true }],
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// 가상 필드: 남은 자리
eventSchema.virtual('remainingSpots').get(function () {
  return this.capacity - this.applicants.length;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
