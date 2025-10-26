// ============================================
// 게시글 수정 페이지 JavaScript
// ============================================
// 💡 백엔드 개발자를 위한 쉬운 설명!
// 
// 수정 페이지의 흐름:
// 1. URL에서 게시글 ID 가져오기 (예: edit-post.html?id=123)
// 2. 서버에서 해당 게시글 정보 불러오기 (GET /api/v1/posts/123)
// 3. 폼에 기존 데이터 채우기 (제목, 내용, 이미지)
// 4. 사용자가 수정
// 5. 수정 완료 버튼 클릭 시 서버에 PATCH 요청
// 6. 성공하면 상세 페이지로 이동
// ============================================

// ============================================
// 전역 변수
// ============================================
let currentPostId = null;           // 현재 수정 중인 게시글 ID
let selectedImageFile = null;       // 새로 선택한 이미지 파일
let uploadedImageId = null;         // 새로 업로드한 이미지 ID
let existingImageIds = [];          // 기존 게시글의 이미지 ID 목록

// ============================================
// 페이지 로드 시 실행
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 게시글 수정 페이지 로드');
    
    // 1. 로그인 확인
    if (!isLoggedIn()) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
    }
    
    // 2. URL에서 게시글 ID 가져오기
    // 예: edit-post.html?id=123 → 123을 추출
    currentPostId = getPostIdFromUrl();
    
    if (!currentPostId) {
        alert('잘못된 접근입니다.');
        window.location.href = '/posts';
        return;
    }
    
    console.log('📝 수정할 게시글 ID:', currentPostId);
    
    // 3. 이벤트 리스너 등록
    initEventListeners();
    
    // 4. 게시글 데이터 불러오기 (핵심!)
    loadPostData();
});

// ============================================
// URL에서 게시글 ID 추출하기
// ============================================
/**
 * URL의 쿼리 파라미터에서 게시글 ID를 가져옴
 * 
 * 백엔드 비유:
 * - @RequestParam("id") Integer id
 * - request.getParameter("id")
 * 
 * 예시:
 * URL: http://localhost:3000/edit-post.html?id=123
 * 결과: "123" 반환
 * 
 * @returns {string|null} - 게시글 ID (없으면 null)
 */
function getPostIdFromUrl() {
    // URLSearchParams: URL의 쿼리 파라미터를 쉽게 다루는 내장 객체
    // window.location.search: URL의 ? 뒤 부분 (예: "?id=123")
    const params = new URLSearchParams(window.location.search);
    
    // 'id' 파라미터의 값을 가져옴
    const postId = params.get('id');
    
    console.log('🔍 URL에서 추출한 게시글 ID:', postId);
    
    return postId;
}

// ============================================
// 이벤트 리스너 초기화
// ============================================
function initEventListeners() {
    // 1. 뒤로가기 버튼
    const btnBack = document.getElementById('btnBack');
    btnBack.addEventListener('click', function() {
        // 상세 페이지로 돌아가기
        window.location.href = `post-detail.html?id=${currentPostId}`;
    });
    
    // 2. 프로필 아이콘 클릭
    const userProfile = document.getElementById('userProfile');
    userProfile.addEventListener('click', function() {
        console.log('프로필 클릭');
    });
    
    // 3. 게시글 수정 폼 제출
    const editPostForm = document.getElementById('editPostForm');
    editPostForm.addEventListener('submit', handleSubmit);
    
    // 4. 이미지 파일 선택
    const postImageInput = document.getElementById('postImage');
    postImageInput.addEventListener('change', handleImageSelect);
    
    // 5. 이미지 삭제 버튼
    const btnRemoveImage = document.getElementById('btnRemoveImage');
    btnRemoveImage.addEventListener('click', handleRemoveImage);
}

// ============================================
// 게시글 데이터 불러오기 (핵심!)
// ============================================
/**
 * 서버에서 게시글 상세 정보를 가져와서 폼에 채우기
 * 
 * 백엔드 API: GET /api/v1/posts/{postId}
 * 
 * 흐름:
 * 1. 로딩 표시
 * 2. API 호출
 * 3. 응답 성공 → 폼에 데이터 채우기
 * 4. 응답 실패 → 에러 메시지 표시
 */
async function loadPostData() {
    console.log('📡 게시글 데이터 요청 시작');
    
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const editPostForm = document.getElementById('editPostForm');
    
    try {
        // 1. 로딩 표시
        loading.style.display = 'block';
        editPostForm.style.display = 'none';
        errorMessage.style.display = 'none';
        
        // 2. API 호출 (api.js의 함수 사용)
        const response = await apiGetPostDetail(currentPostId);
        
        // 3. 응답 확인
        if (!response.ok) {
            throw new Error('게시글 조회 실패');
        }
        
        // 4. JSON 데이터 파싱
        const postData = await response.json();
        console.log('📥 받은 게시글 데이터:', postData);
        
        // 5. 폼에 데이터 채우기 (핵심!)
        fillFormWithData(postData);
        
        // 6. 로딩 숨기고 폼 표시
        loading.style.display = 'none';
        editPostForm.style.display = 'block';
        
    } catch (error) {
        console.error('❌ 게시글 로드 실패:', error);
        
        // 로딩 숨기기
        loading.style.display = 'none';
        
        // 에러 메시지 표시
        errorMessage.style.display = 'block';
    }
}

// ============================================
// 폼에 기존 데이터 채우기
// ============================================
/**
 * 서버에서 받은 게시글 데이터로 폼의 입력 필드를 채움
 * 
 * 백엔드 비유:
 * - 수정 페이지에서 기존 데이터를 보여주는 것과 같음
 * - form.setTitle(post.getTitle())
 * 
 * @param {Object} postData - 게시글 상세 데이터
 * @param {number} postData.id - 게시글 ID
 * @param {string} postData.title - 제목
 * @param {string} postData.content - 내용
 * @param {Array} postData.images - 이미지 목록
 */
function fillFormWithData(postData) {
    console.log('📝 폼에 데이터 채우기 시작');
    
    // 1. 제목 입력 필드에 기존 제목 넣기
    const titleInput = document.getElementById('title');
    titleInput.value = postData.title || '';
    
    // 2. 내용 입력 필드에 기존 내용 넣기
    const contentInput = document.getElementById('content');
    contentInput.value = postData.content || '';
    
    // 3. 기존 이미지가 있으면 표시
    if (postData.images && postData.images.length > 0) {
        console.log('🖼️ 기존 이미지 있음:', postData.images);
        
        // 기존 이미지 ID 목록 저장
        existingImageIds = postData.images.map(img => img.id);
        
        // 첫 번째 이미지를 미리보기로 표시
        const firstImage = postData.images[0];
        showImagePreview(firstImage.url);
        
        // 파일명 표시
        const fileName = document.getElementById('fileName');
        fileName.textContent = '기존 이미지가 있습니다';
    }
    
    console.log('✅ 폼 데이터 채우기 완료');
}

// ============================================
// 이미지 선택 처리
// ============================================
function handleImageSelect(event) {
    console.log('📸 새 이미지 선택됨');
    
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    console.log('선택된 파일:', file.name);
    
    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
    }
    
    // 파일 크기 확인 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
    }
    
    // 선택된 파일 저장
    selectedImageFile = file;
    
    // 파일명 표시
    const fileName = document.getElementById('fileName');
    fileName.textContent = file.name;
    
    // 이미지 미리보기
    const reader = new FileReader();
    reader.onload = function(e) {
        showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

// ============================================
// 이미지 미리보기 표시
// ============================================
function showImagePreview(imageSrc) {
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    
    previewImage.src = imageSrc;
    imagePreview.style.display = 'block';
}

// ============================================
// 이미지 삭제 처리
// ============================================
function handleRemoveImage() {
    console.log('🗑️ 이미지 삭제');
    
    // 선택된 파일 초기화
    selectedImageFile = null;
    uploadedImageId = null;
    
    // 파일 입력 초기화
    const postImageInput = document.getElementById('postImage');
    postImageInput.value = '';
    
    // 파일명 초기화
    const fileName = document.getElementById('fileName');
    fileName.textContent = '파일을 선택해주세요';
    
    // 미리보기 숨기기
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.style.display = 'none';
}

// ============================================
// 이미지 업로드
// ============================================
async function uploadImage() {
    console.log('📤 이미지 업로드 시작');
    
    if (!selectedImageFile) {
        console.log('선택된 이미지 없음');
        return null;
    }
    
    try {
        const response = await apiUploadImage(selectedImageFile);
        
        if (!response.ok) {
            throw new Error('이미지 업로드 실패');
        }
        
        const data = await response.json();
        console.log('✅ 이미지 업로드 성공:', data);
        
        return data.imageId;
        
    } catch (error) {
        console.error('❌ 이미지 업로드 실패:', error);
        throw error;
    }
}

// ============================================
// 게시글 수정 제출 처리 (메인 함수)
// ============================================
async function handleSubmit(event) {
    event.preventDefault();
    
    console.log('🔵 게시글 수정 제출');
    
    // 1. 입력값 가져오기
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    
    // 2. 입력값 검증
    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }
    
    if (title.length > 26) {
        alert('제목은 최대 26자까지 입력 가능합니다.');
        return;
    }
    
    console.log('✅ 입력값 검증 통과');
    
    // 3. 새 이미지가 있으면 먼저 업로드
    let imageIdsToSend = existingImageIds; // 기본값: 기존 이미지 ID 사용
    
    if (selectedImageFile) {
        try {
            console.log('📤 새 이미지 업로드 중...');
            uploadedImageId = await uploadImage();
            imageIdsToSend = [uploadedImageId]; // 새 이미지로 교체
            console.log('✅ 새 이미지 업로드 완료:', uploadedImageId);
        } catch (error) {
            alert('이미지 업로드에 실패했습니다.');
            return;
        }
    }
    
    // 4. 게시글 수정 API 호출
    console.log('📤 게시글 수정 요청 중...');
    
    const updateData = {
        title: title,
        content: content,
        imageIds: imageIdsToSend
    };
    
    console.log('📦 수정 데이터:', updateData);
    
    try {
        const response = await apiUpdatePost(currentPostId, updateData);
        
        if (response.ok) {
            console.log('🎉 게시글 수정 성공!');
            alert('게시글이 수정되었습니다.');
            
            // 상세 페이지로 이동
            window.location.href = `post-detail.html?id=${currentPostId}`;
        } else {
            // 수정 실패
            const errorData = await response.json();
            console.error('❌ 수정 실패:', errorData);
            alert(errorData.message || '게시글 수정에 실패했습니다.');
        }
        
    } catch (error) {
        console.error('❌ 게시글 수정 요청 중 에러:', error);
        alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// ============================================
// 💡 학습 노트: 게시글 수정 vs 작성 차이점
// ============================================
/*
공통점:
- 폼 구조가 거의 같음
- 이미지 업로드 로직 동일
- 입력값 검증 동일

차이점:

1. 초기 데이터 로드
   - 작성: 빈 폼으로 시작
   - 수정: 서버에서 기존 데이터 불러와서 폼에 채움

2. API 호출
   - 작성: POST /api/v1/posts (새로 생성)
   - 수정: PATCH /api/v1/posts/{postId} (기존 것 수정)

3. URL 파라미터
   - 작성: 필요 없음
   - 수정: ?id=123 형태로 게시글 ID 필요

4. 이미지 처리
   - 작성: 새 이미지만
   - 수정: 기존 이미지 유지 or 새 이미지로 교체

백엔드 개발자에게 익숙한 비유:
- 작성 페이지 = POST 요청 (INSERT)
- 수정 페이지 = PATCH 요청 (UPDATE)
*/