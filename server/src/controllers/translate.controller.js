/**
 * controllers/translate.controller.js
 * Google Gemini API를 활용한 서버사이드 실시간 번역 컨트롤러
 */

exports.translateText = async (req, res, next) => {
  try {
    const { type, originalText, originalTitle = '', targetLang = 'ko' } = req.body;

    if (!originalText) {
      return res.status(400).json({ success: false, message: '번역할 텍스트가 입력되지 않았습니다.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: '서버의 GEMINI_API_KEY 설정이 누락되었습니다. Vercel 환경 변수 설정을 확인하세요.'
      });
    }

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP error! status: ${response.status}`;
      return res.status(502).json({ success: false, message: `Gemini API 호출 실패: ${errMsg}` });
    }

    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      return res.status(502).json({ success: false, message: '번역 결과를 받아오지 못했습니다. API 응답 형식을 확인해 주세요.' });
    }

    const translatedData = JSON.parse(responseText.trim());
    return res.json({
      success: true,
      data: translatedData
    });
  } catch (err) {
    next(err);
  }
};
