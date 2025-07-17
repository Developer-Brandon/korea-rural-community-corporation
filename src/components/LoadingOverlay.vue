<!--
  LoadingOverlay.vue - 로딩 오버레이 컴포넌트
  전체 화면 로딩 스피너 및 메시지 표시
  다양한 로딩 스타일 지원
-->
<template>
  <Teleport to="body">
    <Transition name="loading" appear>
      <div
        v-if="isVisible"
        class="loading-overlay"
        :class="[`loading-overlay--${variant}`, { 'loading-overlay--backdrop': showBackdrop }]"
        role="status"
        aria-live="polite"
        aria-label="로딩 중"
      >
        <!-- 로딩 백드롭 -->
        <div v-if="showBackdrop" class="loading-backdrop"></div>

        <!-- 로딩 컨텐츠 -->
        <div class="loading-content">
          <!-- 로딩 스피너 -->
          <div class="loading-spinner">
            <!-- 원형 스피너 (기본) -->
            <div v-if="variant === 'spinner'" class="spinner spinner--circle">
              <svg width="40" height="40" viewBox="0 0 50 50">
                <circle
                  class="spinner__path"
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-dasharray="31.416"
                  stroke-dashoffset="31.416"
                />
              </svg>
            </div>

            <!-- 점 애니메이션 -->
            <div v-else-if="variant === 'dots'" class="spinner spinner--dots">
              <div class="spinner__dot"></div>
              <div class="spinner__dot"></div>
              <div class="spinner__dot"></div>
            </div>

            <!-- 파형 애니메이션 -->
            <div v-else-if="variant === 'wave'" class="spinner spinner--wave">
              <div class="spinner__bar"></div>
              <div class="spinner__bar"></div>
              <div class="spinner__bar"></div>
              <div class="spinner__bar"></div>
              <div class="spinner__bar"></div>
            </div>

            <!-- 펄스 애니메이션 -->
            <div v-else-if="variant === 'pulse'" class="spinner spinner--pulse">
              <div class="spinner__circle"></div>
              <div class="spinner__circle"></div>
            </div>

            <!-- 브랜드 로고 스피너 -->
            <div v-else-if="variant === 'brand'" class="spinner spinner--brand">
              <div class="brand-logo">
                <span class="brand-logo__text">truefriend</span>
                <div class="brand-logo__spinner"></div>
              </div>
            </div>
          </div>

          <!-- 로딩 메시지 -->
          <div v-if="message" class="loading-message">
            <p class="loading-text">{{ message }}</p>

            <!-- 진행률 표시 -->
            <div v-if="showProgress && progress !== null" class="loading-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
                ></div>
              </div>
              <span class="progress-text"> {{ Math.round(progress) }}% </span>
            </div>

            <!-- 서브 메시지 -->
            <p v-if="subMessage" class="loading-submessage">
              {{ subMessage }}
            </p>
          </div>

          <!-- 취소 버튼 -->
          <button
            v-if="cancellable"
            class="loading-cancel"
            @click="handleCancel"
            aria-label="로딩 취소"
          >
            취소
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// Props 정의
const props = defineProps({
  // 표시 여부
  visible: {
    type: Boolean,
    default: false,
  },
  // 로딩 메시지
  message: {
    type: String,
    default: '로딩 중...',
  },
  // 서브 메시지
  subMessage: {
    type: String,
    default: '',
  },
  // 로딩 스피너 변형
  variant: {
    type: String,
    default: 'spinner', // 'spinner', 'dots', 'wave', 'pulse', 'brand'
    validator: (value) => ['spinner', 'dots', 'wave', 'pulse', 'brand'].includes(value),
  },
  // 백드롭 표시 여부
  showBackdrop: {
    type: Boolean,
    default: true,
  },
  // 진행률 표시 여부
  showProgress: {
    type: Boolean,
    default: false,
  },
  // 진행률 값 (0-100)
  progress: {
    type: Number,
    default: null,
  },
  // 취소 가능 여부
  cancellable: {
    type: Boolean,
    default: false,
  },
  // 자동 숨김 시간 (ms)
  autoHide: {
    type: Number,
    default: 0,
  },
})

// Emits 정의
const emit = defineEmits(['cancel', 'timeout'])

// 로컬 상태
const isVisible = computed(() => props.visible)
const autoHideTimer = ref(null)

/**
 * 취소 버튼 클릭 핸들러
 */
const handleCancel = () => {
  emit('cancel')
}

/**
 * 자동 숨김 타이머 설정
 */
const setAutoHideTimer = () => {
  if (props.autoHide > 0) {
    clearAutoHideTimer()
    autoHideTimer.value = setTimeout(() => {
      emit('timeout')
    }, props.autoHide)
  }
}

/**
 * 자동 숨김 타이머 제거
 */
const clearAutoHideTimer = () => {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
    autoHideTimer.value = null
  }
}

// 키보드 이벤트 처리
const handleKeydown = (event) => {
  // ESC 키로 취소 (취소 가능한 경우만)
  if (event.key === 'Escape' && props.cancellable && isVisible.value) {
    event.preventDefault()
    handleCancel()
  }
}

// 라이프사이클 훅
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)

  // 초기 자동 숨김 타이머 설정
  if (isVisible.value) {
    setAutoHideTimer()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  clearAutoHideTimer()
})

// props 변경 감지
import { watch } from 'vue'

watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      setAutoHideTimer()
      // 바디 스크롤 방지
      document.body.style.overflow = 'hidden'
    } else {
      clearAutoHideTimer()
      // 바디 스크롤 복원
      document.body.style.overflow = ''
    }
  },
)

watch(
  () => props.autoHide,
  () => {
    if (isVisible.value) {
      setAutoHideTimer()
    }
  },
)
</script>

<style lang="scss" scoped>
/**
 * 로딩 오버레이 스타일
 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/**
 * 로딩 백드롭
 */
.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

/**
 * 로딩 컨텐츠
 */
.loading-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
  background: #ffffff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 32px 24px;
    margin: 0 16px;
  }
}

/**
 * 로딩 스피너 컨테이너
 */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

/**
 * 원형 스피너
 */
.spinner--circle {
  color: #4a90e2;
  animation: spin 1s linear infinite;

  .spinner__path {
    animation: dash 1.5s ease-in-out infinite;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/**
 * 점 스피너
 */
.spinner--dots {
  display: flex;
  gap: 8px;

  .spinner__dot {
    width: 12px;
    height: 12px;
    background: #4a90e2;
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
    &:nth-child(3) {
      animation-delay: 0s;
    }
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/**
 * 파형 스피너
 */
.spinner--wave {
  display: flex;
  gap: 4px;
  align-items: center;

  .spinner__bar {
    width: 4px;
    height: 32px;
    background: #4a90e2;
    border-radius: 2px;
    animation: wave 1.2s ease-in-out infinite;

    &:nth-child(1) {
      animation-delay: -1.1s;
    }
    &:nth-child(2) {
      animation-delay: -1s;
    }
    &:nth-child(3) {
      animation-delay: -0.9s;
    }
    &:nth-child(4) {
      animation-delay: -0.8s;
    }
    &:nth-child(5) {
      animation-delay: -0.7s;
    }
  }
}

@keyframes wave {
  0%,
  40%,
  100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

/**
 * 펄스 스피너
 */
.spinner--pulse {
  position: relative;

  .spinner__circle {
    position: absolute;
    width: 40px;
    height: 40px;
    border: 2px solid #4a90e2;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 1s;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/**
 * 브랜드 로고 스피너
 */
.spinner--brand {
  .brand-logo {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .brand-logo__text {
    font-size: 24px;
    font-weight: 700;
    color: #a47764;
  }

  .brand-logo__spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e0e0e0;
    border-top-color: #4a90e2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

/**
 * 로딩 메시지
 */
.loading-message {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.loading-text {
  font-size: 18px;
  font-weight: 500;
  color: #2d1810;
  margin: 0;
  line-height: 1.4;
}

.loading-submessage {
  font-size: 14px;
  color: #666666;
  margin: 0;
  line-height: 1.5;
}

/**
 * 진행률 바
 */
.loading-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a90e2, #357abd);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 14px;
  color: #666666;
  text-align: center;
}

/**
 * 취소 버튼
 */
.loading-cancel {
  padding: 12px 24px;
  background: transparent;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  color: #666666;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
    border-color: #cccccc;
    color: #2d1810;
  }

  &:focus-visible {
    outline: 2px solid #4a90e2;
    outline-offset: 2px;
  }
}

/**
 * 로딩 변형 스타일
 */
.loading-overlay--spinner {
  .loading-content {
    background: #ffffff;
  }
}

.loading-overlay--brand {
  .loading-backdrop {
    background: rgba(139, 111, 71, 0.1); /* 브랜드 색상 */
  }

  .loading-content {
    background: transparent;
    box-shadow: none;
    padding: 20px;
  }
}

/**
 * 로딩 전환 애니메이션
 */
.loading-enter-active {
  transition: all 0.3s ease;
}

.loading-leave-active {
  transition: all 0.2s ease;
}

.loading-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.loading-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/**
 * 다크모드 스타일
 */
.dark-mode {
  .loading-backdrop {
    background: rgba(0, 0, 0, 0.8);
  }

  .loading-content {
    background: #2d2d2d;
    box-shadow: 0 20px 64px rgba(0, 0, 0, 0.4);
  }

  .loading-text {
    color: #ffffff;
  }

  .loading-submessage {
    color: #cccccc;
  }

  .progress-bar {
    background: #404040;
  }
}

/**
 * 접근성 개선
 */
@media (prefers-reduced-motion: reduce) {
  .spinner--circle,
  .spinner__dot,
  .spinner__bar,
  .spinner__circle,
  .brand-logo__spinner {
    animation: none !important;
  }

  .loading-enter-active,
  .loading-leave-active {
    transition: none !important;
  }

  .progress-fill {
    transition: none !important;
  }
}

/**
 * 고대비 모드 지원
 */
@media (prefers-contrast: high) {
  .loading-content {
    border: 2px solid #2d1810;
  }

  .progress-bar {
    border: 1px solid #2d1810;
  }

  .loading-cancel {
    border-color: #2d1810;
  }
}

// /* 609번째 줄에 추가 */

// @media (max-width: 480px) {
//   .loading-content {
//     padding: 24px 16px;
//     margin: 0 8px;
//   }

//   .loading-text {
//     font-size: 14px;
//   }

//   .loading-submessage {
//     font-size: 12px;
//   }
// }

// /* 📱 세로 길이 짧을 때 로딩 스크롤 대응 */
// @media (max-height: 600px) {
//   .loading-overlay {
//     overflow-y: auto;
//     -webkit-overflow-scrolling: touch;
//   }

//   .loading-content {
//     max-height: 90vh;
//     overflow-y: auto;
//   }
// }

// @media (max-height: 500px) {
//   .loading-content {
//     padding: 16px 12px;
//     margin: 0 4px;
//     max-height: 95vh;
//     overflow-y: auto;
//   }
// }
</style>
