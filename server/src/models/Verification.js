/**
 * models/Verification.js
 * 이메일 인증 코드 모델 (3분 TTL 설정)
 */
const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 180, // 180초(3분) 후 문서 자동 삭제 (TTL 인덱스)
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// 단일 이메일에 대해 하나의 인증 코드만 유효하도록 인덱스 설정
verificationSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Verification', verificationSchema);
