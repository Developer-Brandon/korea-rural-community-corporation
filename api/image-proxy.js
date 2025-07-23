// api/image-proxy.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: 'URL parameter required' })
  }

  try {
    let imageUrl = decodeURIComponent(url)

    // HTTP를 HTTPS로 변환
    if (imageUrl.startsWith('http://')) {
      imageUrl = imageUrl.replace('http://', 'https://')
    }

    console.log('[VERCEL-PROXY] 요청 URL:', imageUrl)

    // 🎯 더 강력한 헤더 설정
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://news.naver.com/',
        'Origin': 'https://news.naver.com',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
        'Cache-Control': 'no-cache',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      // 타임아웃 설정
      signal: AbortSignal.timeout(10000)
    })

    console.log('[VERCEL-PROXY] 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[VERCEL-PROXY] 응답 에러:', errorText)

      return res.status(response.status).json({
        error: 'Failed to fetch image',
        status: response.status,
        statusText: response.statusText,
        responseBody: errorText.substring(0, 500) // 처음 500자만
      })
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    console.log('[VERCEL-PROXY] 성공:', contentType, buffer.byteLength, 'bytes')

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.setHeader('CDN-Cache-Control', 'max-age=31536000')

    res.status(200).send(Buffer.from(buffer))

  } catch (error) {
    console.error('[VERCEL-PROXY] 전체 에러:', error)

    // 더 자세한 에러 정보
    let errorInfo = {
      error: 'Proxy error',
      message: error.message,
      name: error.name,
      originalUrl: decodeURIComponent(url)
    }

    // 타임아웃 에러
    if (error.name === 'AbortError') {
      errorInfo.type = 'timeout'
      errorInfo.message = 'Request timeout (10s)'
    }

    // 네트워크 에러
    if (error.code) {
      errorInfo.code = error.code
    }

    res.status(500).json(errorInfo)
  }
}
