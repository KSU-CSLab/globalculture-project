/**
 * routes/translate.routes.js
 * 번역 API 라우팅 설정
 */
const router = require('express').Router();
const { translateText } = require('../controllers/translate.controller');
const { protect } = require('../middleware/auth');

// 로그인한 사용자만 번역 요청 가능하도록 보안 조치
router.use(protect);

/**
 * @swagger
 * /api/translate:
 *   post:
 *     summary: 게시글 또는 댓글 실시간 AI 번역 (Gemini API)
 *     tags: [Translate]
 */
router.post('/', translateText);

module.exports = router;
