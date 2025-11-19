// ============================================
// 게시글 상세 페이지 JavaScript (수정/삭제 버튼 표시 로직 추가)
// ============================================

// 전역 변수
let currentPostId = null;
let currentMemberId = null;  // ✅ 추가: 현재 로그인한 사용자 ID
let postAuthorId = null;      // ✅ 추가: 게시글 작성자 ID
let isLiked = false;          // ✅ 추가: 좋아요 여부 (true = 좋아요 누름, false = 안 누름)

// ============================================
// 페이지 로드 시 실행
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 게시글 상세 페이지 로드');
    
    // 1. 로그인 확인
    if (!isLoggedIn()) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
    }
    
    // 2. URL에서 게시글 ID 가져오기
    currentPostId = getPostIdFromUrl();
    
    if (!currentPostId) {
        alert('잘못된 접근입니다.');
        window.location.href = '/posts';
        return;
    }
    
    console.log('📝 게시글 ID:', currentPostId);
    
    // 3. 이벤트 리스너 등록
    initEventListeners();
    
    // 4. 게시글 데이터 불러오기 (핵심!)
    loadPostDetail();
});

// ============================================
// URL에서 게시글 ID 가져오기
// ============================================
function getPostIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// ============================================
// 이벤트 리스너 등록
// ============================================
function initEventListeners() {
    // 수정 버튼
    const btnEdit = document.getElementById('btnEdit');
    btnEdit.addEventListener('click', function() {
        window.location.href = `edit-post.html?id=${currentPostId}`;
    });

    // 삭제 버튼
    const btnDelete = document.getElementById('btnDelete');
    btnDelete.addEventListener('click', handleDeletePost);

    // ✅ 좋아요 버튼
    const btnLike = document.getElementById('btnLike');
    btnLike.addEventListener('click', handleToggleLike);

    // ✅ 댓글 등록 버튼
    const btnCommentSubmit = document.getElementById('btnCommentSubmit');
    btnCommentSubmit.addEventListener('click', handleCreateComment);
}

// ============================================
// 게시글 상세 정보 불러오기 (핵심!)
// ============================================
async function loadPostDetail() {
    console.log('📡 게시글 상세 정보 요청 시작');
    
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const postDetail = document.getElementById('postDetail');
    
    try {
        // 1. 로딩 표시
        loading.style.display = 'block';
        postDetail.style.display = 'none';
        errorMessage.style.display = 'none';
        
        // 2. 동시에 두 API 호출
        // - 게시글 상세 정보
        // - 내 정보 (memberId 얻기 위해)
        const [postResponse, myInfoResponse] = await Promise.all([
            apiGetPostDetail(currentPostId),
            apiGetMyInfo()
        ]);
        
        // 3. 응답 확인
        if (!postResponse.ok || !myInfoResponse.ok) {
            throw new Error('데이터 조회 실패');
        }
        
        // 4. JSON 데이터 파싱
        const postData = await postResponse.json();
        const myInfo = await myInfoResponse.json();
        
        console.log('📥 게시글 데이터:', postData);
        console.log('📥 내 정보:', myInfo);
        
        // 5. 전역 변수에 저장
        currentMemberId = myInfo.memberId;
        postAuthorId = postData.memberId;  // ✅ 백엔드에서 추가한 필드
        isLiked = postData.isLiked || false;  // ✅ 좋아요 여부 저장

        console.log('🔍 비교: 내 ID =', currentMemberId, ', 작성자 ID =', postAuthorId);

        // 6. 화면에 데이터 표시
        renderPostDetail(postData);

        // 7. ✅ 수정/삭제 버튼 표시 여부 결정 (핵심!)
        checkAuthorAndShowButtons();

        // 8. ✅ 좋아요 버튼 UI 업데이트
        updateLikeButton();

        // 9. 로딩 숨기고 내용 표시
        loading.style.display = 'none';
        postDetail.style.display = 'block';

        // 10. ✅ 댓글 목록 불러오기
        loadComments();

    } catch (error) {
        console.error('❌ 게시글 로드 실패:', error);

        loading.style.display = 'none';
        errorMessage.style.display = 'block';
    }
}

// ============================================
// ✅ 수정/삭제 버튼 표시 여부 확인 (핵심!)
// ============================================
/**
 * 로그인한 사용자와 게시글 작성자가 같으면 수정/삭제 버튼 표시
 * 
 * 백엔드 비유:
 * if (loginMemberId.equals(post.getMember().getId())) {
 *     // 수정/삭제 가능
 * }
 */
function checkAuthorAndShowButtons() {
    console.log('🔐 권한 확인 중...');
    
    const postActions = document.getElementById('postActions');
    
    // memberId 비교 (타입까지 엄격하게 비교)
    if (currentMemberId === postAuthorId) {
        // 본인이 작성한 게시글 → 버튼 표시
        postActions.style.display = 'flex';
        console.log('✅ 본인 게시글입니다. 수정/삭제 버튼 표시!');
    } else {
        // 다른 사람이 작성한 게시글 → 버튼 숨김
        postActions.style.display = 'none';
        console.log('❌ 다른 사람의 게시글입니다. 버튼 숨김!');
    }
}

// ============================================
// 게시글 데이터를 화면에 표시
// ============================================
function renderPostDetail(postData) {
    console.log('🎨 게시글 렌더링 시작');
    
    // 제목
    const postTitle = document.getElementById('postTitle');
    postTitle.textContent = postData.title;
    
    // 작성자 프로필 이미지
    const authorProfile = document.getElementById('authorProfile');
    authorProfile.src = postData.memberProfileImageUrl || '/images/default-profile.png';
    
    // 작성자 닉네임
    const authorName = document.getElementById('authorName');
    authorName.textContent = postData.memberNickname;
    
    // 작성 날짜
    const postDate = document.getElementById('postDate');
    postDate.textContent = formatDate(postData.createdAt);
    
    // 게시글 이미지
    if (postData.imageUrls && postData.imageUrls.length > 0) {
        const postImages = document.getElementById('postImages');
        postImages.innerHTML = '';
        
        postData.imageUrls.forEach(imageUrl => {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'post-image';
            img.alt = '게시글 이미지';
            postImages.appendChild(img);
        });
    }
    
    // 게시글 내용
    const postContent = document.getElementById('postContent');
    postContent.textContent = postData.content;
    
    // 통계
    document.getElementById('viewCount').textContent = postData.viewCount || 0;
    document.getElementById('likeCount').textContent = postData.likeCount || 0;
    document.getElementById('commentCount').textContent = postData.commentCount || 0;
    
    console.log('✅ 게시글 렌더링 완료');
}

// ============================================
// 날짜 포맷팅
// ============================================
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// ============================================
// 게시글 삭제 처리
// ============================================
async function handleDeletePost() {
    console.log('🗑️ 게시글 삭제 시도');

    // 확인 메시지
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    try {
        const response = await apiDeletePost(currentPostId);

        if (response.ok) {
            console.log('✅ 게시글 삭제 성공');
            alert('게시글이 삭제되었습니다.');

            // 게시글 목록으로 이동
            window.location.href = '/posts';
        } else {
            const errorData = await response.json();
            console.error('❌ 삭제 실패:', errorData);
            alert(errorData.message || '게시글 삭제에 실패했습니다.');
        }

    } catch (error) {
        console.error('❌ 삭제 요청 중 에러:', error);
        alert('네트워크 오류가 발생했습니다.');
    }
}

// ============================================
// ✅ 좋아요 토글 처리 (핵심!)
// ============================================
/**
 * 좋아요 버튼 클릭 시 호출
 *
 * 백엔드 비유:
 * - 좋아요 안 눌렀으면 → POST /api/v1/posts/{postId}/likes (좋아요 추가)
 * - 좋아요 눌렀으면 → DELETE /api/v1/posts/{postId}/likes (좋아요 취소)
 *
 * 흐름:
 * 1. 현재 좋아요 상태 확인 (isLiked)
 * 2. 상태에 따라 적절한 API 호출
 * 3. 성공 시 상태 업데이트 + UI 업데이트
 */
async function handleToggleLike() {
    console.log('👍 좋아요 토글 시도, 현재 상태:', isLiked);

    try {
        let response;

        // 좋아요 상태에 따라 다른 API 호출
        if (isLiked) {
            // 이미 좋아요를 누른 상태 → 좋아요 취소
            console.log('📡 좋아요 취소 요청');
            response = await apiUnlikePost(currentPostId);
        } else {
            // 좋아요 안 누른 상태 → 좋아요 추가
            console.log('📡 좋아요 추가 요청');
            response = await apiLikePost(currentPostId);
        }

        // 응답 확인
        if (!response.ok) {
            throw new Error('좋아요 처리 실패');
        }

        // 응답 데이터 파싱
        const data = await response.json();
        console.log('📥 좋아요 응답:', data);

        // ✅ 좋아요 상태 반전 (토글)
        isLiked = !isLiked;

        // ✅ 좋아요 수 업데이트 (백엔드에서 받은 최신 값)
        // PostLikeResponse에 likeCount가 있다고 가정
        if (data.likeCount !== undefined) {
            const likeCountElement = document.getElementById('likeCount');
            likeCountElement.textContent = data.likeCount;
        }

        // ✅ 좋아요 버튼 UI 업데이트
        updateLikeButton();

        console.log('✅ 좋아요 처리 성공, 새로운 상태:', isLiked);

    } catch (error) {
        console.error('❌ 좋아요 처리 실패:', error);
        alert('좋아요 처리에 실패했습니다.');
    }
}

// ============================================
// ✅ 좋아요 버튼 UI 업데이트
// ============================================
/**
 * 좋아요 상태에 따라 버튼 스타일 변경
 *
 * 좋아요 누른 상태:
 * - 버튼에 'liked' 클래스 추가 → CSS로 스타일 변경 (파란색 등)
 * - 텍스트: "좋아요 취소"
 *
 * 좋아요 안 누른 상태:
 * - 버튼에서 'liked' 클래스 제거 → 기본 스타일
 * - 텍스트: "좋아요"
 */
function updateLikeButton() {
    const btnLike = document.getElementById('btnLike');
    const likeText = btnLike.querySelector('.like-text');

    if (isLiked) {
        // 좋아요 누른 상태
        btnLike.classList.add('liked');
        likeText.textContent = '좋아요 취소';
        console.log('🎨 좋아요 버튼 → 좋아요 누른 상태로 변경');
    } else {
        // 좋아요 안 누른 상태
        btnLike.classList.remove('liked');
        likeText.textContent = '좋아요';
        console.log('🎨 좋아요 버튼 → 기본 상태로 변경');
    }
}

// ============================================
// 💡 학습 노트: 권한 확인 로직
// ============================================
/*
수정/삭제 버튼 표시 로직:

1. 게시글 조회 시 작성자 memberId 받기
2. 로그인한 사용자의 memberId 받기
3. 두 ID 비교
4. 같으면 버튼 표시, 다르면 숨김

백엔드와의 비교:

백엔드 (Java):
if (loginMemberId.equals(post.getMember().getId())) {
    // 수정/삭제 허용
} else {
    throw new ForbiddenException();
}

프론트엔드 (JavaScript):
if (currentMemberId === postAuthorId) {
    postActions.style.display = 'flex';  // 버튼 표시
} else {
    postActions.style.display = 'none';  // 버튼 숨김
}

차이점:
- 백엔드: 서버에서 실제 권한 검증 (보안)
- 프론트엔드: UI만 제어 (사용자 경험)

중요: 프론트엔드에서 버튼을 숨겨도, 백엔드에서 다시 권한을 검증함!
따라서 프론트엔드는 "편의성", 백엔드는 "보안"을 담당
*/

// ============================================
// ✅ 댓글 등록 처리 (핵심!)
// ============================================
/**
 * 댓글 등록 버튼 클릭 시 호출
 *
 * 백엔드 비유:
 * POST /api/v1/posts/{postId}/comments
 * Body: { "content": "댓글 내용" }
 *
 * 흐름:
 * 1. 댓글 내용 가져오기
 * 2. 유효성 검사
 * 3. API 호출
 * 4. 성공 시 댓글 목록 다시 불러오기 + 입력창 초기화
 */
async function handleCreateComment() {
    console.log('💬 댓글 등록 시도');

    // 1. 댓글 내용 가져오기
    const commentContent = document.getElementById('commentContent');
    const content = commentContent.value.trim();

    // 2. 유효성 검사
    if (!content) {
        alert('댓글 내용을 입력해주세요.');
        commentContent.focus();
        return;
    }

    try {
        // 3. API 호출
        console.log('📡 댓글 등록 요청');
        const response = await apiCreateComment(currentPostId, {
            content: content
        });

        // 4. 응답 확인
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '댓글 등록 실패');
        }

        const data = await response.json();
        console.log('📥 댓글 등록 성공:', data);

        // 5. 댓글 입력창 초기화
        commentContent.value = '';

        // 6. 댓글 목록 다시 불러오기 (loadComments가 댓글 수도 업데이트함)
        await loadComments();

        console.log('✅ 댓글 등록 완료');

    } catch (error) {
        console.error('❌ 댓글 등록 실패:', error);
        alert(error.message || '댓글 등록에 실패했습니다.');
    }
}

// ============================================
// ✅ 댓글 목록 불러오기
// ============================================
/**
 * 댓글 목록 API 호출 및 렌더링
 *
 * 백엔드 비유:
 * GET /api/v1/posts/{postId}/comments
 *
 * 흐름:
 * 1. API 호출
 * 2. 응답 데이터 파싱
 * 3. 댓글 목록 렌더링
 */
async function loadComments() {
    console.log('📡 댓글 목록 요청');

    try {
        // 1. API 호출
        const response = await apiGetComments(currentPostId);

        // 2. 응답 확인
        if (!response.ok) {
            throw new Error('댓글 목록 조회 실패');
        }

        // 3. JSON 데이터 파싱
        const comments = await response.json();
        console.log('📥 댓글 목록:', comments);

        // 4. 댓글 목록 렌더링
        renderComments(comments);

        // 5. ✅ 댓글 수 업데이트 (실제 댓글 개수로)
        const commentCountElement = document.getElementById('commentCount');
        commentCountElement.textContent = comments.length;
        console.log('✅ 댓글 수 업데이트:', comments.length);

        console.log('✅ 댓글 목록 로드 완료');

    } catch (error) {
        console.error('❌ 댓글 목록 로드 실패:', error);
        // 댓글 목록 로드 실패는 치명적이지 않으므로 에러 메시지만 출력
    }
}

// ============================================
// ✅ 댓글 목록 렌더링
// ============================================
/**
 * 댓글 데이터를 화면에 표시
 *
 * CommentResponse 구조:
 * {
 *   "id": 123,
 *   "content": "댓글 내용",
 *   "memberId": 1,
 *   "memberNickname": "작성자",
 *   "memberProfileImageUrl": "https://...",
 *   "createdAt": "2024-01-01T12:00:00"
 * }
 */
function renderComments(comments) {
    console.log('🎨 댓글 렌더링 시작, 개수:', comments.length);

    const commentsList = document.getElementById('commentsList');

    // 댓글이 없는 경우
    if (!comments || comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">첫 댓글을 남겨보세요!</p>';
        return;
    }

    // 댓글 목록 HTML 생성
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item" data-comment-id="${comment.id}">
            <div class="comment-header">
                <div class="comment-author">
                    <img src="${comment.memberProfileImageUrl || '/images/default-profile.png'}"
                         alt="프로필"
                         class="comment-profile">
                    <span class="comment-nickname">${comment.memberNickname}</span>
                </div>
                <span class="comment-date">${formatDate(comment.createdAt)}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
            ${comment.memberId === currentMemberId ? `
                <div class="comment-actions">
                    <button class="btn-comment-edit" onclick="handleEditComment(${comment.id})">수정</button>
                    <button class="btn-comment-delete" onclick="handleDeleteComment(${comment.id})">삭제</button>
                </div>
            ` : ''}
        </div>
    `).join('');

    console.log('✅ 댓글 렌더링 완료');
}

// ============================================
// ✅ 댓글 수정 처리 (인라인 편집)
// ============================================
/**
 * 댓글 수정 버튼 클릭 시 호출 - 인라인 편집 모드로 전환
 *
 * 흐름:
 * 1. 댓글 내용을 textarea로 변경
 * 2. 수정/삭제 버튼을 저장/취소 버튼으로 변경
 * 3. 원본 내용을 data 속성에 저장 (취소 시 복원용)
 */
function handleEditComment(commentId) {
    console.log('✏️ 댓글 편집 모드 진입:', commentId);

    // 수정할 댓글 요소 찾기
    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
    const commentContentElement = commentItem.querySelector('.comment-content');
    const commentActionsElement = commentItem.querySelector('.comment-actions');

    // 현재 댓글 내용 가져오기
    const currentContent = commentContentElement.textContent;

    // 원본 내용 저장 (취소 시 복원용)
    commentItem.setAttribute('data-original-content', currentContent);

    // 댓글 내용을 textarea로 변경
    commentContentElement.innerHTML = `
        <textarea class="comment-edit-textarea" rows="3">${currentContent}</textarea>
    `;

    // 수정/삭제 버튼을 저장/취소 버튼으로 변경
    commentActionsElement.innerHTML = `
        <button class="btn-comment-save" onclick="saveEditComment(${commentId})">저장</button>
        <button class="btn-comment-cancel" onclick="cancelEditComment(${commentId})">취소</button>
    `;

    // textarea에 포커스
    const textarea = commentContentElement.querySelector('.comment-edit-textarea');
    textarea.focus();
    // 커서를 끝으로 이동
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    console.log('✅ 편집 모드로 전환 완료');
}

// ============================================
// ✅ 댓글 수정 저장
// ============================================
/**
 * 저장 버튼 클릭 시 호출 - 수정된 내용을 서버에 저장
 *
 * 백엔드 비유:
 * PATCH /api/v1/posts/{postId}/comments/{commentId}
 * Body: { "content": "수정된 댓글 내용" }
 */
async function saveEditComment(commentId) {
    console.log('💾 댓글 수정 저장 시도:', commentId);

    // 댓글 요소 찾기
    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
    const textarea = commentItem.querySelector('.comment-edit-textarea');
    const newContent = textarea.value.trim();

    // 유효성 검사
    if (!newContent) {
        alert('댓글 내용을 입력해주세요.');
        textarea.focus();
        return;
    }

    try {
        // API 호출
        console.log('📡 댓글 수정 요청');
        const response = await apiUpdateComment(currentPostId, commentId, {
            content: newContent
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '댓글 수정 실패');
        }

        console.log('✅ 댓글 수정 성공');

        // 댓글 목록 다시 불러오기
        await loadComments();

    } catch (error) {
        console.error('❌ 댓글 수정 실패:', error);
        alert(error.message || '댓글 수정에 실패했습니다.');
    }
}

// ============================================
// ✅ 댓글 수정 취소
// ============================================
/**
 * 취소 버튼 클릭 시 호출 - 편집 모드 종료하고 원래 상태로 복원
 */
function cancelEditComment(commentId) {
    console.log('❌ 댓글 수정 취소:', commentId);

    // 댓글 요소 찾기
    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
    const commentContentElement = commentItem.querySelector('.comment-content');
    const commentActionsElement = commentItem.querySelector('.comment-actions');

    // 원본 내용 가져오기
    const originalContent = commentItem.getAttribute('data-original-content');

    // 원래 댓글 내용으로 복원
    commentContentElement.textContent = originalContent;

    // 수정/삭제 버튼으로 복원
    commentActionsElement.innerHTML = `
        <button class="btn-comment-edit" onclick="handleEditComment(${commentId})">수정</button>
        <button class="btn-comment-delete" onclick="handleDeleteComment(${commentId})">삭제</button>
    `;

    // 저장된 원본 내용 속성 제거
    commentItem.removeAttribute('data-original-content');

    console.log('✅ 편집 모드 종료');
}

// ============================================
// ✅ 댓글 삭제 처리
// ============================================
/**
 * 댓글 삭제 버튼 클릭 시 호출
 *
 * 백엔드 비유:
 * DELETE /api/v1/posts/{postId}/comments/{commentId}
 */
async function handleDeleteComment(commentId) {
    console.log('🗑️ 댓글 삭제 시도:', commentId);

    // 확인 메시지
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    try {
        // API 호출
        console.log('📡 댓글 삭제 요청');
        const response = await apiDeleteComment(currentPostId, commentId);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '댓글 삭제 실패');
        }

        console.log('✅ 댓글 삭제 성공');

        // 댓글 목록 다시 불러오기 (loadComments가 댓글 수도 업데이트함)
        await loadComments();

    } catch (error) {
        console.error('❌ 댓글 삭제 실패:', error);
        alert(error.message || '댓글 삭제에 실패했습니다.');
    }
}

// ============================================
// 💡 학습 노트: 댓글 기능 구현
// ============================================
/*
댓글 기능의 핵심 개념:

1. CRUD 패턴 (Create, Read, Update, Delete)
─────────────────────────

댓글은 전형적인 CRUD 기능:
- Create (생성): POST /api/v1/posts/{postId}/comments
- Read (조회): GET /api/v1/posts/{postId}/comments
- Update (수정): PATCH /api/v1/posts/{postId}/comments/{commentId}
- Delete (삭제): DELETE /api/v1/posts/{postId}/comments/{commentId}


2. 댓글 등록 흐름
─────────────────────────

1. 사용자가 댓글 내용 입력
2. "댓글 등록" 버튼 클릭
3. handleCreateComment() 호출
4. 유효성 검사 (빈 문자열 체크)
5. apiCreateComment() API 호출
6. 성공 시:
   - 입력창 초기화
   - 댓글 목록 다시 불러오기
   - 댓글 수 +1


3. 댓글 목록 렌더링
─────────────────────────

renderComments() 함수:
- 댓글 배열을 받아서 HTML 생성
- Array.map()으로 각 댓글을 HTML로 변환
- join('')으로 배열을 문자열로 합침
- innerHTML에 할당하여 한 번에 렌더링

템플릿 리터럴 활용:
- 백틱(`)으로 여러 줄 문자열 작성
- ${변수}로 변수 삽입
- 조건부 렌더링: ${조건 ? '표시' : ''}


4. 권한 확인
─────────────────────────

수정/삭제 버튼 표시 조건:
${comment.memberId === currentMemberId ? '버튼 HTML' : ''}

→ 댓글 작성자와 로그인한 사용자가 같을 때만 버튼 표시
→ 백엔드에서도 동일하게 권한 검증


5. 동적 이벤트 핸들러
─────────────────────────

onclick 속성 사용:
<button onclick="handleDeleteComment(${comment.commentId})">삭제</button>

주의:
- 함수가 전역 스코프에 있어야 함
- 더 나은 방법: 이벤트 위임 (event delegation)


6. 데이터 속성 활용
─────────────────────────

data-comment-id 속성:
<div class="comment-item" data-comment-id="${comment.commentId}">

→ HTML 요소에 데이터를 저장
→ querySelector로 나중에 찾을 수 있음
→ 수정 시 현재 댓글 내용을 가져올 때 사용


7. 낙관적 업데이트 vs 비관적 업데이트
─────────────────────────

현재 구현 (비관적):
1. API 호출
2. 성공하면 댓글 목록 다시 불러오기

낙관적 업데이트 (더 좋은 UX):
1. 즉시 UI에 댓글 추가
2. API 호출
3. 실패하면 추가한 댓글 제거


8. 에러 처리
─────────────────────────

try-catch로 에러 처리:
try {
    const response = await apiCreateComment(...);
    if (!response.ok) throw new Error();
    // 성공 처리
} catch (error) {
    alert('댓글 등록에 실패했습니다.');
}


9. 개발 순서
─────────────────────────

1단계: 백엔드 API 확인
→ 엔드포인트, 메서드, 요청/응답 형식 확인

2단계: API 호출 함수 작성
→ utils/api.js에 함수 추가

3단계: 이벤트 리스너 등록
→ initEventListeners()에 버튼 클릭 이벤트 추가

4단계: 이벤트 핸들러 작성
→ handleCreateComment() 등 구현

5단계: 렌더링 함수 작성
→ renderComments() 구현

6단계: CSS 스타일 추가
→ 댓글 목록, 댓글 아이템 스타일 정의


10. 디버깅 팁
─────────────────────────

console.log 활용:
- API 호출 전후
- 렌더링 전후
- 에러 발생 시

개발자 도구 활용:
- Network 탭: API 요청/응답 확인
- Console 탭: 에러 메시지 확인
- Elements 탭: 렌더링된 HTML 확인
*/

// ============================================
// 💡 학습 노트: 좋아요 기능 구현
// ============================================
/*
좋아요 기능의 핵심 개념:

1. 토글(Toggle) 패턴
─────────────────────────

토글이란?
→ 스위치처럼 on/off를 번갈아 바꾸는 것
→ 좋아요 버튼: 누르면 좋아요 추가, 다시 누르면 좋아요 취소

백엔드와 프론트엔드의 역할:

백엔드 (Java):
@PostMapping("/api/v1/posts/{postId}/likes")
→ 좋아요 추가

@DeleteMapping("/api/v1/posts/{postId}/likes")
→ 좋아요 취소

프론트엔드 (JavaScript):
- 현재 상태 관리 (isLiked)
- 상태에 따라 적절한 API 호출
- UI 업데이트 (버튼 색상, 텍스트 변경)


2. 상태 관리 (State Management)
─────────────────────────

let isLiked = false;  // 전역 변수로 상태 관리

좋아요 토글 시:
1. 현재 상태 확인 (isLiked)
2. API 호출 (POST 또는 DELETE)
3. 성공 시 상태 반전 (isLiked = !isLiked)
4. UI 업데이트


3. 낙관적 업데이트 vs 비관적 업데이트
─────────────────────────

비관적 업데이트 (현재 구현):
1. API 호출
2. 성공하면 → 상태 변경 + UI 업데이트
3. 실패하면 → 그대로 유지

낙관적 업데이트 (더 좋은 UX):
1. 즉시 상태 변경 + UI 업데이트
2. API 호출
3. 실패하면 → 원래대로 되돌림

→ 현재는 비관적 업데이트 방식 (안전하지만 약간 느림)


4. REST API와 HTTP 메서드
─────────────────────────

좋아요 추가:
POST /api/v1/posts/{postId}/likes
→ 리소스 생성 (좋아요 레코드 생성)

좋아요 취소:
DELETE /api/v1/posts/{postId}/likes
→ 리소스 삭제 (좋아요 레코드 삭제)

백엔드 DB 구조 예상:
post_like 테이블
- id
- post_id
- member_id
- created_at


5. CSS 클래스로 스타일 제어
─────────────────────────

JavaScript로 클래스 추가/제거:
btnLike.classList.add('liked');     // 클래스 추가
btnLike.classList.remove('liked');  // 클래스 제거

CSS에서 스타일 정의:
.btn-like {
    background-color: white;  // 기본 상태
}

.btn-like.liked {
    background-color: #7F6AEE;  // 좋아요 누른 상태
    color: white;
}


6. 백엔드 응답 데이터 활용
─────────────────────────

PostLikeResponse (백엔드):
{
    "likeCount": 123  // 업데이트된 좋아요 수
}

프론트엔드:
- 응답에서 likeCount 추출
- 화면의 좋아요 수 업데이트
- 항상 최신 데이터 유지


7. 에러 처리
─────────────────────────

try-catch로 에러 처리:
try {
    const response = await apiLikePost(postId);
    if (!response.ok) throw new Error();
    // 성공 처리
} catch (error) {
    // 에러 처리: 사용자에게 알림
    alert('좋아요 처리에 실패했습니다.');
}


8. 개발 순서 (혼자 개발할 때)
─────────────────────────

1단계: 백엔드 API 확인
→ 어떤 엔드포인트? 어떤 메서드? 어떤 응답?

2단계: API 호출 함수 작성
→ utils/api.js에 apiLikePost, apiUnlikePost 추가

3단계: 상태 관리
→ 전역 변수 isLiked 추가

4단계: 이벤트 핸들러 작성
→ handleToggleLike 함수 구현

5단계: UI 업데이트 함수
→ updateLikeButton 함수 구현

6단계: 이벤트 리스너 등록
→ initEventListeners에 버튼 클릭 이벤트 추가

7단계: CSS 스타일 추가
→ .btn-like.liked 스타일 정의


9. 디버깅 팁
─────────────────────────

console.log 활용:
- API 호출 전: 현재 상태 출력
- API 응답 후: 응답 데이터 출력
- 상태 변경 후: 새로운 상태 출력

개발자 도구 활용:
- Network 탭: API 요청/응답 확인
- Console 탭: 로그 메시지 확인
- Elements 탭: 클래스 추가/제거 확인
*/