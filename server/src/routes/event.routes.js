/**
 * routes/event.routes.js
 * @swagger
 * tags:
 *   name: Events
 *   description: 문화 이벤트 API
 */
const router = require('express').Router();
const {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent, applyEvent, cancelApply,
} = require('../controllers/event.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: 이벤트 목록
 *     tags: [Events]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [culture, language, sports, food, music, art, academic, etc]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */
router.get('/', getEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: 이벤트 상세
 *     tags: [Events]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', getEvent);

// 아래 라우트는 인증 필요
router.use(protect);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: 이벤트 생성 (Admin)
 *     tags: [Events]
 */
router.post('/', authorize('admin', 'staff'), upload.single('thumbnail'), createEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: 이벤트 수정 (Admin)
 *     tags: [Events]
 */
router.put('/:id', authorize('admin', 'staff'), upload.single('thumbnail'), updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: 이벤트 삭제 (Admin)
 *     tags: [Events]
 */
router.delete('/:id', authorize('admin'), deleteEvent);

/**
 * @swagger
 * /api/events/{id}/apply:
 *   post:
 *     summary: 이벤트 신청
 *     tags: [Events]
 */
router.post('/:id/apply', applyEvent);

/**
 * @swagger
 * /api/events/{id}/apply:
 *   delete:
 *     summary: 이벤트 신청 취소
 *     tags: [Events]
 */
router.delete('/:id/apply', cancelApply);

module.exports = router;
