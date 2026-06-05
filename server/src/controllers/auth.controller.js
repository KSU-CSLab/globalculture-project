/**
 * controllers/auth.controller.js
 * 회원가입, 로그인, 로그아웃, 토큰 갱신
 */
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ── JWT 토큰 생성 헬퍼 ─────────────────────────────────
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  return { accessToken, refreshToken };
};

// ── 학교 이메일 검증 ────────────────────────────────────
const isAllowedEmail = (email) => {
  const domains = (process.env.ALLOWED_EMAIL_DOMAINS || 'ks.ac.kr').split(',');
  return domains.some((d) => email.toLowerCase().endsWith(`@${d.trim()}`));
};

// POST /api/auth/send-code
exports.sendCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    const ksEmailRegex = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@ks\.ac\.kr$/i;
    if (!ksEmailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 학교 이메일 형식입니다.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: '이미 가입된 이메일입니다.' });
    }

    // 6자리 랜덤 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 기존 발급된 코드가 있으면 삭제
    await VerificationCode.findOneAndDelete({ email });

    // 새 코드 저장 (5분 TTL)
    await VerificationCode.create({ email, code });

    // 이메일 발송
    const { data, error } = await resend.emails.send({
      from: 'GlobalCulture <onboarding@resend.dev>', // 프로덕션에서는 실제 도메인으로 변경해야 함
      to: email,
      subject: '[경성대학교 글로컬 컬쳐 허브] 이메일 인증 코드',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2>경성대학교 글로컬 컬쳐 허브</h2>
          <p>회원가입을 위한 인증 코드입니다. 5분 안에 입력해 주세요.</p>
          <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; margin: 20px auto; width: max-content; letter-spacing: 5px;">
            ${code}
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('메일 발송 에러:', error);
      return res.status(500).json({ success: false, message: '이메일 발송에 실패했습니다.' });
    }

    res.status(200).json({ success: true, message: '인증 코드가 발송되었습니다.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, studentId, department, nationality, verificationCode } = req.body;

    const ksEmailRegex = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@ks\.ac\.kr$/i;
    if (!ksEmailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 학교 이메일 형식입니다."
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    if (!isAllowedEmail(email)) {
      return res.status(400).json({
        success: false,
        message: '경성대학교 이메일(@ks.ac.kr)만 가입할 수 있습니다.',
      });
    }

    if (!verificationCode) {
      return res.status(400).json({ success: false, message: '인증 코드를 입력해 주세요.' });
    }

    const validCode = await VerificationCode.findOne({ email, code: verificationCode });
    if (!validCode) {
      return res.status(400).json({
        success: false,
        message: '인증 코드가 만료되었거나 일치하지 않습니다.',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: '이미 사용 중인 이메일입니다.' });
    }

    const user = await User.create({ name, email, password, studentId, department, nationality });
    
    // 가입 완료 후 인증 코드 삭제
    await VerificationCode.findByIdAndDelete(validCode._id);
    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: '비활성화된 계정입니다.' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: '로그인 성공',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: '로그아웃 되었습니다.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token이 필요합니다.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: '유효하지 않은 refresh token입니다.' });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
};
