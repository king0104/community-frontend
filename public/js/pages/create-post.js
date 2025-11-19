// ============================================
// 게시글 작성 페이지 JavaScript
// ============================================

// ============================================
// 전역 변수
// ============================================
let selectedImageFile = null;  // 선택된 이미지 파일
let uploadedImageId = null;     // 업로드된 이미지 ID

// ============================================
// 페이지 로드 시 실행
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 게시글 작성 페이지 로드');
    
    // 로그인 확인
    if (!isLoggedIn()) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
    }
    
    // 이벤트 리스너 등록
    initEventListeners();
});

// ============================================
// 이벤트 리스너 초기화
// ============================================
function initEventListeners() {
    // 1. 뒤로가기 버튼
    const btnBack = document.getElementById('btnBack');
    btnBack.addEventListener('click', function() {
        window.location.href = '/posts';
    });
    
    // 2. 프로필 아이콘 클릭
    const userProfile = document.getElementById('userProfile');
    userProfile.addEventListener('click', function() {
        console.log('프로필 클릭');
    });
    
    // 3. 게시글 작성 폼 제출
    const createPostForm = document.getElementById('createPostForm');
    createPostForm.addEventListener('submit', handleSubmit);
    
    // 4. 제목 입력 (버튼 색상 변경용)
    const titleInput = document.getElementById('title');
    titleInput.addEventListener('input', updateSubmitButton);
    
    // 5. 내용 입력 (버튼 색상 변경용)
    const contentInput = document.getElementById('content');
    contentInput.addEventListener('input', updateSubmitButton);
    
    // 6. 이미지 파일 선택
    const postImageInput = document.getElementById('postImage');
    postImageInput.addEventListener('change', handleImageSelect);
    
    // 7. 이미지 삭제 버튼
    const btnRemoveImage = document.getElementById('btnRemoveImage');
    btnRemoveImage.addEventListener('click', removeImage);
    
    console.log('✅ 이벤트 리스너 등록 완료');
}

// ============================================
// 완료 버튼 색상 업데이트
// ============================================
function updateSubmitButton() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const btnSubmit = document.getElementById('btnSubmit');
    
    // 제목과 내용이 모두 입력되었는지 확인
    if (title && content) {
        btnSubmit.style.backgroundColor = '#7F6AEE';
        btnSubmit.disabled = false;
        console.log('✅ 완료 버튼 활성화');
    } else {
        btnSubmit.style.backgroundColor = '#ACA0EB';
        btnSubmit.disabled = false;  // 일단 항상 활성화 (테스트용)
        console.log('⚪ 완료 버튼 색상 변경');
    }
}

// ============================================
// 이미지 선택 처리
// ============================================
function handleImageSelect(event) {
    console.log('📸 이미지 선택됨');
    
    const file = event.target.files[0];
    
    if (!file) {
        console.log('파일이 선택되지 않았습니다.');
        return;
    }
    
    console.log('선택된 파일:', file.name);
    console.log('파일 크기:', file.size, 'bytes');
    console.log('파일 타입:', file.type);
    
    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        event.target.value = '';
        return;
    }
    
    // 파일 크기 확인 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        event.target.value = '';
        return;
    }
    
    // 전역 변수에 저장
    selectedImageFile = file;
    
    // 파일명 표시
    const fileName = document.getElementById('fileName');
    fileName.textContent = file.name;
    
    // 이미지 미리보기 표시
    displayImagePreview(file);
}

// ============================================
// 이미지 미리보기 표시
// ============================================
function displayImagePreview(file) {
    console.log('🖼️ 이미지 미리보기 생성');
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        
        // 미리보기 이미지 설정
        const previewImage = document.getElementById('previewImage');
        previewImage.src = imageUrl;
        
        // 미리보기 컨테이너 표시
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.style.display = 'block';
        
        console.log('✅ 미리보기 표시 완료');
    };
    
    reader.readAsDataURL(file);
}

// ============================================
// 이미지 삭제
// ============================================
function removeImage() {
    console.log('🗑️ 이미지 삭제');
    
    // 전역 변수 초기화
    selectedImageFile = null;
    uploadedImageId = null;
    
    // 파일 input 초기화
    const postImageInput = document.getElementById('postImage');
    postImageInput.value = '';
    
    // 파일명 초기화
    const fileName = document.getElementById('fileName');
    fileName.textContent = '파일을 선택해주세요';
    
    // 미리보기 숨기기
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.style.display = 'none';
    
    // 미리보기 이미지 초기화
    const previewImage = document.getElementById('previewImage');
    previewImage.src = '';
    
    console.log('✅ 이미지 삭제 완료');
}

// ============================================
// 이미지 업로드 (서버에 전송)
// ============================================
async function uploadImage() {
    if (!selectedImageFile) {
        console.log('⚪ 선택된 이미지 없음');
        return null;
    }
    
    console.log('📤 이미지 업로드 시작');
    
    try {
        const response = await apiUploadImage(selectedImageFile);
        
        if (!response.ok) {
            throw new Error('이미지 업로드 실패');
        }
        
        const data = await response.json();
        console.log('📥 이미지 업로드 응답:', data);
        
        // ⭐ Lambda 응답 형식: { metadata: { imageId: 1, ... }, s3Url: "...", ... }
        const imageId = data.metadata.imageId;  // ✅ 수정!
        console.log('✅ 이미지 업로드 완료. imageId:', imageId);
        
        return imageId;
        
    } catch (error) {
        console.error('❌ 이미지 업로드 실패:', error);
        throw error;
    }
}

// ============================================
// 폼 제출 처리 (메인 함수)
// ============================================
async function handleSubmit(event) {
    event.preventDefault();  // 페이지 새로고침 방지
    
    console.log('🔵 게시글 작성 시도');
    
    // ----------------------------------------
    // STEP 1: 입력값 가져오기
    // ----------------------------------------
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    
    console.log('📝 제목:', title);
    console.log('📝 내용:', content.substring(0, 50) + '...');
    
    // ----------------------------------------
    // STEP 2: 입력값 검증
    // ----------------------------------------
    if (!title) {
        alert('제목을 입력해주세요.');
        return;
    }
    
    if (title.length > 26) {
        alert('제목은 최대 26자까지 입력 가능합니다.');
        return;
    }
    
    if (!content) {
        alert('내용을 입력해주세요.');
        return;
    }
    
    console.log('✅ 입력값 검증 통과');
    
    // ----------------------------------------
    // STEP 3: 이미지 업로드 (선택한 경우에만)
    // ----------------------------------------
    if (selectedImageFile) {
        try {
            console.log('📤 이미지 업로드 중...');
            uploadedImageId = await uploadImage();
            console.log('✅ 이미지 업로드 완료:', uploadedImageId);
        } catch (error) {
            alert('이미지 업로드에 실패했습니다.');
            console.error('이미지 업로드 에러:', error);
            return;
        }
    }
    
    // ----------------------------------------
    // STEP 4: 게시글 작성 API 호출
    // ----------------------------------------
    console.log('📤 게시글 작성 요청 중...');
    
    // 서버에 보낼 데이터 구성
    const postData = {
        title: title,
        content: content,
        imageId: uploadedImageId  // 이미지가 없으면 null
    };
    
    console.log('📦 게시글 데이터:', postData);
    
    try {
        const response = await apiCreatePost(postData);
        
        if (response.ok) {
            // 게시글 작성 성공
            console.log('🎉 게시글 작성 성공!');
            alert('게시글이 작성되었습니다!');
            window.location.href = '/posts';  // 게시글 목록으로 이동
        } else {
            // 게시글 작성 실패
            const errorData = await response.json();
            console.error('❌ 게시글 작성 실패:', errorData);
            alert('게시글 작성에 실패했습니다.');
        }
        
    } catch (error) {
        console.error('❌ 게시글 작성 요청 중 에러:', error);
        alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// ============================================
// 💡 학습 노트: 게시글 작성 흐름
// ============================================
/*
게시글 작성 과정:

1. 사용자가 제목, 내용 입력
2. (선택) 이미지 선택
3. "완료" 버튼 클릭
4. JavaScript가 처리:
   a. 입력값 검증
   b. 이미지가 있으면 먼저 업로드 → imageId 받음
   c. 게시글 작성 API 호출 (title, content, imageId)
5. 백엔드가 게시글 저장
6. 성공하면 게시글 목록 페이지로 이동

왜 이미지를 먼저 업로드하나?
- 백엔드 API가 imageId를 받기 때문
- 이미지 업로드 → imageId 획득 → 게시글 작성

회원가입과 동일한 패턴!
- 회원가입: 프로필 이미지 업로드 → imageId → 회원가입
- 게시글 작성: 게시글 이미지 업로드 → imageId → 게시글 작성
*/