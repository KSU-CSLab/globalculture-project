/**
 * routes/user.routes.js
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관리 API
 */
const router = require('express').Router();
const { getMe, updateMe, getAllUsers, changeUserRole } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 모든 라우트 인증 필요
router.use(protect);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: 내 프로필 조회
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 내 프로필 정보
 */
router.get('/me', getMe);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: 내 프로필 수정
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *               bio:
 *                 type: string
 *               nationality:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 */
router.put('/me', upload.single('avatar'), updateMe);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 전체 사용자 목록 (Admin 전용)
 *     tags: [Users]
 */
router.get('/', authorize('admin'), getAllUsers);

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: 사용자 역할 변경 (Admin 전용)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id/role', authorize('admin'), changeUserRole);

module.exports = router;
