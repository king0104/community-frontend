// ============================================
// 회원가입 페이지 전용 JavaScript
// ============================================

// ============================================
// 전역 변수
// ============================================
// 업로드된 이미지 ID를 저장하는 변수
// 이미지를 먼저 업로드하고, 받은 imageId를 회원가입 시 사용
let uploadedImageId = null;
// 선택된 이미지 파일을 임시로 저장
let selectedImageFile = null;

// ============================================
// 페이지 로드 시 실행
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 회원가입 페이지 로드');
    
    // 이미 로그인되어 있으면 게시글 페이지로 이동
    if (isLoggedIn()) {
        console.log('이미 로그인되어 있습니다.');
        window.location.href = '/posts';  
        return;
    }
    
    // 이벤트 리스너 등록
    initEventListeners();
});


// ============================================
// 이벤트 리스너 초기화
// ============================================
function initEventListeners() {
    // 1. 회원가입 폼 제출 이벤트
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', handleSignup);
    
    // 2. 프로필 이미지 선택 이벤트
    const profileImageInput = document.getElementById('profileImage');
    profileImageInput.addEventListener('change', handleImageSelect);
    
    console.log('✅ 이벤트 리스너 등록 완료');
}


// ============================================
// 프로필 이미지 선택 처리
// ============================================
/**
 * 사용자가 이미지를 선택했을 때 실행
 * @param {Event} event - change 이벤트 객체
 */
function handleImageSelect(event) {
    console.log('📸 이미지 선택됨');
    
    // event.target: 이벤트가 발생한 요소 (input 태그)
    // .files: 선택된 파일들의 배열
    // .files[0]: 첫 번째 파일 (우리는 하나만 선택)
    const file = event.target.files[0];
    
    // 파일이 선택되지 않았으면 종료
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
        event.target.value = ''; // 선택 초기화
        return;
    }
    
    // 파일 크기 확인 (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert(MESSAGES.IMAGE_SIZE_EXCEED);
        event.target.value = ''; // 선택 초기화
        return;
    }
    
    // 파일을 전역 변수에 저장 (나중에 업로드할 때 사용)
    selectedImageFile = file;
    
    // 이미지 미리보기 표시
    displayImagePreview(file);
}


// ============================================
// 이미지 미리보기 표시
// ============================================
/**
 * 선택한 이미지를 화면에 미리 표시
 * @param {File} file - 이미지 파일
 */
function displayImagePreview(file) {
    console.log('🖼️ 이미지 미리보기 생성');
    
    // FileReader: 파일을 읽는 객체
    const reader = new FileReader();
    
    // 파일 읽기가 완료되면 실행되는 함수
    reader.onload = function(e) {
        // e.target.result: 읽은 파일의 데이터 (이미지 URL)
        const imageUrl = e.target.result;
        console.log('이미지 URL 생성 완료');
        
        // 프로필 이미지 원 찾기
        const profileCircle = document.querySelector('.profile-circle');
        
        // 배경 이미지로 설정
        profileCircle.style.backgroundImage = `url(${imageUrl})`;
        profileCircle.style.backgroundSize = 'cover';
        profileCircle.style.backgroundPosition = 'center';
        
        // + 아이콘 숨기기
        const plusIcon = profileCircle.querySelector('.plus-icon');
        if (plusIcon) {
            plusIcon.style.display = 'none';
        }
        
        console.log('✅ 미리보기 표시 완료');
    };
    
    // 파일을 Data URL로 읽기 (이미지를 base64로 인코딩)
    reader.readAsDataURL(file);
}


// ============================================
// 이미지 업로드 (서버에 전송)
// ============================================
/**
 * 선택한 이미지를 서버에 업로드
 * @returns {Promise<number>} - 업로드된 이미지 ID
 */
async function uploadImage() {
    console.log('📤 이미지 업로드 시작');
    
    if (!selectedImageFile) {
        throw new Error('이미지가 선택되지 않았습니다.');
    }
    
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
// 회원가입 처리 (메인 함수)
// ============================================
/**
 * 회원가입 버튼을 클릭했을 때 실행
 * @param {Event} event - submit 이벤트 객체
 */
async function handleSignup(event) {
    // 기본 동작 막기 (페이지 새로고침 방지)
    event.preventDefault();
    
    console.log('🔵 회원가입 시도');
    
    // ----------------------------------------
    // STEP 1: 입력값 가져오기
    // ----------------------------------------
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const nickname = document.getElementById('nickname').value.trim();
    
    console.log('📧 이메일:', email);
    console.log('👤 닉네임:', nickname);
    
    // ----------------------------------------
    // STEP 2: 프로필 이미지 확인
    // ----------------------------------------
    if (!selectedImageFile) {
        alert(MESSAGES.IMAGE_REQUIRED);
        return;
    }
    
    // ----------------------------------------
    // STEP 3: 입력값 검증
    // ----------------------------------------
    // validation.js의 함수 사용
    if (!validateSignupInputs(email, password, passwordConfirm, nickname)) {
        console.log('❌ 입력값 검증 실패');
        return;
    }
    
    console.log('✅ 입력값 검증 통과');
    
    // ----------------------------------------
    // STEP 4: 이미지 업로드 (먼저!)
    // ----------------------------------------
    // 회원가입 API는 imageId가 필요하므로
    // 이미지를 먼저 업로드하고 imageId를 받아야 함
    
    try {
        console.log('📤 1단계: 이미지 업로드 중...');
        uploadedImageId = await uploadImage();
        console.log('✅ 1단계 완료: imageId =', uploadedImageId);
        
    } catch (error) {
        alert(MESSAGES.IMAGE_UPLOAD_FAILED);
        console.error('이미지 업로드 에러:', error);
        return;
    }
    
    // ----------------------------------------
    // STEP 5: 회원가입 API 호출
    // ----------------------------------------
    console.log('📤 2단계: 회원가입 요청 중...');
    
    // 서버에 보낼 데이터 구성
    const signupData = {
        email: email,
        password: password,
        nickname: nickname,
        profileImageId: uploadedImageId  // 업로드한 이미지 ID
    };
    
    console.log('📦 회원가입 데이터:', signupData);
    
    try {
        // API 호출 (api.js의 함수 사용)
        const response = await apiSignup(signupData);
        
        if (response.ok) {
            // 회원가입 성공
            handleSignupSuccess();
        } else {
            // 회원가입 실패
            await handleSignupError(response);
        }
        
    } catch (error) {
        console.error('❌ 회원가입 요청 중 에러:', error);
        alert(MESSAGES.NETWORK_ERROR);
    }
}


// ============================================
// 회원가입 성공 처리
// ============================================
function handleSignupSuccess() {
    console.log('🎉 회원가입 성공!');
    
    alert(MESSAGES.SIGNUP_SUCCESS);

    // 로그인 페이지로 이동
    window.location.href = '/pages/login.html';  // public/pages 경로 명시
}


// ============================================
// 회원가입 실패 처리
// ============================================
/**
 * 회원가입 실패 시 에러 메시지 표시
 * @param {Response} response - 서버 응답 객체
 */
async function handleSignupError(response) {
    console.log('❌ 회원가입 실패:', response.status);
    
    // 응답 본문(body)을 읽어서 에러 메시지 확인
    try {
        const errorData = await response.json();
        console.log('에러 응답:', errorData);
        
        // 백엔드 응답 형식: { status: 400, message: "중복 이메일입니다" }
        const errorMessage = errorData.message || MESSAGES.SIGNUP_FAILED;
        alert(errorMessage);
        
    } catch (error) {
        // JSON 파싱 실패 시 기본 메시지
        alert(MESSAGES.SIGNUP_FAILED);
    }
}


// ============================================
// 💡 학습 노트: async/await 설명
// ============================================

/*
async/await란?
- Promise를 더 쉽게 사용하는 방법
- 비동기 코드를 동기 코드처럼 작성 가능

기존 방식 (Promise + then):
-------------------------------
function uploadImage() {
    return apiUploadImage(file)
        .then(response => response.json())
        .then(data => {
            return data.imageId;
        })
        .catch(error => {
            console.error(error);
        });
}

새로운 방식 (async/await):
-------------------------------
async function uploadImage() {
    try {
        const response = await apiUploadImage(file);
        const data = await response.json();
        return data.imageId;
    } catch (error) {
        console.error(error);
    }
}

왜 await를 사용하나?
- fetch()는 시간이 걸림 (네트워크 통신)
- await: "결과가 올 때까지 기다려!"
- await가 없으면 결과가 오기 전에 다음 줄 실행됨

async 함수의 특징:
- async 함수는 항상 Promise를 반환
- await는 async 함수 안에서만 사용 가능
- try-catch로 에러 처리

회원가입 흐름에서 왜 순서가 중요한가?
1. 이미지 업로드 → imageId 받음
2. imageId를 포함해서 회원가입 요청
→ 순서가 바뀌면 안됨! (이미지 ID가 필요하므로)
→ await로 순서 보장
*/


// ============================================
// 💡 학습 노트: FileReader 설명
// ============================================

/*
FileReader란?
- 사용자가 선택한 파일을 읽는 객체
- 이미지를 미리보기로 표시할 때 사용

주요 메서드:
1. readAsDataURL(file)
   - 파일을 Data URL로 읽기
   - 결과: "data:image/png;base64,iVBORw0KG..."
   - 이미지를 <img>나 CSS background로 표시 가능

2. readAsText(file)
   - 텍스트 파일을 문자열로 읽기

3. readAsArrayBuffer(file)
   - 파일을 바이너리로 읽기

이벤트:
- onload: 파일 읽기 완료 시 실행
- onerror: 파일 읽기 실패 시 실행

예제:
const reader = new FileReader();
reader.onload = function(e) {
    console.log('파일 내용:', e.target.result);
};
reader.readAsDataURL(file);
*/