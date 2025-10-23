// ============================================
// 토큰 관리 유틸리티 함수들
// ============================================

/**
 * Access Token을 localStorage에 저장
 * @param {string} token - 저장할 토큰
 */
function saveAccessToken(token) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    console.log('✅ Access Token 저장 완료');
}

/**
 * Access Token을 localStorage에서 가져오기
 * @returns {string|null} - 저장된 토큰 또는 null
 */
function getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Access Token을 localStorage에서 삭제
 */
function removeAccessToken() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    console.log('🗑️ Access Token 삭제 완료');
}

/**
 * 사용자가 로그인했는지 확인
 * @returns {boolean} - 로그인 여부
 */
function isLoggedIn() {
    const token = getAccessToken();
    return token !== null && token !== '';
}

/**
 * 로그아웃 처리
 */
function logout() {
    removeAccessToken();
    window.location.href = '/login';
}