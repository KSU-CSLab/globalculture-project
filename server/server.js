/**
 * server.js — HTTP 서버 시작점
 * KSU 글로컬 컬쳐 허브
 */
require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// MongoDB 비동기 연결 시도 및 서버 시작
app.listen(PORT, () => {
  console.log('==============================================');
  console.log('  🏛️  KSU Global Culture Hub API Server');
  console.log('==============================================');
  console.log(`  🚀 Server    : http://localhost:${PORT}`);
  console.log(`  📄 API Docs  : http://localhost:${PORT}/api-docs`);
  console.log(`  🌱 Mode      : ${process.env.NODE_ENV || 'development'}`);
  console.log('==============================================');

  connectDB().catch((err) => {
    console.error('⚠️ MongoDB 연결 실패 (서버는 데모/메모리 모드 또는 DB 비활성 상태로 유지됩니다):', err.message);
  });
});
