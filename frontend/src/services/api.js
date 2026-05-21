import axios from 'axios';

// Local list of registered users in memory for runtime state simulation
export const REGISTERED_USERS = [
  {
    username: "admin",
    password: "password123",
    nickname: "관리자 (데모)",
    email: "admin@gloculture.edu",
    preferredLanguage: "ko"
  },
  {
    username: "gloculture",
    password: "password123",
    nickname: "글로컬쳐 (데모)",
    email: "snu_student@snu.ac.kr",
    preferredLanguage: "en"
  }
];

// Mock DB for initial demo data (supports multiple languages)
export const INITIAL_POSTS = [
  {
    id: 1,
    category: "contest",
    author: "익명 (작성자)",
    authorId: "user_101",
    isSelf: true, // Simulated logged-in user
    time: "2시간 전",
    title: "혹시 ICT 공모전 팀원 구하시는 분 계신가요?",
    content: "이번 학기에 열리는 ICT 연합 대학생 공모전 나가려고 하는데, 프론트엔드 개발자 한 분과 디자이너 한 분 구합니다! 현재 백엔드 개발자 2명(저 포함) 확보된 상태입니다. 다국어 교류 동아리 활동 경험도 우대합니다. 관심 있으신 외국인 유학생분들도 대환영입니다! 같이 재밌게 개발하고 소통해요~",
    likes: 8,
    commentsCount: 3,
    liked: false,
    lang: "ko",
    translatedTitle: "Is anyone looking for an ICT contest teammate?",
    translatedContent: "I'm planning to participate in the ICT United University Student Contest held this semester, and I'm looking for one frontend developer and one designer! Currently, two backend developers (including me) are secured. Experience in multi-language exchange clubs is also welcome. Foreign exchange students who are interested are also very welcome! Let's develop and communicate fun together~"
  },
  {
    id: 2,
    category: "exchange",
    author: "Sarah Jones",
    authorId: "user_202",
    isSelf: false,
    time: "3시간 전",
    title: "Looking for language exchange buddies near the campus! 🇰🇷🇺🇸",
    content: "Hey guys! I just arrived in Korea last week as an exchange student from the US. I really want to improve my Korean and can help you with English in return! We can grab some coffee or study together near the central library. Feel free to send me a direct message (DM) if you are interested!",
    likes: 12,
    commentsCount: 2,
    liked: true,
    lang: "en",
    translatedTitle: "캠퍼스 근처에서 언어교환 할 친구를 찾고 있어요! 🇰🇷🇺🇸",
    translatedContent: "안녕하세요 여러분! 저는 지난주에 미국에서 교환학생으로 한국에 온 사라라고 합니다. 한국어 실력을 정말 키우고 싶고, 보답으로 영어 공부를 도와드릴 수 있어요! 중앙도서관 근처에서 같이 커피를 마시거나 공부할 수 있습니다. 관심 있으시면 편하게 쪽지(DM) 주세요!"
  },
  {
    id: 3,
    category: "free",
    author: "익명 2",
    authorId: "user_303",
    isSelf: false,
    time: "5시간 전",
    title: "有人想一起练习韩语口语吗？🇨🇳🇰🇷",
    content: "大家好！我是刚来半年的留学生，目前在准备TOPIK 5级，但是口语还是有点弱。希望能找一个韩国朋友或者其他国家的留学生一起练习口语。我们可以互相学习，我也可以教你中文！有兴趣的请私信我哦~",
    likes: 5,
    commentsCount: 2,
    liked: false,
    lang: "zh",
    translatedTitle: "같이 한국어 말하기 연습하실 분 계신가요? 🇨🇳🇰🇷",
    translatedContent: "안녕하세요 여러분! 저는 한국에 온 지 반년 된 유학생입니다. 현재 TOPIK 5급을 준비하고 있지만 말하기가 아직 좀 약합니다. 한국인 친구나 다른 나라 유학생들과 함께 말하기 연습을 하고 싶습니다. 서로 배울 수 있고, 저도 중국어를 가르쳐 드릴 수 있어요! 관심 있으신 분은 쪽지 주세요~"
  },
  {
    id: 4,
    category: "exchange",
    author: "Nguyen Min",
    authorId: "user_404",
    isSelf: false,
    time: "1일 전",
    title: "Tìm quán ăn Việt Nam ngon quanh trường 🍜",
    content: "Chào mọi người, mình mới đến Hàn Quốc được 2 tuần. Cho mình hỏi quanh trường có quán ăn Việt Nam nào ngon và chuẩn vị không ạ? Thèm phở quá mà chưa biết đi đâu ăn ngon. Cảm ơn mọi người nhiều!",
    likes: 15,
    commentsCount: 1,
    liked: false,
    lang: "vi",
    translatedTitle: "학교 주변 맛있는 베트남 음식점 찾아요 🍜",
    translatedContent: "안녕하세요 여러분, 한국에 온 지 2주 되었습니다. 학교 주변에 맛있고 현지 맛을 내는 베트남 음식점이 있나요? 쌀국수가 너무 먹고 싶은데 어디가 맛있는지 모르겠네요. 다들 정말 감사합니다!"
  }
];

export const INITIAL_COMMENTS = {
  1: [
    {
      id: 101,
      author: "익명 1",
      authorId: "user_202",
      isSelf: false,
      time: "1시간 전",
      content: "Hello! I am a foreign student and very interested in UI design for this contest. Can I join your team? I can speak fluent English and basic Korean!",
      lang: "en",
      translatedContent: "안녕하세요! 저는 외국인 학생이고 이 공모전의 UI 디자인에 매우 관심이 있습니다. 팀에 합류할 수 있을까요? 저는 유창한 영어와 기초적인 한국어를 구사할 수 있습니다!",
      likes: 2
    },
    {
      id: 102,
      author: "익명 2",
      authorId: "user_101",
      isSelf: true,
      time: "45분 전",
      content: "와 정말요! UI 디자이너분이 꼭 필요했는데 너무 좋습니다. 영어로 소통하는 것도 전혀 문제없어요! 쪽지 보내주시면 오픈카톡 링크 보내드릴게요~",
      lang: "ko",
      translatedContent: "Oh really! We absolutely needed a UI designer, so this is great. Communicating in English is not a problem at all! If you send me a DM, I'll send you the Open KakaoTalk link~",
      likes: 1
    },
    {
      id: 103,
      author: "익명 3",
      authorId: "user_303",
      isSelf: false,
      time: "20분 전",
      content: "Phần mềm này có cần kinh nghiệm về Flutter không bạn?",
      lang: "vi",
      translatedContent: "이 소프트웨어는 Flutter 경험이 필요한가요?",
      likes: 0
    }
  ],
  2: [
    {
      id: 201,
      author: "익명 1",
      authorId: "user_101",
      isSelf: true,
      time: "2시간 전",
      content: "저요! 저 영어 회화 연습하고 싶은데 같이 공부해요! 저는 한국어 표준어 가르쳐 드릴 수 있어요.",
      lang: "ko",
      translatedContent: "Me! I want to practice English conversation, let's study together! I can teach you standard Korean.",
      likes: 3
    },
    {
      id: 202,
      author: "Sarah Jones",
      authorId: "user_202",
      isSelf: false,
      time: "1시간 전",
      content: "That sounds awesome! I'll send you a message right away.",
      lang: "en",
      translatedContent: "정말 좋네요! 지금 바로 쪽지 보낼게요.",
      likes: 1
    }
  ],
  3: [
    {
      id: 301,
      author: "익명 1",
      authorId: "user_505",
      isSelf: false,
      time: "4시간 전",
      content: "저도 TOPIK 준비 중인데 같이 공부하면 좋겠네요! 저는 몽골에서 왔습니다.",
      lang: "ko",
      translatedContent: "I am also preparing for TOPIK, it would be great to study together! I'm from Mongolia.",
      likes: 2
    },
    {
      id: 302,
      author: "익명 2",
      authorId: "user_303",
      isSelf: false,
      time: "3시간 전",
      content: "太棒了！那我们怎么联系呢？",
      lang: "zh",
      translatedContent: "정말 좋네요! 그럼 우리 어떻게 연락할까요?",
      likes: 0
    }
  ],
  4: [
    {
      id: 401,
      author: "익명 1",
      authorId: "user_606",
      isSelf: false,
      time: "12시간 전",
      content: "정문 건너편에 있는 '포글로벌' 진짜 현지 맛이에요! 베트남 사장님이 직접 요리하십니다. 강력 추천해요!",
      lang: "ko",
      translatedContent: "'Pho Global' across the main gate is real authentic local taste! The Vietnamese owner cooks it himself. Highly recommended!",
      likes: 5
    }
  ]
};

// Simulated Translation, Message and Authentication API services
export const api = {
  // Translate post content
  getTranslation: async (type, id, originalText) => {
    console.log(`[API] Fetching translation for ${type} ID: ${id}`);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (type === 'post') {
      const post = INITIAL_POSTS.find(p => p.id === id);
      if (post) {
        return {
          translatedTitle: post.translatedTitle,
          translatedContent: post.translatedContent
        };
      }
    } else if (type === 'comment') {
      for (const postId in INITIAL_COMMENTS) {
        const comment = INITIAL_COMMENTS[postId].find(c => c.id === id);
        if (comment) {
          return {
            translatedContent: comment.translatedContent
          };
        }
      }
    }

    return {
      translatedTitle: "[Translated] " + (originalText.slice(0, 10) + "..."),
      translatedContent: `[Translation Result] This is a mock translation for "${originalText.slice(0, 30)}..." which is requested in real-time.`
    };
  },

  // Delete post simulation
  deletePost: async (id) => {
    console.log(`[API] Deleting post ID: ${id}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: "게시글이 성공적으로 삭제되었습니다." };
  },

  // Delete comment simulation
  deleteComment: async (id) => {
    console.log(`[API] Deleting comment ID: ${id}`);
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, message: "댓글이 성공적으로 삭제되었습니다." };
  },

  // Send message simulation
  sendMessage: async (receiverName, messageText) => {
    console.log(`[API] Sending message to ${receiverName}: ${messageText}`);
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { success: true, message: `[${receiverName}] 님에게 쪽지가 정상적으로 전송되었습니다.` };
  },

  // ----------------------------------------------------
  // AUTHENTICATION SIMULATIONS (NEW IN 2ND SCOPE)
  // ----------------------------------------------------

  // 1. User Login
  login: async (username, password) => {
    console.log(`[API] Attempting login for username: ${username}`);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const user = REGISTERED_USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
      return {
        success: true,
        user: {
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          preferredLanguage: user.preferredLanguage || 'ko'
        },
        message: `${user.nickname} 님, 환영합니다!`
      };
    } else {
      throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  },

  // 2. Send Verification Email Code
  sendVerificationEmail: async (email) => {
    console.log(`[API] Sending school email verification code to: ${email}`);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simple validation (must look like email)
    if (!email.includes('@') || email.length < 5) {
      throw new Error("올바른 이메일 주소를 입력해주세요.");
    }

    return {
      success: true,
      code: "1234", // Predefined mock code
      message: `[인증 코드: 1234]가 ${email} 메일로 발송되었습니다. 3분 이내에 입력해주세요!`
    };
  },

  // 3. Verify Code
  verifyEmailCode: async (email, code) => {
    console.log(`[API] Verifying code ${code} for email: ${email}`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (code === "1234") {
      return {
        success: true,
        message: "학교 메일 인증이 성공적으로 완료되었습니다!"
      };
    } else {
      throw new Error("인증 번호가 일치하지 않습니다. 다시 입력해주세요.");
    }
  },

  // 4. Register / Sign Up
  signup: async (userData) => {
    console.log(`[API] Attempting registration for user:`, userData);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check if user already exists
    const userExists = REGISTERED_USERS.some(
      (u) => u.username.toLowerCase() === userData.username.toLowerCase()
    );

    if (userExists) {
      throw new Error("이미 사용 중인 아이디입니다.");
    }

    // Append to in-memory list
    const newUser = {
      username: userData.username,
      password: userData.password,
      nickname: userData.nickname || `익명_${Math.floor(Math.random() * 9000) + 1000}`,
      email: userData.email,
      preferredLanguage: userData.preferredLanguage || 'ko'
    };
    
    REGISTERED_USERS.push(newUser);

    return {
      success: true,
      message: "회원가입이 완료되었습니다! 로그인 해보세요."
    };
  },

  // 5. Find ID by School Email
  findId: async (email) => {
    console.log(`[API] Finding ID linked to email: ${email}`);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const user = REGISTERED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      return {
        success: true,
        username: user.username,
        message: `가입된 아이디는 [ ${user.username} ] 입니다.`
      };
    } else {
      throw new Error("등록되지 않은 학교 이메일 주소입니다.");
    }
  },

  // 6. Find & Reset Password (Simulated)
  findPassword: async (username, email) => {
    console.log(`[API] Recovering PW for ID: ${username}, email: ${email}`);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const user = REGISTERED_USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.email.toLowerCase() === email.toLowerCase()
    );

    if (user) {
      return {
        success: true,
        message: `[인증 통과] ${email} 메일로 임시 비밀번호 재설정 링크를 발송해 드렸습니다!`
      };
    } else {
      throw new Error("일치하는 회원 정보가 존재하지 않습니다.");
    }
  }
};
