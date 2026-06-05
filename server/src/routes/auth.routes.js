/**
 * routes/auth.routes.js
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 API (회원가입, 로그인, 토큰 갱신)
 */
const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, logout, refresh } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 example: "example@ks.ac.kr"
 *               password:
 *                 type: string
 *                 minLength: 8
 *               studentId:
 *                 type: string
 *               department:
 *                 type: string
 *               nationality:
 *                 type: string
 *                 default: "KR"
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 허용되지 않는 이메일 도메인
 *       409:
 *         description: 이미 존재하는 이메일
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('이름을 입력해주세요.'),
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
    body('password').isLength({ min: 8 }).withMessage('비밀번호는 8자 이상이어야 합니다.'),
  ],
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공, JWT 반환
 *       401:
 *         description: 인증 실패
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
    body('password').notEmpty().withMessage('비밀번호를 입력해주세요.'),
  ],
  login
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 */
router.post('/logout', protect, logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Access Token 갱신
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 새 토큰 발급 성공
 */
router.post('/refresh', refresh);

module.exports = router;
