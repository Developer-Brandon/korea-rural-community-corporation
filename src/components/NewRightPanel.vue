<!--
  RightPanel.vue - 우측 패널 컴포넌트
  퀵 액세스 도구들과 편집 기능
  수직 툴바 스타일
-->
<template>
  <aside class="right-panel">
    <div class="panel-container">
      <!-- 상단 도구 섹션 -->
      <div class="tools-section">
        <h3 class="section-title">도구</h3>

        <!-- 편집 도구들 -->
        <div class="tool-buttons">
          <!-- 연필 아이콘 (편집) -->
          <button
            class="tool-btn"
            @click="handleToolClick('edit')"
            :class="{ active: activeTool === 'edit' }"
            title="편집"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 20H21"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M16.5 3.5A2.121 2.121 0 1 1 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- 복사 아이콘 -->
          <button
            class="tool-btn"
            @click="handleToolClick('copy')"
            :class="{ active: activeTool === 'copy' }"
            title="복사"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="9"
                y="9"
                width="13"
                height="13"
                stroke="currentColor"
                stroke-width="1.2"
                rx="2"
                ry="2"
              />
              <path
                d="M5 15H4A2 2 0 0 1 2 13V4A2 2 0 0 1 4 2H13A2 2 0 0 1 15 4V5"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- 업로드 아이콘 -->
          <button
            class="tool-btn"
            @click="handleToolClick('upload')"
            :class="{ active: activeTool === 'upload' }"
            title="파일 업로드"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="14,2 14,8 20,8"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="12"
                y1="18"
                x2="12"
                y2="12"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
              />
              <polyline
                points="9,15 12,12 15,15"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- 코드 아이콘 -->
          <button
            class="tool-btn"
            @click="handleToolClick('code')"
            :class="{ active: activeTool === 'code' }"
            title="코드 어시스트"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 6L6 12L10 18"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M14 6L18 12L14 18"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 3L12 5M11 4L13 4"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
              />
              <path
                d="M19 16L17 16M18 15L18 17"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
              />
              <path
                d="M6 19L6 21M5 20L7 20"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
              />
              <circle cx="12" cy="10" r="0.5" fill="currentColor" />
              <circle cx="12" cy="12" r="0.5" fill="currentColor" />
              <circle cx="12" cy="14" r="0.5" fill="currentColor" />
            </svg>
          </button>

          <!-- 템플릿 아이콘 -->
          <button
            class="tool-btn"
            @click="handleToolClick('template')"
            :class="{ active: activeTool === 'template' }"
            title="템플릿"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="2"
                width="18"
                height="20"
                stroke="currentColor"
                stroke-width="1.2"
                fill="none"
                rx="2"
                stroke-linejoin="round"
              />
              <rect
                x="5"
                y="4"
                width="14"
                height="4"
                stroke="currentColor"
                stroke-width="0.8"
                fill="none"
                rx="1"
              />
              <rect
                x="5"
                y="10"
                width="6"
                height="4"
                stroke="currentColor"
                stroke-width="0.8"
                fill="none"
                rx="0.5"
              />
              <rect
                x="13"
                y="10"
                width="6"
                height="4"
                stroke="currentColor"
                stroke-width="0.8"
                fill="none"
                rx="0.5"
              />
              <rect
                x="5"
                y="16"
                width="14"
                height="3"
                stroke="currentColor"
                stroke-width="0.8"
                fill="none"
                rx="0.5"
              />
              <path
                d="M1 4L1 1L4 1"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M23 4L23 1L20 1"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M1 20L1 23L4 23"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M23 20L23 23L20 23"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- AI 에이전트 아이콘 -->
          <button
            class="tool-btn"
            @click="handleToolClick('ai-agent')"
            :class="{ active: activeTool === 'ai-agent' }"
            title="AI 에이전트"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="7"
                y="6"
                width="10"
                height="8"
                stroke="currentColor"
                stroke-width="1.2"
                fill="none"
                rx="2"
                stroke-linejoin="round"
              />
              <line
                x1="12"
                y1="6"
                x2="12"
                y2="3"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
              />
              <circle cx="12" cy="3" r="1" stroke="currentColor" stroke-width="0.8" fill="none" />
              <circle cx="10" cy="9" r="1" fill="currentColor" />
              <circle cx="14" cy="9" r="1" fill="currentColor" />
              <path
                d="M10 12L14 12"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
              />
              <rect
                x="8"
                y="14"
                width="8"
                height="6"
                stroke="currentColor"
                stroke-width="1.2"
                fill="none"
                rx="1"
                stroke-linejoin="round"
              />
              <line
                x1="8"
                y1="16"
                x2="5"
                y2="16"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
              />
              <line
                x1="16"
                y1="16"
                x2="19"
                y2="16"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
              />
              <line
                x1="10"
                y1="20"
                x2="10"
                y2="22"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
              />
              <line
                x1="14"
                y1="20"
                x2="14"
                y2="22"
                stroke="currentColor"
                stroke-width="0.8"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 중간 구분선 -->
      <div class="divider"></div>

      <!-- 퀵 액션 섹션 -->
      <div class="quick-actions-section">
        <h3 class="section-title">퀵 액션</h3>

        <div class="quick-actions">
          <!-- 새 채팅 -->
          <button
            class="quick-action-btn"
            @click="handleQuickAction('new-chat')"
            title="새 채팅 시작"
          >
            <span class="action-icon">💬</span>
            <span class="action-text">새 채팅</span>
          </button>

          <!-- 파일 분석 -->
          <button
            class="quick-action-btn"
            @click="handleQuickAction('analyze-file')"
            title="파일 분석"
          >
            <span class="action-icon">📊</span>
            <span class="action-text">파일 분석</span>
          </button>

          <!-- 스크린샷 -->
          <button
            class="quick-action-btn"
            @click="handleQuickAction('screenshot')"
            title="스크린샷"
          >
            <span class="action-icon">📷</span>
            <span class="action-text">스크린샷</span>
          </button>
        </div>
      </div>

      <!-- 하단 설정 -->
      <div class="settings-section">
        <!-- 테마 토글 -->
        <button class="settings-btn" @click="toggleTheme" title="테마 변경">
          <span v-if="isDarkMode">🌙</span>
          <span v-else>☀️</span>
        </button>

        <!-- 설정 -->
        <button class="settings-btn" @click="openSettings" title="설정">⚙️</button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

// 반응형 데이터
const activeTool = ref('edit') // 현재 활성화된 도구
const isDarkMode = ref(false) // 다크모드 상태

// 이벤트 정의
const emit = defineEmits(['tool-selected', 'quick-action', 'theme-changed', 'settings-opened'])

/**
 * 도구 클릭 핸들러
 * @param {string} toolType - 클릭된 도구 타입
 */
const handleToolClick = (toolType) => {
  activeTool.value = toolType
  console.log(`${toolType} 도구 선택됨`)

  switch (toolType) {
    case 'edit':
      // 편집 모드 활성화
      break
    case 'copy':
      // 복사 기능 활성화
      break
    case 'upload':
      // 파일 업로드 기능
      break
    case 'code':
      // 코드 어시스트 기능
      break
    case 'template':
      // 템플릿 기능
      break
    case 'ai-agent':
      // AI 에이전트 기능
      break
  }

  emit('tool-selected', toolType)
}

/**
 * 퀵 액션 핸들러
 * @param {string} actionType - 액션 타입
 */
const handleQuickAction = (actionType) => {
  console.log(`${actionType} 퀵 액션 실행`)

  switch (actionType) {
    case 'new-chat':
      // 새 채팅 시작
      break
    case 'analyze-file':
      // 파일 분석 시작
      break
    case 'screenshot':
      // 스크린샷 기능
      break
  }

  emit('quick-action', actionType)
}

/**
 * 테마 토글 함수
 */
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  console.log(`테마 변경: ${isDarkMode.value ? '다크' : '라이트'}`)

  emit('theme-changed', isDarkMode.value)
}

/**
 * 설정 열기 함수
 */
const openSettings = () => {
  console.log('설정 페이지 열기')
  emit('settings-opened')
}
</script>

<style lang="scss" scoped>
/**
 * 우측 패널 메인 컨테이너
 * 고정 너비, 수직 툴바 스타일
 */
.right-panel {
  width: 80px; /* 고정 너비 */
  height: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #f8f8f8 100%); /* 화이트 그라데이션 */
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;

  /* 그림자 효과 */
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
}

.panel-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

/**
 * 섹션 제목
 */
.section-title {
  font-size: 10px;
  font-weight: 600;
  color: #666666;
  text-align: center;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/**
 * 도구 섹션
 */
.tools-section {
  padding: 0 12px;
}

.tool-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/**
 * 도구 버튼 스타일
 */
.tool-btn {
  width: 56px;
  height: 56px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 12px;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  /* 호버 효과 */
  &:hover {
    background: #f0f0f0;
    color: #333333;
    transform: scale(1.05);
  }

  /* 활성화 상태 */
  &.active {
    background: #e3f2fd; /* 라이트 블루 */
    border-color: #4a90e2;
    color: #4a90e2;

    &::after {
      content: '';
      position: absolute;
      right: -14px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background: #4a90e2;
      border-radius: 2px;
    }
  }
}

/**
 * 구분선
 */
.divider {
  height: 1px;
  background: #e0e0e0;
  margin: 24px 12px;
}

/**
 * 퀵 액션 섹션
 */
.quick-actions-section {
  padding: 0 12px;
  margin-bottom: auto; /* 하단으로 밀어내기 */
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/**
 * 퀵 액션 버튼
 */
.quick-action-btn {
  width: 56px;
  height: 48px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;

  &:hover {
    background: #f5f5f5;
    border-color: #cccccc;
    transform: translateY(-2px);
  }
}

.action-icon {
  font-size: 16px;
  line-height: 1;
}

.action-text {
  font-size: 8px;
  color: #666666;
  font-weight: 500;
  text-align: center;
}

/**
 * 하단 설정 섹션
 */
.settings-section {
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto; /* 하단 고정 */
}

/**
 * 설정 버튼
 */
.settings-btn {
  width: 56px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f0f0f0;
    transform: scale(1.1);
  }
}

/**
 * 반응형 디자인
 */
@media (max-width: 1024px) {
  .right-panel {
    width: 72px;
  }

  .tool-btn,
  .quick-action-btn {
    width: 48px;
  }

  .tool-btn {
    height: 48px;
  }

  .quick-action-btn {
    height: 40px;
  }

  .settings-btn {
    width: 48px;
    height: 36px;
  }
}

@media (max-width: 768px) {
  .right-panel {
    width: 64px;
  }

  .panel-container {
    padding: 16px 0;
  }

  .tool-btn,
  .quick-action-btn,
  .settings-btn {
    width: 40px;
  }

  .tool-btn {
    height: 40px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .quick-action-btn {
    height: 36px;
  }

  .action-icon {
    font-size: 14px;
  }

  .action-text {
    font-size: 7px;
  }

  .settings-btn {
    height: 32px;
    font-size: 16px;
  }
}

/* 모바일에서는 우측 패널 숨김 */
@media (max-width: 480px) {
  .right-panel {
    display: none;
  }
}
</style>
