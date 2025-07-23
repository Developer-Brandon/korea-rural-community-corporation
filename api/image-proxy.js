// api/image-proxy.js
export default async function handler(req, res) {
  // CORS 헤더 설정
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
    console.log('[VERCEL-PROXY] 이미지 요청:', decodeURIComponent(url))

    // HTTP를 HTTPS로 강제 변환
    let imageUrl = decodeURIComponent(url)
    if (imageUrl.startsWith('http://')) {
      imageUrl = imageUrl.replace('http://', 'https://')
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Vercel)',
        'Referer': 'https://news.naver.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      console.error('[VERCEL-PROXY] 실패:', response.status)
      return res.status(response.status).json({ error: 'Failed to fetch image' })
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.status(200).send(Buffer.from(buffer))

  } catch (error) {
    console.error('[VERCEL-PROXY] 에러:', error)
    res.status(500).json({ error: 'Proxy error', message: error.message })
  }
}
