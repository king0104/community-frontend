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
 * 로그아웃 처리 (백엔드 API 호출)
 */
async function logout() {
    try {
        // 백엔드 로그아웃 API 호출
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
            method: 'POST',
            credentials: 'include', // 쿠키 전송 (refresh token)
            headers: {
                'access': getAccessToken() || '' // access token 헤더 전송
            }
        });

        // 응답 상태와 상관없이 로컬 토큰 삭제
        removeAccessToken();

        if (response.ok) {
            console.log('✅ 로그아웃 성공');
        } else {
            console.warn('⚠️ 로그아웃 API 호출 실패, 로컬 토큰만 삭제');
        }
    } catch (error) {
        console.error('❌ 로그아웃 API 호출 오류:', error);
        // 에러가 발생해도 로컬 토큰은 삭제
        removeAccessToken();
    } finally {
        // 로그인 페이지로 이동
        window.location.href = '/';
    }
}