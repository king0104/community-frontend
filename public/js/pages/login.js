// ============================================
// 로그인 페이지 전용 JavaScript
// 공통 함수들은 utils 폴더에서 가져와서 사용
// ============================================

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 로그인 페이지 로드');
    
    // 이미 로그인되어 있으면 게시글 페이지로 이동
    if (isLoggedIn()) {
        console.log('이미 로그인되어 있습니다.');
        window.location.href = 'posts.html';
        return;
    }   
    
    // 로그인 폼 이벤트 리스너 등록
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
});

/**
 * 로그인 처리 함수
 */
function handleLogin(event) {
    event.preventDefault();
    console.log('🔵 로그인 시도');
    
    // 1. 입력값 가져오기
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // 2. 입력값 검증 (validation.js의 함수 사용)
    if (!validateLoginInputs(email, password)) {
        return;
    }
    
    // 3. 로그인 API 호출 (api.js의 함수 사용)
    apiLogin(email, password)
        .then(response => {
            if (response.ok) {
                return handleLoginSuccess(response);
            } else {
                handleLoginError(response);
            }
        })
        .catch(error => {
            console.error('로그인 에러:', error);
            alert(MESSAGES.NETWORK_ERROR);
        });
}

/**
 * 로그인 성공 처리
 */
function handleLoginSuccess(response) {
    console.log('✅ 로그인 성공');
    
    // Access Token 저장 (auth.js의 함수 사용)
    const token = response.headers.get('access');
    if (token) {
        saveAccessToken(token);
    }
    
    alert(MESSAGES.LOGIN_SUCCESS);
    window.location.href = 'posts.html';
}

/**
 * 로그인 실패 처리
 */
function handleLoginError(response) {
    console.log('❌ 로그인 실패:', response.status);
    
    if (response.status === 401) {
        alert(MESSAGES.LOGIN_FAILED);
    } else {
        alert('로그인에 실패했습니다.');
    }
}