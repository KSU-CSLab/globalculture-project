/**
 * config/db.js — MongoDB 연결
 */
const mongoose = require('mongoose');

let cachedDbPromise = null;

const seedDemoUsers = async () => {
  const User = require('../models/User');
  const demoUsers = [
    {
      name: '관리자 (Admin)',
      email: 'admin@ks.ac.kr',
      password: 'password123',
      role: 'admin',
      nationality: 'KR',
    },
    {
      name: '경성 학생',
      email: 'student1@ks.ac.kr',
      password: 'password123',
      role: 'student',
      nationality: 'KR',
    },
    {
      name: '교직원 홍길동',
      email: 'staff1@ks.ac.kr',
      password: 'password123',
      role: 'staff',
      nationality: 'KR',
    },
  ];

  for (const user of demoUsers) {
    try {
      const exists = await User.findOne({ email: user.email });
      if (!exists) {
        await User.create(user);
        console.log(`👤 데모 계정 생성 완료: ${user.email}`);
      }
    } catch (err) {
      console.error(`⚠️ 데모 계정 생성 중 오류 (${user.email}):`, err.message);
    }
  }
};

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
    
    // Seed demo accounts in background
    seedDemoUsers().catch((err) => console.error('Demo seeding failed:', err));
    
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
