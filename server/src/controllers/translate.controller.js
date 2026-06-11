/**
 * controllers/translate.controller.js
 * Google Gemini API를 활용한 서버사이드 실시간 번역 컨트롤러
 *
 * [방어적 설계 원칙]
 * - 어떤 상황에서도 throw/next(err)를 통해 프로세스를 죽이지 않는다.
 * - 모든 외부 API 호출(fetch)에 타임아웃을 적용한다.
 * - JSON.parse 등 파싱 단계도 별도 try-catch로 감싼다.
 * - 모든 예외 분기에서 반드시 res.json()으로 응답을 종료한다.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const TIMEOUT_MS = 25000; // Onrender free tier: 25초 타임아웃

/**
 * fetch에 타임아웃을 적용하는 헬퍼 함수
 * AbortController를 사용하여 hanging 방지
 */
const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * POST /api/translate
 * 게시글 또는 댓글을 Gemini AI로 번역
 */
exports.translateText = async (req, res) => {
  // ── 최외곽 try-catch: 어떤 예외도 절대 프로세스를 죽이지 않는다 ──────────
  try {
    // ── 1. 요청 파라미터 안전하게 파싱 ──────────────────────────────────────
    let type, originalText, originalTitle, targetLang;
    try {
      type = req.body?.type;
      originalText = req.body?.originalText;
      originalTitle = req.body?.originalTitle || '';
      targetLang = req.body?.targetLang || 'ko';
    } catch (parseErr) {
      console.error('[번역 오류] 요청 바디 파싱 실패:', parseErr.message);
      return res.status(400).json({
        success: false,
        message: '요청 바디를 파싱하는 중 오류가 발생했습니다.',
        error: parseErr.message,
      });
    }

    console.log('[디버깅] 백엔드 번역 API 요청 수신:', {
      type,
      originalTextLength: originalText ? originalText.length : 0,
      originalTitleLength: originalTitle ? originalTitle.length : 0,
      targetLang,
    });

    // ── 2. 입력값 유효성 검증 ────────────────────────────────────────────────
    if (!originalText || typeof originalText !== 'string' || originalText.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '번역할 텍스트(originalText)가 없거나 빈 값입니다.',
        error: `전달받은 originalText: ${JSON.stringify(originalText)}`,
      });
    }

    if (!type || (type !== 'post' && type !== 'comment')) {
      return res.status(400).json({
        success: false,
        message: `번역 타입(type)이 올바르지 않습니다. 'post' 또는 'comment'만 허용됩니다.`,
        error: `전달받은 type: ${JSON.stringify(type)}`,
      });
    }

    // ── 3. API 키 확인 ────────────────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      console.error('[번역 오류] GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
      return res.status(500).json({
        success: false,
        message: '서버에 GEMINI_API_KEY가 설정되지 않았습니다. Onrender 환경 변수를 확인하세요.',
        error: 'GEMINI_API_KEY missing',
      });
    }

    // ── 4. 프롬프트 생성 ──────────────────────────────────────────────────────
    let prompt = '';
    if (type === 'post') {
      prompt = `너는 유학생 커뮤니티의 번역기야. 다음 게시글을 사용자의 브라우저 언어(현재 설정: ${targetLang})에 맞게 자연스럽게 번역해 줘. 부가 설명 없이 오직 번역된 결과만 답변해 줘.
반드시 아래 JSON 포맷으로만 응답해야 해:
{
  "translatedTitle": "번역된 제목",
  "translatedContent": "번역된 본문"
}

[번역할 게시글]
제목: ${originalTitle}
본문: ${originalText}`;
    } else {
      prompt = `너는 유학생 커뮤니티의 번역기야. 다음 댓글을 사용자의 브라우저 언어(현재 설정: ${targetLang})에 맞게 자연스럽게 번역해 줘. 부가 설명 없이 오직 번역된 결과만 답변해 줘.
반드시 아래 JSON 포맷으로만 응답해야 해:
{
  "translatedContent": "번역된 댓글 본문"
}

[번역할 댓글]
본문: ${originalText}`;
    }

    // ── 5. Gemini API 호출 (타임아웃 적용) ────────────────────────────────────
    let response;
    try {
      response = await fetchWithTimeout(
        `${GEMINI_API_URL}?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        },
        TIMEOUT_MS
      );
    } catch (fetchErr) {
      const isTimeout = fetchErr.name === 'AbortError';
      console.error('[번역 오류] Gemini API fetch 실패:', fetchErr.message);
      return res.status(502).json({
        success: false,
        message: isTimeout
          ? `Gemini API 응답 시간 초과 (${TIMEOUT_MS / 1000}초). 잠시 후 다시 시도해 주세요.`
          : `Gemini API 네트워크 오류: ${fetchErr.message}`,
        error: fetchErr.message,
      });
    }

    // ── 6. HTTP 응답 상태 코드 확인 ───────────────────────────────────────────
    if (!response.ok) {
      let errMsg = `HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        errMsg = errBody?.error?.message || errMsg;
      } catch (_) {
        // 응답 바디 파싱 실패해도 무시
      }
      console.error('[번역 오류] Gemini API HTTP 오류:', errMsg);
      return res.status(502).json({
        success: false,
        message: `Gemini API 호출 실패: ${errMsg}`,
        error: errMsg,
      });
    }

    // ── 7. 응답 바디 파싱 ─────────────────────────────────────────────────────
    let result;
    try {
      result = await response.json();
    } catch (jsonErr) {
      console.error('[번역 오류] Gemini 응답 JSON 파싱 실패:', jsonErr.message);
      return res.status(502).json({
        success: false,
        message: 'Gemini API 응답을 JSON으로 파싱하는 데 실패했습니다.',
        error: jsonErr.message,
      });
    }

    // ── 8. 응답 내 번역 텍스트 추출 ──────────────────────────────────────────
    const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText || responseText.trim() === '') {
      console.error('[번역 오류] Gemini 응답 내 텍스트 없음. 전체 응답:', JSON.stringify(result));
      return res.status(502).json({
        success: false,
        message: 'Gemini API가 번역 결과 텍스트를 반환하지 않았습니다.',
        error: 'empty responseText',
      });
    }

    // ── 9. 번역 결과 JSON 파싱 ────────────────────────────────────────────────
    let translatedData;
    try {
      translatedData = JSON.parse(responseText.trim());
    } catch (parseErr) {
      console.error('[번역 오류] 번역 결과 JSON 파싱 실패. 원문:', responseText);
      // JSON 파싱이 실패하더라도 서버를 죽이지 않고 raw 텍스트로 대체 응답
      return res.status(200).json({
        success: true,
        data: {
          translatedTitle: originalTitle,
          translatedContent: responseText.trim(),
        },
        warning: 'Gemini 응답이 JSON 형식이 아니어서 원문 텍스트로 대체되었습니다.',
      });
    }

    // ── 10. 최종 성공 응답 ────────────────────────────────────────────────────
    console.log('[번역 성공] type:', type, '/ targetLang:', targetLang);
    return res.status(200).json({
      success: true,
      data: translatedData,
    });

  } catch (fatalErr) {
    // ── 최후 방어선: 여기까지 오면 절대 next(err) 또는 throw 하지 않는다 ────
    console.error('[번역 치명 오류] 예상치 못한 예외 발생:', fatalErr?.message, fatalErr?.stack);
    try {
      // res가 이미 전송됐을 수 있으므로 headersSent 확인
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: '서버 내부 번역 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
          error: fatalErr?.message || 'Unknown error',
        });
      }
    } catch (responseErr) {
      console.error('[번역 치명 오류] 응답 전송도 실패:', responseErr.message);
    }
    // 어떤 상황에서도 여기서 return하여 프로세스를 보호한다
    return;
  }
};
