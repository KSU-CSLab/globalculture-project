/**
 * controllers/auth.controller.js
 * 회원가입, 로그인, 로그아웃, 토큰 갱신
 */
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Verification = require('../models/Verification');
const axios = require('axios');

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

// POST /api/auth/send-verification
exports.sendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: '이메일 주소를 입력해주세요.' });
    }

    if (!isAllowedEmail(email)) {
      return res.status(400).json({
        success: false,
        message: '경성대학교 이메일(@ks.ac.kr)만 인증할 수 있습니다.',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ success: false, message: '이미 가입된 이메일입니다.' });
    }

    // 랜덤 4자리 숫자 생성
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // 기존 발송 정보 삭제
    await Verification.deleteMany({ email });

    // DB 저장 (3분 만료)
    await Verification.create({ email, code });

    // SMTP 전송 옵션
    const mailContent = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #d97706; font-size: 20px; font-weight: 800; margin-bottom: 16px;">경성대 글로컬 컬쳐 허브</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            안녕하세요! 글로컬 컬쳐 허브 회원가입을 위한 이메일 인증 코드입니다.<br/>
            아래 인증번호 4자리를 입력창에 입력하여 인증을 완료해주세요.
          </p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #0f172a;">${code}</span>
          </div>
          <p style="font-size: 11px; color: #94a3b8;">
            * 이 인증번호는 발송 후 3분(180초) 동안만 유효합니다.<br/>
            * 본인이 요청하지 않은 경우 이 메일을 무시하셔도 됩니다.
          </p>
        </div>
      `;

    // 이메일 발송
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'KSU Culture Hub', email: process.env.SMTP_USER },
        to: [{ email: email }],
        subject: '[KSU Culture Hub] 경성대학교 이메일 인증번호',
        htmlContent: mailContent,
      },
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': process.env.SMTP_PASS,
        },
      },
    )

    res.json({
      success: true,
      message: '인증 메일이 발송되었습니다. 경성대 메일함을 확인해주세요!',
    });
  } catch (err) {
    console.error("💥 이메일 전송 중 에러 발생:", err);
    return res.status(500).json({
      success: false,
      message: '서버 내부 오류로 이메일 발송에 실패했습니다.',
      error: err.message
    });
  }
};

// POST /api/auth/verify-code
exports.verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: '이메일과 인증번호를 모두 입력해주세요.' });
    }

    const verification = await Verification.findOne({ email });

    if (!verification) {
      return res.status(400).json({ success: false, message: '인증 요청 기록이 없거나 만료되었습니다. 다시 요청해주세요.' });
    }

    if (verification.code !== code) {
      return res.status(400).json({ success: false, message: '인증번호가 올바르지 않습니다.' });
    }

    // 인증 완료 처리
    verification.code = 'VERIFIED';
    await verification.save();

    res.json({
      success: true,
      message: '학교 이메일 인증이 완료되었습니다!',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, studentId, department, nationality } = req.body;

    if (!isAllowedEmail(email)) {
      return res.status(400).json({
        success: false,
        message: '경성대학교 이메일(@ks.ac.kr)만 가입할 수 있습니다.',
      });
    }

    // 이메일 인증 교차 검증
    const isVerified = await Verification.findOne({ email, code: 'VERIFIED' });
    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: '이메일 인증이 수행되지 않았거나 유효시간이 초과되었습니다.',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: '이미 사용 중인 이메일입니다.' });
    }

    const user = await User.create({ name, email, password, studentId, department, nationality });
    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // 사용이 끝난 인증 임시 데이터 삭제
    await Verification.deleteMany({ email });

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
