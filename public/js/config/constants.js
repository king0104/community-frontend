// ============================================
// 설정 파일: 프로젝트 전체에서 사용하는 상수들
// ============================================

// API 기본 URL
const API_BASE_URL = 'http://localhost:8080';

// API 엔드포인트
const API_ENDPOINTS = {
    LOGIN: '/login',
    SIGNUP: '/api/v1/members',
    LOGOUT: '/logout',
    REFRESH: '/api/v1/auth/refresh',
    POSTS: '/api/v1/posts',
    IMAGES: '/api/v1/images',
    MEMBER_ME: '/api/v1/members/me'
};

// 로컬 스토리지 키
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken'
};

// 정규표현식 패턴
const PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
};

// 메시지
const MESSAGES = {
    LOGIN_SUCCESS: '로그인 성공!',
    LOGIN_FAILED: '이메일 또는 비밀번호가 올바르지 않습니다.',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
    EMPTY_EMAIL: '이메일을 입력해주세요.',
    EMPTY_PASSWORD: '비밀번호를 입력해주세요.',
    INVALID_EMAIL: '올바른 이메일 형식을 입력해주세요.',
    INVALID_PASSWORD: '비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.',
    SIGNUP_SUCCESS: '회원가입 성공! 로그인 페이지로 이동합니다.',
    SIGNUP_FAILED: '회원가입에 실패했습니다.',
    IMAGE_UPLOAD_FAILED: '이미지 업로드에 실패했습니다.',
    IMAGE_REQUIRED: '프로필 이미지를 선택해주세요.',
    IMAGE_SIZE_EXCEED: '이미지 크기는 5MB 이하여야 합니다.'
};