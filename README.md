# 🌐 TalkSquare

> Vanilla JavaScript와 Spring Boot로 구현한 커뮤니티 플랫폼

![Version](https://img.shields.io/badge/version-0.0.1-blue)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

<br>

## 📌 프로젝트 소개

사용자들이 게시글을 작성하고 댓글과 좋아요를 통해 소통할 수 있는 커뮤니티 플랫폼입니다.
프레임워크 없이 Vanilla JavaScript로 SPA를 구현하고, AWS Lambda를 활용한 서버리스 이미지 업로드를 적용했습니다.

### 개발 기간

- 2025.10 ~ 2025.12

<br>

## ✨ 주요 기능

### 🔐 회원 관리
- 회원가입 / 로그인 / 로그아웃
- JWT 토큰 기반 인증 (Access Token + Refresh Token)
- 프로필 이미지 업로드 (최대 5MB)

### 📝 게시글 관리
- 게시글 CRUD (생성, 조회, 수정, 삭제)
- 제목 (최대 26자) 및 본문 (LONGTEXT) 작성
- 이미지 첨부 기능
- 조회수, 좋아요 수, 댓글 수 표시
- 작성자만 수정/삭제 가능

### 💬 댓글 시스템
- 댓글 작성, 수정, 삭제
- 작성자 정보 표시 (닉네임, 프로필 이미지)
- 작성자 권한 확인 (본인 댓글만 수정/삭제)

### 👍 좋아요 기능
- 좋아요 추가/취소 토글
- 좋아요 수 실시간 업데이트
- CSS 클래스 변경으로 UI 상태 표시

### 📱 사용자 경험
- 뒤로가기 시 자동 데이터 새로고침 (pageshow 이벤트)
- 프로필 드롭다운 메뉴
- 반응형 디자인

<br>

## 🛠 기술 스택

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Backend
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

### Infrastructure
![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=aws-lambda&logoColor=white)
![API Gateway](https://img.shields.io/badge/API_Gateway-FF4F8B?style=for-the-badge&logo=amazon-api-gateway&logoColor=white)
![S3](https://img.shields.io/badge/Amazon_S3-569A31?style=for-the-badge&logo=amazon-s3&logoColor=white)
![ALB](https://img.shields.io/badge/AWS_ALB-8C4FFF?style=for-the-badge&logo=amazon-aws&logoColor=white)

<br>

## 🏗 시스템 아키텍처

<img width="961" height="532" alt="Image" src="https://github.com/user-attachments/assets/7fe0150c-d5eb-4fa2-9b0b-1d0a69978d23" />

<br>

## 💡 핵심 구현 사항

### 1. Vanilla JavaScript로 SPA 구현

**프레임워크 없이 동적 렌더링 구현**

- `document.createElement()`로 DOM 요소 생성
- `appendChild()`로 화면에 추가
- 템플릿 리터럴(백틱)로 HTML 생성
- 이벤트 위임 패턴으로 효율적인 이벤트 관리

**게시글 카드 동적 생성 예시:**
```javascript
function renderPosts(posts) {
    const postsList = document.getElementById('postsList');
    posts.forEach(post => {
        const postCard = createPostCard(post);
        postsList.appendChild(postCard);
    });
}
```

---

### 2. 커서 기반 페이지네이션

**무한 스크롤을 위한 커서 방식 구현**

서버 응답 구조:
```json
{
  "posts": [...],
  "hasNext": true,
  "nextCursor": "eyJpZCI6MTB9"
}
```

- `hasNext`: 다음 페이지 존재 여부
- `nextCursor`: 다음 페이지 요청 시 사용할 커서 값
- Offset 방식 대비 일정한 조회 성능 유지

---

### 3. 좋아요 토글 기능

**상태 관리 패턴**

```javascript
let isLiked = false;  // 현재 좋아요 상태

async function handleToggleLike() {
    const response = isLiked 
        ? await apiUnlikePost(postId)
        : await apiLikePost(postId);
    
    if (response.ok) {
        isLiked = !isLiked;
        updateLikeButton();  // CSS 클래스 변경
    }
}
```

- 상태에 따라 POST/DELETE API 분기 호출
- CSS 클래스 추가/제거로 UI 업데이트
- 성공 시에만 상태 변경 (비관적 업데이트)

---

### 4. Lambda 이미지 업로드

**서버리스 아키텍처로 이미지 처리**

설정:
```javascript
const LAMBDA_IMAGE_UPLOAD_URL = 
  'https://k5cue50tkd.execute-api.ap-northeast-2.amazonaws.com/upload/image-upload-deploy';
```

흐름:
1. 클라이언트에서 5MB 이하 파일 검증
2. Lambda로 Presigned URL 요청
3. S3에 직접 업로드
4. 메타데이터를 백엔드 API에 저장

이점:
- 서버 메모리 사용량 감소
- 업로드 처리를 Lambda가 담당
- S3 직접 업로드로 속도 향상

---

### 5. 권한 기반 UI 제어

**프론트엔드와 백엔드 이중 검증**

프론트엔드:
```javascript
// 작성자만 수정/삭제 버튼 표시
${comment.memberId === currentMemberId ? `
    <button onclick="handleEditComment(${comment.id})">수정</button>
    <button onclick="handleDeleteComment(${comment.id})">삭제</button>
` : ''}
```

- UX 개선: 권한 없는 사용자에게 불필요한 버튼 숨김
- 백엔드에서 실제 권한 재검증 (보안)

---

### 6. JWT 토큰 관리

**LocalStorage 기반 토큰 저장**

```javascript
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken'
};

const API_ENDPOINTS = {
    REFRESH: '/api/v1/auth/refresh',
    // ...
};
```

- Access Token과 Refresh Token 분리 저장
- 토큰 갱신 API 엔드포인트 존재
- 환경별 API URL 자동 설정 (localhost / ALB)

---

### 7. 뒤로가기 데이터 새로고침

**브라우저 캐시 감지 및 업데이트**

```javascript
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // 뒤로가기로 돌아온 경우
        loadPosts();  // 최신 데이터 다시 로드
    }
});
```

시나리오:
1. 게시글 목록 → 상세 페이지 이동
2. 뒤로가기 클릭
3. `pageshow` 이벤트 발생 (event.persisted = true)
4. 자동으로 최신 데이터 새로고침

<br>

## 🎓 프로젝트를 통해 배운 점

### Vanilla JavaScript의 이해

프레임워크 없이 직접 DOM을 조작하며 React, Vue 등이 해결하는 문제들을 체감했습니다.
특히 상태 관리, 렌더링 최적화, 이벤트 처리의 복잡성을 경험하며 프레임워크의 필요성을 이해하게 되었습니다.

### RESTful API 설계

명확한 리소스 기반 URL 구조와 HTTP 메서드의 의미론적 사용을 학습했습니다.
CRUD 작업을 POST, GET, PUT/PATCH, DELETE로 구분하여 일관성 있는 API를 설계했습니다.

### 서버리스 아키텍처

AWS Lambda를 활용한 이미지 업로드를 통해 서버리스의 장점을 실감했습니다.
특히 서버 부하 분산과 비용 효율성 측면에서 전통적인 방식과의 차이를 이해했습니다.

### 인증/인가 구현

JWT 기반 토큰 인증을 직접 구현하며 Access Token과 Refresh Token의 역할을 학습했습니다.
프론트엔드와 백엔드에서 각각 권한을 확인하는 이중 검증의 중요성을 배웠습니다.

