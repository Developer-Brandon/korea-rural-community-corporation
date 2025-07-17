<!--
  ModalContainer.vue - 모달 컨테이너 컴포넌트
  다양한 타입의 모달 지원 (confirm, alert, custom)
  접근성 및 키보드 네비게이션 지원
-->
<template>
  <Teleport to="body">
    <div v-if="modals.length > 0" class="modal-container" @click="handleBackdropClick">
      <!-- 모달 백드롭 -->
      <div class="modal-backdrop" :class="{ 'modal-backdrop--visible': isVisible }"></div>

      <!-- 모달 리스트 -->
      <TransitionGroup name="modal" tag="div" class="modal-list">
        <div
          v-for="(modal, index) in modals"
          :key="modal.id"
          :class="[
            'modal',
            `modal--${modal.type}`,
            `modal--${modal.size}`,
            { 'modal--active': index === modals.length - 1 },
          ]"
          :style="{ zIndex: 1000 + index }"
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="`modal-title-${modal.id}`"
          :aria-describedby="`modal-content-${modal.id}`"
          @click.stop
        >
          <!-- 모달 헤더 -->
          <div v-if="modal.title || modal.closable" class="modal__header">
            <h2 v-if="modal.title" :id="`modal-title-${modal.id}`" class="modal__title">
              {{ modal.title }}
            </h2>

            <button
              v-if="modal.closable"
              class="modal__close"
              @click="closeModal(modal.id)"
              aria-label="모달 닫기"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- 모달 내용 -->
          <div class="modal__content" :id="`modal-content-${modal.id}`">
            <!-- 커스텀 컴포넌트 렌더링 -->
            <component
              v-if="modal.component"
              :is="modal.component"
              v-bind="modal.props"
              @close="closeModal(modal.id)"
              @confirm="handleModalConfirm(modal, $event)"
            />

            <!-- 기본 텍스트 모달 -->
            <template v-else>
              <div class="modal__icon" v-if="modal.icon">
                <!-- 아이콘 SVG -->
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <template v-if="modal.type === 'confirm'">
                    <circle cx="12" cy="12" r="10" stroke="#F59E0B" stroke-width="1.4" />
                    <line
                      x1="12"
                      y1="8"
                      x2="12"
                      y2="12"
                      stroke="#F59E0B"
                      stroke-width="1.4"
                      stroke-linecap="round"
                    />
                    <circle cx="12" cy="16" r="1" fill="#F59E0B" />
                  </template>
                  <template v-else-if="modal.type === 'error'">
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

              <div class="modal__text">
                <p v-if="modal.message" class="modal__message">
                  {{ modal.message }}
                </p>

                <!-- 입력 필드 (prompt 타입) -->
                <input
                  v-if="modal.type === 'prompt'"
                  ref="promptInput"
                  v-model="promptValue"
                  type="text"
                  class="modal__input"
                  :placeholder="modal.placeholder"
                  @keydown.enter="handlePromptConfirm(modal)"
                  @keydown.esc="closeModal(modal.id)"
                />
              </div>
            </template>
          </div>

          <!-- 모달 푸터 -->
          <div v-if="shouldShowFooter(modal)" class="modal__footer">
            <button
              v-if="modal.type === 'confirm' || modal.type === 'prompt'"
              class="modal__button modal__button--secondary"
              @click="handleModalCancel(modal)"
            >
              {{ modal.cancelText || '취소' }}
            </button>

            <button class="modal__button modal__button--primary" @click="handleModalConfirm(modal)">
              {{ modal.confirmText || getDefaultConfirmText(modal.type) }}
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'

// 모달 상태
const modals = ref([])
const modalIdCounter = ref(0)
const promptValue = ref('')
const promptInput = ref(null)

// 모달 표시 상태
const isVisible = computed(() => modals.value.length > 0)

/**
 * 모달 추가
 * @param {Object} options - 모달 옵션
 */
const addModal = (options) => {
  const {
    type = 'alert',
    title = '',
    message = '',
    component = null,
    props = {},
    size = 'medium',
    closable = true,
    persistent = false,
    confirmText = '',
    cancelText = '',
    placeholder = '',
    icon = true,
    onConfirm = null,
    onCancel = null,
    onClose = null,
  } = options

  const modal = {
    id: ++modalIdCounter.value,
    type,
    title,
    message,
    component,
    props,
    size,
    closable,
    persistent,
    confirmText,
    cancelText,
    placeholder,
    icon,
    onConfirm,
    onCancel,
    onClose,
    createdAt: Date.now(),
  }

  modals.value.push(modal)

  // 바디 스크롤 방지
  document.body.style.overflow = 'hidden'

  // prompt 타입인 경우 입력 필드에 포커스
  if (type === 'prompt') {
    nextTick(() => {
      if (promptInput.value) {
        promptInput.value.focus()
      }
    })
  }

  return modal.id
}

/**
 * 모달 닫기
 * @param {number} id - 모달 ID
 * @param {any} result - 닫기 결과
 */
const closeModal = (id, result = null) => {
  const modalIndex = modals.value.findIndex((modal) => modal.id === id)
  if (modalIndex === -1) return

  const modal = modals.value[modalIndex]

  // onClose 콜백 실행
  if (modal.onClose) {
    modal.onClose(result)
  }

  modals.value.splice(modalIndex, 1)

  // 모든 모달이 닫히면 바디 스크롤 복원
  if (modals.value.length === 0) {
    document.body.style.overflow = ''
  }
}

/**
 * 모든 모달 닫기
 */
const closeAllModals = () => {
  modals.value = []
  document.body.style.overflow = ''
}

/**
 * 백드롭 클릭 처리
 */
const handleBackdropClick = (event) => {
  if (event.target === event.currentTarget) {
    const topModal = modals.value[modals.value.length - 1]
    if (topModal && !topModal.persistent && topModal.closable) {
      closeModal(topModal.id)
    }
  }
}

/**
 * 모달 확인 처리
 * @param {Object} modal - 모달 객체
 * @param {any} value - 확인 값
 */
const handleModalConfirm = (modal, value = null) => {
  let result = value

  // prompt 타입인 경우 입력값 사용
  if (modal.type === 'prompt') {
    result = promptValue.value
    promptValue.value = '' // 입력값 초기화
  }

  // onConfirm 콜백 실행
  if (modal.onConfirm) {
    const shouldClose = modal.onConfirm(result)
    // onConfirm이 false를 반환하면 모달을 닫지 않음
    if (shouldClose === false) return
  }

  closeModal(modal.id, result)
}

/**
 * 모달 취소 처리
 * @param {Object} modal - 모달 객체
 */
const handleModalCancel = (modal) => {
  // onCancel 콜백 실행
  if (modal.onCancel) {
    const shouldClose = modal.onCancel()
    // onCancel이 false를 반환하면 모달을 닫지 않음
    if (shouldClose === false) return
  }

  closeModal(modal.id, null)
}

/**
 * prompt 확인 처리
 * @param {Object} modal - 모달 객체
 */
const handlePromptConfirm = (modal) => {
  handleModalConfirm(modal, promptValue.value)
}

/**
 * 푸터 표시 여부 확인
 * @param {Object} modal - 모달 객체
 * @return {boolean} 푸터 표시 여부
 */
const shouldShowFooter = (modal) => {
  return modal.type === 'alert' || modal.type === 'confirm' || modal.type === 'prompt'
}

/**
 * 기본 확인 텍스트 반환
 * @param {string} type - 모달 타입
 * @return {string} 확인 텍스트
 */
const getDefaultConfirmText = (type) => {
  const textMap = {
    alert: '확인',
    confirm: '확인',
    prompt: '입력',
  }
  return textMap[type] || '확인'
}

/**
 * 편의 메서드들
 */
const showAlert = (message, options = {}) => {
  return addModal({
    type: 'alert',
    message,
    title: '알림',
    ...options,
  })
}

const showConfirm = (message, options = {}) => {
  return new Promise((resolve) => {
    addModal({
      type: 'confirm',
      message,
      title: '확인',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
      ...options,
    })
  })
}

const showPrompt = (message, options = {}) => {
  return new Promise((resolve) => {
    addModal({
      type: 'prompt',
      message,
      title: '입력',
      onConfirm: (value) => resolve(value),
      onCancel: () => resolve(null),
      ...options,
    })
  })
}

// 키보드 이벤트 처리
const handleKeydown = (event) => {
  if (modals.value.length === 0) return

  const topModal = modals.value[modals.value.length - 1]

  // ESC 키로 모달 닫기
  if (event.key === 'Escape' && topModal.closable && !topModal.persistent) {
    event.preventDefault()
    closeModal(topModal.id)
  }

  // Enter 키로 확인 (alert 타입만)
  if (event.key === 'Enter' && topModal.type === 'alert') {
    event.preventDefault()
    handleModalConfirm(topModal)
  }
}

// 모달 API
const modalAPI = {
  add: addModal,
  close: closeModal,
  closeAll: closeAllModals,
  alert: showAlert,
  confirm: showConfirm,
  prompt: showPrompt,
}

// 전역에서 사용할 수 있도록 제공
import { getCurrentInstance, provide } from 'vue'
const instance = getCurrentInstance()
if (instance) {
  instance.appContext.config.globalProperties.$modal = modalAPI
}

provide('modal', modalAPI)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  console.log('🪟 Modal Container 초기화 완료')
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = '' // 바디 스크롤 복원
})

// 외부에서 사용할 수 있도록 expose
defineExpose({
  addModal,
  closeModal,
  closeAllModals,
  showAlert,
  showConfirm,
  showPrompt,
})
</script>

<style lang="scss" scoped>
/**
 * 모달 컨테이너 스타일
 */
.modal-container {
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
 * 모달 백드롭
 */
.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;

  &--visible {
    opacity: 1;
  }
}

/**
 * 모달 리스트
 */
.modal-list {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/**
 * 개별 모달
 */
.modal {
  position: absolute;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 64px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow: auto;
  pointer-events: auto;

  /* 모달 크기 */
  &--small {
    width: 100%;
    max-width: 400px;
  }

  &--medium {
    width: 100%;
    max-width: 500px;
  }

  &--large {
    width: 100%;
    max-width: 800px;
  }

  &--full {
    width: 95vw;
    height: 95vh;
    max-width: none;
    max-height: none;
  }

  /* 활성 모달 */
  &--active {
    transform: scale(1);
    opacity: 1;
  }

  @media (max-width: 768px) {
    &--small,
    &--medium {
      max-width: 95vw;
    }

    &--large {
      max-width: 95vw;
      max-height: 85vh;
    }
  }
}

/**
 * 모달 헤더
 */
.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;

  @media (max-width: 768px) {
    padding: 20px 20px 0;
  }
}

.modal__title {
  font-size: 20px;
  font-weight: 600;
  color: #2d1810;
  margin: 0;
  line-height: 1.3;
}

.modal__close {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 8px;
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
 * 모달 내용
 */
.modal__content {
  padding: 24px;

  @media (max-width: 768px) {
    padding: 20px;
  }
}

.modal__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.modal__text {
  text-align: center;
}

.modal__message {
  font-size: 16px;
  color: #666666;
  line-height: 1.6;
  margin: 0 0 16px 0;
  white-space: pre-wrap;
}

.modal__input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: #ffffff;
  color: #2d1810;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }

  &::placeholder {
    color: #999999;
  }
}

/**
 * 모달 푸터
 */
.modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;

  @media (max-width: 768px) {
    // padding: 0 20px 20px;
    flex-direction: column-reverse;

    .modal__button {
      width: 100%;
    }
  }
}

.modal__button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &--primary {
    background: #4a90e2;
    color: #ffffff;

    &:hover {
      background: #357abd;
    }

    &:focus-visible {
      outline: 2px solid #4a90e2;
      outline-offset: 2px;
    }
  }

  &--secondary {
    background: transparent;
    color: #666666;
    border: 2px solid #e0e0e0;

    &:hover {
      background: #f0f0f0;
      border-color: #cccccc;
    }

    &:focus-visible {
      outline: 2px solid #4a90e2;
      outline-offset: 2px;
    }
  }
}

/**
 * 모달 전환 애니메이션
 */
.modal-enter-active {
  transition: all 0.3s ease;
}

.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from {
  transform: scale(0.9);
  opacity: 0;
}

.modal-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

/**
 * 다크모드 스타일
 */
.dark-mode {
  .modal {
    background: #2d2d2d;
    box-shadow: 0 20px 64px rgba(0, 0, 0, 0.4);
  }

  .modal-backdrop {
    background: rgba(0, 0, 0, 0.7);
  }

  .modal__title {
    color: #ffffff;
  }

  .modal__message {
    color: #cccccc;
  }

  .modal__input {
    background: #404040;
    border-color: #666666;
    color: #ffffff;

    &:focus {
      border-color: #4a90e2;
    }
  }
}

/**
 * 접근성 개선
 */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active {
    transition: none !important;
  }

  .modal-backdrop {
    transition: none !important;
  }
}

/**
 * 고대비 모드 지원
 */
@media (prefers-contrast: high) {
  .modal {
    border: 2px solid #2d1810;
  }

  .modal__button--secondary {
    border-color: #2d1810;
  }
}

/* 579번째 줄에 추가 */

@media (max-width: 480px) {
  .modal-container {
    padding: 10px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .modal {
    &--small,
    &--medium {
      max-width: 100%;
      margin: 0;
    }
  }

  .modal__header {
    padding: 16px 16px 0;
  }

  .modal__content {
    padding: 16px;
  }

  .modal__footer {
    padding: 0 16px 16px;

    .modal__button {
      font-size: 14px;
      padding: 10px 16px;
    }
  }
}

/* 📱 세로 길이 짧을 때 모달 스크롤 대응 */
@media (max-height: 600px) {
  .modal-container {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 20px 10px;
  }

  .modal {
    max-height: 90vh;
    overflow-y: auto;
    margin: 10px auto;
  }

  .modal__content {
    max-height: calc(90vh - 120px);
    overflow-y: auto;
  }
}

@media (max-height: 500px) {
  .modal-container {
    padding: 10px 5px;
  }

  .modal {
    max-height: 95vh;
    overflow-y: scroll;
    margin: 5px auto;

    &--small,
    &--medium {
      max-height: 95vh;
    }
  }

  .modal__header {
    padding: 12px 16px 0;
  }

  .modal__content {
    padding: 12px 16px;
    max-height: calc(95vh - 100px);
    overflow-y: auto;
  }

  .modal__footer {
    padding: 0 16px 12px;
  }
}

/* 가로모드에서 아주 짧을 때 */
@media (max-height: 400px) and (orientation: landscape) {
  .modal-container {
    padding: 5px;
  }

  .modal {
    max-height: 98vh;
    overflow-y: auto;
    margin: 1vh auto;
  }

  .modal__header {
    padding: 8px 12px 0;
  }

  .modal__content {
    padding: 8px 12px;
    max-height: calc(98vh - 80px);
    overflow-y: auto;
  }

  .modal__footer {
    padding: 0 12px 8px;
  }
}
</style>
