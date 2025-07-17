<!--
  AppHeader.vue - 상단 헤더 컴포넌트
  로고 + 네비게이션 메뉴 구조
  1440px 기준 고정 헤더
-->
<template>
  <header class="app-header">
    <div class="header-container">
      <!-- 좌측 로고 영역 -->
      <div class="logo-section">
        <div class="logo">
          <img
            src="@/assets/korea-investment-logo-icon.png"
            alt="TrueFriend Logo"
            class="logo-image"
          />
        </div>
      </div>

      <!-- 우측 네비게이션 메뉴 -->
      <nav class="navigation">
        <ul class="nav-list">
          <li class="nav-item">
            <a href="#" class="nav-link" @click="handleNavClick('ai-agent')">AI에이전트</a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" @click="handleNavClick('chat-builder')">Chat빌더</a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" @click="handleNavClick('template')">템플릿</a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link nav-link--login" @click="handleNavClick('login')">
              로그인
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

// 현재 활성화된 네비게이션 아이템
const activeNav = ref('')

/**
 * 네비게이션 클릭 핸들러
 * @param {string} navItem - 클릭된 네비게이션 아이템
 */
const handleNavClick = (navItem) => {
  activeNav.value = navItem
  console.log(`${navItem} 메뉴 클릭됨`)

  // 라우터 네비게이션 또는 액션 처리
  switch (navItem) {
    case 'ai-agent':
      // AI에이전트 페이지로 이동
      break
    case 'chat-builder':
      // Chat빌더 페이지로 이동
      break
    case 'template':
      // 템플릿 페이지로 이동
      break
    case 'login':
      // 로그인 모달 또는 페이지로 이동
      break
  }
}
</script>

<style lang="scss" scoped>
/**
 * 헤더 메인 컨테이너
 * 상단 고정, 브라운 계열 배경 -> 기본 흰색으로 변경
 */
.app-header {
  width: 100%;
  height: 120px; /* 헤더 고정 높이 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #f5f1e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/**
 * 헤더 내부 컨테이너
 * 1440px 기준 중앙 정렬
 */
.header-container {
  max-width: 1440px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px; /* 좌우 여백 */
}

/**
 * 로고 섹션
 * truefriend 한국투자 증권
 */
.logo-section {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-weight: 600;

  .logo-truefriend {
    color: #ff6b35; /* 오렌지 컬러 */
    font-size: 24px;
    font-weight: 700;
  }

  .logo-friend {
    color: #ffffff;
    font-size: 24px;
    font-weight: 700;
    margin-right: 12px;
  }

  .logo-korea {
    color: #ffffff;
    font-size: 20px;
    font-weight: 600;
  }

  .logo-securities {
    color: #ffffff;
    font-size: 20px;
    font-weight: 600;
  }
}

/**
 * 네비게이션 메뉴
 * 우측 정렬, 가로 배치
 */
.navigation {
  display: flex;
  align-items: center;
}

.nav-list {
  display: flex;
  align-items: center;
  gap: 40px; /* 메뉴 아이템 간격 */
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
}

/**
 * 네비게이션 링크 스타일
 */
.nav-link {
  color: #000000;
  text-decoration: none;
  font-size: 20px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;

  /* 호버 효과 */
  // &:hover {
  //   background: rgba(255, 255, 255, 0.1);
  //   transform: translateY(-2px);
  // }

  /* 활성화 상태 */
  &.active {
    background: rgba(255, 255, 255, 0.2);
    font-weight: 600;
  }

  /* 로그인 버튼 특별 스타일 */
  &--login {
    background: #a47764;
    color: #ffffff;
    font-weight: 600;

    &:hover {
      background: #f0f0f0;
      color: var(--color-thirdary);
      transform: translateY(-2px);
    }
  }
}

/**
 * 반응형 디자인
 */
@media (max-width: 1440px) {
  .header-container {
    padding: 0 32px;
  }
}

@media (max-width: 1024px) {
  .header-container {
    padding: 0 24px;
  }

  .nav-list {
    gap: 24px;
  }

  .logo {
    .logo-truefriend,
    .logo-friend {
      font-size: 20px;
    }

    .logo-korea,
    .logo-securities {
      font-size: 16px;
    }
  }
}

@media (max-width: 768px) {
  .app-header {
    height: 60px;
  }

  .header-container {
    padding: 0 16px;
  }

  .nav-list {
    gap: 16px;
  }

  .nav-link {
    font-size: 14px;
    padding: 6px 12px;
  }

  .logo {
    .logo-truefriend,
    .logo-friend {
      font-size: 18px;
    }

    .logo-korea,
    .logo-securities {
      font-size: 14px;
    }
  }
}

@media (max-width: 480px) {
  .logo {
    .logo-korea,
    .logo-securities {
      display: none; /* 모바일에서 숨김 */
    }
  }

  .nav-list {
    gap: 8px;
  }

  .nav-link {
    font-size: 12px;
    padding: 4px 8px;
  }
}
</style>
