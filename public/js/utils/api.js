// ============================================
// API 호출 유틸리티 함수들
// ============================================

/**
 * 로그인 API 호출
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise} - fetch Promise
 */
function apiLogin(email, password) {
    const url = API_BASE_URL + API_ENDPOINTS.LOGIN;
    
    const data = {
        username: email,  // 백엔드에서 username으로 받음
        password: password
    };
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

/**
 * 회원가입 API 호출
 * @param {Object} userData - 회원가입 데이터
 * @returns {Promise} - fetch Promise
 */
function apiSignup(userData) {
    const url = API_BASE_URL + API_ENDPOINTS.SIGNUP;
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
}

/**
 * 이미지 업로드 API 호출
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise} - fetch Promise
 */
function apiUploadImage(file) {
    const url = API_BASE_URL + API_ENDPOINTS.IMAGES;
    
    // FormData 사용 (파일 업로드 시)
    const formData = new FormData();
    formData.append('file', file);
    
    return fetch(url, {
        method: 'POST',
        body: formData  // Content-Type은 자동으로 설정됨
    });
}

/**
 * 내 정보 조회 API 호출
 * @returns {Promise} - fetch Promise
 */
function apiGetMyInfo() {
    const url = API_BASE_URL + API_ENDPOINTS.MEMBER_ME;
    const token = getAccessToken();

    return fetch(url, {
        method: 'GET',
        headers: {
            'access': token  // 백엔드 설정에 맞춰 헤더 이름 사용
        }
    });
}

/**
 * 게시글 목록 조회 API 호출
 *
 * 백엔드 비유:
 * @GetMapping("/api/v1/posts")
 * public List<PostResponse> getPosts() { ... }
 *
 * @returns {Promise<Response>} - fetch Promise
 */
function apiGetPosts() {
    const url = API_BASE_URL + API_ENDPOINTS.POSTS;
    const token = getAccessToken();

    return fetch(url, {
        method: 'GET',
        headers: {
            'access': token  // 인증 필요한 경우 토큰 포함
        }
    });
}