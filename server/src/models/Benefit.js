/**
 * models/Benefit.js — 전용 혜택 (할인/쿠폰) 모델
 */
const mongoose = require('mongoose');

const benefitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, '혜택 제목을 입력해주세요.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, '혜택 설명을 입력해주세요.'],
    },
    type: {
      type: String,
      enum: ['discount', 'coupon', 'freebie', 'service'],
      default: 'discount',
    },
    discountRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      default: null,
    },
    targetRoles: {
      type: [String],
      enum: ['student', 'staff', 'admin'],
      default: ['student', 'staff'],
    },
    maxClaims: {
      type: Number,
      default: null, // null = 무제한
    },
    claimedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        claimedAt: { type: Date, default: Date.now },
      },
    ],
    expiresAt: {
      type: Date,
      default: null,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    isActive: {
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

// 가상 필드: 남은 수령 횟수
benefitSchema.virtual('remainingClaims').get(function () {
  if (this.maxClaims === null) return null; // 무제한
  return Math.max(0, this.maxClaims - this.claimedBy.length);
});

benefitSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Benefit', benefitSchema);
