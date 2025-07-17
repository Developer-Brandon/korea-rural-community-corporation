<template>
  <div class="sidebar-layout">
    <!-- 제일 바깥쪽 사이드바 - 메인 네비게이션 -->
    <aside class="main-sidebar">
      <!-- 네비게이션 섹션 -->
      <div class="nav-section">
        <!-- 로고 -->
        <div class="logo-container">
          <div class="logo" @click="clickMainLogo">
            <img
              src="@/assets/icon/favicon.svg"
              alt="로고"
              class="logo-icon"
              width="50"
              height="50"
            />
          </div>
        </div>

        <!-- 네비게이션 아이템들 -->
        <div class="nav-items">
          <!-- 채팅 -->
          <div class="nav-item" @click="toggleChatSidebar">
            <div class="nav-icon" :class="{ active: isChatSidebarOpen }">
              <img src="@/assets/icon/krcc-chat-icon.svg" alt="아이콘" width="50" height="50" />
            </div>
            <span class="nav-label" :class="{ active: isChatSidebarOpen }">채팅</span>
          </div>

          <!-- 위젯 -->
          <div class="nav-item" @click="toggleWidgetSidebar">
            <div class="nav-icon" :class="{ active: isWidgetSidebarOpen }">
              <img src="@/assets/icon/krcc-widget-icon.svg" alt="아이콘" width="50" height="50" />
            </div>
            <span class="nav-label" :class="{ active: isWidgetSidebarOpen }">위젯</span>
          </div>

          <!-- 설정 -->
          <div class="nav-item" @click="toggleSettingSidebar">
            <div class="nav-icon" :class="{ active: isSettingSidebarOpen }">
              <img src="@/assets/icon/krcc-settings-icon.svg" alt="아이콘" width="50" height="50" />
            </div>
            <span class="nav-label" :class="{ active: isSettingSidebarOpen }">설정</span>
          </div>
        </div>
      </div>

      <!-- 프로필 -->
      <div class="profile-container">
        <img src="@/assets/kakaotalk-image-icon.png" alt="프로필" class="profile-image" />
      </div>
    </aside>

    <!-- 첫번째 안쪽 사이드바 - 채팅 목록 -->
    <div class="chat-sidebar" :class="{ 'chat-sidebar-closed': !isChatSidebarOpen }">
      <div class="chat-content">
        <!-- 사용자 헤더 -->
        <div class="user-header">
          <div class="user-avatar">
            <!-- <div class="avatar-placeholder"></div> -->
            <img src="@/assets/kakaotalk-image-icon.png" alt="프로필" class="profile-image-inner" />
          </div>
          <h2 class="user-name">{{ ownerNm }} 님</h2>
        </div>

        <!-- 채팅 액션 버튼들 -->
        <div class="chat-actions">
          <!-- 새로운 채팅 버튼 -->
          <button class="action-btn new-chat-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <g clip-path="url(#clip0_153_7968)">
                <path
                  d="M8.21123 11.9711C8.05195 12.0069 7.90848 11.8845 7.90601 11.7321L7.91361 11.6665L8.64212 8.78079C8.66199 8.70208 8.70282 8.63034 8.7602 8.57293L15.3886 1.9445C15.8768 1.45645 16.6683 1.45638 17.1564 1.9445L18.0106 2.79869C18.4987 3.28681 18.4986 4.07829 18.0106 4.56646L11.3939 11.1832C11.3487 11.2283 11.2944 11.2629 11.2351 11.2854L11.175 11.304L8.21123 11.9711Z"
                  stroke="#6B7280"
                  stroke-width="1.5"
                />
                <path d="M16.4084 7.22829L12.7257 3.54549" stroke="#6B7280" stroke-width="1.5" />
                <path
                  d="M10 2.75H5.75025C4.09339 2.75 2.75024 4.09315 2.75024 5.75V14.25C2.75024 15.9069 4.09339 17.25 5.75024 17.25H14.2502C15.9071 17.25 17.2502 15.9069 17.2502 14.25V9.51408"
                  stroke="#6B7280"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_153_7968">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span>새로운 채팅</span>
          </button>

          <!-- 챗빌더 버튼 -->
          <button class="action-btn chat-builder-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <mask id="path-1-inside-1_153_7976" fill="white">
                <path
                  d="M14 2C16.209 2 17.9997 3.79108 18 6V11.7998C18 14.0089 16.2091 15.7998 14 15.7998H7.27441L2.94824 18.8867C2.55117 19.1698 2.00019 18.8861 2 18.3984V6C2.00026 3.79108 3.79102 2 6 2H14Z"
                />
              </mask>
              <path
                d="M18 6H19.5V5.99982L18 6ZM7.27441 15.7998V14.2998C6.96203 14.2998 6.65744 14.3973 6.40316 14.5788L7.27441 15.7998ZM2.94824 18.8867L3.81893 20.1082L3.8195 20.1077L2.94824 18.8867ZM2 18.3984H0.5L0.5 18.399L2 18.3984ZM2 6L0.5 5.99982V6H2ZM14 2V3.5C15.3804 3.5 16.4998 4.61937 16.5 6.00018L18 6L19.5 5.99982C19.4996 2.96279 17.0376 0.5 14 0.5V2ZM18 6H16.5V11.7998H18H19.5V6H18ZM18 11.7998H16.5C16.5 13.1805 15.3807 14.2998 14 14.2998V15.7998V17.2998C17.0376 17.2998 19.5 14.8374 19.5 11.7998H18ZM14 15.7998V14.2998H7.27441V15.7998V17.2998H14V15.7998ZM7.27441 15.7998L6.40316 14.5788L2.07698 17.6657L2.94824 18.8867L3.8195 20.1077L8.14567 17.0208L7.27441 15.7998ZM2.94824 18.8867L2.07755 17.6653C2.67303 17.2408 3.49972 17.6661 3.5 18.3979L2 18.3984L0.5 18.399C0.500652 20.106 2.42931 21.0987 3.81893 20.1082L2.94824 18.8867ZM2 18.3984H3.5V6H2H0.5V18.3984H2ZM2 6L3.5 6.00018C3.50016 4.61937 4.61962 3.5 6 3.5V2V0.5C2.96242 0.5 0.500358 2.96279 0.5 5.99982L2 6ZM6 2V3.5H14V2V0.5H6V2Z"
                fill="#6B7280"
                mask="url(#path-1-inside-1_153_7976)"
              />
              <rect x="6.2002" y="7" width="8" height="1.5" rx="0.75" fill="#6B7280" />
              <rect x="6.2002" y="10" width="5" height="1.5" rx="0.75" fill="#6B7280" />
            </svg>
            <span>챗 빌더</span>
          </button>

          <!-- 채팅 목록 검색 컨테이너 -->
          <div class="search-container">
            <div class="icon-wrapper">
              <div class="icon-inner">
                <div class="icon-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M16.9697 18.0303C17.2626 18.3232 17.7374 18.3232 18.0303 18.0303C18.3232 17.7374 18.3232 17.2626 18.0303 16.9697L16.9697 18.0303ZM17.5 17.5L18.0303 16.9697L14.0303 12.9697L13.5 13.5L12.9697 14.0303L16.9697 18.0303L17.5 17.5Z"
                      fill="#6B7280"
                    />
                    <circle cx="9" cy="9" r="6.25" stroke="#6B7280" stroke-width="1.5" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="search-text">채팅을 검색해보세요.</div>
          </div>
        </div>

        <!-- 채팅 목록 -->
        <div class="chat-sections">
          <!-- 오늘 섹션 -->
          <div class="chat-section">
            <div class="section-header">
              <span class="section-title">오늘</span>
              <div class="chevron-icon"></div>
            </div>

            <div class="chat-list">
              <!-- 활성 채팅 -->
              <div class="chat-item active-chat">
                <span>테스트테스트테스트</span>
                <div class="chat-indicator"></div>
              </div>

              <!-- 일반 채팅들 -->
              <button class="chat-item">
                <span>테스트테스트테스트</span>
              </button>

              <button class="chat-item">
                <span>테스트테스트테스트</span>
              </button>
            </div>
          </div>

          <!-- 지난 7일 섹션 -->
          <div class="chat-section">
            <div class="section-header">
              <span class="section-title">지난 7일</span>
              <div class="chevron-icon"></div>
            </div>
          </div>

          <!-- 지난 30일 섹션 -->
          <div class="chat-section">
            <div class="section-header">
              <span class="section-title">지난 30일</span>
              <div class="chevron-icon"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 영역 -->
      <div class="bottom-area">
        <img src="@/assets/gen-ai-banner.png" alt="배너 이미지" class="banner-image" />
      </div>
    </div>
    <!-- 두번째 안쪽 사이드바 - 위젯 목록 -->
    <!-- 세번째 안쪽 사이드바 - 설정 목록 -->
  </div>
</template>

<script setup>
// 🚀 부모에게 이벤트 전달
// const emit = defineEmits(['reset-main-content'])

import { ref } from 'vue'
// import { useRouter } from 'vue-router'

// const router = useRouter()
const ownerNm = ref('이호철')

// 필요한 데이터나 메서드들을 여기에 추가
const isChatSidebarOpen = ref(false)
const isWidgetSidebarOpen = ref(false)
const isSettingSidebarOpen = ref(false)

// 채팅 사이드바 토글 함수
const toggleChatSidebar = () => {
  isChatSidebarOpen.value = !isChatSidebarOpen.value
  isWidgetSidebarOpen.value = false
  isSettingSidebarOpen.value = false
}

const toggleWidgetSidebar = () => {
  isWidgetSidebarOpen.value = !isWidgetSidebarOpen.value
  isChatSidebarOpen.value = false
  isSettingSidebarOpen.value = false
}

const toggleSettingSidebar = () => {
  isSettingSidebarOpen.value = !isSettingSidebarOpen.value
  isChatSidebarOpen.value = false
  isWidgetSidebarOpen.value = false
}

const clickMainLogo = () => {
  // 로고 클릭 시 동작 정의
  console.log('로고 클릭됨')
  // 계속 스크립트 에러가 나서, 모든걸 멈추는 새로고침으로 임시 대응
  // emit('reset-main-content', { type: 'main' })
  window.location.reload()
}
</script>

<style scoped>
/* 전체 레이아웃 */
.sidebar-layout {
  display: flex;
  height: 100vh;
  background: #f9fafb;
  @media (max-width: 768px) {
    position: relative;
  }
}

/* 첫 번째 사이드바 - 메인 네비게이션 */
.main-sidebar {
  width: 82px;
  height: 100vh;
  padding: 20px 16px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-shadow: 8px 0px 30px 0px rgba(51, 71, 107, 0.1);
  z-index: 10;
  /* 📱 태블릿 대응 (1024px 이하) */
  @media (max-width: 1024px) {
    width: 70px;
    padding: 16px 12px;
    height: 100vh;
    -webkit-overflow-scrolling: touch;
  }
  /* 📱 모바일 대응 (768px 이하) */
  @media (max-width: 768px) {
    width: 60px;
    padding: 12px 8px;
    height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.nav-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.logo {
  width: 50px;
  height: 50px;
  background: #225bed;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-icon {
  width: 50px;
  height: 50px;
  border: 0.5px solid #b8b8b8;
  border-radius: 8px; /* 모든 모서리 8px 둥글게 */
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 14px;
  @media (max-width: 1024px) {
    gap: 12px;
  }
  @media (max-width: 768px) {
    gap: 8px;
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  @media (max-width: 768px) {
    gap: 3px;
  }
}

.nav-icon {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 10px;
  border: 1px solid white;
  transition: all 0.2s ease;
  &.active {
    background-color: #7698fd;
  }
  /* @media (max-width: 1024px), (max-width: 768px) {
    width: 44px;
    height: 44px;
    &.active {
      background-color: #7698fd;
    }
  } */
}

.nav-icon.active-icon {
  background: #ebf6fe;
  border-color: #e5e7eb;
}

.nav-label {
  text-align: center;
  color: #6b7280;
  font-size: 12px;
  font-family: Pretendard;
  font-weight: 500;
  line-height: 18px;
  &.active {
    color: #7698fd;
  }
}

.nav-label.active-label {
  color: #2563eb;
}

.profile-container {
  padding: 5px;
  background: linear-gradient(0deg, #15803d 0%, #4ade80 100%);
  box-shadow: 0px 4px 6px rgba(255, 122, 8, 0.14);
  border-radius: 1000px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-container:hover {
  transform: scale(1.05);
  box-shadow: 0px 6px 12px rgba(255, 122, 8, 0.2);
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.profile-image-inner {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

/* 두 번째 사이드바 - 채팅 목록 */
.chat-sidebar {
  width: 272px;
  margin-bottom: 15px; /* 추후 배너 여기에서 만지기  */
  background: white;
  box-shadow: 8px 0px 24px rgba(50, 70, 107, 0.04);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  @media (max-width: 1024px), (max-width: 768px) {
    width: 200px;
    height: 100vh;
    -webkit-overflow-scrolling: touch;
  }
}

.chat-sidebar-closed {
  width: 0;
  box-shadow: none;
}

.chat-content {
  flex: 1;
  padding: 16px;
  padding-top: 26px;
  opacity: 1;
  transform: translateX(0);
  transition:
    opacity 0.2s ease,
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-sidebar-closed .chat-content {
  opacity: 0;
  transform: translateX(-20px);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  @media (max-width: 1024px), (max-width: 768px) {
    margin-bottom: 18px;
  }
}

.user-avatar {
  padding: 3px;
  background: linear-gradient(0deg, #15803d 0%, #4ade80 100%);
  box-shadow: 0px 4px 6px rgba(21, 128, 61, 0.14);
  border-radius: 1000px;
  @media (max-width: 1024px), (max-width: 768px) {
    padding: 1px;
  }
}

.avatar-placeholder {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  @media (max-width: 1024px), (max-width: 768px) {
    width: 20px;
    height: 20px;
  }
}

.user-name {
  color: #1f2937;
  font-size: 16px;
  font-family: Pretendard;
  font-weight: 600;
  line-height: 24px;
  margin: 0;
  @media (max-width: 1024px), (max-width: 768px) {
    font-size: 12px;
  }
}

.chat-actions {
  margin-bottom: 100px;
  height: 80px;
  @media (max-width: 1024px), (max-width: 768px) {
    margin-bottom: 18px;
  }
}

/* 채팅 */
/* 채팅 검색 컴포넌트 SCSS */
/* 채팅 */
/* 채팅 검색 컴포넌트 SCSS */
.search-container {
  width: 228px;
  padding: 10px 8px 10px 8px;
  margin-top: 35px;
  background: white;
  border-radius: 10px;
  outline: 1px #e5e7eb solid;
  outline-offset: -1px;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  display: inline-flex;
  @media (max-width: 1024px), (max-width: 768px) {
    display: none;
  }

  .icon-wrapper {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;

    .icon-inner {
      width: 20px;
      height: 20px;
      left: 2px;
      top: 2px;
      position: absolute;
      overflow: hidden;

      .icon-container {
        width: 24px;
        height: 24px;
        position: absolute;
        overflow: hidden;

        .search-handle {
          width: 4px;
          height: 4px;
          left: 15.5px;
          top: 15.5px;
          position: absolute;
          outline: 1.5px #6b7280 solid;
          outline-offset: -0.75px;
        }

        .search-circle {
          width: 14px;
          height: 14px;
          left: 4px;
          top: 4px;
          position: absolute;
          border-radius: 9999px;
          border: 1.5px #6b7280 solid;
        }
      }
    }
  }

  .search-text {
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
    color: #6b7280;
    font-size: 14px;
    font-family:
      Pretendard,
      -apple-system,
      BlinkMacSystemFont,
      system-ui,
      sans-serif;
    font-weight: 500;
    line-height: 21px;
    word-wrap: break-word;
  }
}

.chat-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 8px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-family: Pretendard;
  font-weight: 600;
  font-size: 15px;
  color: #1f2937;
  text-align: left;
}

.action-btn:hover {
  background: #f9fafb;
}

.action-icon {
  width: 24px;
  height: 24px;
  position: relative;
}

.new-chat-icon::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14.5px;
  height: 14.5px;
  border: 1.5px solid #6b7280;
  border-radius: 3px;
}

.new-chat-icon::after {
  content: '';
  position: absolute;
  top: 8px;
  right: 2px;
  width: 5.21px;
  height: 15.94px;
  border: 1.5px solid #6b7280;
  transform: rotate(-135deg);
  transform-origin: top left;
}

.search-icon::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 14px;
  height: 14px;
  border: 1.5px solid #6b7280;
  border-radius: 50%;
}

.search-icon::after {
  content: '';
  position: absolute;
  top: 15.5px;
  right: 4px;
  width: 4px;
  height: 4px;
  border: 1.5px solid #6b7280;
}

.builder-icon::before {
  content: '';
  position: absolute;
  top: 7px;
  left: 6.2px;
  width: 8px;
  height: 1.5px;
  background: #6b7280;
  border-radius: 59.4px;
}

.builder-icon::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 6.2px;
  width: 5px;
  height: 1.5px;
  background: #6b7280;
  border-radius: 59.4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 8px;
}

.section-title {
  color: #9ca3af;
  font-size: 13px;
  font-family: Pretendard;
  font-weight: 600;
  line-height: 19.5px;
}

.chevron-icon {
  width: 20px;
  height: 20px;
  position: relative;
}

.chevron-icon::before {
  content: '';
  position: absolute;
  top: 7.5px;
  left: 5px;
  width: 10px;
  height: 5px;
  border: 1.5px solid #9ca3af;
  border-top: none;
  border-right: none;
  transform: rotate(-45deg);
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-item {
  width: 100%;
  padding: 16px 14px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-family: Pretendard;
  font-weight: 500;
  font-size: 15px;
  color: #374151;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 1024px), (max-width: 768px) {
    padding: 12px 8px;
    font-size: 12px;
  }
}

.chat-item:hover {
  background: #f9fafb;
}

.active-chat {
  background: linear-gradient(270deg, rgba(0, 174, 255, 0.08) 0%, rgba(29, 78, 216, 0.08) 100%);
  color: #2563eb;
  font-weight: 600;
}

.chat-indicator {
  width: 16px;
  height: 16px;
  position: relative;
}

.chat-indicator::before {
  content: '';
  position: absolute;
  top: 7.33px;
  left: 2.67px;
  width: 10.67px;
  height: 1.33px;
  border: 1.33px solid #2563eb;
}

.bottom-area {
  width: 228px;
  height: 228px;
  margin: 0 auto;
  background: #eff1f5;
  border-radius: 10px;
  opacity: 1;
  transform: translateX(0);
  transition:
    opacity 0.2s ease,
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  @media (max-width: 1024px), (max-width: 768px) {
    display: none !important;
  }
}

.chat-sidebar-closed .bottom-area {
  opacity: 0;
  transform: translateX(-20px);
}

/* 메인 콘텐츠 영역 */
.main-content {
  flex: 1;
  background: white;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #6b7280;
}

.empty-desc {
  font-size: 0.875rem;
  color: #9ca3af;
}
</style>
