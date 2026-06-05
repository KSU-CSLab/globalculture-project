/**
 * models/User.js — 사용자 모델
 * 역할: student | staff | admin
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '이름을 입력해주세요.'],
      trim: true,
      maxlength: [50, '이름은 50자 이하여야 합니다.'],
    },
    email: {
      type: String,
      required: [true, '이메일을 입력해주세요.'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, '유효한 이메일 형식이 아닙니다.'],
    },
    password: {
      type: String,
      required: [true, '비밀번호를 입력해주세요.'],
      minlength: [8, '비밀번호는 8자 이상이어야 합니다.'],
      select: false, // 기본 쿼리에서 제외
    },
    role: {
      type: String,
      enum: ['student', 'staff', 'admin'],
      default: 'student',
    },
    studentId: {
      type: String,
      trim: true,
      sparse: true, // 학생 이외 사용자 null 허용
    },
    department: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [300, '소개는 300자 이하여야 합니다.'],
    },
    nationality: {
      type: String,
      default: 'KR',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    claimedBenefits: [
      {
        benefit: { type: mongoose.Schema.Types.ObjectId, ref: 'Benefit' },
        claimedAt: { type: Date, default: Date.now },
      },
    ],
    appliedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  },
  { timestamps: true }
);

// 비밀번호 해싱 (저장 전)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 비밀번호 검증 메서드
userSchema.methods.matchPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// JSON 직렬화 시 password 제외
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
