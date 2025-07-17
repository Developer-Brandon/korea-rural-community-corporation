<!--
  App.vue - 루트 컴포넌트
  전체 앱을 감싸는 최상위 컴포넌트
  라우터 뷰 및 글로벌 상태 관리
-->
<template>
  <div id="app" :class="appClasses">
    <!-- 메인 페이지 렌더링 -->
    <MainPage />

    <!-- 글로벌 토스트 알림 -->
    <ToastContainer v-if="showToasts" />

    <!-- 글로벌 모달 -->
    <ModalContainer v-if="showModals" />

    <!-- 로딩 오버레이 -->
    <LoadingOverlay v-if="isGlobalLoading" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, provide, readonly } from 'vue' //computed
import MainPage from './components/MainPage.vue'
import ToastContainer from './components/ToastContainer.vue'
import ModalContainer from './components/ModalContainer.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'

// 글로벌 상태
const isDarkMode = ref(false)
const isGlobalLoading = ref(false)
const showToasts = ref(true)
const showModals = ref(true)
const isMobileMenuOpen = ref(false)

/**
 * 앱 클래스 계산
 * 다크모드, 모바일 메뉴 상태 등에 따른 클래스
 */
const appClasses = computed(() => ({
  'dark-mode': isDarkMode.value,
  'mobile-menu-open': isMobileMenuOpen.value,
  loading: isGlobalLoading.value,
}))

/**
 * 테마 변경 핸들러
 * @param {boolean} darkMode - 다크모드 여부
 */
const handleThemeChange = (darkMode) => {
  isDarkMode.value = darkMode

  // 로컬 스토리지에 테마 설정 저장
  try {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  } catch (error) {
    console.warn('테마 설정 저장 실패:', error)
  }

  // HTML 데이터 속성 설정
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  console.log(`테마 변경: ${darkMode ? '다크' : '라이트'} 모드`)
}

/**
 * 모바일 메뉴 토글
 */
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value

  // 바디 스크롤 제어 (모바일 메뉴 오픈 시 스크롤 방지)
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

/**
 * 글로벌 로딩 상태 제어
 * @param {boolean} loading - 로딩 상태
 */
const setGlobalLoading = (loading) => {
  isGlobalLoading.value = loading
}

/**
 * 키보드 단축키 핸들러
 * @param {KeyboardEvent} event - 키보드 이벤트
 */
const handleKeyboardShortcuts = (event) => {
  // Ctrl + K: 검색 모달 열기
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    console.log('검색 모달 열기 (Ctrl+K)')
    // 검색 모달 열기 로직
  }

  // Ctrl + N: 새 대화 시작
  if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
    event.preventDefault()
    console.log('새 대화 시작 (Ctrl+N)')
    // 새 대화 시작 로직
  }

  // Ctrl + ,: 설정 열기
  if ((event.ctrlKey || event.metaKey) && event.key === ',') {
    event.preventDefault()
    console.log('설정 열기 (Ctrl+,)')
    // 설정 모달 열기 로직
  }

  // ESC: 모든 모달/메뉴 닫기
  if (event.key === 'Escape') {
    isMobileMenuOpen.value = false
    document.body.style.overflow = ''
    console.log('ESC - 모든 오버레이 닫기')
  }
}

/**
 * 브라우저 리사이즈 핸들러
 * 모바일/데스크톱 전환 시 상태 초기화
 */
const handleResize = () => {
  const isMobile = window.innerWidth <= 768

  // 데스크톱으로 전환 시 모바일 메뉴 닫기
  if (!isMobile && isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
    document.body.style.overflow = ''
  }
}

/**
 * 테마 초기화
 * 로컬 스토리지에서 저장된 테마 불러오기
 */
const initializeTheme = () => {
  try {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    // 저장된 테마가 있으면 사용, 없으면 시스템 설정 따라감
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark

    handleThemeChange(shouldUseDark)
  } catch (error) {
    console.warn('테마 초기화 실패:', error)
    // 기본값은 라이트 모드
    handleThemeChange(false)
  }
}

/**
 * 시스템 테마 변경 감지
 */
const watchSystemTheme = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleSystemThemeChange = (e) => {
    // 사용자가 수동으로 테마를 설정하지 않았을 때만 시스템 테마 따라감
    const hasManualTheme = localStorage.getItem('theme')
    if (!hasManualTheme) {
      handleThemeChange(e.matches)
    }
  }

  mediaQuery.addEventListener('change', handleSystemThemeChange)

  // 컴포넌트 언마운트 시 리스너 제거
  onBeforeUnmount(() => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  })
}

/**
 * 앱 초기화
 */
const initializeApp = () => {
  console.log('🚀 truefriend 한국투자 증권 AI 채팅 플랫폼 시작')

  // 테마 초기화
  initializeTheme()

  // 시스템 테마 감지 시작
  watchSystemTheme()

  // 이벤트 리스너 등록
  window.addEventListener('keydown', handleKeyboardShortcuts)
  window.addEventListener('resize', handleResize)

  console.log('✅ 앱 초기화 완료')
}

/**
 * 앱 정리
 */
const cleanupApp = () => {
  // 이벤트 리스너 제거
  window.removeEventListener('keydown', handleKeyboardShortcuts)
  window.removeEventListener('resize', handleResize)

  // 바디 스타일 복원
  document.body.style.overflow = ''

  console.log('🧹 앱 정리 완료')
}

// 라이프사이클 훅
onMounted(() => {
  initializeApp()
})

onBeforeUnmount(() => {
  cleanupApp()
})

provide('themeController', {
  isDarkMode: readonly(isDarkMode),
  toggleTheme: () => handleThemeChange(!isDarkMode.value),
  setTheme: handleThemeChange,
})

provide('loadingController', {
  isLoading: readonly(isGlobalLoading),
  setLoading: setGlobalLoading,
})

provide('mobileMenuController', {
  isOpen: readonly(isMobileMenuOpen),
  toggle: toggleMobileMenu,
  close: () => {
    isMobileMenuOpen.value = false
    document.body.style.overflow = ''
  },
})
</script>

<style lang="scss">
/**
 * App.vue 스타일
 * 루트 레벨 스타일 및 글로벌 오버라이드
 */

#app {
  width: 100vw;
  height: 100vh;
  /* overflow: hidden; // 이 부분 제거 */
  overflow: visible; /* visible로 변경 */
  position: relative;

  /* 앱 전체 폰트 설정 */
  font-family:
    'Noto Sans KR',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;

  /* 앱 전체 색상 및 배경 */
  background: #f5f1e8;
  color: #2d1810;

  /* 부드러운 전환 */
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

/**
 * 다크모드 클래스 적용 시
 */
.dark-mode {
  background: #1f1f1f;
  color: #ffffff;
}

/**
 * 모바일 메뉴 오픈 상태
 */
.mobile-menu-open {
  @media (max-width: 768px) {
    overflow: hidden;

    /* 모바일 메뉴 배경 오버레이 */
    &::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      animation: fadeIn 0.3s ease;
    }
  }
}

/**
 * 글로벌 로딩 상태
 */
.loading {
  cursor: wait;

  /* 로딩 중 사용자 인터랙션 제한 */
  * {
    pointer-events: none;
  }

  /* 로딩 인디케이터는 제외 */
  .loading-overlay,
  .loading-spinner {
    pointer-events: auto;
  }
}

/**
 * 접근성 개선
 * 스크린 리더용 텍스트
 */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/**
 * 키보드 포커스 표시 강화
 */
:focus-visible {
  outline: 2px solid #4a90e2 !important;
  outline-offset: 2px !important;
  border-radius: 4px !important;
}

/**
 * 선택 텍스트 스타일
 */
::selection {
  background: #4a90e2;
  color: #ffffff;
}

::-moz-selection {
  background: #4a90e2;
  color: #ffffff;
}

/**
 * 전역 애니메이션 클래스
 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/**
 * 모바일 환경 최적화
 */
@media (max-width: 768px) {
  #app {
    /* 모바일에서 주소창 숨김 고려한 높이 */
    height: 100dvh; /* Dynamic viewport height */

    /* 터치 스크롤 개선 */
    -webkit-overflow-scrolling: touch;
  }

  /* 모바일 터치 반응성 개선 */
  button,
  [role='button'],
  .clickable {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}

/**
 * 고성능 스크롤 최적화
 */
.smooth-scroll {
  scroll-behavior: smooth;
}

/**
 * GPU 가속 최적화
 */
.gpu-optimized {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/**
 * 프린트 스타일 오버라이드
 */
@media print {
  #app {
    background: white !important;
    color: black !important;
    font-size: 12pt !important;
  }

  .no-print,
  .app-sidebar,
  .right-panel,
  .floating-elements {
    display: none !important;
  }
}

/**
 * 접근성 - 움직임 줄이기
 */
@media (prefers-reduced-motion: reduce) {
  #app {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

/**
 * 고대비 모드 지원
 */
@media (prefers-contrast: high) {
  #app {
    border: 1px solid;
  }
}

/* 365번째 줄에 추가 - 반응형 미디어쿼리 */

@media (max-width: 1024px) {
  #app {
    font-size: 15px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 480px) {
  #app {
    font-size: 14px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

/* 📱 세로 길이가 짧을 때 스크롤 대응 */
@media (max-height: 600px) {
  #app {
    overflow-y: auto;
    height: 100vh;
    min-height: 100vh;
    -webkit-overflow-scrolling: touch;
  }

  body {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

// @media (max-height: 500px) {
//   #app {
//     overflow-y: scroll;
//     -webkit-overflow-scrolling: touch;
//   }
// }

// /* 모바일 가로모드 특별 대응 */
// @media (max-height: 500px) and (orientation: landscape) {
//   #app {
//     overflow-y: auto;
//     height: 100vh;
//     padding: 0;
//     -webkit-overflow-scrolling: touch;
//   }
// }
</style>
