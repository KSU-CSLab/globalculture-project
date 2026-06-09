import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// BASE CONFIG
// Backend: Node.js Express @ http://localhost:5000
// All endpoints prefixed with /api
// ─────────────────────────────────────────────────────────────────────────────
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://ksu-culture-hub-api.vercel.app/api';
  }
  return 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true'
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// JWT TOKEN MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const tokenManager = {
  getAccessToken: () => localStorage.getItem('ksu_access_token'),
  getRefreshToken: () => localStorage.getItem('ksu_refresh_token'),
  setTokens: (access, refresh) => {
    localStorage.setItem('ksu_access_token', access);
    if (refresh) localStorage.setItem('ksu_refresh_token', refresh);
  },
  clearTokens: () => {
    localStorage.removeItem('ksu_access_token');
    localStorage.removeItem('ksu_refresh_token');
  },
};

// Attach JWT to every request
axiosInstance.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = tokenManager.getRefreshToken();
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { token: refresh }, { headers: { 'bypass-tunnel-reminder': 'true' } });
        tokenManager.setTokens(data.accessToken, data.refreshToken);
        original.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return axiosInstance(original);
      } catch {
        tokenManager.clearTokens();
        window.location.reload();
      }
    }
    return Promise.reject(err);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA (fallback when backend is not running)
// Used for demo/development mode when backend is unavailable
// ─────────────────────────────────────────────────────────────────────────────
let MOCK_MODE = true; // Dynamically toggled based on health check

export const REGISTERED_USERS = [
  {
    id: 'mock_001',
    username: 'admin',
    password: 'password123',
    nickname: '관리자 (Admin)',
    email: 'admin@ks.ac.kr',
    role: 'admin',
    preferredLanguage: 'ko',
  },
  {
    id: 'mock_002',
    username: 'student1',
    password: 'password123',
    nickname: '경성 학생',
    email: 'student1@ks.ac.kr',
    role: 'student',
    preferredLanguage: 'ko',
  },
  {
    id: 'mock_003',
    username: 'staff1',
    password: 'password123',
    nickname: '교직원 홍길동',
    email: 'staff1@ks.ac.kr',
    role: 'staff',
    preferredLanguage: 'ko',
  },
];

// Mock Posts (matching /api/posts schema)
export const INITIAL_POSTS = [
  {
    id: 1,
    category: 'contest',
    author: '익명 (작성자)',
    authorId: 'mock_001',
    isSelf: true,
    time: '2시간 전',
    title: '혹시 ICT 공모전 팀원 구하시는 분 계신가요?',
    content:
      '이번 학기에 열리는 ICT 연합 대학생 공모전 나가려고 하는데, 프론트엔드 개발자 한 분과 디자이너 한 분 구합니다! 현재 백엔드 개발자 2명(저 포함) 확보된 상태입니다.',
    likes: 8,
    commentsCount: 3,
    liked: false,
    lang: 'ko',
    translatedTitle: 'Is anyone looking for an ICT contest teammate?',
    translatedContent:
      "I'm planning to participate in the ICT United University Student Contest held this semester, and I'm looking for one frontend developer and one designer!",
  },
  {
    id: 2,
    category: 'exchange',
    author: 'Sarah Jones',
    authorId: 'user_202',
    isSelf: false,
    time: '3시간 전',
    title: 'Looking for language exchange buddies near the campus! 🇰🇷🇺🇸',
    content:
      "Hey guys! I just arrived in Korea last week as an exchange student from the US. I really want to improve my Korean!",
    likes: 12,
    commentsCount: 2,
    liked: true,
    lang: 'en',
    translatedTitle: '캠퍼스 근처에서 언어교환 할 친구를 찾고 있어요! 🇰🇷🇺🇸',
    translatedContent:
      '안녕하세요 여러분! 저는 미국에서 교환학생으로 한국에 온 사라입니다. 한국어 실력을 키우고 싶어요!',
  },
  {
    id: 3,
    category: 'free',
    author: '익명 2',
    authorId: 'user_303',
    isSelf: false,
    time: '5시간 전',
    title: '有人想一起练习韩语口语吗？🇨🇳🇰🇷',
    content:
      '大家好！我是刚来半年的留学生，目前在准备TOPIK 5级，但是口语还是有点弱。',
    likes: 5,
    commentsCount: 2,
    liked: false,
    lang: 'zh',
    translatedTitle: '같이 한국어 말하기 연습하실 분 계신가요? 🇨🇳🇰🇷',
    translatedContent:
      '안녕하세요! 저는 한국에 온 지 반년 된 유학생입니다. 현재 TOPIK 5급을 준비 중입니다.',
  },
  {
    id: 4,
    category: 'exchange',
    author: 'Nguyen Min',
    authorId: 'user_404',
    isSelf: false,
    time: '1일 전',
    title: 'Tìm quán ăn Việt Nam ngon quanh trường 🍜',
    content:
      'Chào mọi người, mình mới đến Hàn Quốc được 2 tuần. Cho mình hỏi quanh trường có quán ăn Việt Nam nào ngon không ạ?',
    likes: 15,
    commentsCount: 1,
    liked: false,
    lang: 'vi',
    translatedTitle: '학교 주변 맛있는 베트남 음식점 찾아요 🍜',
    translatedContent:
      '안녕하세요! 한국에 온 지 2주 되었습니다. 학교 주변에 베트남 음식점이 있나요?',
  },
];

export const INITIAL_COMMENTS = {
  1: [
    {
      id: 101, author: '익명 1', authorId: 'user_202', isSelf: false,
      time: '1시간 전', content: 'Hello! I am very interested in UI design for this contest. Can I join?',
      lang: 'en', translatedContent: '안녕하세요! 이 공모전의 UI 디자인에 매우 관심이 있습니다. 합류해도 될까요?', likes: 2,
    },
    {
      id: 102, author: '익명 2', authorId: 'mock_001', isSelf: true,
      time: '45분 전', content: '와 정말요! UI 디자이너분이 꼭 필요했는데 너무 좋습니다. 쪽지 주세요~',
      lang: 'ko', translatedContent: 'Oh really! We absolutely needed a UI designer. Send me a DM~', likes: 1,
    },
    {
      id: 103, author: '익명 3', authorId: 'user_303', isSelf: false,
      time: '20분 전', content: 'Phần mềm này có cần kinh nghiệm về Flutter không bạn?',
      lang: 'vi', translatedContent: '이 소프트웨어는 Flutter 경험이 필요한가요?', likes: 0,
    },
  ],
  2: [
    {
      id: 201, author: '익명 1', authorId: 'mock_001', isSelf: true,
      time: '2시간 전', content: '저요! 영어 회화 연습하고 싶은데 같이 공부해요!',
      lang: 'ko', translatedContent: 'Me! I want to practice English conversation!', likes: 3,
    },
    {
      id: 202, author: 'Sarah Jones', authorId: 'user_202', isSelf: false,
      time: '1시간 전', content: "That sounds awesome! I'll send you a message right away.",
      lang: 'en', translatedContent: '정말 좋네요! 지금 바로 쪽지 보낼게요.', likes: 1,
    },
  ],
  3: [
    {
      id: 301, author: '익명 1', authorId: 'user_505', isSelf: false,
      time: '4시간 전', content: '저도 TOPIK 준비 중인데 같이 공부하면 좋겠네요! 몽골에서 왔습니다.',
      lang: 'ko', translatedContent: "I'm also preparing for TOPIK! I'm from Mongolia.", likes: 2,
    },
  ],
  4: [
    {
      id: 401, author: '익명 1', authorId: 'user_606', isSelf: false,
      time: '12시간 전', content: "정문 건너편 '포글로벌' 진짜 현지 맛이에요! 강력 추천해요!",
      lang: 'ko', translatedContent: "'Pho Global' across the main gate is authentic! Highly recommended!", likes: 5,
    },
  ],
};

// Mock Events (matching /api/events schema)
export const MOCK_EVENTS = [
  {
    _id: 'evt_001',
    title: '2026 경성대학교 글로컬 문화제',
    description: '한국 전통 문화와 세계 각국의 문화를 체험하는 연간 최대 행사입니다. 음식 부스, 공연, 전시 등 다양한 프로그램이 준비되어 있습니다.',
    date: '2026-06-15T14:00:00Z',
    location: '경성대학교 대운동장',
    category: 'cultural',
    capacity: 500,
    applicants: 127,
    imageUrl: null,
    createdAt: '2026-05-01T00:00:00Z',
  },
  {
    _id: 'evt_002',
    title: '한국어-영어 언어교환 파티 🌐',
    description: '매달 진행되는 언어교환 네트워킹 파티입니다. 한국어를 배우고 싶은 외국인과 영어를 배우고 싶은 한국 학생을 연결해 드립니다.',
    date: '2026-05-30T18:00:00Z',
    location: '학생회관 3층 세미나실',
    category: 'exchange',
    capacity: 60,
    applicants: 45,
    imageUrl: null,
    createdAt: '2026-05-05T00:00:00Z',
  },
  {
    _id: 'evt_003',
    title: '글로벌 취업박람회 2026',
    description: '국내외 글로벌 기업들이 참여하는 대규모 취업박람회입니다. 다국어 가능자 우대 채용 공고를 확인하세요!',
    date: '2026-07-10T10:00:00Z',
    location: '경성대학교 컨벤션홀',
    category: 'career',
    capacity: 300,
    applicants: 89,
    imageUrl: null,
    createdAt: '2026-05-10T00:00:00Z',
  },
];

// Mock Benefits (matching /api/benefits schema)
export const MOCK_BENEFITS = [
  {
    _id: 'ben_001',
    title: '캠퍼스 주변 카페 학생 할인 20%',
    description: '경성대학교 재학생 및 교직원 전용 혜택입니다. 학생증 제시 시 음료 전 메뉴 20% 할인을 받으실 수 있습니다.',
    partnerName: '글로카페 (GloCafe)',
    discount: '20%',
    validUntil: '2026-12-31',
    category: 'food',
    eligibleRoles: ['student', 'staff'],
    claimedCount: 342,
  },
  {
    _id: 'ben_002',
    title: '온라인 언어학습 플랫폼 3개월 무료',
    description: '경성대 파트너사 제공 언어학습 앱 "LinguaKSU" 프리미엄 플랜 3개월 무료 이용권입니다.',
    partnerName: 'LinguaKSU',
    discount: '3개월 무료',
    validUntil: '2026-08-31',
    category: 'education',
    eligibleRoles: ['student'],
    claimedCount: 128,
  },
  {
    _id: 'ben_003',
    title: '공항버스 학생 할인권',
    description: '부산-인천공항 노선 공항버스 왕복 30% 할인 쿠폰입니다. 외국인 유학생 귀국 시 활용 가능합니다.',
    partnerName: '경성 공항버스',
    discount: '30%',
    validUntil: '2026-06-30',
    category: 'transport',
    eligibleRoles: ['student', 'staff'],
    claimedCount: 67,
  },
];

// Mock Partners (matching /api/partners schema)
export const MOCK_PARTNERS = [
  {
    _id: 'par_001',
    name: 'LinguaKSU',
    description: '경성대 공식 언어학습 파트너 플랫폼. AI 기반 한국어 학습 서비스 제공.',
    country: '대한민국',
    category: 'education',
    logoUrl: null,
    website: 'https://linguaksu.example.com',
  },
  {
    _id: 'par_002',
    name: 'GlobalConnect Busan',
    description: '부산 소재 글로벌 문화교류 NGO. 유학생 정착 지원 및 멘토링 프로그램 운영.',
    country: '대한민국',
    category: 'ngo',
    logoUrl: null,
    website: 'https://gcbusan.example.com',
  },
  {
    _id: 'par_003',
    name: 'Asia Pacific Exchange Network',
    description: '아시아태평양 대학 연합 교환학생 네트워크. 30개국 150개 대학 파트너십.',
    country: '국제',
    category: 'education',
    logoUrl: null,
    website: 'https://apen.example.com',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// KSU EMAIL VALIDATION
// 경성대학교 공식 도메인: @ks.ac.kr
// ─────────────────────────────────────────────────────────────────────────────
export const KSU_EMAIL_DOMAIN = '@ks.ac.kr';

export const validateKsuEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return email.toLowerCase().endsWith(KSU_EMAIL_DOMAIN);
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCK API HELPER
// Wraps mock delays and responses for offline/demo use
// ─────────────────────────────────────────────────────────────────────────────
const mockDelay = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

const mockSuccess = async (data, delay = 700) => {
  await mockDelay(delay);
  return data;
};

const mockError = async (message, delay = 700) => {
  await mockDelay(delay);
  throw new Error(message);
};

// ─────────────────────────────────────────────────────────────────────────────
// API SERVICE OBJECT
// All methods first try real backend; fall back to mock if MOCK_MODE=true
// ─────────────────────────────────────────────────────────────────────────────
export const api = {

  // ───────────────────────────────────────────────
  // AUTH — /api/auth
  // ───────────────────────────────────────────────

  /**
   * POST /api/auth/login
   * Body: { email, password }
   * Response: { token, refreshToken, user: { id, email, nickname, role } }
   */
  login: async (email, password) => {
    if (MOCK_MODE) {
      await mockDelay(800);
      const found = REGISTERED_USERS.find(
        (u) => (u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase())
               && u.password === password
      );
      if (found) {
        const token = `mock_jwt_${found.id}_${Date.now()}`;
        tokenManager.setTokens(token, `mock_refresh_${found.id}`);
        return {
          success: true,
          token,
          user: {
            id: found.id,
            username: found.username,
            nickname: found.nickname,
            email: found.email,
            role: found.role,
            preferredLanguage: found.preferredLanguage || 'ko',
          },
          message: `${found.nickname} 님, 환영합니다!`,
        };
      }
      throw new Error('아이디/이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    const backendData = data.data; // { user, accessToken, refreshToken }
    if (backendData && backendData.accessToken) {
      tokenManager.setTokens(backendData.accessToken, backendData.refreshToken);
      const mappedUser = {
        id: backendData.user._id,
        username: backendData.user.email.split('@')[0],
        nickname: backendData.user.name,
        email: backendData.user.email,
        role: backendData.user.role,
        preferredLanguage: backendData.user.nationality?.toLowerCase() || 'ko',
      };
      return {
        success: true,
        user: mappedUser,
        message: data.message || '로그인 성공',
      };
    }
    return { success: true, ...data };
  },

  /**
   * POST /api/auth/register
   * Body: { email, password, nickname, role, preferredLanguage }
   * 학교 이메일 도메인 @ks.ac.kr 검증 필수
   */
  register: async (userData) => {
    if (MOCK_MODE) {
      await mockDelay(800);
      if (!validateKsuEmail(userData.email)) {
        throw new Error(`경성대학교 이메일(@ks.ac.kr)만 가입 가능합니다.`);
      }
      const exists = REGISTERED_USERS.some(
        (u) => u.email.toLowerCase() === userData.email.toLowerCase()
             || (userData.username && u.username?.toLowerCase() === userData.username.toLowerCase())
      );
      if (exists) throw new Error('이미 가입된 이메일 또는 아이디입니다.');

      const newUser = {
        id: `mock_${Date.now()}`,
        username: userData.username || userData.email.split('@')[0],
        password: userData.password,
        nickname: userData.nickname || `익명_${Math.floor(Math.random() * 9000) + 1000}`,
        email: userData.email,
        role: userData.role || 'student',
        preferredLanguage: userData.preferredLanguage || 'ko',
      };
      REGISTERED_USERS.push(newUser);
      return { success: true, message: '회원가입이 완료되었습니다! 로그인해 주세요.' };
    }
    const payload = {
      name: userData.nickname || userData.email.split('@')[0],
      email: userData.email,
      password: userData.password,
      role: userData.role || 'student',
      nationality: userData.preferredLanguage?.toUpperCase() || 'KR',
    };
    const { data } = await axiosInstance.post('/auth/register', payload);
    const backendData = data.data; // { user, accessToken, refreshToken }
    if (backendData && backendData.accessToken) {
      tokenManager.setTokens(backendData.accessToken, backendData.refreshToken);
      const mappedUser = {
        id: backendData.user._id,
        username: backendData.user.email.split('@')[0],
        nickname: backendData.user.name,
        email: backendData.user.email,
        role: backendData.user.role,
        preferredLanguage: backendData.user.nationality?.toLowerCase() || 'ko',
      };
      return {
        success: true,
        user: mappedUser,
        message: data.message || '회원가입이 완료되었습니다.',
      };
    }
    return { success: true, ...data };
  },

  /**
   * POST /api/auth/send-verification
   * Body: { email }
   */
  sendVerificationEmail: async (email) => {
    if (MOCK_MODE) {
      await mockDelay(800);
      if (!email.includes('@') || email.length < 5) throw new Error('올바른 이메일 주소를 입력해주세요.');
      if (!validateKsuEmail(email)) throw new Error(`경성대학교 이메일(${KSU_EMAIL_DOMAIN})만 가입이 가능합니다.`);
      return {
        success: true,
        code: '1234',
        message: `[인증 코드: 1234]가 ${email}로 발송되었습니다. 3분 이내에 입력해주세요!`,
      };
    }
    const { data } = await axiosInstance.post('/auth/send-verification', { email });
    return { success: true, message: data.message };
  },

  /**
   * POST /api/auth/verify-code
   * Body: { email, code }
   */
  verifyEmailCode: async (email, code) => {
    if (MOCK_MODE) {
      await mockDelay(500);
      if (code === '1234') return { success: true, message: '학교 메일 인증이 완료되었습니다!' };
      throw new Error('인증 번호가 일치하지 않습니다. 다시 입력해주세요.');
    }
    const { data } = await axiosInstance.post('/auth/verify-code', { email, code });
    return { success: true, message: data.message };
  },

  /**
   * POST /api/auth/logout
   * Clears local tokens
   */
  logout: async () => {
    tokenManager.clearTokens();
    if (MOCK_MODE) return mockSuccess({ success: true, message: '로그아웃 되었습니다.' }, 200);
    try { await axiosInstance.post('/auth/logout'); } catch {}
    return { success: true };
  },

  /**
   * POST /api/auth/refresh
   * Handled automatically by axios interceptor
   */
  refreshToken: async () => {
    const refresh = tokenManager.getRefreshToken();
    if (!refresh) throw new Error('리프레시 토큰이 없습니다.');
    const { data } = await axiosInstance.post('/auth/refresh', { token: refresh });
    tokenManager.setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  // ───────────────────────────────────────────────
  // USERS — /api/users
  // ───────────────────────────────────────────────

  /**
   * GET /api/users/me
   */
  getMe: async () => {
    if (MOCK_MODE) {
      const token = tokenManager.getAccessToken();
      if (!token) throw new Error('인증이 필요합니다.');
      const idMatch = token.match(/mock_jwt_(.+?)_/);
      if (idMatch) {
        const user = REGISTERED_USERS.find((u) => u.id === idMatch[1]);
        if (user) return mockSuccess({ success: true, user });
      }
      throw new Error('사용자 정보를 찾을 수 없습니다.');
    }
    const { data } = await axiosInstance.get('/users/me');
    const backendUser = data.data;
    if (backendUser) {
      const mappedUser = {
        id: backendUser._id,
        username: backendUser.email.split('@')[0],
        nickname: backendUser.name,
        email: backendUser.email,
        role: backendUser.role,
        preferredLanguage: backendUser.nationality?.toLowerCase() || 'ko',
      };
      return { success: true, user: mappedUser };
    }
    return { success: true, user: data };
  },

  /**
   * PUT /api/users/me
   * Body: { nickname, preferredLanguage }
   */
  updateMe: async (updateData) => {
    if (MOCK_MODE) {
      await mockDelay(600);
      const token = tokenManager.getAccessToken();
      const idMatch = token?.match(/mock_jwt_(.+?)_/);
      if (idMatch) {
        const idx = REGISTERED_USERS.findIndex((u) => u.id === idMatch[1]);
        if (idx !== -1) {
          REGISTERED_USERS[idx] = { ...REGISTERED_USERS[idx], ...updateData };
          return { success: true, user: REGISTERED_USERS[idx], message: '프로필이 수정되었습니다.' };
        }
      }
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    const payload = {
      name: updateData.nickname,
      nationality: updateData.preferredLanguage?.toUpperCase(),
      department: updateData.department,
      bio: updateData.bio,
      studentId: updateData.studentId,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    const { data } = await axiosInstance.put('/users/me', payload);
    const backendUser = data.data;
    if (backendUser) {
      const mappedUser = {
        id: backendUser._id,
        username: backendUser.email.split('@')[0],
        nickname: backendUser.name,
        email: backendUser.email,
        role: backendUser.role,
        preferredLanguage: backendUser.nationality?.toLowerCase() || 'ko',
      };
      return { success: true, user: mappedUser, message: data.message || '프로필이 수정되었습니다.' };
    }
    return { success: true, ...data };
  },

  /**
   * GET /api/users — Admin only
   */
  getUsers: async () => {
    if (MOCK_MODE) return mockSuccess({ success: true, users: REGISTERED_USERS });
    const { data } = await axiosInstance.get('/users');
    return { success: true, users: data };
  },

  // ───────────────────────────────────────────────
  // EVENTS — /api/events
  // ───────────────────────────────────────────────

  /** GET /api/events */
  getEvents: async () => {
    if (MOCK_MODE) return mockSuccess({ success: true, events: MOCK_EVENTS }, 500);
    const { data } = await axiosInstance.get('/events');
    return { success: true, events: data.data };
  },

  /** GET /api/events/:id */
  getEvent: async (id) => {
    if (MOCK_MODE) {
      const event = MOCK_EVENTS.find((e) => e._id === id);
      if (!event) return mockError('이벤트를 찾을 수 없습니다.');
      return mockSuccess({ success: true, event });
    }
    const { data } = await axiosInstance.get(`/events/${id}`);
    return { success: true, event: data.data };
  },

  /** POST /api/events — Admin */
  createEvent: async (eventData) => {
    if (MOCK_MODE) {
      const newEvent = { _id: `evt_${Date.now()}`, ...eventData, applicants: 0, createdAt: new Date().toISOString() };
      MOCK_EVENTS.unshift(newEvent);
      return mockSuccess({ success: true, event: newEvent, message: '이벤트가 등록되었습니다.' });
    }
    const { data } = await axiosInstance.post('/events', eventData);
    return { success: true, message: data.message, event: data.data };
  },

  /** PUT /api/events/:id — Admin */
  updateEvent: async (id, eventData) => {
    if (MOCK_MODE) {
      const idx = MOCK_EVENTS.findIndex((e) => e._id === id);
      if (idx === -1) return mockError('이벤트를 찾을 수 없습니다.');
      MOCK_EVENTS[idx] = { ...MOCK_EVENTS[idx], ...eventData };
      return mockSuccess({ success: true, event: MOCK_EVENTS[idx], message: '이벤트가 수정되었습니다.' });
    }
    const { data } = await axiosInstance.put(`/events/${id}`, eventData);
    return { success: true, message: data.message, event: data.data };
  },

  /** DELETE /api/events/:id — Admin */
  deleteEvent: async (id) => {
    if (MOCK_MODE) {
      const idx = MOCK_EVENTS.findIndex((e) => e._id === id);
      if (idx !== -1) MOCK_EVENTS.splice(idx, 1);
      return mockSuccess({ success: true, message: '이벤트가 삭제되었습니다.' }, 400);
    }
    const { data } = await axiosInstance.delete(`/events/${id}`);
    return { success: true, ...data };
  },

  /** POST /api/events/:id/apply */
  applyEvent: async (id) => {
    if (MOCK_MODE) {
      const event = MOCK_EVENTS.find((e) => e._id === id);
      if (event) event.applicants = (event.applicants || 0) + 1;
      return mockSuccess({ success: true, message: '이벤트 신청이 완료되었습니다!' });
    }
    const { data } = await axiosInstance.post(`/events/${id}/apply`);
    return { success: true, ...data };
  },

  // ───────────────────────────────────────────────
  // BENEFITS — /api/benefits
  // ───────────────────────────────────────────────

  /** GET /api/benefits */
  getBenefits: async () => {
    if (MOCK_MODE) return mockSuccess({ success: true, benefits: MOCK_BENEFITS }, 500);
    const { data } = await axiosInstance.get('/benefits');
    return { success: true, benefits: data.data };
  },

  /** GET /api/benefits/:id */
  getBenefit: async (id) => {
    if (MOCK_MODE) {
      const benefit = MOCK_BENEFITS.find((b) => b._id === id);
      if (!benefit) return mockError('혜택을 찾을 수 없습니다.');
      return mockSuccess({ success: true, benefit });
    }
    const { data } = await axiosInstance.get(`/benefits/${id}`);
    return { success: true, benefit: data.data };
  },

  /** POST /api/benefits/:id/claim */
  claimBenefit: async (id) => {
    if (MOCK_MODE) {
      const benefit = MOCK_BENEFITS.find((b) => b._id === id);
      if (benefit) benefit.claimedCount = (benefit.claimedCount || 0) + 1;
      return mockSuccess({
        success: true,
        couponCode: `KSU-${id.toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        message: '혜택 쿠폰이 발급되었습니다!',
      });
    }
    const { data } = await axiosInstance.post(`/benefits/${id}/claim`);
    return {
      success: true,
      couponCode: data.couponCode || `KSU-${id.toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      message: data.message || '혜택을 수령했습니다!',
    };
  },

  // ───────────────────────────────────────────────
  // POSTS — /api/posts
  // ───────────────────────────────────────────────

  /** GET /api/posts */
  getPosts: async (params = {}) => {
    if (MOCK_MODE) return mockSuccess({ success: true, posts: INITIAL_POSTS }, 400);
    const { data } = await axiosInstance.get('/posts', { params });
    return { success: true, posts: data.data };
  },

  /** POST /api/posts */
  createPost: async (postData) => {
    if (MOCK_MODE) {
      const newPost = {
        id: Date.now(),
        ...postData,
        likes: 0, commentsCount: 0, liked: false,
        time: '방금 전',
        createdAt: new Date().toISOString(),
      };
      INITIAL_POSTS.unshift(newPost);
      return mockSuccess({ success: true, post: newPost, message: '게시글이 등록되었습니다.' });
    }
    const { data } = await axiosInstance.post('/posts', postData);
    return { success: true, message: data.message, post: data.data };
  },

  /** PUT /api/posts/:id */
  updatePost: async (id, postData) => {
    if (MOCK_MODE) {
      const idx = INITIAL_POSTS.findIndex((p) => p.id === id);
      if (idx !== -1) INITIAL_POSTS[idx] = { ...INITIAL_POSTS[idx], ...postData };
      return mockSuccess({ success: true, message: '게시글이 수정되었습니다.' });
    }
    const { data } = await axiosInstance.put(`/posts/${id}`, postData);
    return { success: true, message: data.message, post: data.data };
  },

  /** DELETE /api/posts/:id */
  deletePost: async (id) => {
    if (MOCK_MODE) return mockSuccess({ success: true, message: '게시글이 삭제되었습니다.' }, 500);
    const { data } = await axiosInstance.delete(`/posts/${id}`);
    return { success: true, ...data };
  },

  /** DELETE comment (local-only — backend uses posts comments sub-route) */
  deleteComment: async (id) => {
    return mockSuccess({ success: true, message: '댓글이 삭제되었습니다.' }, 400);
  },

  // ───────────────────────────────────────────────
  // PARTNERS — /api/partners
  // ───────────────────────────────────────────────

  /** GET /api/partners */
  getPartners: async () => {
    if (MOCK_MODE) return mockSuccess({ success: true, partners: MOCK_PARTNERS }, 500);
    const { data } = await axiosInstance.get('/partners');
    return { success: true, partners: data.data };
  },

  /** POST /api/partners — Admin */
  createPartner: async (partnerData) => {
    if (MOCK_MODE) {
      const newPartner = { _id: `par_${Date.now()}`, ...partnerData };
      MOCK_PARTNERS.push(newPartner);
      return mockSuccess({ success: true, partner: newPartner, message: '파트너사가 등록되었습니다.' });
    }
    const { data } = await axiosInstance.post('/partners', partnerData);
    return { success: true, message: data.message, partner: data.data };
  },

  // ───────────────────────────────────────────────
  // HEALTH CHECK — /api/health
  // ───────────────────────────────────────────────
  healthCheck: async () => {
    try {
      // Always test real backend health
      const { data } = await axiosInstance.get('/health');
      MOCK_MODE = false;
      return data;
    } catch (err) {
      MOCK_MODE = true;
      throw err;
    }
  },

  // ───────────────────────────────────────────────
  // LEGACY / UTILITY (kept for backward compatibility)
  // ───────────────────────────────────────────────

  /** Translation via backend router */
  getTranslation: async (type, id, originalText, originalTitle = '') => {
    console.log("api.getTranslation 호출됨:", { type, id, MOCK_MODE, originalTitle, textSnippet: originalText?.slice(0, 30) });
    if (MOCK_MODE) {
      await mockDelay(600);
      if (type === 'post') {
        const post = INITIAL_POSTS.find((p) => p.id === id);
        if (post) return { translatedTitle: post.translatedTitle, translatedContent: post.translatedContent };
      }
      return {
        translatedTitle: `[Translated] ${originalText?.slice(0, 20)}...`,
        translatedContent: `[Translation] ${originalText}`,
      };
    }

    const browserLang = navigator.language || 'ko';

    const { data } = await axiosInstance.post('/translate', {
      type,
      originalText,
      originalTitle,
      targetLang: browserLang,
    });

    if (data && data.success && data.data) {
      return data.data;
    }
    throw new Error(data?.message || '번역에 실패했습니다.');
  },

  /** Send message (DM) — simulated */
  sendMessage: async (receiverName, messageText) => {
    return mockSuccess({
      success: true,
      message: `[${receiverName}] 님에게 쪽지가 전송되었습니다.`,
    }, 600);
  },

  /** Email verification (for signup) */
  sendVerificationEmail: async (email) => {
    await mockDelay(800);
    if (!email.includes('@') || email.length < 5) throw new Error('올바른 이메일 주소를 입력해주세요.');
    if (!validateKsuEmail(email)) throw new Error(`경성대학교 이메일(${KSU_EMAIL_DOMAIN})만 가입 가능합니다.`);
    return {
      success: true,
      code: '1234',
      message: `[인증 코드: 1234]가 ${email}로 발송되었습니다. 3분 이내에 입력해주세요!`,
    };
  },

  /** Verify email code */
  verifyEmailCode: async (email, code) => {
    await mockDelay(500);
    if (code === '1234') return { success: true, message: '학교 메일 인증이 완료되었습니다!' };
    throw new Error('인증 번호가 일치하지 않습니다. 다시 입력해주세요.');
  },

  /** Signup (legacy alias → register) */
  signup: async (userData) => api.register(userData),

  /** Find ID by email */
  findId: async (email) => {
    await mockDelay(600);
    const user = REGISTERED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) return { success: true, username: user.username, message: `가입된 아이디: [ ${user.username} ]` };
    throw new Error('등록되지 않은 이메일 주소입니다.');
  },

  /** Reset password */
  resetPassword: async (username, email) => {
    await mockDelay(800);
    const user = REGISTERED_USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.email.toLowerCase() === email.toLowerCase()
    );
    if (user) return { success: true, message: `${email}로 비밀번호 재설정 링크를 발송했습니다!` };
    throw new Error('일치하는 회원 정보가 없습니다.');
  },

  /** Legacy: findPassword alias */
  findPassword: async (username, email) => api.resetPassword(username, email),
};

export default api;
