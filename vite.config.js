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
})
