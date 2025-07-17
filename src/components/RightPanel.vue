<!--
  RightPanel.vue - 우측 패널 컴포넌트
  퀵 액세스 도구들과 편집 기능
  수직 툴바 스타일
-->
<template>
  <aside class="right-panel">
    <div class="panel-container"></div>
  </aside>
</template>

<script setup></script>

<style lang="scss" scoped>
/**
 * 우측 패널 메인 컨테이너
 * 고정 너비, 수직 툴바 스타일
 */
.right-panel {
  width: 270px; /* 고정 너비 */
  height: calc(100vh - 120px); /* 헤더 높이 제외 */
  background: var(--color-secondary); /* 화이트 그라데이션 */
  display: flex;
  flex-direction: column;
  right: 0;
  top: 120px; /* 헤더 높이만큼 아래에 위치 */
  .panel-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px 0;
  }
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
