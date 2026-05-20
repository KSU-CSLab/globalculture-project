import axios from "axios";
import { mockPostsData } from "../data/mockPosts";

// Create a custom axios instance
export const api = axios.create({
  baseURL: "",
});

// Configure the Axios request interceptor to act as a local mock server
api.interceptors.request.use(async (config) => {
  const postTranslateMatch = config.url.match(/\/api\/posts\/(\d+)\/translate/);
  const commentTranslateMatch = config.url.match(/\/api\/comments\/(\d+)\/translate/);

  // 1. Post Translation Mock Endpoint
  if (postTranslateMatch && config.method === "post") {
    const postId = parseInt(postTranslateMatch[1]);
    const { targetLang } = config.data || {};
    
    // Simulate real AI network processing delay (600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Find the post in the preloaded database
    const post = mockPostsData.find((p) => p.id === postId);
    
    if (post) {
      // Determine target language: default to user's requested, otherwise toggle
      let lang = targetLang || (post.originalLanguage === "ko" ? "en" : "ko");
      let translation = post.translations[lang];
      
      // If requested language isn't directly preloaded, grab first available
      if (!translation) {
        const availableLangs = Object.keys(post.translations);
        if (availableLangs.length > 0) {
          lang = availableLangs[0];
          translation = post.translations[lang];
        }
      }

      if (translation) {
        return {
          ...config,
          adapter: () => Promise.resolve({
            data: {
              success: true,
              translatedTitle: translation.title,
              translatedContent: translation.content,
              targetLanguage: lang,
              sourceLanguage: post.originalLanguage
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config
          })
        };
      }
    }
    
    // Dynamic Fallback for newly created posts by the user
    // We will simulate AI translation on the fly!
    const sourceLanguage = config.data?.sourceLanguage || "ko";
    let targetLanguage = targetLang || (sourceLanguage === "ko" ? "en" : "ko");
    
    // Simple translation simulation helper
    let simulatedTitle = config.data?.title || "Translated Post";
    let simulatedContent = config.data?.content || "Translated Content";

    if (sourceLanguage === "ko" && targetLanguage === "en") {
      simulatedTitle = `[🌐 EN Translation] ${simulatedTitle} (Translated from Korean)`;
      simulatedContent = `[🌐 This is a simulated English AI translation] Hello! Thank you for translating my post. Here is the translated content of your custom post:\n\n"${simulatedContent}"`;
    } else if (sourceLanguage !== "ko" && targetLanguage === "ko") {
      simulatedTitle = `[🌐 국문 번역] ${simulatedTitle} (번역됨)`;
      simulatedContent = `[🌐 인공지능 한국어 번역 시뮬레이션] 안녕하세요! 작성하신 외국어 글의 한글 번역본입니다:\n\n"${simulatedContent}"`;
    } else {
      simulatedTitle = `[🌐 AI ${targetLanguage.toUpperCase()}] ${simulatedTitle}`;
      simulatedContent = `[🌐 Translated to ${targetLanguage.toUpperCase()}] ${simulatedContent}`;
    }

    return {
      ...config,
      adapter: () => Promise.resolve({
        data: {
          success: true,
          translatedTitle: simulatedTitle,
          translatedContent: simulatedContent,
          targetLanguage: targetLanguage,
          sourceLanguage: sourceLanguage
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config
      })
    };
  }

  // 2. Comment Translation Mock Endpoint
  if (commentTranslateMatch && config.method === "post") {
    const commentId = parseInt(commentTranslateMatch[1]);
    const { targetLang } = config.data || {};

    // Simulate 400ms network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Look for comment inside any post
    let comment = null;
    for (const post of mockPostsData) {
      comment = post.comments?.find((c) => c.id === commentId);
      if (comment) break;
    }

    if (comment) {
      let lang = targetLang || (comment.originalLanguage === "ko" ? "en" : "ko");
      let translatedText = comment.translations?.[lang];

      if (!translatedText && comment.translations) {
        const availableLangs = Object.keys(comment.translations);
        if (availableLangs.length > 0) {
          lang = availableLangs[0];
          translatedText = comment.translations[lang];
        }
      }

      if (translatedText) {
        return {
          ...config,
          adapter: () => Promise.resolve({
            data: {
              success: true,
              translatedContent: translatedText,
              targetLanguage: lang,
              sourceLanguage: comment.originalLanguage
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config
          })
        };
      }
    }

    // Dynamic Fallback for newly created comments
    const sourceLanguage = config.data?.sourceLanguage || "ko";
    let targetLanguage = targetLang || (sourceLanguage === "ko" ? "en" : "ko");
    let originalText = config.data?.content || "Comment";
    let simulatedText = originalText;

    if (sourceLanguage === "ko" && targetLanguage === "en") {
      simulatedText = `[🌐 EN] (Translated comment): "${originalText}"`;
    } else if (sourceLanguage !== "ko" && targetLanguage === "ko") {
      simulatedText = `[🌐 국문] (번역된 댓글): "${originalText}"`;
    } else {
      simulatedText = `[🌐 ${targetLanguage.toUpperCase()}] "${originalText}"`;
    }

    return {
      ...config,
      adapter: () => Promise.resolve({
        data: {
          success: true,
          translatedContent: simulatedText,
          targetLanguage: targetLanguage,
          sourceLanguage: sourceLanguage
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config
      })
    };
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});
