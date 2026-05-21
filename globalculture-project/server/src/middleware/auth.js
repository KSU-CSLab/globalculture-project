/**
 * middleware/auth.js — JWT 인증 미들웨어
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT 토큰 검증 후 req.user 주입
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '인증 토큰이 없습니다.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: '비활성화된 계정입니다.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: '토큰이 만료되었습니다.' });
    }
    return res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
  }
};

/**
 * 역할 기반 접근 제어 (RBAC)
 * 사용 예: authorize('admin'), authorize('admin', 'staff')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `'${req.user.role}' 역할은 이 기능에 접근할 수 없습니다.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
