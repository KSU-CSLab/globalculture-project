/**
 * config/db.js — MongoDB 연결
 */
const mongoose = require('mongoose');

let cachedDbPromise = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ksu_culture';

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedDbPromise) {
    cachedDbPromise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  try {
    await cachedDbPromise;
    console.log(`✅ MongoDB 연결 성공: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (err) {
    cachedDbPromise = null; // Reset cache on failure
    console.error('❌ MongoDB 연결 실패:', err.message);
    throw err;
  }
};

// 연결 이벤트 리스너
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB 연결이 끊어졌습니다.');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB 연결 종료 (앱 종료)');
  process.exit(0);
});

module.exports = connectDB;
