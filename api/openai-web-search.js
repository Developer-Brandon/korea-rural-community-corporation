// pages/api/openai-web-search.js
import OpenAI from 'openai'

console.log('🔑 OpenAI API Key 확인:', process.env.OPENAI_API_KEY ? '설정됨' : '❌ 없음')

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 🎯 도메인 추출 함수
function extractDomain(url, options = {}) {
  const { useKoreanNames = true, fallbackText = '알 수 없음' } = options

  if (!url || typeof url !== 'string') {
    return fallbackText
  }

  try {
    const domain = new URL(url).hostname.replace('www.', '')

    if (useKoreanNames) {
      const koreanDomainMap = {
        'naver.com': '네이버',
        'google.com': '구글',
        'wikipedia.org': '위키피디아',
        'yonhap.co.kr': '연합뉴스',
        'gov.kr': '정부기관',
        'youtube.com': '유튜브',
        'instagram.com': '인스타그램',
        'twitter.com': '트위터',
        'facebook.com': '페이스북',
        'asiae.co.kr': '아시아경제',
        'news.nate.com': '네이트뉴스',
        'apps.apple.com': '앱스토어',
        'ekr.or.kr': '한국농어촌공사', // 한국농어촌공사 공식 홈페이지
        'rawris.ekr.or.kr': '농촌용수종합정보시스템', // 농촌용수종합정보시스템
        'alimi.or.kr': '농어촌알리미', // 농어촌알리미 포털
        'rri.ekr.or.kr': '농어촌연구원', // 농어촌연구원
        'njy.mafra.go.kr': '농지공간포털', // 농지공간포털
        'adms.ekr.or.kr': '농업가뭄관리시스템', // ADMS 농업가뭄관리시스템
      }
      for (const [key, value] of Object.entries(koreanDomainMap)) {
        if (domain.includes(key)) {
          return value
        }
      }
    }

    return domain
  } catch (error) {
    console.warn('도메인 추출 실패:', url, error)

    try {
      const match = url.match(/https?:\/\/([^\/\?#]+)/i)
      if (match && match[1]) {
        return match[1].replace('www.', '')
      }
    } catch (secondError) {
      console.warn('2차 도메인 추출 실패:', secondError)
    }

    return fallbackText
  }
}

async function extractOgImageFromUrl(url, options = {}) {
  const {
    timeout = 10000,
    retries = 2,
    userAgent = 'Mozilla/5.0 (compatible; OGImageBot/1.0; +https://example.com/bot)',
    followRedirects = true,
  } = options

  console.log('🖼️ og:image 추출 시도:', url)

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 시도 ${attempt}/${retries}:`, url)

      // 🎯 강화된 fetch 옵션
      const fetchOptions = {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          DNT: '1',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: followRedirects ? 'follow' : 'manual',
        // 🔧 Node.js 환경에서 SSL 검증 완화 (개발용)
        ...(process.env.NODE_ENV === 'development' && {
          agent: new (require('https').Agent)({
            rejectUnauthorized: false,
          }),
        }),
      }

      // ⏱️ Timeout 처리
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      fetchOptions.signal = controller.signal

      const response = await fetch(url, fetchOptions)
      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`⚠️ HTTP ${response.status}: ${url}`)

        // 403, 404 등은 재시도 안함
        if ([403, 404, 410].includes(response.status)) {
          break
        }

        // 5xx 에러는 재시도
        if (response.status >= 500 && attempt < retries) {
          await sleep(1000 * attempt) // 지수 백오프
          continue
        }

        return null
      }

      const html = await response.text()
      console.log(`📄 HTML 받음: ${html.length} 글자`)

      // 🎯 og:image 추출 (개선된 정규식)
      const ogImageMatches = [
        // 표준 og:image
        /<meta\s+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\'][^>]*>/i,
        /<meta\s+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\'][^>]*>/i,

        // 트위터 카드
        /<meta\s+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\'][^>]*>/i,
        /<meta\s+content=["\']([^"\']+)["\'][^>]+name=["\']twitter:image["\'][^>]*>/i,

        // 일반적인 메타 이미지
        /<meta\s+name=["\']image["\'][^>]+content=["\']([^"\']+)["\'][^>]*>/i,

        // Open Graph 변형
        /<meta\s+property=["\']og:image:url["\'][^>]+content=["\']([^"\']+)["\'][^>]*>/i,
      ]

      for (const regex of ogImageMatches) {
        const match = html.match(regex)
        if (match && match[1]) {
          let imageUrl = match[1].trim()

          // 상대 URL을 절대 URL로 변환
          if (imageUrl.startsWith('//')) {
            imageUrl = new URL(url).protocol + imageUrl
          } else if (imageUrl.startsWith('/')) {
            imageUrl = new URL(imageUrl, url).href
          } else if (!imageUrl.startsWith('http')) {
            imageUrl = new URL(imageUrl, url).href
          }

          console.log('✅ og:image 찾음:', imageUrl)
          return {
            url: imageUrl,
            source: url,
            domain: extractDomain(url),
            method: 'og:image',
          }
        }
      }

      console.warn('❌ og:image 없음:', url)
      return null
    } catch (error) {
      console.error(`❌ 시도 ${attempt} 실패:`, error.message)

      // AbortError (timeout)는 재시도
      if (error.name === 'AbortError' && attempt < retries) {
        console.log('⏱️ 타임아웃, 재시도...')
        continue
      }

      // 네트워크 에러는 재시도
      if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
        if (attempt < retries) {
          await sleep(2000 * attempt)
          continue
        }
      }

      // 마지막 시도에서 실패
      if (attempt === retries) {
        console.error('❌ 모든 시도 실패:', url, error.message)
        return null
      }
    }
  }

  return null
}

// 🛠️ 도우미 함수들
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 🚀 대량 og:image 추출 (병렬 처리 + 에러 복원력)
async function extractOgImagesFromSources(sources, maxConcurrent = 3) {
  console.log('🖼️ 대량 og:image 추출 시작:', sources?.length || 0, '개')

  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    console.warn('⚠️ sources가 비어있음')
    return []
  }

  const results = []

  // 배치 처리로 서버 부하 감소
  for (let i = 0; i < sources.length; i += maxConcurrent) {
    const batch = sources.slice(i, i + maxConcurrent)
    console.log(`📦 배치 ${Math.floor(i / maxConcurrent) + 1} 처리: ${batch.length}개`)

    const batchPromises = batch.map(async (source) => {
      try {
        if (!source || !source.url) {
          console.warn('⚠️ 유효하지 않은 source:', source)
          return null
        }

        const ogImage = await extractOgImageFromUrl(source.url, {
          timeout: 8000,
          retries: 1, // 대량 처리시 재시도 줄임
        })

        if (ogImage) {
          return {
            ...ogImage,
            title: source.title || 'OG 이미지',
            alt: source.snippet || source.title || 'OG 이미지',
          }
        }
      } catch (error) {
        console.warn('⚠️ OG 이미지 추출 실패:', source?.url || 'unknown', error.message)
      }
      return null
    })

    const batchResults = await Promise.allSettled(batchPromises)

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value)
      }
    })

    // 다음 배치 전에 잠시 대기 (서버 부하 방지)
    if (i + maxConcurrent < sources.length) {
      await sleep(500)
    }
  }

  console.log('✅ og:image 추출 완료:', results.length, '개 성공')
  return results
}

// 🚀 초강력 OpenAI 응답 파서 (모든 형태 처리)
function parseOpenAIResponse(response, query) {
  console.log('🚀 초강력 파서 시작')
  console.log('📊 응답 타입:', typeof response)
  console.log('📊 응답 키들:', Object.keys(response || {}))

  let aiResponse = ''
  let sources = []
  let webSearchPerformed = false

  try {
    // 🔍 모든 가능한 응답 구조 체크
    console.log('🔍 응답 구조 전체 덤프:', JSON.stringify(response, null, 2))

    // ===== 방법 1: response.output 배열 형태 =====
    if (response.output && Array.isArray(response.output)) {
      console.log('📋 방법 1: output 배열 처리, 길이:', response.output.length)

      for (let i = 0; i < response.output.length; i++) {
        const item = response.output[i]
        console.log(`📋 Item ${i}:`, JSON.stringify(item, null, 2))

        // 웹 검색 감지
        if (item.type === 'web_search_call') {
          webSearchPerformed = true
          console.log('🔍 웹 검색 감지됨:', item.status)
        }

        // 메시지 내용 추출 - 모든 가능한 경우
        if (item.type === 'message') {
          console.log('💬 메시지 타입 발견')

          // content 배열인 경우
          if (item.content && Array.isArray(item.content)) {
            console.log('📄 content 배열 처리, 길이:', item.content.length)

            for (const content of item.content) {
              console.log('📄 Content 항목:', JSON.stringify(content, null, 2))

              // 텍스트 추출 - 모든 가능한 필드
              if (content.text) {
                aiResponse += content.text
                console.log('📝 텍스트 추가됨 (text 필드):', content.text.length, '글자')
              } else if (content.content) {
                aiResponse += content.content
                console.log('📝 텍스트 추가됨 (content 필드):', content.content.length, '글자')
              } else if (typeof content === 'string') {
                aiResponse += content
                console.log('📝 텍스트 추가됨 (문자열):', content.length, '글자')
              }

              // 소스 추출
              if (content.annotations && Array.isArray(content.annotations)) {
                console.log('🔗 annotations 처리, 개수:', content.annotations.length)
                for (const annotation of content.annotations) {
                  console.log('🔗 annotation 상세:', JSON.stringify(annotation, null, 2))
                  if (annotation.type === 'url_citation' && annotation.url) {
                    sources.push({
                      title: annotation.title || '검색 결과',
                      url: annotation.url,
                      snippet: `${query} 관련 검색 결과`,
                    })
                    console.log('🔗 소스 추가:', annotation.url)
                  }
                }
              }
            }
          }
          // content가 문자열인 경우
          else if (typeof item.content === 'string') {
            aiResponse += item.content
            console.log('📝 텍스트 추가됨 (content 문자열):', item.content.length, '글자')
          }
        }

        // 다른 타입들도 체크
        if (item.text) {
          aiResponse += item.text
          console.log('📝 텍스트 추가됨 (item.text):', item.text.length, '글자')
        }
        if (item.content && typeof item.content === 'string') {
          aiResponse += item.content
          console.log('📝 텍스트 추가됨 (item.content):', item.content.length, '글자')
        }
      }
    }

    // ===== 방법 2: response.output_text =====
    if (!aiResponse && response.output_text) {
      console.log('📋 방법 2: output_text 사용, 길이:', response.output_text.length)
      aiResponse = response.output_text
    }

    // ===== 방법 3: response.content =====
    if (!aiResponse && response.content) {
      console.log('📋 방법 3: content 사용')
      if (typeof response.content === 'string') {
        aiResponse = response.content
        console.log('📝 content 문자열 길이:', response.content.length)
      } else if (Array.isArray(response.content)) {
        console.log('📝 content 배열 처리')
        for (const item of response.content) {
          if (typeof item === 'string') {
            aiResponse += item
          } else if (item.text) {
            aiResponse += item.text
          }
        }
      }
    }

    // ===== 방법 4: response.text =====
    if (!aiResponse && response.text) {
      console.log('📋 방법 4: text 사용, 길이:', response.text.length)
      aiResponse = response.text
    }

    // ===== 방법 5: response.message =====
    if (!aiResponse && response.message) {
      console.log('📋 방법 5: message 사용')
      if (typeof response.message === 'string') {
        aiResponse = response.message
      } else if (response.message.content) {
        aiResponse = response.message.content
      }
    }

    // ===== 방법 6: response.choices (Chat API 형태) =====
    if (!aiResponse && response.choices && response.choices[0]) {
      console.log('📋 방법 6: choices 사용 (Chat API 형태)')
      const choice = response.choices[0]
      if (choice.message && choice.message.content) {
        aiResponse = choice.message.content
      } else if (choice.text) {
        aiResponse = choice.text
      }
    }

    // ===== 방법 7: 직접 문자열 =====
    if (!aiResponse && typeof response === 'string') {
      console.log('📋 방법 7: 응답 자체가 문자열, 길이:', response.length)
      aiResponse = response
    }

    // ===== 방법 8: 모든 문자열 필드 찾기 =====
    if (!aiResponse) {
      console.log('📋 방법 8: 모든 문자열 필드 탐색')
      function findStringFields(obj, path = '') {
        if (typeof obj === 'string' && obj.length > 10) {
          console.log(`📝 문자열 필드 발견: ${path} = ${obj.substring(0, 100)}...`)
          if (!aiResponse && obj.length > aiResponse.length) {
            aiResponse = obj
          }
        } else if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            findStringFields(item, path ? `${path}[${index}]` : `[${index}]`)
          })
        } else if (typeof obj === 'object' && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            findStringFields(value, path ? `${path}.${key}` : key)
          }
        }
      }
      findStringFields(response)
    }
  } catch (parseError) {
    console.error('❌ 파싱 중 에러:', parseError)
    console.error('❌ 파싱 에러 스택:', parseError.stack)
  }

  // 최종 결과 로깅
  console.log('🎯 파싱 완료:')
  console.log(`📝 추출된 텍스트 길이: ${aiResponse.length}`)
  console.log(`🔗 추출된 소스 개수: ${sources.length}`)
  console.log(`🔍 웹 검색 수행됨: ${webSearchPerformed}`)
  console.log(`📝 텍스트 미리보기: ${aiResponse.substring(0, 200)}...`)

  return {
    aiResponse: aiResponse.trim(),
    sources,
    webSearchPerformed,
  }
}

export default async function handler(req, res) {
  console.log('📝 OpenAI Responses API 실제 웹 검색 호출됨')
  console.log('📝 요청 데이터:', req.body)

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    })
  }

  try {
    const { query, conversationHistory = [] } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: '검색 쿼리가 필요합니다.',
      })
    }

    console.log('🌐 실제 웹 검색 요청:', query)
    console.log('📋 받은 대화 히스토리 길이:', conversationHistory.length)

    // 🌟 OpenAI Responses API로 실제 웹 검색 수행
    const response = await openai.responses.create({
      model: 'gpt-4o',
      input: `한국농어촌공사(KRC) AI 어시스턴트로서 "${query}"에 대해 최신 웹 정보를 검색하여 한국어로 답변해주세요. 구체적이고 도움이 되는 정보를 제공하고, 마크다운 포맷을 사용하여 가독성 있게 답변해주세요.`,
      tools: [
        {
          type: 'web_search',
        },
      ],
      temperature: 0.7,
      max_output_tokens: 1500,
    })

    console.log('✅ OpenAI API 호출 완료')

    // 🚀 초강력 파서 사용
    const parseResult = parseOpenAIResponse(response, query)
    let aiResponse = parseResult.aiResponse
    let sources = parseResult.sources
    let webSearchPerformed = parseResult.webSearchPerformed

    // 응답이 비어있는 경우 대체 처리
    if (!aiResponse || aiResponse.trim().length === 0) {
      console.warn('⚠️ 파싱 후에도 빈 응답 감지, 강제 대체 응답 생성')

      if (webSearchPerformed) {
        aiResponse = `"${query}"에 대한 웹 검색을 수행했지만, 현재 결과를 처리하는데 문제가 있습니다. 다시 시도해주시거나 다른 키워드로 검색해보세요.`
      } else {
        // 웹 검색이 수행되지 않았다면 일반 GPT 답변으로 대체
        console.log('🔄 웹 검색 미수행, 일반 GPT로 대체 답변 생성')

        try {
          const fallbackCompletion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content:
                  '당신은 한국농어촌공사(KRC)의 AI 어시스턴트입니다. 사용자의 질문에 대해 알고 있는 정보를 바탕으로 한국어로 답변해주세요.',
              },
              {
                role: 'user',
                content: query,
              },
            ],
            temperature: 0.7,
            max_tokens: 1500,
          })

          aiResponse = fallbackCompletion.choices[0].message.content
          console.log('🔄 대체 답변 생성 성공:', aiResponse.length, '글자')
        } catch (fallbackError) {
          console.error('❌ 대체 답변 생성도 실패:', fallbackError)
          aiResponse = `"${query}"에 대한 정보를 찾고 있습니다. 좀 더 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다.`
        }
      }

      console.log('🔄 최종 대체 응답 길이:', aiResponse.length, '글자')
    }

    // 🌐 OG Images 추출 (실제 소스 사이트에서)
    let images = []
    try {
      console.log('🌐 실제 소스 URL들에서 og:image 추출 시작...')

      if (sources && Array.isArray(sources) && sources.length > 0) {
        console.log(`📋 추출할 소스 수: ${sources.length}개`)
        images = await extractOgImagesFromSources(sources, 2)
        console.log('🎯 OG Images 추출 완료:', images.length, '개')
      } else {
        console.warn('⚠️ sources가 없어서 og:image 추출 불가')
      }
    } catch (ogError) {
      console.warn('⚠️ og:image 추출 실패:', ogError.message)
    }

    // 로깅
    if (images && Array.isArray(images)) {
      images.forEach((img, index) => {
        console.log(`🌐 OG 이미지 ${index + 1}: ${img.url} (출처: ${img.domain})`)
      })
    }

    // 최종 응답 데이터 구성
    const responseData = {
      success: true,
      response: aiResponse,
      sources: sources || [],
      images: images || [], // 🌐 실제 사이트 이미지
      usage: response.usage || null,
      searchPerformed: webSearchPerformed,
      realSources: (sources || []).length,
      realImages: (images || []).length,
      debug: {
        responseType: typeof response,
        hasOutput: !!response.output,
        outputLength: response.output
          ? Array.isArray(response.output)
            ? response.output.length
            : 1
          : 0,
        responseLength: aiResponse.length,
        parsingMethod: 'ultra-robust-parser-with-og-images-only',
        imageExtractionMethod: 'og-image-from-actual-sources',
      },
    }

    console.log('✅ 최종 응답 데이터 구성 완료')
    console.log(
      `📊 결과: 응답 ${aiResponse.length}자, 소스 ${(sources || []).length}개, OG 이미지 ${(images || []).length}개`,
    )

    return res.status(200).json(responseData)
  } catch (error) {
    console.error('❌ OpenAI Responses API 오류:', error)
    console.error('❌ 에러 스택:', error.stack)
    console.error('❌ 에러 상세 정보:', {
      name: error.name,
      message: error.message,
      status: error.status,
      type: error.type,
    })

    // Responses API 지원 안되는 경우 폴백
    if (
      error.message &&
      (error.message.includes('responses') ||
        error.message.includes('web_search') ||
        error.status === 404 ||
        error.status === 400)
    ) {
      console.warn('⚠️ Responses API 미지원 또는 오류, Chat API로 폴백')

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content:
                '당신은 한국농어촌공사(KRC)의 AI 어시스턴트입니다. 사용자의 질문에 대해 알고 있는 정보를 바탕으로 한국어로 답변해주세요.',
            },
            {
              role: 'user',
              content: query,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        })

        console.log('✅ 폴백 Chat API 성공')

        return res.status(200).json({
          success: true,
          response: completion.choices[0].message.content,
          sources: [],
          images: [],
          usage: completion.usage,
          searchPerformed: false,
          note: 'Responses API를 사용할 수 없어 기본 GPT로 답변했습니다.',
        })
      } catch (fallbackError) {
        console.error('❌ 폴백 API도 실패:', fallbackError)
        return res.status(500).json({
          success: false,
          error: '모든 API 호출이 실패했습니다.',
        })
      }
    }

    // 일반적인 에러 처리
    if (error.status === 401) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API 키가 유효하지 않습니다.',
      })
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'API 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.',
      })
    }

    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        error: 'OpenAI 서비스가 일시적으로 사용할 수 없습니다.',
      })
    }

    return res.status(500).json({
      success: false,
      error: error.message || '알 수 없는 오류가 발생했습니다.',
    })
  }
}
