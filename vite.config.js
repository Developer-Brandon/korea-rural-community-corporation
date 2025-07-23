import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // ✅ API 핸들러 플러그인 추가
    {
      name: 'api-handler',
      configureServer(server) {
              // 🖼️ 이미지 프록시 - 이 부분만 추가!
        server.middlewares.use('/api/image-proxy', async (req, res, next) => {
          if (req.method === 'GET') {
            const urlParams = new URLSearchParams(req.url.split('?')[1])
            const imageUrl = urlParams.get('url')

            if (!imageUrl) {
              res.statusCode = 400
              res.end('URL parameter required')
              return
            }

            try {
              const response = await fetch(decodeURIComponent(imageUrl), {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; Bot)',
                  'Referer': 'https://news.naver.com/'
                }
              })

              const buffer = await response.arrayBuffer()
              const contentType = response.headers.get('content-type') || 'image/jpeg'

              res.setHeader('Content-Type', contentType)
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(Buffer.from(buffer))
            } catch (error) {
              res.statusCode = 500
              res.end('Error fetching image')
            }
          }
        }),
        server.middlewares.use('/api/openai-chat', async (req, res, next) => {
          console.log(`[API] ${req.method} /api/openai-chat 요청 받음`)

          if (req.method === 'OPTIONS') {
            // CORS preflight 처리
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
            res.statusCode = 200
            res.end()
            return
          }

          if (req.method === 'POST') {
            try {
              // Request body 수집
              let body = ''

              req.on('data', (chunk) => {
                body += chunk.toString()
              })

              req.on('end', async () => {
                try {
                  // JSON 파싱
                  const parsedBody = JSON.parse(body)
                  req.body = parsedBody

                  console.log('[API] 요청 데이터:', {
                    message: parsedBody.message?.substring(0, 50) + '...',
                    historyLength: parsedBody.conversationHistory?.length || 0,
                  })

                  // API 함수 동적 import 및 실행
                  const { default: handler } = await import('./api/openai-chat.js')

                  // Express 스타일 response 객체 생성
                  const apiRes = {
                    setHeader: (name, value) => res.setHeader(name, value),
                    status: (code) => {
                      res.statusCode = code
                      return apiRes
                    },
                    json: (data) => {
                      res.setHeader('Content-Type', 'application/json')
                      res.end(JSON.stringify(data))
                    },
                    end: (data) => {
                      res.end(data)
                    },
                  }

                  // API 핸들러 실행
                  await handler(req, apiRes)
                } catch (parseError) {
                  console.error('[API] JSON 파싱 오류:', parseError)
                  res.statusCode = 400
                  res.setHeader('Content-Type', 'application/json')
                  res.end(
                    JSON.stringify({
                      error: '잘못된 JSON 형식입니다.',
                      details: parseError.message,
                    }),
                  )
                }
              })

              req.on('error', (error) => {
                console.error('[API] 요청 오류:', error)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(
                  JSON.stringify({
                    error: '요청 처리 중 오류가 발생했습니다.',
                    details: error.message,
                  }),
                )
              })
            } catch (importError) {
              console.error('[API] 핸들러 import 오류:', importError)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error: 'API 핸들러를 로드할 수 없습니다.',
                  details: importError.message,
                }),
              )
            }
          } else {
            // POST가 아닌 요청
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
          }
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'import.meta.env': 'import.meta.env',
  },
  // 🚀 Mixed Content 해결을 위한 개발 서버 설정 추가
  server: {
    headers: {
      // Content Security Policy - 모든 이미지 소스 허용
      'Content-Security-Policy': [
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' *",
        "img-src * data: blob: 'unsafe-inline' http: https:",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' * data: blob:",
        "style-src 'self' 'unsafe-inline' * data: blob:",
        'connect-src *',
        'font-src *',
        'object-src *',
        'media-src *',
        'child-src *',
        'frame-src *',
      ].join('; '),

      // 추가 보안 헤더
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer-when-downgrade',

      // CORS 헤더
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },

  // 🎯 빌드 시에도 적용되도록 Preview 서버 설정
  preview: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' *",
        "img-src * data: blob: 'unsafe-inline' http: https:",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' * data: blob:",
        "style-src 'self' 'unsafe-inline' * data: blob:",
        'connect-src *',
      ].join('; '),
    },
  },
})
