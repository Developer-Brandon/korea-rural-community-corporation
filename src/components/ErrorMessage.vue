<template>
  <div v-if="error" class="error-container" :class="{ show: show }">
    <div class="error-content">
      <div class="error-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="error-message">
        <h4>{{ title || '오류 발생' }}</h4>
        <p>{{ error }}</p>
      </div>
      <button @click="retry" class="retry-btn" v-if="showRetry">다시 시도</button>
      <button @click="close" class="close-error-btn">✕</button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'ErrorMessage',
  props: {
    error: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    showRetry: {
      type: Boolean,
      default: true,
    },
    autoHide: {
      type: Number,
      default: 0, // 0이면 자동 숨김 없음
    },
  },
  emits: ['retry', 'close'],
  setup(props, { emit }) {
    const show = ref(false)

    watch(
      () => props.error,
      (newError) => {
        if (newError) {
          show.value = true

          if (props.autoHide > 0) {
            setTimeout(() => {
              close()
            }, props.autoHide)
          }
        } else {
          show.value = false
        }
      },
      { immediate: true },
    )

    const retry = () => {
      emit('retry')
    }

    const close = () => {
      show.value = false
      setTimeout(() => {
        emit('close')
      }, 300)
    }

    return {
      show,
      retry,
      close,
    }
  },
}
</script>

<style scoped>
.error-container {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  z-index: 1100;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s ease;
}

.error-container.show {
  opacity: 1;
  transform: translateX(0);
}

.error-content {
  background: #fff;
  border: 1px solid #fee;
  border-left: 4px solid #f44336;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.15);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
}

.error-icon {
  color: #f44336;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.error-message {
  flex: 1;
}

.error-message h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #d32f2f;
}

.error-message p {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
  line-height: 1.4;
}

.retry-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 8px;
}

.retry-btn:hover {
  background: #d32f2f;
}

.close-error-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-error-btn:hover {
  background: #f5f5f5;
  color: #666;
}

@media (max-width: 480px) {
  .error-container {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
