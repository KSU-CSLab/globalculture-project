/**
 * server.js — HTTP 서버 시작점
 * KSU 글로컬 컬쳐 허브
 */
require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// MongoDB 연결 후 서버 시작
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('==============================================');
    console.log('  🏛️  KSU Global Culture Hub API Server');
    console.log('==============================================');
    console.log(`  🚀 Server    : http://localhost:${PORT}`);
    console.log(`  📄 API Docs  : http://localhost:${PORT}/api-docs`);
    console.log(`  🌱 Mode      : ${process.env.NODE_ENV || 'development'}`);
    console.log('==============================================');
  });
}).catch((err) => {
  console.error('❌ DB 연결 실패, 서버를 종료합니다.', err);
  process.exit(1);
});
