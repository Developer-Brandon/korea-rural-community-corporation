/**
 * main.js - Vue 3 애플리케이션 진입점
 * truefriend 한국투자 증권 AI 채팅 플랫폼
 * Vite + Vue 3 + SCSS 설정
 */

import { createApp } from 'vue'
import App from './App.vue'

// 글로벌 스타일 임포트
import './assets/base_styles.scss'

/**
 * Vue 앱 인스턴스 생성
 */
const app = createApp(App)

/**
 * 글로벌 설정
 */
app.config.globalProperties.$appName = '농어촌공사AI솔루션'
app.config.globalProperties.$version = '1.0.0'

// 개발 환경에서만 성능 추적 활성화
if (import.meta.env.DEV) {
  app.config.performance = true
  console.log('🔧 개발 모드: 성능 추적 활성화')
}

/**
 * 글로벌 에러 핸들러
 */
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue 에러 발생:', err)
  console.error('컴포넌트 인스턴스:', instance)
  console.error('에러 정보:', info)

  // 프로덕션 환경에서는 에러 로깅 서비스에 전송
  if (import.meta.env.PROD) {
    // 예: Sentry, LogRocket 등에 에러 전송
    // reportErrorToService(err, instance, info)
  }
}

/**
 * 글로벌 경고 핸들러
 */
app.config.warnHandler = (msg, instance, trace) => {
  if (import.meta.env.DEV) {
    console.warn('Vue 경고:', msg)
    console.warn('추적 정보:', trace)
  }
}

/**
 * 글로벌 디렉티브 등록
 */

// 클릭 외부 감지 디렉티브
app.directive('click-outside', {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function (event) {
      // 클릭한 요소가 현재 요소 내부가 아닐 때
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
})

// 포커스 디렉티브
app.directive('focus', {
  mounted(el) {
    el.focus()
  },
})

// 툴팁 디렉티브
app.directive('tooltip', {
  beforeMount(el, binding) {
    el.setAttribute('title', binding.value)
    el.style.position = 'relative'
  },
  updated(el, binding) {
    el.setAttribute('title', binding.value)
  },
})

/**
 * 글로벌 믹스인 (필요시)
 * 주의: Vue 3에서는 Composition API 사용 권장
 */
// app.mixin({
//   methods: {
//     /**
//      * 날짜 포맷팅 유틸리티
//      * @param {Date|string} date - 포맷팅할 날짜
//      * @param {string} format - 포맷 옵션
//      * @return {string} 포맷된 날짜 문자열
//      */
//     $formatDate(date, format = 'YYYY-MM-DD') {
//       if (!date) return ''

//       const d = new Date(date)
//       const year = d.getFullYear()
//       const month = String(d.getMonth() + 1).padStart(2, '0')
//       const day = String(d.getDate()).padStart(2, '0')
//       const hours = String(d.getHours()).padStart(2, '0')
//       const minutes = String(d.getMinutes()).padStart(2, '0')

//       switch (format) {
//         case 'YYYY-MM-DD':
//           return `${year}-${month}-${day}`
//         case 'YYYY-MM-DD HH:mm':
//           return `${year}-${month}-${day} ${hours}:${minutes}`
//         case 'MM/DD':
//           return `${month}/${day}`
//         default:
//           return d.toLocaleDateString()
//       }
//     },

//     /**
//      * 디바운스 유틸리티
//      * @param {Function} func - 실행할 함수
//      * @param {number} delay - 지연 시간(ms)
//      * @return {Function} 디바운스된 함수
//      */
//     $debounce(func, delay = 300) {
//       let timeoutId
//       return function (...args) {
//         clearTimeout(timeoutId)
//         timeoutId = setTimeout(() => func.apply(this, args), delay)
//       }
//     },

//     /**
//      * 로그 유틸리티
//      * @param {string} message - 로그 메시지
//      * @param {string} level - 로그 레벨
//      */
//     $log(message, level = 'info') {
//       if (import.meta.env.DEV) {
//         console[level](`[${this.$options.name || 'Component'}]`, message)
//       }
//     },
//   },
// })

/**
 * 개발 도구 설정
 */
if (import.meta.env.DEV) {
  // Vue DevTools 연결
  app.config.devtools = true

  // 글로벌 디버그 함수
  window.$app = app
  window.$debug = {
    logComponentTree: () => {
      console.log('현재 컴포넌트 트리:', app._instance)
    },
    logGlobalProperties: () => {
      console.log('글로벌 속성:', app.config.globalProperties)
    },
  }

  console.log('🛠️ 개발 도구 활성화')
  console.log('사용 가능한 디버그 명령:', Object.keys(window.$debug))
}

/**
 * 앱 마운트 전 초기화 작업
 */
const initializeApp = async () => {
  try {
    console.log('🚀 앱 초기화 시작...')

    // 환경 변수 검증
    if (!import.meta.env.VITE_APP_TITLE) {
      console.warn('⚠️ VITE_APP_TITLE 환경 변수가 설정되지 않았습니다.')
    }

    // 브라우저 호환성 검사
    if (!window.fetch) {
      throw new Error('이 브라우저는 지원되지 않습니다. 최신 브라우저를 사용해주세요.')
    }

    // 서비스 워커 등록 (PWA 사용 시)
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      try {
        await navigator.serviceWorker.register('/sw.js')
        console.log('✅ Service Worker 등록 완료')
      } catch (error) {
        console.warn('⚠️ Service Worker 등록 실패:', error)
      }
    }

    // 글로벌 CSS 변수 설정
    document.documentElement.style.setProperty('--app-name', '"농어촌공사AI솔루션"')

    console.log('✅ 앱 초기화 완료')

    return true
  } catch (error) {
    console.error('❌ 앱 초기화 실패:', error)

    // 에러 페이지 표시 또는 폴백 처리
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <div>
          <h1>앱 로딩 중 오류가 발생했습니다</h1>
          <p>${error.message}</p>
          <button onclick="location.reload()" style="
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 16px;
            background: #4A90E2;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
          ">
            페이지 새로고침
          </button>
        </div>
      </div>
    `

    return false
  }
}

/**
 * 앱 마운트 및 실행
 */
initializeApp().then((success) => {
  if (success) {
    // 앱 마운트
    app.mount('#app')

    console.log('🎉 Vue 앱이 성공적으로 마운트되었습니다!')
    console.log('📱 앱 정보:', {
      name: app.config.globalProperties.$appName,
      version: app.config.globalProperties.$version,
      environment: import.meta.env.MODE,
      isDev: import.meta.env.DEV,
    })

    // 성능 측정 (개발 환경)
    if (import.meta.env.DEV) {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0]
        console.log('📊 페이지 로딩 성능:', {
          DOMContentLoaded: `${Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart)}ms`,
          Load: `${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`,
          Total: `${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`,
        })
      }, 1000)
    }
  }
})

/**
 * 전역 에러 캐처 (예상치 못한 에러)
 */
window.addEventListener('error', (event) => {
  console.error('전역 JavaScript 에러:', event.error)

  // 프로덕션에서는 에러 리포팅 서비스에 전송
  if (import.meta.env.PROD) {
    // reportErrorToService(event.error)
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('처리되지 않은 Promise 거부:', event.reason)

  // 프로덕션에서는 에러 리포팅 서비스에 전송
  if (import.meta.env.PROD) {
    // reportErrorToService(event.reason)
  }

  // 기본 에러 처리 방지
  event.preventDefault()
})

/**
 * 앱 종료 시 정리 작업
 */
window.addEventListener('beforeunload', () => {
  console.log('👋 앱 종료 중...')

  // 필요한 정리 작업 수행
  // 예: 진행 중인 요청 취소, 로컬 스토리지 정리 등
})

// Hot Module Replacement (HMR) 지원
if (import.meta.hot) {
  import.meta.hot.accept()
  console.log('🔥 HMR 활성화됨')
}
