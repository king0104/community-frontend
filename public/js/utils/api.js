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
 * 백엔드: PostController.getPostList()
 * @GetMapping("/api/v1/posts")
 * 
 * 커서 기반 페이지네이션 사용
 * - cursor: 마지막으로 본 게시글 ID
 * - size: 가져올 게시글 개수 (기본 20개)
 * 
 * @param {number|null} cursor - 커서 (없으면 첫 페이지)
 * @param {number} size - 페이지 크기
 * @returns {Promise<Response>} - fetch Promise
 */
function apiGetPosts(cursor = null, size = 20) {
    // URL 파라미터 구성
    let url = API_BASE_URL + API_ENDPOINTS.POSTS + `?size=${size}`;
    if (cursor) {
        url += `&cursor=${cursor}`;
    }
    
    const token = getAccessToken();
    
    return fetch(url, {
        method: 'GET',
        headers: {
            'access': token  // 인증 필요한 경우 토큰 포함
        }
    });
}

/**
 * 게시글 상세 조회 API 호출
 * 
 * 백엔드: PostController.getPostDetail()
 * @GetMapping("/api/v1/posts/{postId}")
 * 
 * @param {number} postId - 게시글 ID
 * @returns {Promise<Response>} - fetch Promise
 */
function apiGetPostDetail(postId) {
    const url = API_BASE_URL + API_ENDPOINTS.POSTS + `/${postId}`;
    const token = getAccessToken();
    
    return fetch(url, {
        method: 'GET',
        headers: {
            'access': token
        }
    });
}

/**
 * 게시글 작성 API 호출
 * 
 * 백엔드: PostController.createPost()
 * @PostMapping("/api/v1/posts")
 * 
 * @param {Object} postData - 게시글 데이터
 * @param {string} postData.title - 제목 (최대 100자)
 * @param {string} postData.content - 내용
 * @returns {Promise<Response>} - fetch Promise
 */
function apiCreatePost(postData) {
    const url = API_BASE_URL + API_ENDPOINTS.POSTS;
    const token = getAccessToken();
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'access': token
        },
        body: JSON.stringify(postData)
    });
}

/**
 * 게시글 수정 API 호출
 * 
 * 백엔드: PostController.updatePost()
 * @PatchMapping("/api/v1/posts/{postId}")
 * 
 * @param {number} postId - 게시글 ID
 * @param {Object} updateData - 수정할 데이터
 * @param {string} updateData.title - 제목 (최대 26자)
 * @param {string} updateData.content - 내용
 * @param {Array<number>} updateData.imageIds - 이미지 ID 목록
 * @returns {Promise<Response>} - fetch Promise
 */
function apiUpdatePost(postId, updateData) {
    const url = API_BASE_URL + API_ENDPOINTS.POSTS + `/${postId}`;
    const token = getAccessToken();
    
    return fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'access': token
        },
        body: JSON.stringify(updateData)
    });
}

/**
 * 게시글 삭제 API 호출
 *
 * 백엔드: PostController.deletePost()
 * @DeleteMapping("/api/v1/posts/{postId}")
 *
 * @param {number} postId - 게시글 ID
 * @returns {Promise<Response>} - fetch Promise
 */
function apiDeletePost(postId) {
    const url = API_BASE_URL + API_ENDPOINTS.POSTS + `/${postId}`;
    const token = getAccessToken();

    return fetch(url, {
        method: 'DELETE',
        headers: {
            'access': token
        }
    });
}

/**
 * 좋아요 추가 API 호출
 *
 * 백엔드: PostLikeController.like()
 * @PostMapping("/api/v1/posts/{postId}/likes")
 *
 * @param {number} postId - 게시글 ID
 * @returns {Promise<Response>} - fetch Promise
 */
function apiLikePost(postId) {
    const url = API_BASE_URL + API_ENDPOINTS.POSTS + `/${postId}/likes`;
    const token = getAccessToken();

    return fetch(url, {
        method: 'POST',
        headers: {
            'access': token
        }
    });
}

/**
 * 좋아요 취소 API 호출
 *
 * 백엔드: PostLikeController.unlike()
 * @DeleteMapping("/api/v1/posts/{postId}/likes")
 *
 * @param {number} postId - 게시글 ID
 * @returns {Promise<Response>} - fetch Promise
 */
function apiUnlikePost(postId) {
    const url = API_BASE_URL + API_ENDPOINTS.POSTS + `/${postId}/likes`;
    const token = getAccessToken();

    return fetch(url, {
        method: 'DELETE',
        headers: {
            'access': token
        }
    });
}

/**
 * 댓글 생성 API 호출
 *
 * 백엔드: CommentController.createComment()
 * @PostMapping("/api/v1/posts/{postId}/comments")
 *
 * @param {number} postId - 게시글 ID
 * @param {Object} commentData - 댓글 데이터
 * @param {string} commentData.content - 댓글 내용
 * @returns {Promise<Response>} - fetch Promise
 */
function apiCreateComment(postId, commentData) {
    const url = API_BASE_URL + API_ENDPOINTS.POSTS + `/${postId}/comments`;
    const token = getAccessToken();

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'access': token
        },
        body: JSON.stringify(commentData)
    });
}

/**
 * 댓글 목록 조회 API 호출
 *
 * 백엔드: CommentController.getComments()
 * @GetMapping("/api/v1/posts/{postId}/comments")
 *
 * @param {number} postId - 게시글 ID
 * @returns {Promise<Response>} - fetch Promise
 */
function apiGetComments(postId) {
    const url = API_BASE_URL + API_ENDPOINTS.POSTS + `/${postId}/comments`;
    const token = getAccessToken();

    return fetch(url, {
        method: 'GET',
        headers: {
            'access': token
        }
    });
}

/**
 * 댓글 수정 API 호출
 *
 * 백엔드: CommentController.updateComment()
 * @PatchMapping("/api/v1/posts/{postId}/comments/{commentId}")
 *
 * @param {number} postId - 게시글 ID
 * @param {number} commentId - 댓글 ID
 * @param {Object} updateData - 수정할 데이터
 * @param {string} updateData.content - 댓글 내용
 * @returns {Promise<Response>} - fetch Promise
 */
function apiUpdateComment(postId, commentId, updateData) {
    const url = API_BASE_URL + API_ENDPOINTS.POSTS + `/${postId}/comments/${commentId}`;
    const token = getAccessToken();

    return fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'access': token
        },
        body: JSON.stringify(updateData)
    });
}

/**
 * 댓글 삭제 API 호출
 *
 * 백엔드: CommentController.deleteComment()
 * @DeleteMapping("/api/v1/posts/{postId}/comments/{commentId}")
 *
 * @param {number} postId - 게시글 ID
 * @param {number} commentId - 댓글 ID
 * @returns {Promise<Response>} - fetch Promise
 */
function apiDeleteComment(postId, commentId) {
    const url = API_BASE_URL + API_ENDPOINTS.POSTS + `/${postId}/comments/${commentId}`;
    const token = getAccessToken();

    return fetch(url, {
        method: 'DELETE',
        headers: {
            'access': token
        }
    });
}

