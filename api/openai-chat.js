export default async function handler(req, res) {
  console.log('[Handler] API 함수 실행 시작')

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // OPTIONS 요청 처리 (브라우저 preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, conversationHistory = [] } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: '메시지가 필요합니다.' })
    }

    // ✅ process.env로 환경변수 접근
    const apiKey = process.env.OPENAI_API_KEY
    const model = process.env.OPENAI_MODEL || 'gpt-4.1'
    const apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions'

    console.log('[Handler] 환경변수 체크:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      model,
    })

    if (!apiKey) {
      console.error('[Handler] API 키가 없습니다!')
      return res.status(500).json({
        error: 'OpenAI API 키가 설정되지 않았습니다.',
        debug: '.env 파일에 OPENAI_API_KEY를 설정하세요.',
      })
    }

    // 대화 히스토리 구성 (최근 10개 메시지만 유지)
    const messages = [
      {
        role: 'system',
        content:
          '당신은 한국농어촌공사의 AI 어시스턴트입니다. 친근하고 전문적으로 답변해주세요. 금융 관련 질문에는 정확한 정보를 제공하되, 투자 권유는 하지 마세요.',
      },
      ...conversationHistory.slice(-10), // 최근 10개 대화만 유지
      {
        role: 'user',
        content: message,
      },
    ]

    console.log('[Handler] OpenAI API 호출 시작:', { model, messageCount: messages.length })

    // OpenAI API 호출
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Handler] OpenAI API 오류:', response.status, errorText)

      let errorMessage = 'OpenAI API 오류가 발생했습니다.'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error?.message || errorMessage
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    console.log('[Handler] OpenAI API 응답 성공')

    // 응답 반환
    res.status(200).json({
      success: true,
      response: aiResponse,
      usage: data.usage, // 토큰 사용량 정보
      model: model,
    })
  } catch (error) {
    console.error('[Handler] ChatGPT API 오류:', error)
    res.status(500).json({
      error: '서버 오류가 발생했습니다.',
      details: error.message,
    })
  }
}
