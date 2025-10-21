// ============================================
// 입력값 검증 유틸리티 함수들
// ============================================

/**
 * 이메일 검증
 * @param {string} email - 검증할 이메일
 * @returns {boolean} - 유효 여부
 */
function validateEmail(email) {
    // 빈 값 체크
    if (!email || email.trim() === '') {
        alert(MESSAGES.EMPTY_EMAIL);
        return false;
    }
    
    // 이메일 형식 체크
    if (!PATTERNS.EMAIL.test(email)) {
        alert(MESSAGES.INVALID_EMAIL);
        return false;
    }
    
    return true;
}

/**
 * 비밀번호 검증
 * @param {string} password - 검증할 비밀번호
 * @returns {boolean} - 유효 여부
 */
function validatePassword(password) {
    // 빈 값 체크
    if (!password || password.trim() === '') {
        alert(MESSAGES.EMPTY_PASSWORD);
        return false;
    }
    
    return true;
}

/**
 * 비밀번호 형식 검증 (회원가입용)
 * @param {string} password - 검증할 비밀번호
 * @returns {boolean} - 유효 여부
 */
function validatePasswordFormat(password) {
    if (!validatePassword(password)) {
        return false;
    }
    
    // 비밀번호 형식 체크 (8자 이상, 영문, 숫자, 특수문자)
    if (!PATTERNS.PASSWORD.test(password)) {
        alert(MESSAGES.INVALID_PASSWORD);
        return false;
    }
    
    return true;
}

/**
 * 비밀번호 확인 검증
 * @param {string} password - 비밀번호
 * @param {string} passwordConfirm - 비밀번호 확인
 * @returns {boolean} - 일치 여부
 */
function validatePasswordMatch(password, passwordConfirm) {
    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return false;
    }
    return true;
}

/**
 * 닉네임 검증
 * @param {string} nickname - 검증할 닉네임
 * @returns {boolean} - 유효 여부
 */
function validateNickname(nickname) {
    if (!nickname || nickname.trim() === '') {
        alert('닉네임을 입력해주세요.');
        return false;
    }
    
    if (nickname.length < 2 || nickname.length > 10) {
        alert('닉네임은 2자 이상 10자 이하여야 합니다.');
        return false;
    }
    
    return true;
}

/**
 * 로그인 입력값 검증 (통합)
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {boolean} - 유효 여부
 */
function validateLoginInputs(email, password) {
    return validateEmail(email) && validatePassword(password);
}

/**
 * 회원가입 입력값 검증 (통합)
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @param {string} passwordConfirm - 비밀번호 확인
 * @param {string} nickname - 닉네임
 * @returns {boolean} - 유효 여부
 */
function validateSignupInputs(email, password, passwordConfirm, nickname) {
    // 각 항목을 순서대로 검증
    if (!validateEmail(email)) return false;
    if (!validatePasswordFormat(password)) return false;
    if (!validatePasswordMatch(password, passwordConfirm)) return false;
    if (!validateNickname(nickname)) return false;
    
    return true;
}