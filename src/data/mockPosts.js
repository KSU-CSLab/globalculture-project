export const mockPostsData = [
  {
    id: 1,
    category: "자유게시판",
    author: "익명 (미국 유학생)",
    isAnonymous: true,
    time: "5분 전",
    title: "Are there any good Korean restaurants near the campus that are halal-friendly?",
    content: "Hi guys! I just arrived at the campus this week as a new exchange student. Some of my friends are looking for halal-friendly or vegetarian-friendly Korean food options nearby. Any recommendations for bibimbap or places with vegetable-based dishes would be highly appreciated! Thank you! 😊",
    likes: 12,
    commentsCount: 3,
    originalLanguage: "en",
    translations: {
      ko: {
        title: "캠퍼스 근처에 할랄 푸드가 가능한 괜찮은 한국 음식점이 있나요?",
        content: "안녕하세요 여러분! 이번 주에 교환학생으로 새로 입국했어요. 제 친구들 중 몇 명이 학교 근처에서 할랄이나 채식주의자가 먹을 수 있는 한식 메뉴를 찾고 있어요. 비빔밥이나 채소 중심의 요리를 파는 맛집을 추천해주시면 정말 감사하겠습니다! 고마워요! 😊",
        language: "ko"
      }
    },
    comments: [
      {
        id: 101,
        author: "익명",
        time: "4분 전",
        content: "There is a great bibimbap place right behind the main library! You can ask them to exclude beef. They are very friendly to international students!",
        originalLanguage: "en",
        translations: {
          ko: "중앙 도서관 바로 뒤편에 비빔밥 맛집이 있어요! 소고기는 빼달라고 요청할 수 있고, 외국인 학생들에게 매우 친절하십니다!"
        }
      },
      {
        id: 102,
        author: "글로벌버디",
        time: "3분 전",
        content: "정문 쪽에 있는 '초록식탁' 식당 추천해요! 비건 메뉴가 따로 있어서 외국인 친구들이랑 자주 가요. 맛도 아주 깔끔합니다.",
        originalLanguage: "ko",
        translations: {
          en: "I highly recommend the restaurant 'Green Table' near the main gate! They have a separate vegan menu, so I often go there with my international friends. The taste is very clean."
        }
      },
      {
        id: 103,
        author: "익명",
        time: "1분 전",
        content: "Welcome to Korea! If you want, I can show you around the campus restaurants tomorrow.",
        originalLanguage: "en",
        translations: {
          ko: "한국에 오신 것을 환영합니다! 괜찮으시다면 내일 제가 학교 주변 식당들을 직접 안내해 드릴 수 있어요."
        }
      }
    ]
  },
  {
    id: 2,
    category: "공모전 팀원모집",
    author: "경영학과 22학번",
    isAnonymous: false,
    time: "25분 전",
    title: "[팀원모집] 스타트업 기획 공모전 같이 나갈 외국인 유학생 팀원 구합니다!",
    content: "안녕하세요! 이번 학기 창업진흥원 주관 글로벌 스타트업 기획 공모전에 함께 도전할 외국인 유학생 팀원을 찾고 있습니다. 저희는 현재 경영학과 학생 2명으로 구성되어 있고, 영어가 유창합니다. 한국 시장뿐만 아니라 글로벌(특히 영어권/중화권) 시장 타겟팅 아이디어를 같이 구체화할 열정적인 팀원을 모십니다. 어학 능력은 소통만 되면 상관없으니 편하게 쪽지 주세요!",
    likes: 8,
    commentsCount: 2,
    originalLanguage: "ko",
    translations: {
      en: {
        title: "[Recruitment] Seeking international students for a Startup Planning Contest!",
        content: "Hello! We are looking for international exchange students to join our team for the Global Startup Planning Contest hosted by the Startup Promotion Agency this semester. Our team currently consists of two Business Administration majors, and we are fluent in English. We are looking for passionate members to flesh out marketing ideas targeting not only Korea but global markets (especially English/Chinese-speaking areas). Language proficiency doesn't matter as long as basic communication is possible, so feel free to send a DM!",
        language: "en"
      }
    },
    comments: [
      {
        id: 201,
        author: "익명 (중국 유학생)",
        time: "18분 전",
        content: "저요! 저 중국어 원어민이고 영어도 가능해요. 스타트업 기획에 관심이 많은데 같이 참가해보고 싶습니다. 쪽지 드려도 될까요?",
        originalLanguage: "ko",
        translations: {
          en: "Me! I am a native Chinese speaker and can also speak English. I am very interested in startup planning and would love to participate. May I send you a DM?"
        }
      },
      {
        id: 202,
        author: "Alex",
        time: "10분 전",
        content: "Wow, this sounds like a great opportunity! I major in computer science and have built a few web prototypes. I'd love to join as the tech/product guy if that fits your needs.",
        originalLanguage: "en",
        translations: {
          ko: "와, 정말 좋은 기회인 것 같네요! 저는 컴퓨터공학을 전공하고 있고 웹 프로토타입을 몇 개 만들어 본 경험이 있어요. 괜찮으시다면 개발/제품 기획 파트로 합류하고 싶습니다."
        }
      }
    ]
  },
  {
    id: 3,
    category: "언어교환/일상",
    author: "익명",
    isAnonymous: true,
    time: "2시간 전",
    title: "스페인어 배우고 싶으신 분! 저랑 주말 커피챗하며 언어교환해요 ☕",
    content: "¡Hola! 저는 이번 학기에 멕시코에서 교환학생을 온 가브리엘라입니다. 한국어가 아직 서툴러서 일상 한국어 회화를 연습하고 싶어요! 대신 저는 스페인어 원어민이니까 스페인어나 기초 영어를 가르쳐 드릴 수 있습니다. 주말에 신촌 근처 카페에서 한 시간은 한국어, 한 시간은 스페인어로 가볍게 대화 나눌 메이트를 구해요!",
    likes: 19,
    commentsCount: 2,
    originalLanguage: "ko",
    translations: {
      en: {
        title: "Anyone want to learn Spanish? Let's do language exchange over coffee on weekends! ☕",
        content: "¡Hola! I am Gabriela, an exchange student from Mexico this semester. Since my Korean is still basic, I want to practice daily conversational Korean! In return, since I am a native Spanish speaker, I can teach you Spanish or basic English. Looking for a buddy to meet up at a cafe near Sinchon on weekends for a casual chat - one hour in Korean, one hour in Spanish!",
        language: "en"
      }
    },
    comments: [
      {
        id: 301,
        author: "스페인어초보",
        time: "1시간 전",
        content: "대박! 저 이번 방학에 남미 여행 계획 중이라 스페인어 기초 배우고 싶었는데 너무 완벽한 메이트네요. 댓글이나 쪽지 주세요!!",
        originalLanguage: "ko",
        translations: {
          en: "Awesome! I am planning a trip to South America this vacation and wanted to learn basic Spanish. This is a perfect match. Please reply or send a DM!!"
        }
      },
      {
        id: 302,
        author: "익명",
        time: "30분 전",
        content: "Me too! I have a DELE A2 preparation running and need speaking practice. Count me in if you have room for one more!",
        originalLanguage: "en",
        translations: {
          ko: "저도요! 현재 DELE A2 자격증 준비 중이라 말하기 연습이 꼭 필요해요. 자리가 남는다면 저도 꼭 끼워주세요!"
        }
      }
    ]
  },
  {
    id: 4,
    category: "자유게시판",
    author: "익명 (중국 유학생)",
    isAnonymous: true,
    time: "4시간 전",
    title: "学校的水</td> 还有宿舍申请的一些问题请教大家",
    content: "大家好！我是下个学期要来的新生。请问在学校宿舍里可以用电热水壶吗？另外，宿舍申请的截止日期是本周五吗？我在官网上看得不是很明白，有人能帮忙解答一下吗？非常感谢！🙏",
    likes: 5,
    commentsCount: 1,
    originalLanguage: "zh",
    translations: {
      ko: {
        title: "기숙사 신청 및 생활 관련해서 몇 가지 여쭤봅니다!",
        content: "안녕하세요! 다음 학기에 입학 예정인 신입생입니다. 학교 기숙사 내에서 개인 전기포트(무선주전자)를 사용해도 괜찮은가요? 그리고 기숙사 신청 마감일이 이번 주 금요일이 맞나요? 공식 홈페이지 안내문이 헷갈려서 여쭤봅니다. 답변해 주시면 정말 감사하겠습니다! 🙏",
        language: "ko"
      },
      en: {
        title: "Some questions about dormitory applications and life on campus!",
        content: "Hello everyone! I am an incoming freshman for the next semester. Are electric kettles allowed in the dormitory rooms? Also, is the application deadline this Friday? The official website is a bit confusing to read, could anyone help clarify? Thank you so much! 🙏",
        language: "en"
      }
    },
    comments: [
      {
        id: 401,
        author: "학생지원처",
        time: "3시간 전",
        content: "안녕하세요! 학생지원처입니다. 기숙사 내에서는 화재 예방을 위해 전열기구 사용이 제한되지만, 무선 전기포트는 허용됩니다. 그리고 이번 학기 기숙사 신청 마감일은 금요일 오후 6시가 맞습니다. 추가 문의 사항은 행정실로 연락 바랍니다.",
        originalLanguage: "ko",
        translations: {
          en: "Hello! This is the Student Services Office. For fire safety reasons, heating appliances are restricted in dormitories, but cordless electric kettles are allowed. Also, the application deadline for this semester is indeed this Friday at 6:00 PM. Please contact the administrative office for further questions.",
          zh: "大家好！这里는 学生事务处。为了防止火灾，宿舍内限制使用高功率加热电器，但允许使用无线电热水壶。另外，本学期宿舍申请截止日期确实是本周五下午6点。如有其他疑问，请联系行政室。"
        }
      }
    ]
  }
];
