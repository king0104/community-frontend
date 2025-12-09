// ============================================
// 게시글 목록 페이지 - 동적 데이터 로딩 + 무한 스크롤
// ============================================

// 💡 개발 순서 (이 순서대로 작성하면 됨!)
// 1. 페이지 로드 시 초기화
// 2. 서버에서 데이터 가져오기
// 3. 데이터를 HTML로 변환
// 4. 화면에 추가
// 5. 이벤트 처리 (클릭 등)
// 6. 무한 스크롤 설정

// ============================================
// 무한 스크롤 상태 관리
// ============================================
let currentCursor = null;  // 현재 커서 (다음 페이지 로드용)
let hasMorePosts = true;   // 더 불러올 게시글이 있는지
let isLoadingPosts = false; // 현재 로딩 중인지 (중복 요청 방지)

// ============================================
// STEP 1: 페이지 로드 시 초기화
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 게시글 목록 페이지 로드');

    // 로그인 확인 (로그인 안 되어 있으면 로그인 페이지로)
    if (!isLoggedIn()) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
    }

    // 이벤트 리스너 등록
    initEventListeners();

    // 무한 스크롤 초기화
    initInfiniteScroll();

    // 게시글 목록 불러오기 (핵심!)
    loadPosts();
});

// ============================================
// ✅ 뒤로가기 감지 - 데이터 자동 새로고침
// ============================================
/**
 * 브라우저의 뒤로가기/앞으로가기로 페이지에 돌아왔을 때 실행
 *
 * pageshow 이벤트:
 * - 페이지가 화면에 표시될 때마다 발생
 * - event.persisted: 브라우저 캐시에서 페이지를 복원했는지 여부
 *   true = 뒤로가기로 돌아옴 (캐시된 페이지)
 *   false = 새로 로드됨
 *
 * 사용 시나리오:
 * 1. 게시글 목록 페이지 진입
 * 2. 게시글 클릭 → 상세 페이지 이동
 * 3. 뒤로가기 클릭 → pageshow 이벤트 발생
 * 4. loadPosts(true) 실행 → 업데이트된 데이터 표시 (첫 페이지부터)
 */
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        console.log('🔙 뒤로가기로 페이지 복원됨 - 데이터 새로고침 시작');
        loadPosts(true); // 첫 페이지부터 다시 로드
    }
});

// ============================================
// STEP 2: 이벤트 리스너 등록
// ============================================
function initEventListeners() {
    // 게시글 작성 버튼 클릭
    const btnCreatePost = document.getElementById('btnCreatePost');
    btnCreatePost.addEventListener('click', function() {
        window.location.href = 'create-post';
    });

    // 프로필 아이콘 클릭 - 드롭다운 토글
    const profileIcon = document.querySelector('.profile-icon');
    const profileDropdown = document.getElementById('profileDropdown');

    profileIcon.addEventListener('click', function(event) {
        event.stopPropagation(); // 이벤트 전파 방지
        profileDropdown.classList.toggle('show');
    });

    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.user-profile')) {
            profileDropdown.classList.remove('show');
        }
    });

    // 로그아웃 버튼 클릭
    const btnLogout = document.getElementById('btnLogout');
    btnLogout.addEventListener('click', function(event) {
        event.stopPropagation(); // 이벤트 전파 방지
        if (confirm('로그아웃 하시겠습니까?')) {
            logout();
        }
    });
}

// ============================================
// STEP 3: 게시글 목록 불러오기 (핵심 로직!)
// ============================================
/**
 * 서버에서 게시글 목록을 가져와서 화면에 표시
 *
 * 🆕 무한 스크롤 지원:
 * - isInitial = true: 첫 페이지 로드 (목록 초기화)
 * - isInitial = false: 다음 페이지 로드 (기존 목록에 추가)
 *
 * 흐름:
 * 1. 중복 로딩 방지 체크
 * 2. 로딩 표시
 * 3. API 호출 (커서 사용)
 * 4. 응답 처리
 * 5. HTML 생성 및 추가
 * 6. 상태 업데이트
 *
 * @param {boolean} isInitial - 첫 페이지 로드 여부
 */
async function loadPosts(isInitial = true) {
    console.log(`📡 게시글 목록 요청 시작 (${isInitial ? '첫 페이지' : '다음 페이지'})`);

    // 1. 중복 로딩 방지
    if (isLoadingPosts) {
        console.log('⏸️ 이미 로딩 중입니다.');
        return;
    }

    // 2. 더 이상 불러올 데이터가 없으면 중단
    if (!isInitial && !hasMorePosts) {
        console.log('✋ 더 이상 불러올 게시글이 없습니다.');
        return;
    }

    // DOM 요소들 가져오기
    const postsList = document.getElementById('postsList');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const noPosts = document.getElementById('noPosts');

    try {
        // 3. 로딩 상태 시작
        isLoadingPosts = true;
        loading.style.display = 'block';

        // 4. 첫 페이지 로드 시 목록 초기화
        if (isInitial) {
            postsList.innerHTML = ''; // 기존 내용 지우기
            currentCursor = null;
            hasMorePosts = true;
        }

        // 5. API 호출 (커서 전달)
        const response = await apiGetPosts(currentCursor);

        // 6. 응답 확인
        if (!response.ok) {
            throw new Error('게시글 목록 조회 실패');
        }

        // 7. JSON 데이터 파싱
        const data = await response.json();
        console.log('📥 받은 게시글 데이터:', data);

        // 8. PostListPageResponse 구조에서 데이터 추출
        const posts = data.posts || [];
        const hasNext = data.hasNext;
        const nextCursor = data.nextCursor;

        loading.style.display = 'none';

        // 9. 게시글이 없을 경우 처리 (첫 페이지만)
        if (isInitial && posts.length === 0) {
            noPosts.style.display = 'block';
            hasMorePosts = false;
            return;
        }

        // 10. 게시글 카드 생성 및 추가
        if (posts.length > 0) {
            renderPosts(posts);
        }

        // 11. 무한 스크롤 상태 업데이트
        currentCursor = nextCursor;
        hasMorePosts = hasNext;

        console.log(`✅ ${posts.length}개 게시글 로드 완료`);
        console.log(`📜 다음 커서: ${nextCursor}, 더 있음? ${hasNext}`);

    } catch (error) {
        console.error('❌ 게시글 목록 로드 실패:', error);

        // 로딩 숨기기
        loading.style.display = 'none';

        // 에러 메시지 표시 (첫 페이지만)
        if (isInitial) {
            errorMessage.style.display = 'block';
        }
    } finally {
        // 12. 로딩 상태 종료
        isLoadingPosts = false;
    }
}

// ============================================
// STEP 4: 게시글 목록을 HTML로 변환 (핵심!)
// ============================================
/**
 * 게시글 데이터 배열을 받아서 HTML 카드로 변환하고 화면에 추가
 * 
 * 이게 핵심입니다!
 * 서버에서 받은 JSON 데이터를 HTML로 만드는 과정
 * 
 * @param {Array} posts - 게시글 데이터 배열
 */
function renderPosts(posts) {
    console.log('🎨 게시글 카드 생성 시작');

    // 게시글 목록 컨테이너 가져오기
    const postsList = document.getElementById('postsList');

    // 배열의 각 게시글에 대해 반복
    // 백엔드의 for문이나 stream().forEach()와 같음
    posts.forEach(post => {
        // 각 게시글마다 카드 생성
        const postCard = createPostCard(post);

        // 컨테이너에 추가
        postsList.appendChild(postCard);
    });

    console.log(`✅ ${posts.length}개의 게시글 카드 생성 완료`);
}

// ============================================
// STEP 5: 개별 게시글 카드 생성 (HTML 생성!)
// ============================================
/**
 * 하나의 게시글 데이터로 HTML 카드 요소를 생성
 *
 * 백엔드 응답 구조 (PostListResponse):
 * {
 *   id: 1,
 *   title: "제목",
 *   viewCount: 123,
 *   likeCount: 10,
 *   commentCount: 5,  // ✅ 백엔드에서 post.getPostStats().getCommentCount()로 제공
 *   createdAt: "2021-01-01T00:00:00",
 *   memberNickname: "작성자",
 *   memberProfileImageUrl: "https://..."
 * }
 *
 * @param {Object} post - 게시글 데이터 객체 (PostListResponse)
 * @returns {HTMLElement} - 생성된 카드 요소
 */
function createPostCard(post) {
    // 1. 카드 컨테이너 생성
    const card = document.createElement('div');
    card.className = 'post-card';

    // 2. 카드 클릭 시 상세 페이지로 이동
    card.addEventListener('click', function() {
        window.location.href = `post-detail.html?id=${post.id}`;
    });

    // 3. 카드 내용 생성
    // ✅ 백엔드에서 제공하는 commentCount를 그대로 사용
    card.innerHTML = `
        <h3 class="post-title">${escapeHtml(post.title)}</h3>

        <div class="post-stats">
            <span class="stat-item">좋아요 ${post.likeCount || 0}</span>
            <span class="stat-item">댓글 ${post.commentCount || 0}</span>
            <span class="stat-item">조회수 ${post.viewCount || 0}</span>
        </div>

        <div class="post-footer">
            <div class="post-author">
                <img src="${post.memberProfileImageUrl || DEFAULT_PROFILE_IMAGE}"
                     alt="프로필"
                     class="author-profile" />
                <span class="author-name">${escapeHtml(post.memberNickname || '익명')}</span>
            </div>
            <span class="post-date">${formatDate(post.createdAt)}</span>
        </div>
    `;

    return card;
}

// ============================================
// STEP 6: 유틸리티 함수들
// ============================================

/**
 * 날짜 포맷 변환
 * 
 * 백엔드에서 보내주는 날짜 형식:
 * "2021-01-01T00:00:00"
 * 
 * 화면에 표시할 형식:
 * "2021-01-01 00:00:00"
 * 
 * @param {string} dateString - ISO 형식의 날짜 문자열
 * @returns {string} - 포맷된 날짜 문자열
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    // Date 객체로 변환
    const date = new Date(dateString);
    
    // 포맷 변환 (YYYY-MM-DD HH:mm:ss)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * HTML 이스케이프 (보안)
 * 
 * XSS 공격 방지
 * 사용자가 입력한 데이터에 <script> 태그가 있으면 실행되지 않게 함
 * 
 * 예시:
 * "<script>alert('hack')</script>"
 * → "&lt;script&gt;alert('hack')&lt;/script&gt;"
 * 
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} - 이스케이프된 텍스트
 */
function escapeHtml(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// STEP 7: 무한 스크롤 초기화 (Intersection Observer)
// ============================================
/**
 * 무한 스크롤 기능 초기화
 *
 * Intersection Observer API 사용:
 * - 센티널 요소가 화면에 보이는지 감지
 * - 보이면 자동으로 다음 페이지 로드
 *
 * 작동 원리:
 * 1. 사용자가 스크롤하여 페이지 하단에 도달
 * 2. scrollSentinel 요소가 화면에 보임
 * 3. Observer가 감지하여 콜백 실행
 * 4. loadPosts(false) 호출 → 다음 페이지 로드
 */
function initInfiniteScroll() {
    console.log('🔄 무한 스크롤 초기화');

    // 센티널 요소 가져오기
    const sentinel = document.getElementById('scrollSentinel');

    if (!sentinel) {
        console.error('❌ scrollSentinel 요소를 찾을 수 없습니다.');
        return;
    }

    // Intersection Observer 설정
    const options = {
        root: null,           // viewport 사용
        rootMargin: '100px',  // 하단 100px 전에 미리 로드 (부드러운 UX)
        threshold: 0          // 요소가 조금이라도 보이면 감지
    };

    // Observer 콜백 함수
    const callback = (entries) => {
        entries.forEach(entry => {
            // 센티널이 화면에 보이고, 더 불러올 데이터가 있고, 로딩 중이 아닐 때
            if (entry.isIntersecting && hasMorePosts && !isLoadingPosts) {
                console.log('🎯 센티널 감지 → 다음 페이지 로드');
                loadPosts(false); // 다음 페이지 로드
            }
        });
    };

    // Observer 생성 및 감시 시작
    const observer = new IntersectionObserver(callback, options);
    observer.observe(sentinel);

    console.log('✅ 무한 스크롤 활성화됨');
}

// ============================================
// 💡 학습 노트: 핵심 개념 정리
// ============================================

/*
🆕 무한 스크롤 추가 개념
─────────────────────────

1. Intersection Observer API
→ 요소가 화면에 보이는지 감지하는 브라우저 API
→ scroll 이벤트보다 성능이 좋음 (이벤트 리스너 대신 브라우저가 최적화)

작동 원리:
const observer = new IntersectionObserver(callback, options);
observer.observe(element);

→ element가 화면에 보이면 callback 실행

2. 커서 기반 페이지네이션
→ 오프셋(offset) 방식의 문제점 해결
   - 오프셋: ?page=1, ?page=2 (새 데이터 추가 시 중복/누락 가능)
   - 커서: 마지막 항목 ID 기준 (안정적)

예시:
첫 페이지: GET /posts?size=20 → cursor=20
다음 페이지: GET /posts?cursor=20&size=20 → cursor=40

3. 상태 관리의 중요성
→ currentCursor: 다음 페이지 시작 위치
→ hasMorePosts: 더 불러올 데이터 있는지
→ isLoadingPosts: 중복 요청 방지

없으면 생기는 문제:
- 같은 데이터 중복 로드
- 스크롤할 때마다 무한 요청
- 마지막 페이지에서도 계속 요청

4. 무한 스크롤 vs 페이지네이션

무한 스크롤 (현재 방식):
✅ 장점: 자연스러운 탐색, 모바일 친화적
❌ 단점: 특정 위치 찾기 어려움, SEO 불리

페이지네이션 (번호 버튼):
✅ 장점: 특정 페이지 이동 쉬움, SEO 유리
❌ 단점: 클릭 필요, 흐름 끊김

→ 소셜 미디어 = 무한 스크롤
→ 검색 결과 = 페이지네이션

1. DOM 조작의 핵심 메서드들
─────────────────────────

document.createElement('div')
→ 새로운 HTML 요소 생성
→ 백엔드 비유: new Post() (객체 생성)

element.innerHTML = '...'
→ 요소의 내부 HTML 설정
→ 문자열로 HTML을 작성하면 실제 HTML로 변환

element.appendChild(child)
→ 자식 요소 추가
→ 백엔드 비유: list.add(item)

document.getElementById('id')
→ id로 요소 찾기
→ 백엔드 비유: repository.findById()


2. 정적 vs 동적 비교
─────────────────────────

정적 HTML (기존):
<div class="posts-list">
    <div class="post-card">
        <h3>제목 1</h3>  ← 고정된 데이터
    </div>
</div>

동적 JavaScript (새로운 방식):
const postsList = document.getElementById('postsList');
posts.forEach(post => {
    const card = document.createElement('div');
    card.innerHTML = `<h3>${post.title}</h3>`;  ← 서버 데이터
    postsList.appendChild(card);
});


3. 데이터 흐름
─────────────────────────

서버 → JSON → JavaScript 객체 → HTML → 화면

1. 서버 응답 (JSON):
   [{"id": 1, "title": "제목1"}, ...]

2. JavaScript 파싱:
   const posts = await response.json();
   → posts = [{id: 1, title: "제목1"}, ...]

3. HTML 생성:
   posts.forEach(post => {
       const html = `<h3>${post.title}</h3>`;
   });

4. DOM에 추가:
   postsList.appendChild(card);

5. 화면에 표시:
   사용자가 볼 수 있는 HTML로 렌더링


4. 개발 순서 정리 (혼자 개발할 때)
─────────────────────────

1단계: HTML 구조 만들기
   → 빈 컨테이너만 만들기
   → <div id="postsList"></div>

2단계: API 함수 작성
   → utils/api.js에 apiGetPosts() 추가

3단계: 데이터 가져오기 함수
   → async function loadPosts() {...}

4단계: HTML 생성 함수
   → function createPostCard(post) {...}

5단계: 렌더링 함수
   → function renderPosts(posts) {...}

6단계: 초기화
   → DOMContentLoaded에서 loadPosts() 호출


5. 템플릿 리터럴 (Template Literal)
─────────────────────────

백틱(`)을 사용한 문자열:
`<h3>${post.title}</h3>`

장점:
- 여러 줄 작성 가능
- ${} 안에 변수/표현식 삽입 가능
- HTML을 쉽게 작성 가능

예시:
const name = "홍길동";
const age = 20;
const html = `
    <div>
        <h1>${name}</h1>
        <p>나이: ${age}세</p>
        <p>내년: ${age + 1}세</p>
    </div>
`;
*/