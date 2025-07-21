// /api/personal-agent-chat.js
export default async function handler(req, res) {
  console.log('[Personal Agent Handler] API 함수 실행 시작')

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
    const { message, conversationId = '', userId = 'default_user', files = [] } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: '메시지가 필요합니다.' })
    }

    // ✅ 개인 AI Agent 환경변수
    const apiKey = process.env.PERSONAL_AGENT_API_KEY
    const apiUrl = process.env.PERSONAL_AGENT_API_URL || 'http://172.190.116.61:8080/v1'
    const endpoint = `${apiUrl}/chat-messages`

    console.log('[Personal Agent Handler] 환경변수 체크:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiUrl,
      endpoint,
    })

    if (!apiKey) {
      console.error('[Personal Agent Handler] API 키가 없습니다!')
      return res.status(500).json({
        error: '개인 AI Agent API 키가 설정되지 않았습니다.',
        debug: '.env 파일에 PERSONAL_AGENT_API_KEY를 설정하세요.',
      })
    }

    // 개인 AI Agent API 요청 데이터 구성
    const requestBody = {
      query: message, // 사용자 질문
      inputs: {}, // 기본값 빈 객체
      response_mode: 'blocking', // 블럭킹 모드
      user: userId, // 사용자 식별자
      conversation_id: conversationId, // 대화 세션 ID (빈 문자열이면 새 대화)
      files: files, // 파일 배열 (이미지 등)
      auto_generate_name: false, // 대화 제목 자동 생성 안함
    }

    console.log('[Personal Agent Handler] API 호출 시작:', {
      endpoint,
      userId,
      hasConversationId: !!conversationId,
      filesCount: files.length,
    })

    // 개인 AI Agent API 호출
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Personal Agent Handler] API 오류:', response.status, errorText)

      let errorMessage = '개인 AI Agent API 오류가 발생했습니다.'
      try {
        const errorData = JSON.parse(errorText)
        // 개인 AI Agent API 에러 코드에 따른 메시지 처리
        switch (response.status) {
          case 400:
            if (errorData.code === 'invalid_param') {
              errorMessage = '잘못된 입력값입니다.'
            } else if (errorData.code === 'app_unavailable') {
              errorMessage = '앱 설정에 문제가 있습니다.'
            } else if (errorData.code === 'provider_not_initialize') {
              errorMessage = '사용 가능한 AI 모델이 없습니다.'
            } else if (errorData.code === 'provider_quota_exceeded') {
              errorMessage = '모델 사용량을 초과했습니다.'
            } else if (errorData.code === 'model_currently_not_support') {
              errorMessage = '현재 사용할 수 없는 모델입니다.'
            } else if (errorData.code === 'workflow_request_error') {
              errorMessage = '커스텀 에이전트 오류가 발생했습니다.'
            }
            break
          case 500:
            errorMessage = '서버 내부 오류가 발생했습니다.'
            break
          default:
            errorMessage = errorData.message || errorMessage
        }
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()

    // 개인 AI Agent API 응답 구조에 맞게 파싱
    const aiResponse = data.answer || data.message || '응답을 받지 못했습니다.'
    const newConversationId = data.conversation_id || conversationId
    const messageId = data.message_id

    console.log('[Personal Agent Handler] API 응답 성공:', {
      messageId,
      conversationId: newConversationId,
      responseLength: aiResponse.length,
      hasMetadata: !!data.metadata,
    })

    // 응답 반환
    res.status(200).json({
      success: true,
      response: aiResponse,
      conversation_id: newConversationId, // 세션 유지를 위한 대화 ID
      message_id: messageId,
      metadata: data.metadata || null, // 사용량 정보, 참조 자료 등
      mode: data.mode || 'chat',
      created_at: data.created_at,
    })
  } catch (error) {
    console.error('[Personal Agent Handler] 처리 오류:', error)
    res.status(500).json({
      error: '서버 오류가 발생했습니다.',
      details: error.message,
    })
  }
}
