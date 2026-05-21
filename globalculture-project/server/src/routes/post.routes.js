/**
 * routes/post.routes.js
 * @swagger
 * tags:
 *   name: Posts
 *   description: 커뮤니티 게시판 API
 */
const router = require('express').Router();
const {
  getPosts, getPost, createPost, updatePost, deletePost, toggleLike, addComment,
} = require('../controllers/post.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: 게시글 목록
 *     tags: [Posts]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [notice, free, question, exchange, promotion]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 */
router.get('/', getPosts);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: 게시글 상세 (조회수 +1)
 *     tags: [Posts]
 *     security: []
 */
router.get('/:id', getPost);

// 아래 라우트는 인증 필요
router.use(protect);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: 게시글 작성
 *     tags: [Posts]
 */
router.post('/', upload.array('images', 5), createPost);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: 게시글 수정 (작성자 또는 Admin)
 *     tags: [Posts]
 */
router.put('/:id', updatePost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: 게시글 삭제 (작성자 또는 Admin)
 *     tags: [Posts]
 */
router.delete('/:id', deletePost);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: 좋아요 토글
 *     tags: [Posts]
 */
router.post('/:id/like', toggleLike);

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: 댓글 작성
 *     tags: [Posts]
 */
router.post('/:id/comments', addComment);

module.exports = router;
