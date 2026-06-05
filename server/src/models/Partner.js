/**
 * models/Partner.js — 글로컬 파트너사 모델
 */
const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '파트너사 이름을 입력해주세요.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, '파트너사 설명을 입력해주세요.'],
    },
    category: {
      type: String,
      enum: ['restaurant', 'cafe', 'education', 'fitness', 'entertainment', 'retail', 'etc'],
      default: 'etc',
    },
    country: {
      type: String,
      default: 'KR',
    },
    logo: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    contactEmail: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    benefits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Benefit' }],
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

module.exports = mongoose.model('Partner', partnerSchema);
