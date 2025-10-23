// ============================================
// Express 프론트엔드 서버
// 역할: HTML, CSS, JS 파일들을 브라우저에 제공
// ============================================

// Express 불러오기 (Spring Boot의 @SpringBootApplication 같은 역할)
const express = require('express');
const path = require('path');

// Express 앱 생성
const app = express();

// 포트 번호 설정 (백엔드는 8080, 프론트엔드는 3001로 변경)
// 3000번이 사용중이면 3001 사용
const PORT = 3000;

// ============================================
// 1. 정적 파일 제공 설정
// ============================================
// public 폴더의 파일들을 웹에서 접근 가능하게 만들기
// 백엔드 비유: @Configuration으로 static 리소스 경로 설정
app.use(express.static('public'));

// ============================================
// 2. 루트 경로 설정
// ============================================
// localhost:3000/ 접속 시 login.html 보여주기
// 백엔드 비유: @GetMapping("/")
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html'));
});

// ============================================
// 3. 각 페이지별 라우팅 설정 (선택사항)
// ============================================
// 명시적으로 경로를 지정하고 싶다면 추가
// ============================================
// 3. 각 페이지별 라우팅 설정
// ============================================
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'signup.html'));
});

app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'signup.html'));
});

app.get('/posts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'posts.html'));
});

app.get('/posts.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'posts.html'));
});

app.get('/post-detail', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'post-detail.html'));
});

app.get('/post-detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'post-detail.html'));
});

app.get('/create-post', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'create-post.html'));
});

app.get('/create-post.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'create-post.html'));
})


// ============================================
// 4. 서버 시작
// ============================================
// 백엔드 비유: public static void main() { SpringApplication.run(...) }
app.listen(PORT, () => {
    console.log('====================================');
    console.log('🚀 프론트엔드 서버가 시작되었습니다!');
    console.log('====================================');
    console.log(`📍 주소: http://localhost:${PORT}`);
    console.log('📂 정적 파일 경로: public/');
    console.log('====================================');
    console.log('💡 서버를 종료하려면 Ctrl + C를 누르세요');
    console.log('====================================');
});

// ============================================
// 💡 Express 핵심 개념 정리
// ============================================
/*
1. express.static('public')
   → public 폴더를 웹에 공개
   → 브라우저가 /login.html 요청 시 public/login.html 반환

2. app.get('/', ...)
   → GET 요청 처리
   → 백엔드의 @GetMapping과 동일

3. res.sendFile(...)
   → HTML 파일을 응답으로 보내기
   → 백엔드의 return "viewName"과 유사

4. app.listen(PORT, ...)
   → 서버를 특정 포트에서 실행
   → 백엔드의 SpringApplication.run()과 동일
*/