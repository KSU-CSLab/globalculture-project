/**
 * routes/partner.routes.js
 * @swagger
 * tags:
 *   name: Partners
 *   description: 글로컬 파트너사 API
 */
const router = require('express').Router();
const { getPartners, getPartner, createPartner, updatePartner, deletePartner } = require('../controllers/partner.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/partners:
 *   get:
 *     summary: 파트너사 목록
 *     tags: [Partners]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [restaurant, cafe, education, fitness, entertainment, retail, etc]
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 */
router.get('/', getPartners);

/**
 * @swagger
 * /api/partners/{id}:
 *   get:
 *     summary: 파트너사 상세
 *     tags: [Partners]
 *     security: []
 */
router.get('/:id', getPartner);

// 아래 라우트는 Admin 전용
router.use(protect, authorize('admin'));

/**
 * @swagger
 * /api/partners:
 *   post:
 *     summary: 파트너사 등록 (Admin)
 *     tags: [Partners]
 */
router.post('/', upload.single('logo'), createPartner);

/**
 * @swagger
 * /api/partners/{id}:
 *   put:
 *     summary: 파트너사 수정 (Admin)
 *     tags: [Partners]
 */
router.put('/:id', upload.single('logo'), updatePartner);

/**
 * @swagger
 * /api/partners/{id}:
 *   delete:
 *     summary: 파트너사 삭제 (Admin)
 *     tags: [Partners]
 */
router.delete('/:id', deletePartner);

module.exports = router;
