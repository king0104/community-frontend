// ============================================
// 게시글 목록 페이지 - 동적 데이터 로딩
// ============================================

// 💡 개발 순서 (이 순서대로 작성하면 됨!)
// 1. 페이지 로드 시 초기화
// 2. 서버에서 데이터 가져오기
// 3. 데이터를 HTML로 변환
// 4. 화면에 추가
// 5. 이벤트 처리 (클릭 등)

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
 * 4. loadPosts() 실행 → 업데이트된 데이터 표시
 */
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        console.log('🔙 뒤로가기로 페이지 복원됨 - 데이터 새로고침 시작');
        loadPosts();
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
    
    // 프로필 아이콘 클릭
    const userProfile = document.getElementById('userProfile');
    userProfile.addEventListener('click', function() {
        window.location.href = 'profile';
    });
}

// ============================================
// STEP 3: 게시글 목록 불러오기 (핵심 로직!)
// ============================================
/**
 * 서버에서 게시글 목록을 가져와서 화면에 표시
 * 
 * 흐름:
 * 1. 로딩 표시
 * 2. API 호출
 * 3. 응답 처리
 * 4. HTML 생성
 * 5. 화면에 추가
 */
async function loadPosts() {
    console.log('📡 게시글 목록 요청 시작');
    
    // DOM 요소들 가져오기
    const postsList = document.getElementById('postsList');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const noPosts = document.getElementById('noPosts');
    
    try {
        // 1. 로딩 표시
        loading.style.display = 'block';
        postsList.innerHTML = ''; // 기존 내용 지우기
        
        // 2. API 호출 (api.js의 함수 사용)
        const response = await apiGetPosts();
        
        // 3. 응답 확인
        if (!response.ok) {
            throw new Error('게시글 목록 조회 실패');
        }

        // 4. JSON 데이터 파싱
        const data = await response.json();
        console.log('📥 받은 게시글 데이터:', data);

        // ✅ PostListPageResponse 구조 반영
        // ✅ 실제 posts 배열 꺼내기
        const posts = data.posts || [];
        const hasNext = data.hasNext;
        const nextCursor = data.nextCursor;

        loading.style.display = 'none';
        
        // ✅ 게시글이 없을 경우 처리
        if (posts.length === 0) {
             // 게시글이 없으면 "게시글 없음" 메시지 표시
            noPosts.style.display = 'block';
            return;
        }

        // 7. 게시글 카드 생성 및 추가
        renderPosts(posts);
        
        // ✅ 다음 페이지 로딩 구현을 나중에 추가할 수 있음
        console.log(`📜 다음 커서: ${nextCursor}, 다음 페이지 있음? ${hasNext}`);
        
        
    } catch (error) {
        console.error('❌ 게시글 목록 로드 실패:', error);
        
        // 로딩 숨기기
        loading.style.display = 'none';
        
        // 에러 메시지 표시
        errorMessage.style.display = 'block';
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
 *   commentCount: 5,
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
    card.innerHTML = `
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        
        <div class="post-stats">
            <span class="stat-item">좋아요 ${post.likeCount || 0}</span>
            <span class="stat-item">댓글 ${post.commentCount || 0}</span>
            <span class="stat-item">조회수 ${post.viewCount || 0}</span>
        </div>
        
        <div class="post-footer">
            <div class="post-author">
                ${post.memberProfileImageUrl 
                    ? `<img src="${post.memberProfileImageUrl}" alt="프로필" class="author-profile" />`
                    : '<div class="author-profile"></div>'
                }
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
// 💡 학습 노트: 핵심 개념 정리
// ============================================

/*
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