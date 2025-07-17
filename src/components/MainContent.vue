<template>
  <main class="main-content">
    <!-- 배경 그라데이션 -->
    <div class="background-gradient"></div>

    <!-- 여기에 추가! 중앙 블러 장식 -->
    <div class="blur-decoration" v-show="!hasSearchResults && !hasChatResults"></div>

    <div class="content-container">
      <!-- 검색 결과나 ChatGPT 결과가 없을 때만 보이는 기본 컨텐츠 -->
      <transition name="fade-out" mode="out-in">
        <div
          v-if="!hasSearchResults && !hasChatResults"
          key="default-content"
          class="wrap-welcome-section"
        >
          <!-- 중앙 환영 메시지 -->
          <div class="welcome-section">
            <div class="welcome-orb"></div>
            <h1 class="welcome-title">
              안녕하세요, <span class="owner-name">{{ ownerNm }}</span
              >님
            </h1>
            <p class="welcome-subtitle">
              금융의 판을 바꿀 생성형 AI 전략<br />
              오늘 오후 2시, 대강당에서 만나보세요.
            </p>
          </div>

          <!-- 기능 카드 섹션 -->
          <div class="feature-cards-container">
            <div
              v-for="(card, index) in featureCards"
              :key="index"
              class="feature-card"
              :style="{ animationDelay: `${index * 0.15}s` }"
              @click="handleCardClick(card.type)"
            >
              <div class="card-icon-container">
                <div class="card-icon" :style="{ background: card.iconBg }">
                  <img v-if="card.icon" :src="card.icon" :alt="card.title" />
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ card.title }}</h3>
                <p class="card-description" v-html="card.description"></p>
              </div>
            </div>
          </div>
        </div>

        <!-- ChatGPT 대화 결과 영역 (웹검색과 동일한 구조) -->
        <div v-else-if="hasChatResults" key="chat-content" class="chat-results-container">
          <!-- 채팅 헤더 -->
          <div class="chat-header">
            <div class="chat-info">
              <div class="chat-logo">
                <img src="@/assets/icon/krcc-chat-icon.svg" alt="아이콘" width="50" height="50" />
                <span class="chat-brand">
                  <span style="color: #1d4ed8">{{ shortAIproductNm }}AI</span>
                  {{ isOpenAIWebSearchMode ? 'WEB ' : '' }}에게 무엇이든 물어보세요.
                </span>
              </div>
            </div>
            <button class="clear-results-btn" @click="clearChatResults">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="#6b7280"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- 스크롤 가능한 대화 영역 -->
          <div class="chat-results-scroll">
            <!-- 로딩 상태 -->
            <div v-if="isChatLoading" class="loading-container">
              <div class="loading-spinner"></div>
              <p class="loading-text">
                {{
                  isOpenAIWebSearchMode
                    ? `${shortAIproductNm} AI가 웹을 검색하며 답변을 생성하고 있어요`
                    : `${shortAIproductNm} AI가 답변을 생성하고 있어요`
                }}
              </p>
            </div>

            <!-- 대화 메시지들 -->
            <div v-else-if="chatMessages.length > 0" class="chat-messages">
              <div
                v-for="(msg, index) in chatMessages"
                :key="index"
                class="chat-message-item"
                :class="msg.type"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <!-- 사용자 메시지 - 좌측 정렬 -->
                <div v-if="msg.type === 'user'" class="user-message">
                  <div class="user-avatar">
                    <div class="avatar-circle">
                      <img
                        src="@/assets/kakaotalk-image-icon.png"
                        alt="프로필"
                        class="profile-image"
                      />
                    </div>
                    <div class="avatar-name">{{ ownerNm }}</div>
                  </div>
                  <div class="message-content">
                    <div class="message-bubble user-bubble">
                      {{ msg.content }}
                    </div>
                    <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
                  </div>
                </div>

                <!-- AI 메시지 - 기존과 동일 -->
                <div v-else class="ai-message">
                  <div class="ai-avatar">
                    <div class="avatar-circle">
                      <img
                        src="@/assets/icon/favicon.svg"
                        alt="로고"
                        class="logo-icon"
                        width="50"
                        height="50"
                      />
                    </div>
                    <div class="avatar-name">
                      {{ isOpenAIWebSearchMode ? 'AI WEB' : 'AI' }}
                    </div>
                  </div>
                  <div class="message-content">
                    <div class="message-bubble ai-bubble group relative">
                      <div v-html="formatAIResponse(msg.content)"></div>

                      <!-- ✨ 웹 검색 소스 아이콘들 (OpenAI 웹 검색인 경우만) -->
                      <div
                        v-if="!msg.isTyping && msg.sources && msg.sources.length > 0"
                        class="openai-web-sources"
                      >
                        <div class="sources-horizontal">
                          <div
                            v-for="(source, sourceIndex) in msg.sources"
                            :key="sourceIndex"
                            class="source-icon-card"
                            @click="openSourceLink(source.url)"
                            :title="source.title"
                          >
                            <div class="brand-initial" :style="getBrandStyle(source.url)">
                              {{ getBrandInitial(source.url) }}
                            </div>
                          </div>
                        </div>

                        <div class="sources-vertical">
                          <div
                            v-for="(source, sourceIndex) in msg.sources"
                            :key="sourceIndex"
                            class="source-url-item"
                            @click="openSourceLink(source.url)"
                            :title="source.title"
                          >
                            {{ source.url }}
                          </div>
                        </div>

                        <!-- 🖼️ 이미지 썸네일 4개 (OpenAI 웹 검색 이미지) -->
                        <div
                          v-if="!msg.isTyping && msg.images && msg.images.length > 0"
                          class="openai-web-images"
                        >
                          <div class="images-grid-container">
                            <div
                              v-for="(image, imageIndex) in msg.images.slice(0, 4)"
                              :key="imageIndex"
                              class="image-thumbnail-card"
                              @click="openImageModal(image)"
                              :title="image.alt || image.title || '이미지'"
                            >
                              <img
                                :src="image.url"
                                :alt="image.alt || image.title || '이미지'"
                                class="thumbnail-image"
                                @error="handleImageError"
                                @load="handleImageLoad"
                              />
                              <div class="image-overlay">
                                <div class="image-source">
                                  {{ extractDomainForImage(image.url) }}
                                </div>
                              </div>
                              <div class="image-loading" v-if="!imageLoaded[imageIndex]">
                                <div class="loading-spinner-small"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 타이핑 인디케이터 -->
                      <div v-if="msg.isTyping" class="typing-indicator-container">
                        <!-- 🎨 옵션 1: 웨이브 애니메이션 (추천!) -->
                        <div class="typing-wave-container">
                          <div class="typing-wave">
                            <div class="wave-dot"></div>
                            <div class="wave-dot"></div>
                            <div class="wave-dot"></div>
                            <div class="wave-dot"></div>
                          </div>
                          <div class="typing-text">
                            <span class="typing-text-content">
                              {{
                                isOpenAIWebSearchMode
                                  ? `${shortAIproductNm} AI가 웹을 검색하며 답변을 생각하고 있어요`
                                  : `${shortAIproductNm} AI가 답변을 생각하고 있어요`
                              }}
                            </span>
                            <div class="typing-cursor"></div>
                          </div>
                        </div>
                      </div>
                      <!-- 복사 버튼 + 좋아요/싫어요 버튼 (타이핑 완료된 AI 메시지에만 표시) -->
                      <div
                        v-if="!msg.isTyping && msg.content"
                        style="margin-top: 2px"
                        class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div
                          class="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-1"
                        >
                          <!-- 복사 버튼 -->
                          <button
                            @click="copyToClipboard(msg.content, index)"
                            class="action-button copy-btn"
                            :class="{ 'copy-success': copyStates[index] === 'success' }"
                            :title="copyStates[index] === 'success' ? '복사됨!' : '복사하기'"
                          >
                            <!-- 기본 복사 아이콘 -->
                            <svg
                              v-if="copyStates[index] !== 'success'"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                            <!-- 성공 체크 아이콘 -->
                            <svg
                              v-else
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </button>

                          <!-- 👍 좋아요 버튼 -->
                          <button
                            @click="toggleLike(index)"
                            class="action-button like-btn"
                            :class="{ active: likeStates[index] }"
                            title="좋아요"
                          >
                            <img
                              src="@/assets/icon/thumbs-up-icon.svg"
                              alt="아이콘"
                              width="18"
                              height="18"
                            />
                          </button>

                          <!-- 👎 싫어요 버튼 -->
                          <button
                            @click="toggleDislike(index)"
                            class="action-button dislike-btn"
                            :class="{ active: dislikeStates[index] }"
                            title="싫어요"
                          >
                            <img
                              src="@/assets/icon/thumbs-down-icon.svg"
                              alt="아이콘"
                              width="18"
                              height="18"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="message-time flex items-center justify-between">
                      <span>{{ formatTime(msg.timestamp) }}</span>
                      <!-- 복사 상태 메시지 -->
                      <span
                        v-if="copyStates[index] === 'success'"
                        class="text-green text-xs animate-fade-in"
                      >
                        복사됨!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 검색 결과 영역 (기존 그대로) -->
        <div v-else-if="hasSearchResults" key="search-content" class="search-results-container">
          <!-- 검색 헤더 -->
          <div class="search-header">
            <div class="search-info">
              <div class="search-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="#4285f4" stroke-width="2" />
                  <path
                    d="m21 21-4.35-4.35"
                    stroke="#4285f4"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                <span class="search-brand"
                  ><span style="color: #4285f4">AI Agent Bing Search</span> 웹 검색 결과</span
                >
              </div>
              <div class="search-query">"{{ lastSearchQuery }}"</div>
            </div>
            <button class="clear-results-btn" @click="clearSearchResults">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="#6b7280"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- 검색 통계 -->
          <div v-if="searchResults.length > 0" class="search-stats">
            {{ searchResults.length }}개의 검색 결과 ({{ searchTime }}초)
          </div>

          <!-- 스크롤 가능한 검색 결과 영역 -->
          <div class="search-results-scroll">
            <!-- 로딩 상태 -->
            <div v-if="isLoading" class="loading-container">
              <div class="loading-spinner"></div>
              <p class="loading-text">웹에서 검색하고 있습니다...</p>
            </div>

            <!-- 검색 결과 -->
            <div v-else-if="searchResults.length > 0" class="search-results">
              <div
                v-for="(result, index) in searchResults"
                :key="index"
                class="search-result-item"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="result-header">
                  <div class="result-favicon">
                    <img
                      :src="result.favicon"
                      :alt="result.displayLink"
                      @error="handleFaviconError"
                    />
                  </div>
                  <div class="result-url">{{ result.displayLink }}</div>
                </div>
                <h3 class="result-title">
                  <a :href="result.link" target="_blank" rel="noopener noreferrer">
                    {{ result.title }}
                  </a>
                </h3>
                <p class="result-snippet">{{ result.snippet }}</p>
                <div class="result-actions">
                  <button class="action-btn" @click="copyLink(result.link)">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M6 6L8.5 3.5C9.88 2.12 12.12 2.12 13.5 3.5C14.88 4.88 14.88 7.12 13.5 8.5L11 11"
                        stroke="#6b7280"
                        stroke-width="1.2"
                        stroke-linecap="round"
                      />
                      <path
                        d="M10 10L7.5 12.5C6.12 13.88 3.88 13.88 2.5 12.5C1.12 11.12 1.12 8.88 2.5 7.5L5 5"
                        stroke="#6b7280"
                        stroke-width="1.2"
                        stroke-linecap="round"
                      />
                    </svg>
                    링크 복사
                  </button>
                </div>
              </div>
            </div>

            <!-- 검색 결과가 없을 때 -->
            <div v-else-if="hasSearched && !isLoading" class="no-results">
              <div class="no-results-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="21" cy="21" r="16" stroke="#9ca3af" stroke-width="2" />
                  <path d="m33 33 6 6" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" />
                  <path
                    d="M21 13V21L27 27"
                    stroke="#9ca3af"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <h3 class="no-results-title">검색 결과가 없습니다</h3>
              <p class="no-results-description">다른 키워드로 다시 검색해보세요.</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- 입력창 섹션 (기존 그대로 유지) -->
      <div class="input-section">
        <div class="input-container" :class="{ 'web-search-active': isOpenAIWebSearchMode }">
          <!-- 좌측 영역 -->
          <div class="input-left">
            <div class="placeholder-text">
              <!-- 실제 입력창 -->
              <input
                ref="worksInput"
                v-model="inputText"
                @keydown.enter="handleSubmit"
                type="text"
                class="works-input"
                :placeholder="
                  isOpenAIWebSearchMode
                    ? `🌐 ${shortAIproductNm}AI 웹검색으로 질문하세요...`
                    : `✨ ${shortAIproductNm}AI에게 무엇이든 물어보세요.`
                "
              />
            </div>

            <!-- 하단 컨트롤 영역 (기존 그대로) -->
            <div class="input-controls">
              <!-- 좌측 컨트롤들 -->
              <div class="left-controls">
                <!-- 기능 아이콘들 (기존 그대로) -->
                <div class="function-icons">
                  <!-- 에이전트 호출 아이콘 -->
                  <button
                    class="icon-btn icon-btn-with-text"
                    :class="{ 'icon-btn-with-text__active': isAgentSearchMode }"
                    @click.stop="toggleAgentSearchMode"
                    title="에이전트검색"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="20"
                      viewBox="0 0 21 20"
                      fill="none"
                    >
                      <circle
                        cx="10.5"
                        cy="9.99994"
                        r="3.25"
                        :stroke="isAgentSearchMode ? '#4285f4' : '#6B7280'"
                        stroke-width="1.5"
                      />
                      <path
                        d="M14.9444 17.4999H10.5C6.35786 17.4999 3 14.1421 3 9.99994V9.99994C3 5.8578 6.35786 2.49994 10.5 2.49994V2.49994C14.6421 2.49994 18 5.8578 18 9.99994V9.99994V11.4305C18 12.6041 17.0486 13.5555 15.875 13.5555V13.5555C14.7014 13.5555 13.75 12.6041 13.75 11.4305V9.99994"
                        :stroke="isAgentSearchMode ? '#4285f4' : '#6B7280'"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                    <span :class="isAgentSearchMode ? 'btn-text' : 'btn-text__hidden'">
                      {{ isAgentSearchMode ? '에이전트' : '' }}
                    </span>
                  </button>

                  <!-- 파일 업로드(파일첨부) 선택 아이콘 -->
                  <button
                    class="icon-btn icon-btn-with-text"
                    :class="{ 'icon-btn-with-text__active': isFileUploadMode }"
                    @click.stop="toggleFileUploadMode"
                    title="파일첨부"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M5 12.6667V7C5 4.23858 7.23858 2 10 2V2C12.7614 2 15 4.23858 15 7V14.6667C15 16.5076 13.5076 18 11.6667 18V18C9.82572 18 8.33333 16.5076 8.33333 14.6667V7.22222C8.33333 6.30175 9.07953 5.55556 10 5.55556V5.55556C10.9205 5.55556 11.6667 6.30175 11.6667 7.22222V14.4444"
                        :stroke="isFileUploadMode ? '#4285f4' : '#6B7280'"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                    <span :class="isFileUploadMode ? 'btn-text' : 'btn-text__hidden'">
                      {{ isFileUploadMode ? '파일첨부' : '' }}
                    </span>
                  </button>

                  <!-- 웹 검색 토글 버튼 -->
                  <button
                    class="icon-btn icon-btn-with-text"
                    :class="{ 'icon-btn-with-text__active': isOpenAIWebSearchMode }"
                    @click.stop="toggleWebSearchMode"
                    title="웹검색"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <circle
                        cx="10"
                        cy="10"
                        r="7.25"
                        :stroke="isOpenAIWebSearchMode ? '#4285f4' : '#6B7280'"
                        stroke-width="1.5"
                      />
                      <line
                        x1="3"
                        y1="9.75"
                        x2="17"
                        y2="9.75"
                        :stroke="isOpenAIWebSearchMode ? '#4285f4' : '#6B7280'"
                        stroke-width="1.5"
                      />
                      <path
                        d="M9.7735 3L9.41369 3.55793C6.75234 7.6847 6.89519 13.0215 9.7735 17V17"
                        :stroke="isOpenAIWebSearchMode ? '#4285f4' : '#6B7280'"
                        stroke-width="1.5"
                      />
                      <path
                        d="M10.7265 3L11.0694 3.59398C13.4819 7.77244 13.3494 12.9503 10.7265 17V17"
                        :stroke="isOpenAIWebSearchMode ? '#4285f4' : '#6B7280'"
                        stroke-width="1.5"
                      />
                    </svg>
                    <span :class="isOpenAIWebSearchMode ? 'btn-text' : 'btn-text__hidden'">
                      {{ isOpenAIWebSearchMode ? '웹검색' : '' }}
                    </span>
                  </button>

                  <!-- 코드 분석 아이콘-->
                  <button
                    class="icon-btn icon-btn-with-text"
                    :class="{ 'icon-btn-with-text__active': isCodeAnalysisMode }"
                    @click.stop="toggleCodeAnalysisMode"
                    title="코드분석"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="20"
                      viewBox="0 0 21 20"
                      fill="none"
                    >
                      <rect
                        x="3.25"
                        y="2.74994"
                        width="14.5"
                        height="14.5"
                        rx="3.25"
                        :stroke="isCodeAnalysisMode ? '#4285f4' : '#6B7280'"
                        stroke-width="1.5"
                      />
                      <path
                        d="M9 7.74994L7 9.99994L9 12.2499"
                        :stroke="isCodeAnalysisMode ? '#4285f4' : '#6B7280'"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M12 7.74994L14 9.99994L12 12.2499"
                        :stroke="isCodeAnalysisMode ? '#4285f4' : '#6B7280'"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span :class="isCodeAnalysisMode ? 'btn-text' : 'btn-text__hidden'">
                      {{ isCodeAnalysisMode ? '코드분석' : '' }}
                    </span>
                  </button>

                  <div class="divider"></div>

                  <!-- 템플릿 아이콘 -->
                  <button
                    class="icon-btn icon-btn-with-text"
                    :class="{ 'icon-btn-with-text__active': isTemplateMode }"
                    @click.stop="toggleTemplateMode"
                    title="템플릿"
                  >
                    <img
                      src="@/assets/icon/template-icon.svg"
                      alt="템플릿 아이콘"
                      width="20"
                      height="20"
                      :style="{
                        filter: isTemplateMode
                          ? 'brightness(0) saturate(100%) invert(45%) sepia(99%) saturate(1815%) hue-rotate(207deg) brightness(97%) contrast(94%)'
                          : 'none',
                      }"
                    />
                    <span :class="isTemplateMode ? 'btn-text' : 'btn-text__hidden'">
                      {{ isTemplateMode ? '템플릿' : '' }}
                    </span>
                  </button>

                  <!-- 이미지 생성 아이콘 -->
                  <button
                    class="icon-btn icon-btn-with-text"
                    :class="{ 'icon-btn-with-text__active': isImageMakingMode }"
                    @click.stop="toggleImageMakingMode"
                    title="이미지 생성"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="20"
                      viewBox="0 0 21 20"
                      fill="none"
                    >
                      <rect
                        x="2.25"
                        y="1.75"
                        width="16.5"
                        height="16.5"
                        rx="3.25"
                        :stroke="isImageMakingMode ? '#4285f4' : '#6B7280'"
                        stroke-width="1.5"
                      />
                      <path
                        d="M4.00012 17.4999L12.7928 8.70711C13.1833 8.31658 13.8165 8.31658 14.207 8.7071L18.5 13"
                        :stroke="isImageMakingMode ? '#4285f4' : '#6B7280'"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                      <circle
                        cx="7.5"
                        cy="7"
                        r="1.75"
                        :stroke="isImageMakingMode ? '#4285f4' : '#6B7280'"
                        stroke-width="1.5"
                      />
                    </svg>
                    <span :class="isImageMakingMode ? 'btn-text' : 'btn-text__hidden'">
                      {{ isImageMakingMode ? '이미지생성' : '' }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- 우측 전송 버튼 -->
              <div class="right-controls">
                <!-- 모델선택 버튼 (커스텀 드롭다운) -->
                <div
                  class="model-badge"
                  :class="{ 'model-badge__hidden': isOpenAIWebSearchMode }"
                  @click="toggleModelDropdown"
                >
                  <span class="model-text">{{ selectedModel }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    :class="{ 'rotate-180': isModelDropdownOpen }"
                    class="dropdown-arrow"
                  >
                    <path
                      d="M4 6L7 9L10 6"
                      stroke="#2563EB"
                      stroke-width="1.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  <!-- 커스텀 드롭다운 (위로 펼쳐짐) -->
                  <div v-if="isModelDropdownOpen" class="custom-dropdown" @click.stop>
                    <div
                      v-for="model in modelOptions"
                      :key="model.value"
                      class="dropdown-option"
                      :class="{ selected: selectedModel === model.label }"
                      @click="selectModel(model.label)"
                    >
                      <span class="option-text">{{ model.label }}</span>
                      <svg
                        v-if="selectedModel === model.label"
                        class="check-icon"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M13.5 4.5L6 12L2.5 8.5"
                          stroke="#2563EB"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <button
                  class="send-btn"
                  @click.stop="handleSubmit"
                  :disabled="!inputText.trim() || selectedModel === '모델선택'"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                  >
                    <rect
                      width="32"
                      height="32"
                      rx="8"
                      :fill="isOpenAIWebSearchMode ? '#4285f4' : '#374151'"
                    />
                    <path
                      d="M11 15L16 10L21 15"
                      stroke="white"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M16 10.6667V22.2222"
                      stroke="white"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 텍스트 -->
      <div class="footer-text">
        {{ shortAIproductNm }}AI의 답변에 잘못된 정보가 있을 수 있습니다. 중요한 정보는 확인해
        주세요.
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import firstCardIcon from '@/assets/icon/krcc-main-first-card-icon.svg'
import secondCardIcon from '@/assets/icon/krcc-main-second-card-icon.svg'
import thirdCardIcon from '@/assets/icon/krcc-main-third-card-icon.svg'

// 🛡️ 전역 interval 추적 시스템 (에러 해결용)
const activeIntervals = new Set()
const activeTimeouts = new Set()

// 타이핑 상태 관리
const isTyping = ref(false)
const typingMessageId = ref(null)

// 복사 상태 관리
const copyStates = ref({})

// 반응형 데이터
const inputText = ref('')
const worksInput = ref(null)

// 모든 모드 상태 관리
const isAgentSearchMode = ref(false)
const isFileUploadMode = ref(false)
const isOpenAIWebSearchMode = ref(false)
const isCodeAnalysisMode = ref(false)
const isTemplateMode = ref(false)
const isImageMakingMode = ref(false)

// 모델 선택
const ownerNm = '이호철'
const shortAIproductNm = '농어촌'
const selectedModel = ref('모델선택')
const isModelDropdownOpen = ref(false)
const modelOptions = ref([
  { value: '모델선택', label: '모델선택' },
  { value: 'gpt-4.1', label: 'GPT-4.1' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-o3', label: 'GPT-3.5' },
  { value: 'claude3', label: 'Claude 3 Opus' },
  { value: 'claude3', label: 'Claude 3 Sonnet' },
  { value: 'claude3', label: 'Claude 3 Haiku' },
  { value: 'gemini', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-pro', label: 'Gemini 1.0 Ultra' },
  { value: 'gemini-nano', label: 'Gemini 1.0 Nano' },
])

// 검색 관련 상태
const hasSearchResults = ref(false)
const searchResults = ref([])
const isLoading = ref(false)
const hasSearched = ref(false)
const searchTime = ref(0)
const lastSearchQuery = ref('')

// ChatGPT 관련 상태
const hasChatResults = ref(false)
const chatMessages = ref([])
const isChatLoading = ref(false)
const conversationHistory = ref([])

// 기능 카드 데이터
const featureCards = ref([
  {
    type: 'stock-summary',
    title: '첫번째 카드 제목',
    description: '테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트',
    iconBg: '#E5EFFC',
    icon: firstCardIcon,
  },
  {
    type: 'web-search',
    title: '두번째 카드 제목',
    description: '테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트',
    iconBg: '#E5EFFC',
    icon: secondCardIcon,
  },
  {
    type: 'news-summary',
    title: '세번째 카드 제목',
    description: '테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트테스트',
    iconBg: '#E5EFFC',
    icon: thirdCardIcon,
  },
])

// 이벤트 정의
const emit = defineEmits(['card-clicked', 'icon-clicked', 'message-sent'])

/**
 * 🧹 모든 비동기 작업 안전하게 정리하는 함수
 */
const cleanupAllAsyncOperations = () => {
  console.log('🧹 모든 비동기 작업 정리 시작')

  try {
    // 🛑 모든 interval 정리
    activeIntervals.forEach((interval) => {
      clearInterval(interval)
    })
    activeIntervals.clear()

    // 🛑 모든 timeout 정리
    activeTimeouts.forEach((timeout) => {
      clearTimeout(timeout)
    })
    activeTimeouts.clear()

    // 🛑 타이핑 상태 리셋
    if (isTyping.value) {
      isTyping.value = false
    }
    if (typingMessageId.value !== null) {
      typingMessageId.value = null
    }

    console.log('✅ 모든 비동기 작업 정리 완료')
  } catch (error) {
    console.error('정리 중 오류:', error)
  }
}

/**
 * 컴포넌트 마운트
 */
onMounted(() => {
  console.log('새로운 MainContent 마운트됨')
  debugInitialState()

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.model-badge')) {
      isModelDropdownOpen.value = false
    }
  })
})

/**
 * 🧹 컴포넌트 언마운트 시 완전한 정리
 */
onUnmounted(() => {
  console.log('🧹 컴포넌트 언마운트 - 모든 작업 정리')
  cleanupAllAsyncOperations()
})

/**
 * 모든 모드 토글 함수들
 */
const toggleAgentSearchMode = () => {
  isAgentSearchMode.value = !isAgentSearchMode.value
  isFileUploadMode.value = false
  isOpenAIWebSearchMode.value = false
  isCodeAnalysisMode.value = false
  isTemplateMode.value = false
  isImageMakingMode.value = false
  cleanupAllAsyncOperations()
  console.log('에이전트 검색 모드:', isAgentSearchMode.value ? '활성화' : '비활성화')
}

const toggleFileUploadMode = () => {
  isFileUploadMode.value = !isFileUploadMode.value
  isAgentSearchMode.value = false
  isOpenAIWebSearchMode.value = false
  isCodeAnalysisMode.value = false
  isTemplateMode.value = false
  isImageMakingMode.value = false
  cleanupAllAsyncOperations()
  console.log('파일 업로드 모드:', isFileUploadMode.value ? '활성화' : '비활성화')
}

const toggleWebSearchMode = () => {
  isOpenAIWebSearchMode.value = !isOpenAIWebSearchMode.value
  isAgentSearchMode.value = false
  isFileUploadMode.value = false
  isCodeAnalysisMode.value = false
  isTemplateMode.value = false
  isImageMakingMode.value = false
  cleanupAllAsyncOperations()
  console.log('웹 검색 모드:', isOpenAIWebSearchMode.value ? '활성화' : '비활성화')
}

const toggleCodeAnalysisMode = () => {
  isCodeAnalysisMode.value = !isCodeAnalysisMode.value
  isAgentSearchMode.value = false
  isFileUploadMode.value = false
  isOpenAIWebSearchMode.value = false
  isTemplateMode.value = false
  isImageMakingMode.value = false
  cleanupAllAsyncOperations()
  console.log('코드 분석 모드:', isCodeAnalysisMode.value ? '활성화' : '비활성화')
}

const toggleTemplateMode = () => {
  isTemplateMode.value = !isTemplateMode.value
  isAgentSearchMode.value = false
  isFileUploadMode.value = false
  isOpenAIWebSearchMode.value = false
  isCodeAnalysisMode.value = false
  isImageMakingMode.value = false
  cleanupAllAsyncOperations()
  console.log('템플릿 모드:', isTemplateMode.value ? '활성화' : '비활성화')
}

const toggleImageMakingMode = () => {
  isImageMakingMode.value = !isImageMakingMode.value
  isAgentSearchMode.value = false
  isFileUploadMode.value = false
  isOpenAIWebSearchMode.value = false
  isCodeAnalysisMode.value = false
  isTemplateMode.value = false
  cleanupAllAsyncOperations()
  console.log('이미지 생성 모드:', isImageMakingMode.value ? '활성화' : '비활성화')
}

/**
 * 모델 드롭다운 관련
 */
const toggleModelDropdown = () => {
  isModelDropdownOpen.value = !isModelDropdownOpen.value
}

const selectModel = (modelLabel) => {
  selectedModel.value = modelLabel
  isModelDropdownOpen.value = false
  console.log('선택된 모델:', modelLabel)
}

/**
 * 🔄 변수값 초기화 핸들러
 */
const resetAllValues = () => {
  console.log('🔄 전체 변수 초기화 시작')

  try {
    cleanupAllAsyncOperations()

    isAgentSearchMode.value = false
    isFileUploadMode.value = false
    isCodeAnalysisMode.value = false
    isTemplateMode.value = false
    isImageMakingMode.value = false
    isOpenAIWebSearchMode.value = false
    selectedModel.value = '모델선택'
    hasSearchResults.value = false
    hasChatResults.value = false
    searchResults.value = []
    hasSearched.value = false
    lastSearchQuery.value = ''
    inputText.value = ''
    chatMessages.value = []
    conversationHistory.value = []
    copyStates.value = {}
    isModelDropdownOpen.value = false

    console.log('✅ 전체 변수 초기화 완료')
  } catch (error) {
    console.error('초기화 중 오류:', error)
  }
}

const resetAllValueWhenCardClicked = () => {
  resetAllValues()
  selectedModel.value = modelOptions.value[1].value // 모델 선택 초기화
}

/**
 * ✅ 완전히 수정된 OpenAI 웹 검색 함수
 */
const sendOpenAIWebSearch = async (query) => {
  if (isTyping.value) {
    console.log('이미 타이핑 중이므로 요청 무시')
    return
  }

  isTyping.value = true
  hasChatResults.value = true

  // 사용자 메시지 추가
  const userMessage = {
    type: 'user',
    content: query,
    timestamp: new Date(),
  }
  chatMessages.value.push(userMessage)

  // 빈 AI 메시지 먼저 추가
  const aiMessage = {
    type: 'ai',
    content: '',
    timestamp: new Date(),
    isTyping: true,
    sources: [],
  }
  chatMessages.value.push(aiMessage)
  const aiMessageIndex = chatMessages.value.length - 1
  typingMessageId.value = aiMessageIndex

  // 스크롤 이동
  await nextTick()
  try {
    const scrollElement = document.querySelector('.chat-results-scroll')
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  } catch (error) {
    console.warn('스크롤 이동 실패:', error)
  }

  try {
    console.log('🌐 실제 웹 검색 API 호출 시작...', query)

    const requestBody = {
      query: query,
      conversationHistory: [],
    }

    console.log('📤 서버로 전송하는 데이터:', requestBody)

    const response = await fetch('/api/openai-web-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('📨 서버 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 서버 응답 오류:', response.status, errorText)
      throw new Error(`API 오류 (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    console.log('📋 서버 응답 데이터:', data)

    if (data.success) {
      if (chatMessages.value[aiMessageIndex]) {
        chatMessages.value[aiMessageIndex].isTyping = false

        let finalResponse = data.response || ''

        if (!finalResponse || finalResponse.trim().length === 0) {
          console.warn('⚠️ 빈 응답 감지, 대체 메시지 생성')
          finalResponse = `"${query}"에 대한 검색을 완료했습니다. 더 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다.`
        }

        console.log('📝 최종 표시할 응답:', finalResponse.substring(0, 100) + '...')

        // 실제 검색 소스 처리
        if (data.sources && Array.isArray(data.sources) && data.sources.length > 0) {
          chatMessages.value[aiMessageIndex].sources = data.sources
          console.log('📄 검색 소스 추가됨:', data.sources.length, '개')
        } else {
          console.log('⚠️ 검색 소스가 없습니다.')
          chatMessages.value[aiMessageIndex].sources = []
        }

        // 🖼️ 실제 소스에서 추출한 이미지들 처리
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          chatMessages.value[aiMessageIndex].images = data.images
          console.log('🖼️ 소스 이미지 추가됨:', data.images.length, '개')
        } else {
          console.log('⚠️ 이미지가 없습니다.')
          chatMessages.value[aiMessageIndex].images = []
        }

        // 🎯 수정된 타이핑 애니메이션 호출
        try {
          await typeMessage(finalResponse, aiMessageIndex, {
            baseSpeed: 15,
            adaptiveSpeed: true,
            fallbackOnError: true,
          })
          console.log('✅ 타이핑 애니메이션 완료')
        } catch (typingError) {
          console.error('❌ 타이핑 애니메이션 실패, 직접 표시:', typingError.message)
          if (chatMessages.value[aiMessageIndex]) {
            chatMessages.value[aiMessageIndex].content = finalResponse
          }
        }

        console.log('🎯 독립적인 웹 검색 완료')

        if (data.searchPerformed) {
          console.log('🎉 실제 웹 검색이 성공적으로 수행되었습니다!')
        } else {
          console.log('⚠️ 웹 검색이 수행되지 않았습니다 (폴백 모드)')
        }
      }

      console.log('✅ OpenAI 웹 검색 응답 처리 완료')
    } else {
      throw new Error(data.error || '서버에서 실패 응답을 받았습니다.')
    }
  } catch (error) {
    console.error('❌ OpenAI 웹 검색 API 오류:', error)

    if (chatMessages.value[aiMessageIndex]) {
      chatMessages.value[aiMessageIndex].isTyping = false

      let userFriendlyError = ''

      if (error.message.includes('API 오류 (404)') || error.message.includes('responses')) {
        userFriendlyError =
          '웹 검색 기능이 현재 사용할 수 없습니다. 일반 질문으로 다시 시도해주세요.'
      } else if (error.message.includes('API 오류 (429)')) {
        userFriendlyError = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
      } else if (error.message.includes('API 오류 (401)')) {
        userFriendlyError = 'API 인증에 문제가 있습니다. 관리자에게 문의해주세요.'
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        userFriendlyError = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.'
      } else {
        userFriendlyError = `웹 검색 중 문제가 발생했습니다. 다른 키워드로 다시 시도해보세요.`
      }

      console.log('📝 사용자에게 표시할 에러 메시지:', userFriendlyError)

      try {
        await typeMessage(userFriendlyError, aiMessageIndex, {
          baseSpeed: 20,
          fallbackOnError: true,
        })
      } catch (typingError) {
        console.error('❌ 에러 메시지 타이핑도 실패:', typingError.message)
        if (chatMessages.value[aiMessageIndex]) {
          chatMessages.value[aiMessageIndex].content = userFriendlyError
        }
      }
    }
  } finally {
    try {
      if (isTyping.value) {
        isTyping.value = false
      }
      if (typingMessageId.value === aiMessageIndex) {
        typingMessageId.value = null
      }
      console.log('🔄 웹 검색 프로세스 완료 - 모든 상태 리셋됨')
    } catch (resetError) {
      console.error('❌ 상태 리셋 실패:', resetError)
    }
  }
}

/**
 * 🚀 완전히 수정된 타이핑 애니메이션 함수 (버그 수정)
 */
const typeMessage = async (message, messageIndex, options = {}) => {
  // 🎯 설정 옵션 - let으로 변경하여 재할당 가능하게 함
  let {
    baseSpeed = 15,
    maxSpeed = 5,
    chunkSize = 1,
    maxTimeout = 100000,
    adaptiveSpeed = true,
    fallbackOnError = true,
  } = options

  return new Promise((resolve) => {
    let typeInterval = null
    let timeoutId = null
    let currentIndex = 0
    let isCompleted = false

    // 🔍 입력값 검증
    if (!message || typeof message !== 'string') {
      console.warn('⚠️ Invalid message provided:', message)
      if (fallbackOnError && chatMessages.value?.[messageIndex]) {
        chatMessages.value[messageIndex].content = message || ''
      }
      resolve()
      return
    }

    if (messageIndex === undefined || messageIndex === null || messageIndex < 0) {
      console.warn('⚠️ Invalid messageIndex:', messageIndex)
      resolve()
      return
    }

    if (!chatMessages.value?.[messageIndex]) {
      console.warn('⚠️ Message not found at index:', messageIndex)
      resolve()
      return
    }

    // 🎯 텍스트 길이에 따른 동적 속도 계산
    const textLength = message.length
    let typingSpeed = baseSpeed

    if (adaptiveSpeed) {
      if (textLength > 1000) {
        typingSpeed = maxSpeed
        chunkSize = Math.min(3, chunkSize) // 🎯 수정: let으로 선언했으므로 재할당 가능
      } else if (textLength > 500) {
        typingSpeed = Math.max(baseSpeed * 0.3, maxSpeed)
        chunkSize = Math.min(2, chunkSize)
      } else if (textLength > 200) {
        typingSpeed = baseSpeed * 0.6
      }
    }

    const estimatedTime = (textLength / chunkSize) * typingSpeed
    const safeTimeout = Math.min(estimatedTime * 2 + 10000, maxTimeout)

    console.log(
      `📝 타이핑 시작: ${textLength}자, 속도: ${typingSpeed}ms, 청크: ${chunkSize}, 타임아웃: ${safeTimeout}ms`,
    )

    const chars = Array.from(message)

    // 🛡️ 안전한 정리 함수
    const cleanup = () => {
      if (isCompleted) return
      isCompleted = true

      try {
        if (typeInterval) {
          clearInterval(typeInterval)
          activeIntervals.delete(typeInterval)
          typeInterval = null
        }

        if (timeoutId) {
          clearTimeout(timeoutId)
          activeTimeouts.delete(timeoutId)
          timeoutId = null
        }

        if (isTyping?.value) {
          isTyping.value = false
        }
        if (typingMessageId?.value === messageIndex) {
          typingMessageId.value = null
        }
      } catch (cleanupError) {
        console.warn('🧹 Cleanup 중 에러 (무시됨):', cleanupError)
      }
    }

    const complete = (reason = 'success') => {
      if (isCompleted) return
      cleanup()
      console.log(`✅ 타이핑 완료 (${reason}): ${textLength}자`)
      resolve(message)
    }

    const fallback = (error) => {
      console.warn('⚠️ 타이핑 중 문제 발생, fallback 처리:', error.message)

      try {
        if (fallbackOnError && chatMessages.value?.[messageIndex]) {
          chatMessages.value[messageIndex].content = message
          console.log('🛡️ Fallback: 전체 텍스트 표시 완료')
        }
      } catch (fallbackError) {
        console.error('❌ Fallback 처리 실패:', fallbackError)
      }

      complete('fallback')
    }

    // 🚀 타이핑 핸들러
    const typeHandler = () => {
      try {
        if (!chatMessages.value?.[messageIndex]) {
          fallback(new Error('Message removed during typing'))
          return
        }

        if (currentIndex < chars.length) {
          const endIndex = Math.min(currentIndex + chunkSize, chars.length)
          const currentText = chars.slice(0, endIndex).join('')

          chatMessages.value[messageIndex].content = currentText
          currentIndex = endIndex

          // 부드러운 자동 스크롤
          nextTick(() => {
            try {
              const scrollElement = document.querySelector('.chat-results-scroll')
              if (scrollElement?.scrollTop !== undefined) {
                const scrollFromBottom =
                  scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight

                if (scrollFromBottom <= 150) {
                  scrollElement.scrollTop = scrollElement.scrollHeight
                }
              }
            } catch (scrollError) {
              // 스크롤 에러는 무시
            }
          }).catch(() => {
            // nextTick 에러도 무시
          })
        } else {
          complete('finished')
        }
      } catch (error) {
        fallback(error)
      }
    }

    try {
      chatMessages.value[messageIndex].content = ''

      typeInterval = setInterval(typeHandler, typingSpeed)
      activeIntervals.add(typeInterval)

      timeoutId = setTimeout(() => {
        if (!isCompleted) {
          console.warn(`⏰ 타이핑 타임아웃 (${safeTimeout}ms), fallback 처리`)
          fallback(new Error('Typing timeout'))
        }
      }, safeTimeout)
      activeTimeouts.add(timeoutId)
    } catch (initError) {
      console.error('❌ 타이핑 초기화 실패:', initError)
      fallback(initError)
    }
  })
}

/**
 * 🛡️ 안전한 ChatGPT API 호출 함수
 */
const sendChatGPTMessage = async (message) => {
  if (isTyping.value) {
    console.log('이미 타이핑 중이므로 요청 무시')
    return
  }

  isTyping.value = true
  hasChatResults.value = true

  const userMessage = {
    type: 'user',
    content: message,
    timestamp: new Date(),
  }
  chatMessages.value.push(userMessage)

  const aiMessage = {
    type: 'ai',
    content: '',
    timestamp: new Date(),
    isTyping: true,
  }
  chatMessages.value.push(aiMessage)
  const aiMessageIndex = chatMessages.value.length - 1
  typingMessageId.value = aiMessageIndex

  await nextTick()
  try {
    const scrollElement = document.querySelector('.chat-results-scroll')
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  } catch (error) {
    console.warn('스크롤 이동 실패:', error)
  }

  try {
    console.log('ChatGPT API 호출 시작...')

    const response = await fetch('/api/openai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        conversationHistory: conversationHistory.value,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API 응답 오류:', response.status, errorText)
      throw new Error(`API 오류 (${response.status}): ${errorText}`)
    }

    const data = await response.json()

    if (data.success) {
      if (chatMessages.value[aiMessageIndex]) {
        chatMessages.value[aiMessageIndex].isTyping = false

        try {
          await typeMessage(data.response, aiMessageIndex)
        } catch (typingError) {
          console.error('타이핑 애니메이션 실패:', typingError)
          if (chatMessages.value[aiMessageIndex]) {
            chatMessages.value[aiMessageIndex].content = data.response
          }
        }

        conversationHistory.value.push(
          { role: 'user', content: message },
          { role: 'assistant', content: data.response },
        )

        if (conversationHistory.value.length > 20) {
          conversationHistory.value = conversationHistory.value.slice(-20)
        }
      }

      console.log('ChatGPT 응답 성공')
    } else {
      throw new Error(data.error || '알 수 없는 오류가 발생했습니다.')
    }
  } catch (error) {
    console.error('ChatGPT API 오류:', error)

    if (chatMessages.value[aiMessageIndex]) {
      chatMessages.value[aiMessageIndex].isTyping = false
      const errorText = `죄송합니다. 오류가 발생했습니다: ${error.message}`

      try {
        await typeMessage(errorText, aiMessageIndex)
      } catch (typingError) {
        console.error('오류 메시지 타이핑 실패:', typingError)
        chatMessages.value[aiMessageIndex].content = errorText
      }
    }
  } finally {
    if (isTyping.value) {
      isTyping.value = false
    }
    if (typingMessageId.value === aiMessageIndex) {
      typingMessageId.value = null
    }
  }
}

/**
 * 결과 지우기 함수들
 */
const clearChatResults = () => {
  console.log('채팅 결과 지우기')
  cleanupAllAsyncOperations()
  resetAllValues()
}

const clearSearchResults = () => {
  console.log('검색 결과 지우기')
  resetAllValues()
}

/**
 * 헬퍼 함수들
 */
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatAIResponse = (content) => {
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

const copyLink = async (link) => {
  try {
    await navigator.clipboard.writeText(link)
    console.log('링크가 복사되었습니다:', link)
  } catch (error) {
    console.error('링크 복사 실패:', error)
  }
}

const handleFaviconError = (event) => {
  event.target.src = '/favicon.png' // 기본 파비콘으로 대체
}

/**
 * 🎯 통합된 도메인 추출 함수 (웹 검색 소스 + 이미지 소스 모두 지원)
 */
const extractDomain = (url, options = {}) => {
  // 기본 옵션
  const {
    useKoreanNames = true, // 한글 서비스명 사용 여부
    fallbackText = '이미지', // URL이 없을 때 기본 텍스트
  } = options

  // URL이 없거나 빈 문자열인 경우
  if (!url || typeof url !== 'string') {
    return fallbackText
  }

  try {
    const domain = new URL(url).hostname.replace('www.', '')

    // 잘 알려진 서비스들 매핑 (한글/영문 지원)
    if (useKoreanNames) {
      const koreanDomainMap = {
        'freepik.com': 'Freepik',
        'kr.freepik.com': 'Freepik',
        'source.unsplash.com': 'Unsplash',
        'picsum.photos': 'Picsum',
        'via.placeholder.com': 'Placeholder',
        'naver.com': '네이버',
        'google.com': '구글',
        'wikipedia.org': '위키피디아',
        'yonhap.co.kr': '연합뉴스',
        'mk.co.kr': '매일경제',
        'truefriend.com': '농어촌공사',
        'krx.co.kr': '한국거래소',
        'gov.kr': '정부기관',
        'youtube.com': '유튜브',
        'instagram.com': '인스타그램',
        'twitter.com': '트위터',
        'facebook.com': '페이스북',
      }

      // 도메인 매핑에서 찾기
      for (const [key, value] of Object.entries(koreanDomainMap)) {
        if (domain.includes(key)) {
          return value
        }
      }
    }

    // 매핑에 없으면 원본 도메인 반환
    return domain
  } catch (error) {
    console.warn('도메인 추출 실패:', url, error)

    // URL 파싱 실패 시, URL 자체에서 도메인 추출 시도
    try {
      const match = url.match(/https?:\/\/([^\/\?#]+)/i)
      if (match && match[1]) {
        return match[1].replace('www.', '')
      }
    } catch (secondError) {
      console.warn('2차 도메인 추출 실패:', secondError)
    }

    // 모든 시도 실패 시 fallback 반환
    return fallbackText
  }
}

const openSourceLink = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * 🛡️ 안전한 복사 함수
 */
const copyToClipboard = async (text, messageIndex) => {
  try {
    await navigator.clipboard.writeText(text)

    copyStates.value[messageIndex] = 'success'

    const timeoutId = setTimeout(() => {
      if (copyStates.value[messageIndex] === 'success') {
        copyStates.value[messageIndex] = null
      }
    }, 2000)
    activeTimeouts.add(timeoutId)

    console.log('텍스트가 복사되었습니다!')
  } catch (err) {
    console.error('복사 실패:', err)

    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      textArea.remove()

      copyStates.value[messageIndex] = 'success'
      const timeoutId = setTimeout(() => {
        if (copyStates.value[messageIndex] === 'success') {
          copyStates.value[messageIndex] = null
        }
      }, 2000)
      activeTimeouts.add(timeoutId)
    } catch (fallbackErr) {
      console.error('Fallback 복사도 실패:', fallbackErr)
      copyStates.value[messageIndex] = 'error'
      const timeoutId = setTimeout(() => {
        if (copyStates.value[messageIndex] === 'error') {
          copyStates.value[messageIndex] = null
        }
      }, 2000)
      activeTimeouts.add(timeoutId)
    }
  }
}

/**
 * 메시지 전송 핸들러
 */
const handleSubmit = () => {
  if (!inputText.value.trim()) return

  const message = inputText.value.trim()
  console.log('메시지 전송:', message)

  if (isOpenAIWebSearchMode.value) {
    sendOpenAIWebSearch(message)
  } else {
    sendChatGPTMessage(message)
  }

  inputText.value = ''
}

/**
 * 카드 클릭 핸들러
 */
const handleCardClick = (cardType) => {
  console.log(`${cardType} 카드 클릭됨`)
  resetAllValueWhenCardClicked()

  switch (cardType) {
    case 'stock-summary':
      inputText.value = '넌 누구야?'
      handleSubmit()
      break
    case 'web-search':
      isOpenAIWebSearchMode.value = true
      inputText.value = '한국농어촌공사에 대해 알려줄 수 있어?'
      handleSubmit()
      break
    case 'news-summary':
      inputText.value = '한국농어촌공사의 뉴스에 대해서 정리해줘'
      handleSubmit()
      break
  }

  emit('card-clicked', cardType)
}

// 브랜드 관련 헬퍼 함수들
const getBrandInitial = (url) => {
  const domain = extractDomain(url)

  if (domain.includes('naver')) return 'N'
  if (domain.includes('google')) return 'G'
  if (domain.includes('wikipedia')) return 'W'
  if (domain.includes('yonhap')) return '연'
  if (domain.includes('mk.co.kr')) return '매'
  if (domain.includes('truefriend')) return '한'
  if (domain.includes('krx.co.kr')) return 'K'
  if (domain.includes('gov.kr')) return '정'

  return domain.charAt(0).toUpperCase()
}

const getBrandStyle = (url) => {
  const domain = extractDomain(url)

  const brandColors = {
    naver: { background: 'linear-gradient(135deg, #03C75A 0%, #05B552 100%)', color: 'white' },
    google: { background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)', color: 'white' },
    wikipedia: { background: 'linear-gradient(135deg, #000000 0%, #333333 100%)', color: 'white' },
    yonhap: { background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)', color: 'white' },
    'mk.co.kr': { background: 'linear-gradient(135deg, #E31E24 0%, #FF4444 100%)', color: 'white' },
    truefriend: { background: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)', color: 'white' },
    'krx.co.kr': {
      background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      color: 'white',
    },
    'gov.kr': { background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', color: 'white' },
  }

  for (const [key, style] of Object.entries(brandColors)) {
    if (domain.includes(key)) return style
  }

  return { background: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)', color: 'white' }
}

const debugInitialState = () => {
  console.log('🚀 Vue 컴포넌트 초기 상태:')
  console.log('📋 conversationHistory:', conversationHistory.value)
  console.log('📋 chatMessages:', chatMessages.value)
  console.log('🌐 isOpenAIWebSearchMode:', isOpenAIWebSearchMode.value)
  console.log('⚙️ 전역 추적 변수:', {
    activeIntervals: activeIntervals.size,
    activeTimeouts: activeTimeouts.size,
  })
}

const likeStates = ref({})
const dislikeStates = ref({})

// 👍 좋아요 토글 (독립적)
const toggleLike = (messageIndex) => {
  likeStates.value[messageIndex] = !likeStates.value[messageIndex]
}

// 👎 싫어요 토글 (독립적)
const toggleDislike = (messageIndex) => {
  dislikeStates.value[messageIndex] = !dislikeStates.value[messageIndex]
}

// 이미지 로딩 상태 관리
const imageLoaded = ref({})

// 이미지 도메인 추출
const extractDomainForImage = (url) => {
  return extractDomain(url, { useKoreanNames: true, fallbackText: '이미지' })
}

// 이미지 모달 열기 (새 탭에서)
const openImageModal = (image) => {
  window.open(image.url, '_blank', 'noopener,noreferrer')
}

// 이미지 에러 처리
const handleImageError = (event) => {
  const img = event.target
  img.style.display = 'none'
  // 에러 발생한 이미지는 부모 카드도 숨김
  if (img.parentElement) {
    img.parentElement.style.display = 'none'
  }
}

// 이미지 로드 완료 처리
const handleImageLoad = (event) => {
  const img = event.target
  const card = img.closest('.image-thumbnail-card')
  if (card) {
    const index = Array.from(card.parentElement.children).indexOf(card)
    imageLoaded.value[index] = true
  }
}

// 외부에서 호출 가능하도록 노출
defineExpose({
  resetAllValues,
  cleanupAllAsyncOperations,
})
</script>

<style lang="scss" scoped>
.text-green {
  color: #10a37f;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  width: 100%;
  position: relative;
  min-height: 100vh;
  justify-content: space-between;
  background: var(--Gray-50, #f9fafb);
  @media (max-width: 768px) {
    overflow-x: hidden;
  }
}

/* 배경 그라데이션 */
.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #a8d0f0 0%, #d4e7f5 50%, #f0f7ff 100%);
  z-index: -1;
}

.content-container {
  max-width: 1200px;
  width: 100%;
  padding: 100px 40px 60px 40px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 📱 태블릿 대응 */
@media (max-width: 1024px) {
  .content-container {
    max-width: 900px;
    padding: 80px 32px 50px 32px;
    height: auto;
    min-height: calc(100vh - 120px);
    justify-content: flex-start; /* 추가 */
    overflow-y: visible; /* auto에서 visible로 변경 */
  }

  .feature-cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    max-width: 600px;
  }

  .welcome-orb {
    width: 120px;
    height: 120px;
    margin-bottom: 20px;
  }

  .welcome-title {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .content-container {
    padding: 60px 20px 40px 20px;
    height: auto;
    min-height: calc(100vh - 120px);
    justify-content: flex-start; /* 추가 */
    overflow-y: visible; /* auto에서 visible로 변경 */
  }

  .feature-cards-container {
    grid-template-columns: 1fr;
    gap: 12px;
    max-width: 400px;
  }

  .welcome-orb {
    width: 100px;
    height: 100px;
    margin-bottom: 16px;
  }

  .welcome-title {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .welcome-subtitle {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .content-container {
    padding: 40px 16px 30px 16px;
    height: auto;
    min-height: calc(100vh - 100px);
    justify-content: flex-start; /* 추가 */
    overflow-y: visible; /* auto에서 visible로 변경 */
  }

  .welcome-orb {
    width: 80px;
    height: 80px;
    margin-bottom: 12px;
  }

  .welcome-title {
    font-size: 20px;
  }

  .welcome-subtitle {
    font-size: 13px;
  }

  .feature-cards-container {
    max-width: 320px;
  }
}

/* 📱 세로 길이 짧을 때 메인 콘텐츠 스크롤 대응 */
@media (max-height: 600px) {
  .content-container {
    height: auto;
    min-height: calc(100vh - 120px);
    padding: 40px 20px 30px 20px;
    justify-content: flex-start; /* 추가 */
    overflow-y: auto; /* 스크롤이 필요할 때만 */
    -webkit-overflow-scrolling: touch;
  }

  .chat-results-container,
  .search-results-container {
    max-height: 300px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .input-section {
    position: sticky;
    bottom: 0;
    background: var(--color-background);
    z-index: 100;
    padding: 16px 0;
    border-top: 1px solid var(--color-border-subtle);
  }
}

@media (max-height: 500px) {
  .content-container {
    height: auto;
    padding: 20px 16px 20px 16px;
    justify-content: flex-start; /* 추가 */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* 나머지 코드는 동일 */
}

/* 페이드 트랜지션 */
.fade-out-enter-active,
.fade-out-leave-active {
  transition: all 0.5s ease-in-out;
}

.fade-out-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.fade-out-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* ======= 검색 관련 스타일 ======= */

.search-results-container {
  width: 100%;
  max-width: 900px;
  margin-bottom: 80px;
  max-height: 465px; /* 검색 결과 영역 최대 높이 */
  display: flex;
  flex-direction: column;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0; /* 헤더는 고정 */
}

.search-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-brand {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  font-family: 'Pretendard', sans-serif;
}

.search-query {
  font-size: 16px;
  color: #4285f4;
  font-weight: 500;
  font-family: 'Pretendard', sans-serif;
}

.clear-results-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
}

.search-stats {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 15px;
  font-family: 'Pretendard', sans-serif;
  flex-shrink: 0; /* 통계는 고정 */
}

/* 🔥 스크롤 가능한 검색 결과 영역 */
.search-results-scroll {
  flex: 1;
  overflow-y: auto;
  max-height: 500px;
  padding-right: 8px;

  /* 커스텀 스크롤바 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
      background: #94a3b8;
    }
  }
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #6b7280;
  font-size: 16px;
  font-family: 'Pretendard', sans-serif;
}

/* 검색 결과 */
.search-results {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 20px;
}

.search-result-item {
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  opacity: 0;
  transform: translateY(20px);
  animation: resultFadeIn 0.6s ease forwards;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: #d1d5db;
  }
}

@keyframes resultFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.result-favicon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.result-url {
  color: #16a34a;
  font-size: 14px;
  font-family: 'Pretendard', sans-serif;
  line-height: 1.4;
}

.result-title {
  margin: 0 0 8px 0;

  a {
    color: #1a0dab;
    font-size: 18px;
    font-weight: 400;
    text-decoration: none;
    line-height: 1.3;
    font-family: 'Pretendard', sans-serif;

    &:hover {
      text-decoration: underline;
    }

    &:visited {
      color: #681da8;
    }
  }
}

.result-snippet {
  color: #4d5156;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 12px 0;
  font-family: 'Pretendard', sans-serif;
}

.result-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
}

/* 검색 결과 없음 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.no-results-icon {
  margin-bottom: 20px;
  opacity: 0.6;
}

.no-results-title {
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  font-family: 'Pretendard', sans-serif;
}

.no-results-description {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
  font-family: 'Pretendard', sans-serif;
}

/* 웹 검색 모드 활성화 시 입력창 스타일 */
.input-container.web-search-active {
  border-color: #4285f4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
}

/* ======= 기존 스타일들 ======= */
.blur-decoration {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 230px;
  border-radius: 954px;
  opacity: 0.9;
  filter: blur(110px);
  z-index: 0;
  pointer-events: none;

  /* 기본 파란색 */
  background: linear-gradient(372deg, #2563eb -0.64%, #1d4ed8 107.3%);
}

/* 초록색 오버레이 추가 */
.blur-decoration::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  /* KR 마크의 초록색에 맞춤 - 진한 초록색 */
  background: linear-gradient(372deg, #16a34a -0.64%, #15803d 107.3%);
  opacity: 0;
  /* 매우 부드러운 페이드 인/아웃 */
  animation: smoothFade 6s ease-in-out infinite;
  transition: opacity 0.5s ease;
}

@keyframes smoothFade {
  0%,
  100% {
    opacity: 0;
  }
  10% {
    opacity: 0.1;
  }
  30% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  70% {
    opacity: 0.7;
  }
  90% {
    opacity: 0.1;
  }
}

@keyframes blurPulse {
  0%,
  100% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

/* 환영 섹션 */
.welcome-section {
  text-align: center;
  position: relative;
  margin-bottom: 10px;
}

.wrap-welcome-section {
  margin-bottom: 15px;
  @media (max-width: 768px) {
    margin-bottom: 0px;
    height: 450px;
  }
}

/* 🌟 Enhanced Welcome Orb Animation */
.welcome-orb {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background-image: url('@/assets/krcc-orb.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin: 0 auto 25px;
  position: relative;

  /* 🎯 멀티 애니메이션 적용 */
  animation:
    orbFloat 3s ease-in-out infinite,
    orbGlow 2s ease-in-out infinite alternate,
    orbPulse 4s ease-in-out infinite,
    orbSpin 8s linear infinite,
    orbEntrance 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;

  /* 🔥 기본 파란색 글로우 효과 */
  box-shadow:
    0 0 30px rgba(6, 43, 146, 0.3),
    0 0 60px rgba(12, 44, 134, 0.2),
    0 0 90px rgba(23, 63, 173, 0.1);

  /* 🎨 반짝이는 오버레이 효과 */
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: orbShimmer 3s linear infinite;
    z-index: 1;
  }

  /* ✨ 기본 파란색 파티클 효과 */
  &::after {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    top: -20px;
    left: -20px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(29, 78, 216, 0.1) 0%, transparent 70%);
    animation: orbParticle 5s ease-in-out infinite;
    z-index: -1;
  }
}

/* 🟢 초록색 글로우 오버레이 추가 */
.welcome-orb {
  /* 초록색 글로우 효과를 위한 추가 요소 */
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    box-shadow:
      0 0 30px rgba(22, 163, 74, 0.4),
      0 0 60px rgba(21, 128, 61, 0.3),
      0 0 90px rgba(20, 83, 45, 0.2);
    opacity: 0;
    animation: orbColorShift 6s ease-in-out infinite;
    z-index: 0;
    pointer-events: none;
  }
}

/* 🟢 초록색 파티클 오버레이 */
.welcome-orb {
  /* 세 번째 가상 요소를 위한 래퍼 추가 */
  position: relative;

  &:hover::before {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    top: -20px;
    left: -20px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(22, 163, 74, 0.15) 0%, transparent 70%);
    opacity: 0;
    animation:
      orbParticleGreen 5s ease-in-out infinite,
      orbColorShift 6s ease-in-out infinite;
    z-index: -1;
    pointer-events: none;
  }
}

/* 🎭 Welcome Orb 키프레임 애니메이션들 */
@keyframes orbEntrance {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-180deg);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1) rotate(0deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes orbFloat {
  0%,
  100% {
    transform: translateY(0px);
  }
  25% {
    transform: translateY(-12px);
  }
  50% {
    transform: translateY(0px);
  }
  75% {
    transform: translateY(-8px);
  }
}

/* 🔄 색상 변화하는 글로우 - 파란색에서 초록색으로 */
@keyframes orbGlow {
  0% {
    box-shadow:
      0 0 30px rgba(29, 78, 216, 0.3),
      0 0 60px rgba(29, 78, 216, 0.2),
      0 0 90px rgba(29, 78, 216, 0.1);
  }
  50% {
    box-shadow:
      0 0 35px rgba(22, 163, 74, 0.5),
      0 0 70px rgba(21, 128, 61, 0.35),
      0 0 105px rgba(20, 83, 45, 0.25);
  }
  100% {
    box-shadow:
      0 0 40px rgba(29, 78, 216, 0.5),
      0 0 80px rgba(29, 78, 216, 0.3),
      0 0 120px rgba(29, 78, 216, 0.2);
  }
}

@keyframes orbPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes orbSpin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes orbShimmer {
  0% {
    transform: rotate(0deg);
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    transform: rotate(360deg);
    opacity: 0.3;
  }
}

/* 🔄 색상 변화하는 파티클 - 파란색에서 초록색으로 */
@keyframes orbParticle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.3;
    background: radial-gradient(circle, rgba(29, 78, 216, 0.1) 0%, transparent 70%);
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.1;
    background: radial-gradient(circle, rgba(22, 163, 74, 0.15) 0%, transparent 70%);
  }
}

/* 🟢 초록색 파티클 애니메이션 */
@keyframes orbParticleGreen {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.1;
  }
}

/* 🌈 색상 전환 애니메이션 */
@keyframes orbColorShift {
  0%,
  100% {
    opacity: 0;
  }
  10% {
    opacity: 0.1;
  }
  30% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  70% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.1;
  }
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
  font-family: 'Pretendard', sans-serif;
  animation: titleFadeIn 1s ease-out 0.5s both;
  @media (max-width: 768px) {
    font-size: 25px;
  }

  /* ✨ 이름 색상 변화 애니메이션 */
  // span {
  //   animation: nameColorShift 2.5s ease-in-out infinite;
  // }
}

/* 🎨 이름 색상 변화 키프레임 */
// @keyframes nameColorShift {
//   0%,
//   100% {
//     color: #1d4ed8;
//   }
//   50% {
//     color: #3b82f6;
//   }
// }

.welcome-subtitle {
  color: #5d8ad7;
  text-align: center;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%;
  letter-spacing: -0.32px;
  animation: titleFadeIn 1s ease-out 0.7s both;
}

@keyframes titleFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 기능 카드 컨테이너 */
.feature-cards-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 1000px;
  margin-bottom: 30px;
  perspective: 1000px; /* 3D 효과를 위한 원근감 */
}

/* 🚀 Enhanced Feature Card Animation */
.feature-card {
  padding: 16px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0) 47%, rgba(255, 255, 255, 0.6) 100%),
    rgba(255, 255, 255, 0.2);
  box-shadow: 0px 8px 30px rgba(198, 218, 248, 0.4);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(25px);
  cursor: pointer;
  min-height: 140px;
  position: relative;
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    min-height: 40px;
  }

  /* 🎯 초기 상태 */
  opacity: 0;
  transform: translateY(60px) rotateX(15deg);

  /* 🎨 Enhanced 애니메이션 */
  animation: cardSlideInEnhanced 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;

  /* 🔥 Smooth 트랜지션 */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  /* ✨ 호버 시 3D 효과 */
  &:hover {
    transform: translateY(-15px) rotateX(5deg) rotateY(5deg) scale(1.02);
    box-shadow:
      0px 20px 50px rgba(198, 218, 248, 0.6),
      0px 10px 30px rgba(29, 78, 216, 0.2);
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.1) 47%, rgba(255, 255, 255, 0.8) 100%),
      rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(29, 78, 216, 0.3);

    /* 호버 시 글로우 효과 */
    &::before {
      opacity: 1;
    }
  }

  /* 🌟 글로우 오버레이 */
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(
      45deg,
      rgba(29, 78, 216, 0.1),
      rgba(59, 130, 246, 0.1),
      rgba(29, 78, 216, 0.1)
    );
    border-radius: 20px;
    opacity: 0;
    z-index: -1;
    transition: opacity 0.3s ease;
    animation: cardGlow 3s ease-in-out infinite;
  }

  /* 🎭 특별한 세 번째 카드 스타일 */
  &:nth-child(3) {
    background:
      linear-gradient(180deg, rgba(10, 140, 241, 0) 0%, rgba(91, 134, 255, 0.2) 100%),
      linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.6) 100%),
      rgba(255, 255, 255, 0.2);

    &::before {
      background: linear-gradient(
        45deg,
        rgba(91, 134, 255, 0.15),
        rgba(10, 140, 241, 0.15),
        rgba(91, 134, 255, 0.15)
      );
    }
  }

  /* 🎪 카드별 개별 애니메이션 지연 */
  &:nth-child(1) {
    animation-delay: 0.1s;
  }
  &:nth-child(2) {
    animation-delay: 0.25s;
  }
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

/* 🎬 Enhanced Card 키프레임 애니메이션 */
@keyframes cardSlideInEnhanced {
  0% {
    opacity: 0;
    transform: translateY(60px) rotateX(15deg) scale(0.9);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-10px) rotateX(5deg) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0deg) scale(1);
  }
}

@keyframes cardGlow {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 0.3;
  }
}

/* 🎨 Card Icon 애니메이션 강화 */
.card-icon-container {
  margin-bottom: 20px;
  animation: iconBounceIn 1s ease-out 0.8s both;
  @media (max-width: 768px) {
    margin-bottom: 0px;
  }
}

.card-icon {
  width: 60px;
  height: 60px;
  background: #e5effc;
  border-radius: 10px;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  img {
    width: 60px;
    height: 60px;
    transition: transform 0.3s ease;
  }

  /* 호버 시 아이콘 애니메이션 */
  .feature-card:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0px 5px 15px rgba(29, 78, 216, 0.2);

    img {
      transform: scale(1.1);
    }
  }
}

@keyframes iconBounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-10deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: contentFadeIn 1s ease-out 1s both;
}

@keyframes contentFadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-title {
  color: #1f2937;
  font-size: 16px;
  font-family: 'Pretendard', sans-serif;
  font-weight: 600;
  line-height: 24px;
  margin: 0;
  transition: color 0.3s ease;

  .feature-card:hover & {
    color: #1d4ed8;
  }

  @media (max-width: 1024px) {
    font-size: 15px;
  }

  @media (max-width: 768px) {
    display: none;
  }
}

.card-description {
  color: #4b5563;
  font-size: 13px;
  font-family: 'Pretendard', sans-serif;
  font-weight: 400;
  line-height: 18.2px;
  margin: 0;
  transition: color 0.3s ease;

  .feature-card:hover & {
    color: #374151;
  }
  @media (max-width: 1024px), (max-width: 768px) {
    display: none;
  }
}

/* 입력창 섹션 */
.input-section {
  width: 100%;
  max-width: 1000px;
  position: relative;
  animation: inputSlideUp 1s ease-out 1.2s both;
}

@keyframes inputSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-container {
  caret-color: black !important;
  background: white;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  border: 1px solid #1d4ed8;
  padding: 20px;
  transition: all 0.2s ease;
  margin-bottom: 28px;
}

.input-left {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.placeholder-text {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
}

.input-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.left-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 기존 모델 배지 스타일 복원 */
.model-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 8px;
  padding: 6px 10px;
  height: 32px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;

  &:hover {
    background: rgba(37, 99, 235, 0.15);
  }

  &__hidden {
    display: none;
  }
}

.model-text {
  color: #2563eb;
  text-align: center;
  leading-trim: both;
  text-edge: cap;
  font-family: Pretendard;
  font-size: 13px;
  font-style: normal;
  font-weight: 600;
  line-height: 150%;
  letter-spacing: -0.13px;
}

/* 🎯 드롭다운 화살표 회전 애니메이션 */
.dropdown-arrow {
  transition: transform 0.3s ease;

  &.rotate-180 {
    transform: rotate(180deg);
  }
}

/* 🌟 예쁜 커스텀 드롭다운 (위로 펼쳐짐) */
.custom-dropdown {
  position: absolute;
  bottom: 100%;
  left: -8px;
  right: -8px;
  margin-bottom: 8px;
  background: white;
  border: 2px solid #2563eb;
  border-radius: 12px;
  box-shadow:
    0 -10px 25px rgba(37, 99, 235, 0.15),
    0 -5px 15px rgba(37, 99, 235, 0.1),
    0 0 0 4px rgba(37, 99, 235, 0.05);
  z-index: 1000;
  overflow: hidden;
  animation: dropdownSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(10px);
  min-width: 140px;
}

@keyframes dropdownSlideUp {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 🎨 드롭다운 옵션들 */
.dropdown-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: Pretendard;
  font-size: 13px;
  font-weight: 500;
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
  background: white;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%);

    .option-text {
      color: #1d4ed8;
      font-weight: 600;
    }
  }

  &.selected {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);

    .option-text {
      color: #1e40af;
      font-weight: 600;
    }
  }
}

.option-text {
  color: #1f2937;
  transition: all 0.2s ease;
}

/* ✅ 체크 아이콘 */
.check-icon {
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;

  .dropdown-option.selected & {
    opacity: 1;
    transform: scale(1);
  }
}

.function-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 🚀 Enhanced 아이콘 버튼 스타일 - 모든 버튼에 동일한 효과 적용 */
.icon-btn {
  cursor: pointer !important;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #6b7280;

  &:hover {
    background: rgba(107, 114, 128, 0.1);
  }

  /* 🎯 모든 버튼에 텍스트 애니메이션 적용 */
  &-with-text {
    width: auto;
    height: 32px;
    padding: 4px;
    gap: 0; // gap 제거!
    overflow: hidden; // 핵심!

    &__active {
      background-color: #ddecff66;
    }

    .btn-text {
      font-weight: 500;
      white-space: nowrap;
      color: #2563eb;
      padding: 2px 4px 0 0;

      // 완벽한 스르륵 효과
      width: auto;
      margin-left: 3px; // gap 대신 margin 사용
      opacity: 1;
      transform: translateX(0);

      // 나타날 때: 천천히 부드럽게
      transition:
        width 0.5s cubic-bezier(0.16, 1, 0.3, 1),
        margin-left 0.5s cubic-bezier(0.16, 1, 0.3, 1),
        opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s,
        transform 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.05s;

      &__hidden {
        width: 0 !important;
        margin-left: 0 !important; // 완전히 공간 제거
        opacity: 0;
        transform: translateX(-4px);
        overflow: hidden;

        // 사라질 때: 빠르고 깔끔하게
        transition:
          opacity 0.2s cubic-bezier(0.5, 0, 1, 1),
          transform 0.25s cubic-bezier(0.5, 0, 1, 1),
          width 0.3s cubic-bezier(0.5, 0, 1, 1) 0.05s,
          margin-left 0.3s cubic-bezier(0.5, 0, 1, 1) 0.05s;
      }
    }
  }
}

.divider {
  width: 1px;
  height: 16px;
  background: #d1d5db;
  margin: 0 4px;
  cursor: default;
}

.right-controls {
  margin-left: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.send-btn {
  width: 32px;
  height: 32px;
  background: #374151;
  border: none;
  border-radius: 8px;
  cursor: pointer !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #1f2937;
    transform: scale(1.05);
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed !important;
  }
}

.works-input {
  outline: none;
  border: none;
  width: 100%;
  height: 40px;
  font-family: Pretendard;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
  letter-spacing: -0.36px;

  /* 🖱️ 강제로 검은색 I-beam 커서 적용 */
  cursor:
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="3" height="20" viewBox="0 0 3 20"><rect width="1" height="20" x="1" fill="black"/><rect width="3" height="2" y="0" fill="black"/><rect width="3" height="2" y="18" fill="black"/></svg>')
      1 10,
    text;

  &:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
}

.footer-text {
  color: #9ca3af;
  font-size: 12px;
  font-family: 'Pretendard', sans-serif;
  font-weight: 400;
  text-align: center;
  max-width: 800px;
  line-height: 1.4;
  animation: footerFadeIn 1s ease-out 1.5s both;
  @media (max-width: 768px) {
    display: none;
  }
}

@keyframes footerFadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* ChatGPT 대화 컨테이너 - 웹검색과 동일한 높이 제한 */
.chat-results-container {
  width: 100%;
  max-width: 900px;
  margin-bottom: 80px;
  max-height: 465px; /* 웹검색과 동일한 높이 */
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  overflow: hidden;
}

/* ChatGPT 헤더 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e6;
  flex-shrink: 0; /* 헤더는 고정 */
  background: #ffffff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.chat-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-brand {
  font-size: 20px;
  font-weight: 600;
  color: #2e3338;
  font-family: 'Pretendard', sans-serif;
}

/* 스크롤 가능한 대화 영역 - 웹검색과 동일 */
.chat-results-scroll {
  flex: 1;
  overflow-y: auto;
  max-height: 400px; /* 웹검색과 동일 */
  scroll-behavior: smooth;
  background: #f7f7f8;
  padding-right: 8px; /* 웹검색과 동일 */

  /* 웹검색과 동일한 스크롤바 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
      background: #94a3b8;
    }
  }
}

/* 대화 메시지 컨테이너 */
.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: 20px; /* 웹검색과 동일 */
}

/* 개별 메시지 애니메이션 - 웹검색과 동일 */
.chat-message-item {
  opacity: 0;
  transform: translateY(20px);
  animation: resultFadeIn 0.6s ease forwards;
}

/* 사용자 메시지 - 좌측 정렬로 변경 */
.user-message {
  padding: 32px 24px;
  display: flex;
  gap: 20px;
  background: #f7f7f8;
  transition: background-color 0.2s ease;
  position: relative;
  border-bottom: 1px solid #f0f0f1;
  align-items: flex-start; /* 아바타와 내용 상단 정렬 */
}

.user-message:hover {
  background: rgba(0, 0, 0, 0.03);
}

/* AI 메시지 - 기존과 동일 */
.ai-message {
  padding: 32px 24px;
  display: flex;
  gap: 20px;
  background: #ffffff;
  transition: background-color 0.2s ease;
  position: relative;
  border-bottom: 1px solid #f0f0f1;
  align-items: flex-start; /* 아바타와 내용 상단 정렬 */
}

.ai-message:hover {
  background: rgba(0, 0, 0, 0.02);
}

/* 아바타 + 이름 컨테이너 */
.user-avatar,
.ai-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* 아바타 스타일 */
.user-avatar .avatar-circle,
.ai-avatar .avatar-circle {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.user-avatar .avatar-circle {
  background: linear-gradient(0deg, #15803d 0%, #4ade80 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 163, 127, 0.25);
}

.ai-avatar .avatar-circle {
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}

.user-avatar .avatar-circle:hover,
.ai-avatar .avatar-circle:hover {
  transform: scale(1.05);
}

/* 이름 라벨 */
.user-avatar .avatar-name,
.ai-avatar .avatar-name {
  font-size: 15px;
  font-weight: 600;
  color: black;
  font-family: 'Pretendard', sans-serif;
  text-align: center;
  white-space: nowrap;
}

/* 메시지 내용 */
.user-message .message-content,
.ai-message .message-content {
  flex: 1;
  line-height: 1.7;
  font-size: 16px;
  color: #2e3338;
  font-weight: 400;
  letter-spacing: -0.01em;
  font-family: 'Pretendard', sans-serif;
  margin-top: 2px; /* 아바타와 정렬 맞춤 */
}

/* 기존 bubble 클래스들은 이제 단순 텍스트로 */
.user-bubble,
.ai-bubble {
  background: none;
  border: none;
  box-shadow: none;
  padding: 0;
  border-radius: 0;
  color: inherit;
  width: 100%;
  min-width: auto;

  /* 마크다운 스타일링 */
  strong {
    font-weight: 600;
    color: #2e3338;
  }

  em {
    font-style: italic;
    color: #6e6e80;
  }

  p {
    margin: 16px 0;
  }

  ul,
  ol {
    margin: 16px 0;
    padding-left: 24px;
  }

  li {
    margin: 8px 0;
  }

  h1,
  h2,
  h3 {
    margin: 20px 0 12px 0;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  h1 {
    font-size: 28px;
    font-weight: 700;
  }
  h2 {
    font-size: 22px;
  }
  h3 {
    font-size: 18px;
  }
}

/* 메시지 시간 */
.message-time {
  font-size: 11px;
  color: #8e8ea0;
  margin-top: 8px;
  font-family: 'Pretendard', sans-serif;
  font-weight: 400;
}

/* 로딩 스피너 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #ffffff;
}

.loading-text {
  color: #6e6e80;
  font-size: 14px;
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
}

/* 애니메이션 지연 */
.chat-message-item:nth-child(odd) {
  animation-delay: 0.1s;
}

.chat-message-item:nth-child(even) {
  animation-delay: 0.2s;
}

/* 메시지 액션 버튼들 (호버 시 나타나는) */
.message-actions {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateY(-4px);
}

.user-message:hover .message-actions,
.ai-message:hover .message-actions {
  opacity: 1;
  transform: translateY(0);
}

.action-btn {
  background: #ffffff;
  border: 1px solid #e5e5e6;
  color: #6e6e80;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.action-btn:hover {
  background: #f7f7f8;
  border-color: #e5e5e6;
  color: #2e3338;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* 코드 블록 스타일링 (예제에서 가져옴) */
.ai-bubble code {
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
  font-size: 14px;
  color: #cf222e;
  font-weight: 500;
}

/* 스크롤바 개선 */
.chat-results-scroll {
  scrollbar-width: thin;
  scrollbar-color: #e5e5e6 transparent;
}

/* 메시지 내용 개선 */
.user-message .message-content,
.ai-message .message-content {
  /* 텍스트 선택 가능 */
  user-select: text;

  /* 링크 스타일 */
  a {
    color: #10a37f;
    text-decoration: underline;
    text-decoration-color: rgba(16, 163, 127, 0.3);
    transition: all 0.2s ease;

    &:hover {
      text-decoration-color: #10a37f;
      color: #0d8a6b;
    }
  }
}

/* 자연스러운 줄바꿈 */
.user-bubble,
.ai-bubble {
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
}

/* 스크롤바 개선 */
.chat-results-scroll {
  scrollbar-width: thin;
  scrollbar-color: #e5e5e6 transparent;
}

/* 메시지 내용 개선 */
.user-message .message-content,
.ai-message .message-content {
  /* 텍스트 선택 가능 */
  user-select: text;

  /* 링크 스타일 */
  a {
    color: #10a37f;
    text-decoration: underline;
    text-decoration-color: rgba(16, 163, 127, 0.3);
    transition: all 0.2s ease;

    &:hover {
      text-decoration-color: #10a37f;
      color: #0d8a6b;
    }
  }
}

/* 자연스러운 줄바꿈 */
.user-bubble,
.ai-bubble {
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
}

/* 코드 블록 스타일링 (예제에서 가져옴) */
.ai-bubble code {
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
  font-size: 14px;
  color: #cf222e;
  font-weight: 500;
}

/* 기존 CSS 스타일 끝에 추가 */

/* 복사 관련 애니메이션 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* 복사 버튼 그룹 호버 효과 */
.group:hover .group-hover\:opacity-100 {
  opacity: 1 !important;
}

/* 타이핑 애니메이션 Bounce 효과 */
@keyframes bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

/* 🎨 Enhanced 타이핑 인디케이터 */
.typing-indicator-container {
  margin: 16px 0;
  padding: 20px;
  background: linear-gradient(135deg, #f8faff 0%, #f0f7ff 100%);
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  position: relative;
  overflow: hidden;
}

/* ✨ 배경 shimmer 효과 */
.typing-indicator-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 🌊 옵션 1: 웨이브 애니메이션 */
.typing-wave-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.typing-wave {
  display: flex;
  align-items: center;
  gap: 4px;
}

.wave-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  animation: wave 1.4s ease-in-out infinite;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.wave-dot:nth-child(1) {
  animation-delay: -0.32s;
}
.wave-dot:nth-child(2) {
  animation-delay: -0.16s;
}
.wave-dot:nth-child(3) {
  animation-delay: 0s;
}
.wave-dot:nth-child(4) {
  animation-delay: 0.16s;
}

@keyframes wave {
  0%,
  60%,
  100% {
    transform: scale(0.8) translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: scale(1.2) translateY(-8px);
    opacity: 1;
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
  }
}

/* 📝 타이핑 텍스트 */
.typing-text {
  display: flex;
  align-items: center;
  position: relative;
}

.typing-text-content {
  font-size: 15px;
  font-weight: 500;
  color: #1e40af;
  font-family: 'Pretendard', sans-serif;
  animation: textFade 2s ease-in-out infinite;
}

@keyframes textFade {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* ⌨️ 타이핑 커서 */
.typing-cursor {
  width: 2px;
  height: 18px;
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  margin-left: 4px;
  border-radius: 1px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* 🌟 옵션 2: 펄스 링 애니메이션 */
.typing-pulse-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
}

.pulse-ring {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
  opacity: 0;
}

.pulse-ring-delay-1 {
  animation-delay: 0.5s;
}

.pulse-ring-delay-2 {
  animation-delay: 1s;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.pulse-center {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  animation: pulse-center 2s ease-in-out infinite;
  z-index: 10;
}

@keyframes pulse-center {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
  }
}

.typing-text-pulse {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  font-family: 'Pretendard', sans-serif;
  text-align: center;
  animation: textPulse 2s ease-in-out infinite;
  margin-top: 20px;
}

@keyframes textPulse {
  0%,
  100% {
    opacity: 0.6;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

/* 🎭 호버 효과 */
.typing-indicator-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.typing-indicator-container:hover .wave-dot {
  animation-duration: 1s;
}

.typing-indicator-container:hover .typing-text-content {
  color: #1e40af;
  font-weight: 600;
}

/* 🎯 개선된 복사 버튼 스타일 */
.copy-button {
  /* 🔄 기본 버튼 스타일 완전 리셋 */
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  border-radius: 0; /* 라운드 제거 */

  /* 🎨 커스텀 스타일 */
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  /* ✨ 부드러운 트랜지션 */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* 👆 손가락 커서 */
  cursor: pointer !important;

  /* 🎭 기본 상태 - 살짝 보이게 */
  opacity: 0.4; /* 0.6에서 0.4로 변경 */
  transform: scale(1);

  /* 🌟 호버 효과 */
  &:hover {
    opacity: 1;
    transform: scale(1.1);
    background: rgba(59, 130, 246, 0.08);
    border-radius: 6px; /* 호버 시에만 살짝 라운드 */

    .copy-icon {
      filter: brightness(0) saturate(100%) invert(45%) sepia(99%) saturate(1815%) hue-rotate(207deg)
        brightness(97%) contrast(94%);
    }
  }

  /* ✅ 성공 상태 - 임시로만 표시 */
  &.copy-success {
    opacity: 1;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 6px;
    transform: scale(1.05);

    /* 성공 후 자동으로 원래 상태로 돌아가는 애니메이션 */
    animation: copySuccessFlash 2s ease-out forwards;

    &:hover {
      background: rgba(16, 185, 129, 0.15);
      transform: scale(1.1);
    }
  }

  /* 🎯 포커스 상태 (접근성) */
  &:focus {
    outline: 2px solid rgba(59, 130, 246, 0.3);
    outline-offset: 2px;
    border-radius: 6px;
  }

  /* 📱 터치 디바이스 대응 */
  &:active {
    transform: scale(0.95);
  }

  /* 🚫 비활성화 방지 */
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed !important;
    transform: none;

    &:hover {
      opacity: 0.3;
      transform: none;
      background: none;
    }
  }
}

/* ✅ 성공 후 원래 상태로 돌아가는 애니메이션 */
@keyframes copySuccessFlash {
  0% {
    opacity: 1;
    background: rgba(16, 185, 129, 0.1);
    transform: scale(1.05);
  }

  50% {
    opacity: 1;
    background: rgba(16, 185, 129, 0.15);
    transform: scale(1.1);
  }

  100% {
    opacity: 0.4; /* 원래 상태로 */
    background: none; /* 배경색 제거 */
    border-radius: 0; /* 라운드 제거 */
    transform: scale(1);
  }
}

/* 🎨 아이콘 스타일 */
.copy-icon {
  transition: all 0.2s ease;
  opacity: 0.8;

  .copy-button:hover & {
    opacity: 1;
  }
}

.check-icon {
  animation: checkPopIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* ✅ 체크 아이콘 팝인 애니메이션 */
@keyframes checkPopIn {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-180deg);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1) rotate(0deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

/* 🎭 개선된 그룹 호버 효과 */
.ai-bubble {
  .copy-button {
    /* ✨ 기본적으로 살짝 보이게 */
    opacity: 0.4;
    visibility: visible;
    transform: translateY(0);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* 메시지에 호버 시 복사 버튼 더 명확하게 */
  &:hover .copy-button {
    opacity: 0.7;
  }

  /* 복사 버튼 자체에 호버 시 */
  .copy-button:hover {
    opacity: 1 !important;
  }

  /* 성공 상태일 때는 애니메이션 우선 */
  .copy-button.copy-success {
    /* animation이 우선하도록 !important 제거 */
  }
}

.brand-initial {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Pretendard', sans-serif;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.source-card:hover .brand-initial {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.source-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827; /* 이미 검은색인데 더 진하게 */
  margin: 0 0 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: 'Pretendard', sans-serif;
}

.source-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #000000; /* 완전 검은색으로 변경 */
  margin: 0 0 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: 'Pretendard', sans-serif;
}

/* ✨ 가로 아이콘 배치 스타일 */
.sources-horizontal {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 8px 0;
  overflow-x: auto;

  /* 스크롤바 숨기기 */
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
}

.source-icon-card {
  flex-shrink: 0; /* 크기 고정 */
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px) scale(1.1);
  }

  .brand-initial {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    font-family: 'Pretendard', sans-serif;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;

    /* 호버 시 더 강한 그림자 */
    .source-icon-card:hover & {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }
  }
}

/* 5개 이상일 때 더 작게 */
.sources-horizontal:has(> .source-icon-card:nth-child(5)) .source-icon-card .brand-initial {
  width: 32px;
  height: 32px;
  font-size: 14px;
  border-radius: 8px;
}

/* 🎯 애니메이션 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ✨ 가로 아이콘 배치 스타일 (기존 유지) */
.sources-horizontal {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 8px 0;
  overflow-x: auto;

  /* 스크롤바 숨기기 */
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
}

.source-icon-card {
  flex-shrink: 0; /* 크기 고정 */
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px) scale(1.1);
  }

  .brand-initial {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    font-family: 'Pretendard', sans-serif;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;

    /* 호버 시 더 강한 그림자 */
    .source-icon-card:hover & {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }
  }
}

/* 5개 이상일 때 더 작게 */
.sources-horizontal:has(> .source-icon-card:nth-child(5)) .source-icon-card .brand-initial {
  width: 32px;
  height: 32px;
  font-size: 14px;
  border-radius: 8px;
}

/* 애니메이션 키프레임 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ✨ 웹 검색 소스 URL 세로 배치 스타일 */
.sources-vertical {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.source-url-item {
  font-size: 12px;
  font-family: 'Pretendard', sans-serif;
  color: #4285f4;
  text-decoration: underline;
  cursor: pointer;
  word-break: break-all;
  line-height: 1.4;
  transition: all 0.2s ease;

  &:hover {
    color: #1a73e8;
    text-decoration-color: #1a73e8;
  }
}
/* 🎯 반응 버튼 스타일 */
.reaction-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 30px;
  height: 30px;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: scale(1.1);
  }

  /* 👍 좋아요 활성화 상태 */
  &.active:has(.text-blue-500) {
    background: rgba(59, 130, 246, 0.1);

    &:hover {
      background: rgba(59, 130, 246, 0.15);
    }
  }

  /* 👎 싫어요 활성화 상태 */
  &.active:has(.text-red-500) {
    background: rgba(239, 68, 68, 0.1);

    &:hover {
      background: rgba(239, 68, 68, 0.15);
    }
  }

  /* 아이콘 애니메이션 */
  svg {
    transition: all 0.2s ease;
  }

  &:hover svg {
    transform: scale(1.1);
  }

  /* 클릭 시 펄스 효과 */
  &.active svg {
    animation: reactionPulse 0.3s ease;
  }
}

/* 🎭 반응 애니메이션 */
@keyframes reactionPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 🎯 기존 복사 버튼 크기 조정 */
.copy-button {
  padding: 6px !important;
  width: 30px;
  height: 30px;

  img,
  svg {
    width: 18px !important;
    height: 18px !important;
  }
}

/* 📱 모바일 반응형 */
@media (max-width: 768px) {
  .reaction-button,
  .copy-button {
    width: 28px;
    height: 28px;
    padding: 4px;

    svg,
    img {
      width: 16px !important;
      height: 16px !important;
    }
  }
}

/* 🎯 액션 버튼 공통 스타일 */
.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  color: #6b7280;
  position: relative;

  /* 호버 효과 */
  &:hover {
    transform: translateY(-1px) scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* 아이콘 애니메이션 */
  svg {
    transition: all 0.2s ease;
  }

  &:hover svg {
    transform: scale(1.1);
  }

  /* 클릭 효과 */
  &:active {
    transform: translateY(0) scale(0.95);
  }
}

/* 🎯 복사 버튼 (기존 유지) */
.copy-btn {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1px solid #e2e8f0;
  margin-right: 8px;

  &:hover {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    color: #334155;
    border-color: #cbd5e1;
  }

  &.copy-success {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    color: #16a34a;
    border-color: #bbf7d0;

    svg {
      animation: successPulse 0.5s ease;
    }
  }
}

/* 👍 좋아요 버튼 (파란색 테마) */
.like-btn {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
  border: 1px solid #bfdbfe;
  margin-right: 8px;

  &:hover {
    background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
    color: #1d4ed8;
    border-color: #93c5fd;
  }

  &.active {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border-color: #2563eb;
    box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);

    svg {
      fill: currentColor;
      animation: thumbsUpBounce 0.6s ease;
    }
  }
}

/* 👎 싫어요 버튼 (빨간색 테마) */
.dislike-btn {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  border: 1px solid #fecaca;

  &:hover {
    background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
    color: #b91c1c;
    border-color: #fca5a5;
  }

  &.active {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border-color: #dc2626;
    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);

    svg {
      fill: currentColor;
      animation: thumbsDownShake 0.5s ease;
    }
  }
}

/* 🎭 애니메이션 키프레임 */
@keyframes successPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes thumbsUpBounce {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.2) rotate(-10deg);
  }
  50% {
    transform: scale(1.3) rotate(0deg);
  }
  75% {
    transform: scale(1.1) rotate(10deg);
  }
}

@keyframes thumbsDownShake {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.2) rotate(10deg);
  }
  50% {
    transform: scale(1.3) rotate(0deg);
  }
  75% {
    transform: scale(1.1) rotate(-10deg);
  }
}

/* 🖼️ OpenAI 웹 검색 이미지 썸네일 스타일 */
.openai-web-images {
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.images-grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  justify-items: center;
}

.image-thumbnail-card {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background: #f8fafc;

  &:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(-2px) scale(1.01);
  }
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
  background: #e2e8f0;

  &:hover {
    transform: scale(1.05);
  }
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );
  padding: 8px 10px;
  transform: translateY(100%);
  transition: transform 0.3s ease;

  .image-thumbnail-card:hover & {
    transform: translateY(0);
  }
}

.image-source {
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  font-family: 'Pretendard', sans-serif;
  text-align: center;
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(4px);
}

.loading-spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 3개 이하일 때 가운데 정렬 */
.images-grid-container:has(.image-thumbnail-card:nth-child(1):nth-last-child(1)) {
  grid-template-columns: 1fr;
  justify-content: center;
}

.images-grid-container:has(.image-thumbnail-card:nth-child(2):nth-last-child(1)) {
  grid-template-columns: repeat(2, 1fr);
}

.images-grid-container:has(.image-thumbnail-card:nth-child(3):nth-last-child(1)) {
  grid-template-columns: repeat(3, 1fr);
}

/* 2700번째 줄에 추가 */

/* 📱 입력창 반응형 */
@media (max-width: 768px) {
  .input-section {
    max-width: 100%;
    padding: 0 16px;
    position: sticky;
    bottom: 0;
    background: var(--color-background);
    z-index: 100;
  }

  .input-container {
    padding: 16px;
    border-radius: 16px;
    margin-bottom: 20px;
  }

  .input-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .left-controls {
    order: 2;
  }

  .right-controls {
    order: 1;
    margin-left: 0;
    justify-content: space-between;
  }

  .function-icons {
    flex-wrap: wrap;
    gap: 6px;
  }

  .works-input {
    font-size: 16px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .input-container {
    padding: 12px;
    margin-bottom: 16px;
  }

  .function-icons {
    gap: 4px;
  }

  .icon-btn-with-text {
    height: 28px;

    .btn-text {
      font-size: 12px;
    }
  }

  .model-badge {
    padding: 4px 8px;
    height: 28px;

    .model-text {
      font-size: 12px;
    }
  }

  .send-btn {
    width: 28px;
    height: 28px;
  }
}

/* 📱 채팅 결과 반응형 */
@media (max-width: 768px) {
  .chat-results-container,
  .search-results-container {
    max-width: 100%;
    margin-bottom: 60px;
    max-height: 400px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .chat-header,
  .search-header {
    padding: 16px 20px;
  }

  .chat-brand,
  .search-brand {
    font-size: 18px;
  }

  .user-message,
  .ai-message {
    padding: 24px 20px;
    gap: 16px;
  }

  .user-avatar .avatar-circle,
  .ai-avatar .avatar-circle {
    width: 40px;
    height: 40px;
  }

  .user-avatar .avatar-name,
  .ai-avatar .avatar-name {
    font-size: 13px;
  }

  .user-message .message-content,
  .ai-message .message-content {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .chat-results-container,
  .search-results-container {
    max-height: 350px;
    margin-bottom: 40px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .chat-header,
  .search-header {
    padding: 12px 16px;
  }

  .chat-brand,
  .search-brand {
    font-size: 16px;
  }

  .user-message,
  .ai-message {
    padding: 20px 16px;
    gap: 12px;
  }

  .user-avatar .avatar-circle,
  .ai-avatar .avatar-circle {
    width: 36px;
    height: 36px;
  }

  .user-avatar .avatar-name,
  .ai-avatar .avatar-name {
    font-size: 12px;
  }

  .user-message .message-content,
  .ai-message .message-content {
    font-size: 14px;
  }

  .action-button {
    width: 28px;
    height: 28px;
  }

  .sources-horizontal {
    gap: 8px;
  }

  .source-icon-card .brand-initial {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .images-grid-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .image-thumbnail-card {
    width: 120px;
    height: 120px;
  }
}

/* 📱 세로 길이 짧을 때 메인 콘텐츠 스크롤 대응 */
@media (max-height: 600px) {
  .content-container {
    overflow-x: hidden;
    overflow-y: auto;
    height: auto;
    min-height: calc(100vh - 120px);
    padding: 40px 20px 30px 20px;
    -webkit-overflow-scrolling: touch;
  }

  .chat-results-container,
  .search-results-container {
    max-height: 300px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .input-section {
    position: sticky;
    bottom: 0;
    background: var(--color-background);
    z-index: 100;
    padding: 16px 0;
    border-top: 1px solid var(--color-border-subtle);
  }
}

@media (max-height: 500px) {
  .content-container {
    height: auto;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 20px 16px 20px 16px;
    -webkit-overflow-scrolling: touch;
  }

  .welcome-section {
    margin-bottom: 20px;
  }

  .welcome-orb {
    width: 60px;
    height: 60px;
    margin-bottom: 8px;
  }

  .welcome-title {
    font-size: 18px;
    margin-bottom: 4px;
  }

  .welcome-subtitle {
    font-size: 12px;
  }

  .feature-cards-container {
    margin-bottom: 20px;
    gap: 8px;
  }

  .chat-results-container,
  .search-results-container {
    max-height: 200px;
    overflow-y: scroll;
    margin-bottom: 40px;
  }

  .input-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-background);
    z-index: 1000;
    padding: 12px 16px;
    border-top: 1px solid var(--color-border-subtle);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  }

  .input-container {
    margin-bottom: 0;
  }
}

/* 극도로 짧은 화면 (가로모드) */
@media (max-height: 400px) and (orientation: landscape) {
  .content-container {
    height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 10px 16px 60px 16px;
    -webkit-overflow-scrolling: touch;
  }

  .welcome-section {
    margin-bottom: 10px;
  }

  .welcome-orb {
    width: 40px;
    height: 40px;
    margin-bottom: 4px;
  }

  .welcome-title {
    font-size: 16px;
    margin-bottom: 2px;
  }

  .welcome-subtitle {
    font-size: 11px;
  }

  .feature-cards-container {
    display: none; /* 공간 절약 */
  }

  .chat-results-container,
  .search-results-container {
    max-height: 150px;
    overflow-y: scroll;
    margin-bottom: 20px;
  }

  .input-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px 12px;
  }

  .input-container {
    padding: 8px;
  }

  .works-input {
    height: 32px;
    font-size: 14px;
  }
}

/* 스크롤바 스타일링 */
@media (max-height: 600px) {
  .content-container::-webkit-scrollbar,
  .chat-results-container::-webkit-scrollbar,
  .search-results-container::-webkit-scrollbar {
    width: 6px;
  }

  .content-container::-webkit-scrollbar-track,
  .chat-results-container::-webkit-scrollbar-track,
  .search-results-container::-webkit-scrollbar-track {
    background: var(--color-background-subtle);
    border-radius: 3px;
  }

  .content-container::-webkit-scrollbar-thumb,
  .chat-results-container::-webkit-scrollbar-thumb,
  .search-results-container::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 3px;
  }

  .content-container::-webkit-scrollbar-thumb:hover,
  .chat-results-container::-webkit-scrollbar-thumb:hover,
  .search-results-container::-webkit-scrollbar-thumb:hover {
    background: var(--color-text-secondary);
  }
}

/* 사용자 이름 스타일 - 실제 작동하는 버전 */
.owner-name {
  font-weight: 700;
  background: linear-gradient(45deg, #1d4ed8, #4ade80);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  /* 그라데이션 위치를 변화시켜 색상 변화 효과 */
  animation: colorShift 3s ease-in-out infinite alternate;
}

/* 호버 시 애니메이션 일시정지 */
.owner-name:hover {
  animation-play-state: paused;
}

/* 그라데이션 위치 변화 애니메이션 */
@keyframes colorShift {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

/* 접근성을 위한 애니메이션 감소 설정 */
@media (prefers-reduced-motion: reduce) {
  .owner-name {
    animation: none;
    background-position: 0% 50%;
  }
}
</style>
