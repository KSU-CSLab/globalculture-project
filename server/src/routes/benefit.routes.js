/**
 * routes/benefit.routes.js
 * @swagger
 * tags:
 *   name: Benefits
 *   description: 전용 혜택 API
 */
const router = require('express').Router();
const { getBenefits, getBenefit, createBenefit, claimBenefit } = require('../controllers/benefit.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 모든 혜택 라우트 인증 필요 (로그인한 경성대 구성원만)
router.use(protect);

/**
 * @swagger
 * /api/benefits:
 *   get:
 *     summary: 혜택 목록 (내 역할에 맞는 혜택만)
 *     tags: [Benefits]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [discount, coupon, freebie, service]
 */
router.get('/', getBenefits);

/**
 * @swagger
 * /api/benefits/{id}:
 *   get:
 *     summary: 혜택 상세
 *     tags: [Benefits]
 */
router.get('/:id', getBenefit);

/**
 * @swagger
 * /api/benefits:
 *   post:
 *     summary: 혜택 등록 (Admin)
 *     tags: [Benefits]
 */
router.post('/', authorize('admin'), upload.single('thumbnail'), createBenefit);

/**
 * @swagger
 * /api/benefits/{id}/claim:
 *   post:
 *     summary: 혜택 수령
 *     tags: [Benefits]
 */
router.post('/:id/claim', claimBenefit);

module.exports = router;
