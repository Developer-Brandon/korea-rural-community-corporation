// pages/api/openai-web-search.js
import OpenAI from 'openai'

console.log('🔑 OpenAI API Key 확인:', process.env.OPENAI_API_KEY ? '설정됨' : '❌ 없음')

const GPT_MODEL = process.env.GPT_MODEL || 'gpt-4.1'

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 🎯 강화된 프롬프팅 시스템 시작

// 📅 현재 시간 정보 생성
function getCurrentTimeContext() {
  const now = new Date()
  const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000) // UTC+9

  return {
    currentDate: koreaTime.toISOString().split('T')[0], // YYYY-MM-DD
    currentTime: koreaTime.toTimeString().split(' ')[0], // HH:MM:SS
    currentYear: koreaTime.getFullYear(),
    currentMonth: koreaTime.getMonth() + 1,
    currentDay: koreaTime.getDate(),
    dayOfWeek: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][
      koreaTime.getDay()
    ],
    season: getSeason(koreaTime.getMonth() + 1),
    quarter: getQuarter(koreaTime.getMonth() + 1),
  }
}

// 🌱 계절 정보
function getSeason(month) {
  if (month >= 3 && month <= 5) return '봄철'
  if (month >= 6 && month <= 8) return '여름철'
  if (month >= 9 && month <= 11) return '가을철'
  return '겨울철'
}

// 📊 분기 정보
function getQuarter(month) {
  if (month <= 3) return '1분기'
  if (month <= 6) return '2분기'
  if (month <= 9) return '3분기'
  return '4분기'
}

// 🔍 쿼리 의도 분석 및 확장
function analyzeQueryIntent(query) {
  const intentPatterns = {
    // 📰 뉴스/최신 정보
    news: ['뉴스', '최근', '최신', '소식', '발표', '보도', '동향', '현황'],

    // 📊 데이터/통계
    statistics: ['통계', '데이터', '수치', '현황', '비율', '증감', '추이', '변화'],

    // 💼 사업/정책
    business: ['사업', '정책', '계획', '추진', '시행', '도입', '개선', '확대'],

    // 🏢 조직/인사
    organization: ['조직', '인사', '임원', '사장', '이사', '부서', '직원'],

    // 💰 예산/재정
    finance: ['예산', '재정', '투자', '지원', '보조', '융자', '대출', '자금'],

    // 🌾 농업/농촌
    agriculture: ['농업', '농촌', '농지', '농민', '농산물', '작물', '재배', '수확'],

    // 💧 수자원
    water: ['물', '수자원', '저수지', '관개', '배수', '홍수', '가뭄', '수리시설'],

    // 🏗️ 건설/시설
    construction: ['건설', '시설', '공사', '개발', '조성', '정비', '보수', '확충'],
  }

  const detectedIntents = []
  const expandedKeywords = []

  for (const [intent, keywords] of Object.entries(intentPatterns)) {
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        detectedIntents.push(intent)
        expandedKeywords.push(...keywords)
        break
      }
    }
  }

  return {
    detectedIntents: [...new Set(detectedIntents)],
    expandedKeywords: [...new Set(expandedKeywords)],
    isTimeSensitive: query.includes('최근') || query.includes('최신') || query.includes('현재'),
    isDataRequest: query.includes('통계') || query.includes('데이터') || query.includes('현황'),
    isNewsRequest: query.includes('뉴스') || query.includes('소식') || query.includes('발표'),
  }
}

// 🎯 고급 시스템 프롬프트 생성
function generateAdvancedSystemPrompt(query, timeContext, queryAnalysis) {
  const baseRole = `당신은 한국농어촌공사(Korea Rural Community Corporation)의 전문 AI 어시스턴트입니다.`

  const expertise = `
**전문 분야:**
- 농업기반시설 조성 및 관리 (농지조성, 수리시설, 관개배수)
- 농촌지역 개발 및 정주여건 개선
- 농업용수 공급 및 수자원 관리
- 농촌 융복합산업 지원
- 귀농귀촌 지원 및 농촌 활성화
- 농어촌 정비사업 및 환경보전
- 농업정책 및 제도 분석`

  const currentContext = `
**현재 시점 정보:**
- 📅 현재 날짜: ${timeContext.currentDate} (${timeContext.dayOfWeek})
- 🕐 현재 시간: ${timeContext.currentTime} (KST)
- 🗓️ ${timeContext.currentYear}년 ${timeContext.currentMonth}월 ${timeContext.currentDay}일
- 🌱 계절: ${timeContext.season}
- 📊 연도 기준: ${timeContext.quarter}
- ⚡ 기준년도: 2024-2025년 정보 우선 제공`

  const taskGuidelines = `
**응답 지침:**
1. **최신성 우선**: ${timeContext.currentYear}년 기준, 가장 최근 정보를 우선 제공
2. **신뢰성**: 공식 기관 정보 > 언론 보도 > 일반 정보 순으로 신뢰도 표시
3. **구체성**: 구체적인 수치, 일정, 담당 부서명 포함
4. **맥락 제공**: 배경, 목적, 기대효과, 향후 계획까지 포괄
5. **실용성**: 사용자가 실제로 활용할 수 있는 정보 중심`

  const responseFormat = `
**응답 형식:**
- 📋 **핵심 요약** (2-3줄)
- 📊 **주요 내용** (상세 정보)
- 🔗 **관련 정보** (연관 사업, 제도, 연락처)
- 📅 **시기별 정보** (시행일, 마감일, 중요 일정)
- ⚠️ **주의사항** (제한사항, 변경 가능성)
- 🌐 **추가 정보** (공식 홈페이지, 문의처)`

  // 쿼리 의도별 특화 지침
  let intentSpecificGuidance = ''

  if (queryAnalysis.isNewsRequest) {
    intentSpecificGuidance += `
**뉴스/최신 정보 요청 감지됨:**
- 2024-2025년 최신 보도자료, 발표사항 우선 검색
- 정확한 발표일, 시행일 명시 필수
- 관련 언론 보도, 공식 발표자료 출처 제공`
  }

  if (queryAnalysis.isDataRequest) {
    intentSpecificGuidance += `
**데이터/통계 요청 감지됨:**
- 최신 통계청, 농식품부, 한국농어촌공사 공식 데이터 우선
- 연도별 비교, 증감률, 트렌드 분석 포함
- 데이터 출처, 조사 기준, 업데이트 주기 명시`
  }

  if (queryAnalysis.isTimeSensitive) {
    intentSpecificGuidance += `
**시급성 요청 감지됨:**
- ${timeContext.currentDate} 기준 가장 최신 정보 우선
- "현재 진행 중", "최근 변경", "임박한 마감" 등 시간 관련 정보 강조`
  }

  const searchStrategy = `
**정보 검색 전략:**
1. **1차**: 한국농어촌공사 공식 홈페이지 (ekr.or.kr)
2. **2차**: 농림축산식품부 (mafra.go.kr), 농촌진흥청 (rda.go.kr)
3. **3차**: 관련 공공기관 (농업정책보험금융원, 한국농촌경제연구원)
4. **4차**: 신뢰성 있는 언론 (연합뉴스, 농업전문지)
5. **5차**: 전문 연구기관, 학술 자료`

  const qualityControl = `
**품질 관리:**
- ✅ 정확성: 공식 출처 확인, 오래된 정보 배제
- ✅ 완성도: 불완전한 답변보다는 "추가 확인 필요" 명시
- ✅ 유용성: 사용자가 바로 활용할 수 있는 구체적 정보
- ✅ 투명성: 정보 출처, 최종 업데이트 시점 명시
- ✅ 연결성: 관련 서비스, 담당 부서, 문의처 안내`

  return `${baseRole}

${expertise}

${currentContext}

${taskGuidelines}

${responseFormat}

${intentSpecificGuidance}

${searchStrategy}

${qualityControl}

**특별 지시사항:**
- 한국농어촌공사와 직접 관련 없는 질문도 농업/농촌 관점에서 유용한 정보 제공
- 불확실한 정보는 "확인이 필요합니다"라고 명시하고 공식 문의처 안내
- 마크다운 형식으로 가독성 있게 구조화
- 전문 용어 사용 시 간단한 설명 병기`
}

// 🎯 사용자 쿼리 프롬프트 강화
function generateEnhancedUserPrompt(query, timeContext, queryAnalysis) {
  let enhancedQuery = query

  // 시간 맥락 추가
  if (queryAnalysis.isTimeSensitive) {
    enhancedQuery += `\n\n**시간 맥락**: ${timeContext.currentDate} 현재 기준으로 최신 정보가 필요합니다.`
  }

  // 검색 확장 키워드 추가
  if (queryAnalysis.expandedKeywords.length > 0) {
    enhancedQuery += `\n\n**관련 키워드**: ${queryAnalysis.expandedKeywords.slice(0, 10).join(', ')}`
  }

  // 의도별 구체화 요청
  if (queryAnalysis.detectedIntents.length > 0) {
    const intentDescriptions = {
      news: '최신 뉴스, 보도자료, 공식 발표사항',
      statistics: '구체적 수치, 통계 데이터, 현황 분석',
      business: '사업 내용, 추진 현황, 참여 방법',
      organization: '조직 구조, 담당 부서, 연락처',
      finance: '예산 규모, 지원 조건, 신청 방법',
      agriculture: '농업 정책, 농민 지원, 농산물 정보',
      water: '수자원 관리, 관개시설, 물 관련 서비스',
      construction: '시설 현황, 공사 일정, 개발 계획',
    }

    const intentDetails = queryAnalysis.detectedIntents
      .map((intent) => intentDescriptions[intent])
      .filter(Boolean)
      .join(', ')

    if (intentDetails) {
      enhancedQuery += `\n\n**세부 요청사항**: ${intentDetails}에 대한 정보를 포함해주세요.`
    }
  }

  // 품질 요구사항 추가
  enhancedQuery += `\n\n**답변 요구사항**:
- 📊 구체적인 수치와 일정 포함
- 🔗 관련 링크나 문의처 제공
- 📅 최신 정보 (${timeContext.currentYear}년 기준)
- 📋 체계적이고 이해하기 쉬운 구조화
- ⚠️ 정보의 신뢰성과 출처 명시`

  return enhancedQuery
}

// 🚀 통합 프롬프트 생성 함수
function createEnhancedPrompt(query) {
  const timeContext = getCurrentTimeContext()
  const queryAnalysis = analyzeQueryIntent(query)

  const systemPrompt = generateAdvancedSystemPrompt(query, timeContext, queryAnalysis)
  const userPrompt = generateEnhancedUserPrompt(query, timeContext, queryAnalysis)

  return {
    systemPrompt,
    userPrompt,
    timeContext,
    queryAnalysis,
    debug: {
      detectedIntents: queryAnalysis.detectedIntents,
      isTimeSensitive: queryAnalysis.isTimeSensitive,
      isDataRequest: queryAnalysis.isDataRequest,
      isNewsRequest: queryAnalysis.isNewsRequest,
      expandedKeywordsCount: queryAnalysis.expandedKeywords.length,
    },
  }
}

// 🎯 강화된 프롬프팅 시스템 끝

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
        // 기본 포털 및 검색엔진
        'naver.com': '네이버',
        'google.com': '구글',
        'wikipedia.org': '위키피디아',
        'youtube.com': '유튜브',
        'instagram.com': '인스타그램',
        'twitter.com': '트위터',
        'facebook.com': '페이스북',

        // 한국농어촌공사 및 농업 관련 기관
        'ekr.or.kr': '한국농어촌공사',
        'krc.or.kr': '한국농어촌공사',
        'rda.go.kr': '농촌진흥청',
        'mafra.go.kr': '농림축산식품부',
        'kati.net': '농업기술실용화재단',
        'naas.go.kr': '국립농업과학원',
        'nongsaro.go.kr': '농사로',
        'epis.or.kr': '농업정책보험금융원',
        'krei.re.kr': '한국농촌경제연구원',
        'kostat.go.kr': '통계청',
        'gov.kr': '정부기관',

        // 농업/농촌 관련 언론
        'aflnews.co.kr': '농축유통신문',
        'newswire.co.kr': '뉴스와이어',
        'yonhap.co.kr': '연합뉴스',
        'yna.co.kr': '연합뉴스',
        'news1.kr': '뉴스1',
        'newsis.com': '뉴시스',
        'asiae.co.kr': '아시아경제',
        'mk.co.kr': '매일경제',
        'hankyung.com': '한국경제',
        'chosun.com': '조선일보',
        'joongang.co.kr': '중앙일보',
        'donga.com': '동아일보',
        'hani.co.kr': '한겨레',
        'khan.co.kr': '경향신문',

        // 농업 전문 미디어
        'farmnews.com': '한국농어민신문',
        'agrinet.co.kr': '농업인신문',
        'newsfarm.co.kr': '뉴스팜',
        'ikpnews.net': '일간사료신문',

        // 기타 유용한 사이트
        'weather.go.kr': '기상청',
        'kma.go.kr': '기상청',
        'news.nate.com': '네이트뉴스',
        'apps.apple.com': '앱스토어',
        'play.google.com': '플레이스토어',

        // 국제 농업기관
        'fao.org': 'FAO',
        'worldbank.org': '세계은행',
        'oecd.org': 'OECD',
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

// 🌐 쿼리 기반 관련 사이트 URL 생성 (소스가 없을 때 대체)
function generateFallbackSources(query) {
  const normalizedQuery = encodeURIComponent(query.trim())

  // 🎯 한국농어촌공사 관련 주요 사이트들
  const fallbackSources = [
    {
      title: '한국농어촌공사 공식 홈페이지',
      url: 'https://www.ekr.or.kr',
      snippet: `${query} 관련 공식 정보`,
      domain: '한국농어촌공사',
    },
    {
      title: '농림축산식품부',
      url: 'https://www.mafra.go.kr',
      snippet: `${query} 관련 정부 정책`,
      domain: '농림축산식품부',
    },
    {
      title: '농촌진흥청',
      url: 'https://www.rda.go.kr',
      snippet: `${query} 관련 연구 정보`,
      domain: '농촌진흥청',
    },
    {
      title: '연합뉴스 검색',
      url: `https://www.yonhapnews.co.kr/search/?query=${normalizedQuery}`,
      snippet: `${query} 관련 최신 뉴스`,
      domain: '연합뉴스',
    },
  ]

  console.log('🔄 대체 소스 생성:', fallbackSources.length, '개')
  return fallbackSources
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

// 🔍 URL 패턴 검색 - 응답 전체에서 URL을 찾는 함수
function extractUrlsFromResponse(response) {
  console.log('🔍 응답에서 URL 패턴 검색 시작...')

  const urls = new Set()
  const urlRegex = /https?:\/\/[^\s<>"'()[\]{}]+/gi

  // JSON 문자열로 변환하여 모든 URL 찾기
  const responseString = JSON.stringify(response)
  const foundUrls = responseString.match(urlRegex) || []

  foundUrls.forEach((url) => {
    // 정리: 따옴표, 괄호 등 제거
    const cleanUrl = url.replace(/['">\]},;]+$/, '')
    if (cleanUrl.length > 10 && !cleanUrl.includes('example.com')) {
      urls.add(cleanUrl)
    }
  })

  console.log('🔍 발견된 URL들:', Array.from(urls))
  return Array.from(urls)
}

// 🔍 웹 검색 결과에서 소스 추출 (개선된 버전)
function extractWebSearchSources(response, query) {
  console.log('🔍 웹 검색 소스 추출 시작...')

  let sources = []

  try {
    // 🎯 1단계: annotations에서 소스 찾기 (기존 로직)
    if (response.output && Array.isArray(response.output)) {
      for (const item of response.output) {
        if (item.type === 'message' && item.content && Array.isArray(item.content)) {
          for (const content of item.content) {
            if (content.annotations && Array.isArray(content.annotations)) {
              for (const annotation of content.annotations) {
                if (annotation.type === 'url_citation' && annotation.url) {
                  sources.push({
                    title: annotation.title || '검색 결과',
                    url: annotation.url,
                    snippet: `${query} 관련 검색 결과`,
                    domain: extractDomain(annotation.url),
                  })
                }
              }
            }
          }
        }
      }
    }

    // 🎯 2단계: web_search_call에서 소스 찾기
    if (response.output && Array.isArray(response.output)) {
      for (const item of response.output) {
        if (item.type === 'web_search_call') {
          console.log('🔍 web_search_call 상세 검사:', JSON.stringify(item, null, 2))

          // results, sources, urls 등의 필드 확인
          if (item.results && Array.isArray(item.results)) {
            console.log('📋 web_search_call.results 발견')
            item.results.forEach((result) => {
              if (result.url) {
                sources.push({
                  title: result.title || '웹 검색 결과',
                  url: result.url,
                  snippet: result.snippet || `${query} 관련 내용`,
                  domain: extractDomain(result.url),
                })
              }
            })
          }

          if (item.sources && Array.isArray(item.sources)) {
            console.log('📋 web_search_call.sources 발견')
            item.sources.forEach((source) => {
              if (source.url) {
                sources.push({
                  title: source.title || '웹 검색 결과',
                  url: source.url,
                  snippet: source.snippet || `${query} 관련 내용`,
                  domain: extractDomain(source.url),
                })
              }
            })
          }
        }
      }
    }

    // 🎯 3단계: 응답 전체에서 URL 패턴 검색
    if (sources.length === 0) {
      console.log('🔍 annotations와 web_search_call에서 소스를 찾지 못함, URL 패턴 검색 시도...')

      const foundUrls = extractUrlsFromResponse(response)
      foundUrls.forEach((url, index) => {
        // 일반적인 웹사이트 URL만 필터링 (API 엔드포인트 제외)
        if (!url.includes('/api/') && !url.includes('openai.com') && !url.includes('claude.ai')) {
          sources.push({
            title: `검색 결과 ${index + 1}`,
            url: url,
            snippet: `${query} 관련 검색 결과`,
            domain: extractDomain(url),
          })
        }
      })
    }
  } catch (error) {
    console.error('❌ 소스 추출 중 오류:', error)
  }

  console.log('🔍 추출된 소스 개수:', sources.length)
  return sources
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

    // 🎯 새로운 소스 추출 로직 적용
    sources = extractWebSearchSources(response, query)
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

    // 🎯 강화된 프롬프트 생성
    const promptData = createEnhancedPrompt(query)

    console.log('🎯 강화된 프롬프트 적용됨:')
    console.log('📊 감지된 의도:', promptData.queryAnalysis.detectedIntents)
    console.log('⏰ 시간 민감성:', promptData.queryAnalysis.isTimeSensitive)
    console.log('📈 데이터 요청:', promptData.queryAnalysis.isDataRequest)
    console.log('📰 뉴스 요청:', promptData.queryAnalysis.isNewsRequest)
    console.log('🗓️ 현재 시간:', promptData.timeContext.currentDate)

    // 🌟 OpenAI Responses API로 실제 웹 검색 수행 (강화된 프롬프트 적용)
    const response = await openai.responses.create({
      model: GPT_MODEL,
      input: promptData.userPrompt, // 🔥 강화된 사용자 프롬프트 적용
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

    // 🔄 소스가 없으면 대체 소스 생성
    if (!sources || sources.length === 0) {
      console.log('🔄 소스가 없음, 대체 소스 생성...')
      sources = generateFallbackSources(query)
    }

    // 응답이 비어있는 경우 대체 처리
    if (!aiResponse || aiResponse.trim().length === 0) {
      console.warn('⚠️ 파싱 후에도 빈 응답 감지, 강제 대체 응답 생성')

      if (webSearchPerformed) {
        aiResponse = `"${query}"에 대한 웹 검색을 수행했지만, 현재 결과를 처리하는데 문제가 있습니다. 다시 시도해주시거나 다른 키워드로 검색해보세요.`
      } else {
        // 웹 검색이 수행되지 않았다면 일반 GPT 답변으로 대체 (강화된 프롬프트 적용)
        console.log('🔄 웹 검색 미수행, 강화된 프롬프트로 일반 GPT 답변 생성')

        try {
          const fallbackCompletion = await openai.chat.completions.create({
            model: GPT_MODEL,
            messages: [
              {
                role: 'system',
                content: promptData.systemPrompt, // 🔥 강화된 시스템 프롬프트 적용
              },
              {
                role: 'user',
                content: promptData.userPrompt, // 🔥 강화된 사용자 프롬프트 적용
              },
            ],
            temperature: 0.7,
            max_tokens: 1500,
            presence_penalty: 0.1, // 🔥 추가: 반복 방지
            frequency_penalty: 0.1, // 🔥 추가: 다양성 증가
          })

          aiResponse = fallbackCompletion.choices[0].message.content
          console.log('🔄 강화된 프롬프트로 대체 답변 생성 성공:', aiResponse.length, '글자')
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
        parsingMethod: 'ultra-robust-parser-with-enhanced-prompting',
        imageExtractionMethod: 'og-image-from-sources-with-fallback',
        sourcesMethod: sources.length > 0 ? 'extracted-or-fallback' : 'none',
        // 🎯 프롬프트 디버그 정보 추가
        promptEnhancement: {
          detectedIntents: promptData.queryAnalysis.detectedIntents,
          isTimeSensitive: promptData.queryAnalysis.isTimeSensitive,
          isDataRequest: promptData.queryAnalysis.isDataRequest,
          isNewsRequest: promptData.queryAnalysis.isNewsRequest,
          expandedKeywordsCount: promptData.queryAnalysis.expandedKeywords.length,
          currentDate: promptData.timeContext.currentDate,
          season: promptData.timeContext.season,
          quarter: promptData.timeContext.quarter,
        },
      },
    }

    console.log('✅ 최종 응답 데이터 구성 완료')
    console.log(
      `📊 결과: 응답 ${aiResponse.length}자, 소스 ${(sources || []).length}개, OG 이미지 ${(images || []).length}개`,
    )
    console.log('🎯 프롬프트 강화 효과:', {
      의도감지: promptData.queryAnalysis.detectedIntents.length > 0 ? '✅' : '❌',
      시간맥락: promptData.queryAnalysis.isTimeSensitive ? '✅' : '➖',
      키워드확장: promptData.queryAnalysis.expandedKeywords.length > 5 ? '✅' : '➖',
    })

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
      console.warn('⚠️ Responses API 미지원 또는 오류, 강화된 프롬프트로 Chat API 폴백')

      try {
        // 🎯 폴백에서도 강화된 프롬프트 적용
        const promptData = createEnhancedPrompt(query)

        console.log('🎯 폴백에서도 강화된 프롬프트 적용:')
        console.log('📊 감지된 의도:', promptData.queryAnalysis.detectedIntents)

        const completion = await openai.chat.completions.create({
          model: GPT_MODEL,
          messages: [
            {
              role: 'system',
              content: promptData.systemPrompt, // 🔥 강화된 시스템 프롬프트
            },
            {
              role: 'user',
              content: promptData.userPrompt, // 🔥 강화된 사용자 프롬프트
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        })

        console.log('✅ 강화된 프롬프트로 폴백 Chat API 성공')

        // 폴백인 경우에도 대체 소스 제공
        const fallbackSources = generateFallbackSources(query)
        const fallbackImages = await extractOgImagesFromSources(fallbackSources, 2)

        return res.status(200).json({
          success: true,
          response: completion.choices[0].message.content,
          sources: fallbackSources,
          images: fallbackImages,
          usage: completion.usage,
          searchPerformed: false,
          note: 'Responses API를 사용할 수 없어 강화된 프롬프트로 기본 GPT 답변을 제공했습니다.',
          debug: {
            promptEnhancement: {
              detectedIntents: promptData.queryAnalysis.detectedIntents,
              isTimeSensitive: promptData.queryAnalysis.isTimeSensitive,
              isDataRequest: promptData.queryAnalysis.isDataRequest,
              isNewsRequest: promptData.queryAnalysis.isNewsRequest,
              currentDate: promptData.timeContext.currentDate,
            },
          },
        })
      } catch (fallbackError) {
        console.error('❌ 강화된 폴백 API도 실패:', fallbackError)
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
