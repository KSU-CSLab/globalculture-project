import { useMemo } from 'react';
import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// BASE CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;
  if (url) {
    return url.endsWith('/api') || url.endsWith('/api/') ? url : `${url.replace(/\/$/, '')}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://globalculture-project.onrender.com/api';
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
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export const KSU_EMAIL_DOMAIN = '@ks.ac.kr';

export const validateKsuEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return email.toLowerCase().endsWith(KSU_EMAIL_DOMAIN);
};

export const INITIAL_POSTS = [];
export const INITIAL_COMMENTS = {};

// ─────────────────────────────────────────────────────────────────────────────
// HOOK DEFINITION
// ─────────────────────────────────────────────────────────────────────────────
export function useApi() {
  const api = useMemo(() => ({
    // ── AUTH ──
    login: async (email, password) => {
      const { data } = await axiosInstance.post('/auth/login', { email, password });
      const backendData = data.data;
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

    register: async (userData) => {
      const payload = {
        name: userData.nickname || userData.email.split('@')[0],
        email: userData.email,
        password: userData.password,
        role: userData.role || 'student',
        nationality: userData.preferredLanguage?.toUpperCase() || 'KR',
      };
      const { data } = await axiosInstance.post('/auth/register', payload);
      const backendData = data.data;
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

    sendVerificationEmail: async (email) => {
      const { data } = await axiosInstance.post('/auth/send-verification', { email });
      return { success: true, message: data.message };
    },

    verifyEmailCode: async (email, code) => {
      const { data } = await axiosInstance.post('/auth/verify-code', { email, code });
      return { success: true, message: data.message };
    },

    logout: async () => {
      tokenManager.clearTokens();
      try { await axiosInstance.post('/auth/logout'); } catch { }
      return { success: true };
    },

    refreshToken: async () => {
      const refresh = tokenManager.getRefreshToken();
      if (!refresh) throw new Error('리프레시 토큰이 없습니다.');
      const { data } = await axiosInstance.post('/auth/refresh', { token: refresh });
      tokenManager.setTokens(data.accessToken, data.refreshToken);
      return data;
    },

    // ── USERS ──
    getMe: async () => {
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

    updateMe: async (updateData) => {
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

    getUsers: async () => {
      const { data } = await axiosInstance.get('/users');
      return { success: true, users: data };
    },

    // ── EVENTS ──
    getEvents: async () => {
      const { data } = await axiosInstance.get('/events');
      return { success: true, events: data.data };
    },

    getEvent: async (id) => {
      const { data } = await axiosInstance.get(`/events/${id}`);
      return { success: true, event: data.data };
    },

    createEvent: async (eventData) => {
      const { data } = await axiosInstance.post('/events', eventData);
      return { success: true, message: data.message, event: data.data };
    },

    updateEvent: async (id, eventData) => {
      const { data } = await axiosInstance.put(`/events/${id}`, eventData);
      return { success: true, message: data.message, event: data.data };
    },

    deleteEvent: async (id) => {
      const { data } = await axiosInstance.delete(`/events/${id}`);
      return { success: true, ...data };
    },

    applyEvent: async (id) => {
      const { data } = await axiosInstance.post(`/events/${id}/apply`);
      return { success: true, ...data };
    },

    // ── BENEFITS ──
    getBenefits: async () => {
      const { data } = await axiosInstance.get('/benefits');
      return { success: true, benefits: data.data };
    },

    getBenefit: async (id) => {
      const { data } = await axiosInstance.get(`/benefits/${id}`);
      return { success: true, benefit: data.data };
    },

    claimBenefit: async (id) => {
      const { data } = await axiosInstance.post(`/benefits/${id}/claim`);
      return {
        success: true,
        couponCode: data.couponCode || `KSU-${id.toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        message: data.message || '혜택을 수령했습니다!',
      };
    },

    // ── POSTS ──
    getPosts: async (params = {}) => {
      const { data } = await axiosInstance.get('/posts', { params });
      return { success: true, posts: data.data };
    },

    createPost: async (postData) => {
      const { data } = await axiosInstance.post('/posts', postData);
      return { success: true, message: data.message, post: data.data };
    },

    updatePost: async (id, postData) => {
      const { data } = await axiosInstance.put(`/posts/${id}`, postData);
      return { success: true, message: data.message, post: data.data };
    },

    deletePost: async (id) => {
      const { data } = await axiosInstance.delete(`/posts/${id}`);
      return { success: true, ...data };
    },

    deleteComment: async (id) => {
      return { success: true, message: '댓글이 삭제되었습니다.' };
    },

    // ── PARTNERS ──
    getPartners: async () => {
      const { data } = await axiosInstance.get('/partners');
      return { success: true, partners: data.data };
    },

    createPartner: async (partnerData) => {
      const { data } = await axiosInstance.post('/partners', partnerData);
      return { success: true, message: data.message, partner: data.data };
    },

    // ── HEALTH CHECK ──
    healthCheck: async () => {
      const { data } = await axiosInstance.get('/health');
      return data;
    },

    // ── TRANSLATE ──
    getTranslation: async (type, id, originalText, originalTitle = '') => {
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

    // ── SIMULATED / LOCAL ACTIONS (without backend endpoints) ──
    sendMessage: async (receiverName, messageText) => {
      return {
        success: true,
        message: `[${receiverName}] 님에게 쪽지가 전송되었습니다.`,
      };
    },

    findId: async (email) => {
      if (!email.includes('@')) throw new Error('올바른 이메일 주소를 입력해주세요.');
      return { success: true, username: email.split('@')[0], message: `가입된 아이디: [ ${email.split('@')[0]} ]` };
    },

    resetPassword: async (username, email) => {
      if (!username || !email.includes('@')) throw new Error('일치하는 회원 정보가 없습니다.');
      return { success: true, message: `${email}로 비밀번호 재설정 링크를 발송했습니다!` };
    },

    signup: async (userData) => {
      return api.register(userData);
    },

    findPassword: async (username, email) => {
      return api.resetPassword(username, email);
    }
  }), []);

  return api;
}
