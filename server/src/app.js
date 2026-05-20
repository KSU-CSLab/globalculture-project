/**
 * app.js — Express 앱 설정
 * KSU 글로컬 컬쳐 허브
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

// 라우터
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const eventRoutes = require('./routes/event.routes');
const benefitRoutes = require('./routes/benefit.routes');
const postRoutes = require('./routes/post.routes');
const partnerRoutes = require('./routes/partner.routes');

const app = express();

// ─── 보안 미들웨어 ──────────────────────────────────────
app.use(helmet());

// ─── CORS 설정 ──────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// ─── 요청 파싱 ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── 로깅 ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── 정적 파일 (업로드) ─────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Swagger API 문서 ────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// ─── 헬스체크 ───────────────────────────────────────────
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: 서버 헬스체크
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 서버 정상 작동 중
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'KSU Culture Hub API is running 🚀',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ─── API 라우터 ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/benefits', benefitRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/partners', partnerRoutes);

// ─── 404 처리 ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── 전역 에러 핸들러 ────────────────────────────────────
app.use(errorHandler);

module.exports = app;
