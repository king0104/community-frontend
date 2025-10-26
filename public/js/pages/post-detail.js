// ============================================
// 게시글 상세 페이지 JavaScript (수정/삭제 버튼 표시 로직 추가)
// ============================================

// 전역 변수
let currentPostId = null;
let currentMemberId = null;  // ✅ 추가: 현재 로그인한 사용자 ID
let postAuthorId = null;      // ✅ 추가: 게시글 작성자 ID

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
        
        console.log('🔍 비교: 내 ID =', currentMemberId, ', 작성자 ID =', postAuthorId);
        
        // 6. 화면에 데이터 표시
        renderPostDetail(postData);
        
        // 7. ✅ 수정/삭제 버튼 표시 여부 결정 (핵심!)
        checkAuthorAndShowButtons();
        
        // 8. 로딩 숨기고 내용 표시
        loading.style.display = 'none';
        postDetail.style.display = 'block';
        
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