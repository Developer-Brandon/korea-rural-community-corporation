<!--
  ToastContainer.vue - 토스트 알림 컨테이너
  성공, 에러, 경고, 정보 메시지 표시
  자동 사라짐 및 수동 닫기 지원
-->
<template>
  <Teleport to="body">
    <div v-if="toasts.length > 0" class="toast-container" role="region" aria-label="알림">
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.type}`, { 'toast--dismissible': toast.dismissible }]"
          :role="toast.type === 'error' ? 'alert' : 'status'"
          :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
        >
          <!-- 토스트 아이콘 -->
          <div class="toast__icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- 성공 아이콘 -->
              <template v-if="toast.type === 'success'">
                <circle cx="12" cy="12" r="10" stroke="#10B981" stroke-width="1.4" />
                <polyline
                  points="9,12 11,14 15,10"
                  stroke="#10B981"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </template>

              <!-- 에러 아이콘 -->
              <template v-else-if="toast.type === 'error'">
                <circle cx="12" cy="12" r="10" stroke="#EF4444" stroke-width="1.4" />
                <line
                  x1="15"
                  y1="9"
                  x2="9"
                  y2="15"
                  stroke="#EF4444"
                  stroke-width="1.4"
                  stroke-linecap="round"
                />
                <line
                  x1="9"
                  y1="9"
                  x2="15"
                  y2="15"
                  stroke="#EF4444"
                  stroke-width="1.4"
                  stroke-linecap="round"
                />
              </template>

              <!-- 경고 아이콘 -->
              <template v-else-if="toast.type === 'warning'">
                <path
                  d="M10.29 3.86L1.82 18A2 2 0 0 0 3.55 21H20.45A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z"
                  stroke="#F59E0B"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="12"
                  y1="9"
                  x2="12"
                  y2="13"
                  stroke="#F59E0B"
                  stroke-width="1.4"
                  stroke-linecap="round"
                />
                <circle cx="12" cy="17" r="1" fill="#F59E0B" />
              </template>

              <!-- 정보 아이콘 -->
              <template v-else>
                <circle cx="12" cy="12" r="10" stroke="#3B82F6" stroke-width="1.4" />
                <line
                  x1="12"
                  y1="16"
                  x2="12"
                  y2="12"
                  stroke="#3B82F6"
                  stroke-width="1.4"
                  stroke-linecap="round"
                />
                <circle cx="12" cy="8" r="1" fill="#3B82F6" />
              </template>
            </svg>
          </div>

          <!-- 토스트 내용 -->
          <div class="toast__content">
            <h4 v-if="toast.title" class="toast__title">
              {{ toast.title }}
            </h4>
            <p class="toast__message">
              {{ toast.message }}
            </p>
          </div>

          <!-- 닫기 버튼 -->
          <button
            v-if="toast.dismissible"
            class="toast__close"
            @click="removeToast(toast.id)"
            aria-label="알림 닫기"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <!-- 진행률 바 (지속시간이 있을 때) -->
          <div
            v-if="toast.duration && toast.duration > 0"
            class="toast__progress"
            :style="{ animationDuration: `${toast.duration}ms` }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 토스트 상태
const toasts = ref([])
const toastIdCounter = ref(0)

/**
 * 토스트 추가
 * @param {Object} options - 토스트 옵션
 */
const addToast = (options) => {
  const {
    type = 'info',
    title = '',
    message = '',
    duration = 5000,
    dismissible = true,
    persistent = false,
  } = options

  const toast = {
    id: ++toastIdCounter.value,
    type,
    title,
    message,
    duration: persistent ? 0 : duration,
    dismissible,
    createdAt: Date.now(),
  }

  toasts.value.push(toast)

  // 자동 제거 (지속시간이 설정된 경우)
  if (toast.duration > 0) {
    setTimeout(() => {
      removeToast(toast.id)
    }, toast.duration)
  }

  return toast.id
}

/**
 * 토스트 제거
 * @param {number} id - 토스트 ID
 */
const removeToast = (id) => {
  const index = toasts.value.findIndex((toast) => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

/**
 * 모든 토스트 제거
 */
const clearAllToasts = () => {
  toasts.value = []
}

/**
 * 특정 타입의 토스트만 제거
 * @param {string} type - 토스트 타입
 */
const clearToastsByType = (type) => {
  toasts.value = toasts.value.filter((toast) => toast.type !== type)
}

/**
 * 편의 메서드들
 */
const showSuccess = (message, options = {}) => {
  return addToast({ type: 'success', message, ...options })
}

const showError = (message, options = {}) => {
  return addToast({
    type: 'error',
    message,
    duration: 8000, // 에러는 더 오래 표시
    ...options,
  })
}

const showWarning = (message, options = {}) => {
  return addToast({ type: 'warning', message, ...options })
}

const showInfo = (message, options = {}) => {
  return addToast({ type: 'info', message, ...options })
}

// 글로벌 토스트 API 제공
const toastAPI = {
  add: addToast,
  remove: removeToast,
  clear: clearAllToasts,
  clearByType: clearToastsByType,
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
}

// 전역에서 사용할 수 있도록 제공
import { getCurrentInstance } from 'vue'
const instance = getCurrentInstance()
if (instance) {
  instance.appContext.config.globalProperties.$toast = toastAPI
}

// provide/inject를 통한 제공
import { provide } from 'vue'
provide('toast', toastAPI)

// 키보드 이벤트 처리
const handleKeydown = (event) => {
  // ESC 키로 모든 토스트 닫기
  if (event.key === 'Escape') {
    clearAllToasts()
  }
}

onMounted(() => {
  // 키보드 이벤트 리스너 등록
  document.addEventListener('keydown', handleKeydown)

  console.log('🍞 Toast Container 초기화 완료')
})

onBeforeUnmount(() => {
  // 키보드 이벤트 리스너 제거
  document.removeEventListener('keydown', handleKeydown)
})

// 외부에서 사용할 수 있도록 expose
defineExpose({
  addToast,
  removeToast,
  clearAllToasts,
  showSuccess,
  showError,
  showWarning,
  showInfo,
})
</script>

<style lang="scss" scoped>
/**
 * 토스트 컨테이너 스타일
 */
.toast-container {
  position: fixed;
  top: 80px; /* 헤더 아래 */
  right: 20px;
  z-index: 1000;
  pointer-events: none; /* 컨테이너는 클릭 이벤트 차단하지 않음 */

  @media (max-width: 768px) {
    top: 60px;
    right: 16px;
    left: 16px;
  }
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

/**
 * 개별 토스트 스타일
 */
.toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 480px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  pointer-events: auto; /* 토스트는 클릭 가능 */

  /* 타입별 테두리 색상 */
  &--success {
    border-left-color: #10b981;
  }

  &--error {
    border-left-color: #ef4444;
  }

  &--warning {
    border-left-color: #f59e0b;
  }

  &--info {
    border-left-color: #3b82f6;
  }

  @media (max-width: 768px) {
    min-width: auto;
    max-width: none;
    padding: 14px;
  }
}

/**
 * 토스트 아이콘
 */
.toast__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

/**
 * 토스트 내용
 */
.toast__content {
  flex: 1;
  min-width: 0; /* overflow 방지 */
}

.toast__title {
  font-size: 16px;
  font-weight: 600;
  color: #2d1810;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.toast__message {
  font-size: 14px;
  color: #666666;
  margin: 0;
  line-height: 1.5;
  word-break: break-word;
}

/**
 * 닫기 버튼
 */
.toast__close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #999999;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f0f0f0;
    color: #666666;
  }

  &:focus-visible {
    outline: 2px solid #4a90e2;
    outline-offset: 2px;
  }
}

/**
 * 진행률 바
 */
.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  border-radius: 0 0 12px 12px;
  opacity: 0.6;

  /* 애니메이션: 왼쪽에서 오른쪽으로 줄어듦 */
  animation: toast-progress linear forwards;
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/**
 * 토스트 전환 애니메이션
 */
.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}

/**
 * 다크모드 스타일
 */
.dark-mode {
  .toast {
    background: #2d2d2d;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .toast__title {
    color: #ffffff;
  }

  .toast__message {
    color: #cccccc;
  }

  .toast__close {
    color: #999999;

    &:hover {
      background: #404040;
      color: #cccccc;
    }
  }
}

/**
 * 접근성 개선
 */
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move {
    transition: none !important;
  }

  .toast__progress {
    animation: none !important;
  }
}

/**
 * 고대비 모드 지원
 */
@media (prefers-contrast: high) {
  .toast {
    border: 2px solid;

    &--success {
      border-color: #10b981;
    }

    &--error {
      border-color: #ef4444;
    }

    &--warning {
      border-color: #f59e0b;
    }

    &--info {
      border-color: #3b82f6;
    }
  }
}
</style>
