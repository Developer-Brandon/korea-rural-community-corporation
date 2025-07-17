<!--
  MainPage.vue - 메인 레이아웃 컴포넌트
  1440px 기준 데스크톱 레이아웃
  좌측 사이드바 + 메인 콘텐츠 + 우측 패널 구조
-->
<template>
  <div class="main-layout">
    <!-- 상단 헤더 -->
    <!-- <AppHeader /> -->
    <!-- 메인 콘텐츠 영역 -->
    <div class="content-wrapper">
      <!-- 좌측 사이드바 -->
      <AppSidebar @reset-main-content="handleResetMainContent" />
      <!-- 중앙 메인 콘텐츠 -->
      <MainContent ref="mainContentRef" />
      <!-- 우측 패널 -->
      <!-- <RightPanel /> -->
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import MainContent from './MainContent.vue'

// MainContent 컴포넌트 참조
const mainContentRef = ref(null)

// 🎯 사이드바에서 발생한 이벤트 처리
const handleResetMainContent = (data) => {
  console.log('사이드바에서 리셋 요청:', data)

  // MainContent의 메소드 호출
  if (mainContentRef.value) {
    mainContentRef.value.resetAllValues()
  }
}

// 컴포넌트 마운트 시 초기 설정
onMounted(() => {
  console.log('메인 페이지 로드 완료')
})
</script>

<style lang="scss" scoped>
/**
 * 메인 레이아웃 스타일
 * 1440px 기준 데스크톱 레이아웃
 */
.main-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  background: var(--color-background);
  position: relative;
  overflow: hidden;
}

/**
 * 콘텐츠 래퍼
 * 헤더 아래 메인 영역 전체
 */
.content-wrapper {
  flex: 1;
  display: flex;
  width: 100%;
  // max-width: 1440px; /* 최대 너비 제한 */
  margin: 0 auto; /* 중앙 정렬 */

  /* 좌측부터 사이드바 -> 메인 -> 우측 패널 순서 */
  gap: 0; /* 컴포넌트간 간격 없음 */

  @media (max-width: 1024px) {
    max-width: 100%;
    // justify-content: flex-end; /* 추가 */
    align-items: stretch; /* 추가 */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

// .content-wrapper {
//   display: flex;
//   flex-direction: column;
//   flex: 1;
//   height: 100vh;
//   width: 100%;
//   max-width: 100%;
//   position: relative;
//   /* justify-content 속성 제거 또는 flex-start로 변경 */
//   justify-content: flex-start;
//   align-items: stretch; /* center에서 stretch로 변경 */
//   overflow: hidden;
// }

/* 기존 미디어쿼리도 수정 */
// @media (max-width: 1024px) {
//   .content-wrapper {
//     max-width: 100%;
//     justify-content: flex-end; /* 추가 */
//     align-items: stretch; /* 추가 */
//     overflow-y: auto;
//     -webkit-overflow-scrolling: touch;
//   }
// }

// @media (max-width: 768px) {
//   .main-layout {
//     flex-direction: column;
//     overflow-y: auto;
//     -webkit-overflow-scrolling: touch;
//   }

//   .content-wrapper {
//     flex-direction: column;
//     height: calc(100vh - 60px);
//     justify-content: flex-start; /* 추가 */
//     align-items: stretch; /* 추가 */
//     overflow-y: auto;
//     -webkit-overflow-scrolling: touch;
//   }
// }

// @media (max-width: 480px) {
//   .main-layout {
//     height: 100dvh;
//     overflow-y: auto;
//     -webkit-overflow-scrolling: touch;
//   }

//   .content-wrapper {
//     height: 100%;
//     justify-content: flex-start; /* 추가 */
//     align-items: stretch; /* 추가 */
//     overflow-y: auto;
//     -webkit-overflow-scrolling: touch;
//   }
// }

// /* 📱 세로 길이 짧을 때 대응 */
// @media (max-height: 600px) {
//   .main-layout {
//     height: auto;
//     min-height: 100vh;
//     overflow-y: auto;
//     -webkit-overflow-scrolling: touch;
//   }

//   .content-wrapper {
//     height: auto;
//     min-height: calc(100vh - 60px);
//     justify-content: flex-start; /* 추가 */
//     align-items: stretch; /* 추가 */
//     overflow-y: auto;
//     -webkit-overflow-scrolling: touch;
//   }
// }

// @media (max-height: 500px) {
//   .main-layout {
//     height: 100vh;
//     overflow-y: scroll;
//     -webkit-overflow-scrolling: touch;
//   }

//   .content-wrapper {
//     height: auto;
//     flex: 1;
//     justify-content: flex-start; /* 추가 */
//     align-items: stretch; /* 추가 */
//     overflow-y: auto;
//     -webkit-overflow-scrolling: touch;
//   }
// }

// /* 가로모드에서 아주 짧을 때 */
// @media (max-height: 400px) and (orientation: landscape) {
//   .main-layout {
//     height: 100vh;
//     overflow-y: auto;
//     -webkit-overflow-scrolling: touch;
//   }

//   .content-wrapper {
//     height: auto;
//     justify-content: flex-start; /* 추가 */
//     align-items: stretch; /* 추가 */
//     overflow-y: visible;
//   }
// }
</style>
