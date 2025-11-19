# ============================================
# 프론트엔드 Dockerfile
# Node.js + Express 서버를 Docker 컨테이너로 실행
# ============================================

# 1단계: 베이스 이미지 선택
# Node.js 20 버전의 경량화된 Alpine Linux 기반 이미지 사용
FROM node:20-alpine

# 2단계: 작업 디렉토리 설정
# 컨테이너 내부에서 작업할 디렉토리 생성 및 이동
WORKDIR /app

# 3단계: package.json과 package-lock.json 복사
# 의존성 설치를 위해 먼저 package 파일들만 복사
# (레이어 캐싱 최적화를 위해 코드보다 먼저 복사)
COPY package*.json ./

# 4단계: 프로덕션 의존성 설치
# --production 플래그로 devDependencies는 설치하지 않음
# npm ci는 package-lock.json을 기반으로 정확한 버전 설치
RUN npm ci --only=production

# 5단계: 애플리케이션 코드 복사
# public 폴더와 server.js 등 모든 소스 코드 복사
COPY . .

# 6단계: 포트 노출
# Express 서버가 3000번 포트에서 실행됨을 명시
EXPOSE 3000

# 7단계: 컨테이너 시작 시 실행할 명령어
# server.js를 실행하여 Express 서버 시작
CMD ["node", "server.js"]

# ============================================
# 빌드 및 실행 예시:
# docker build -t amoomal-frontend -f frontend-Dockerfile .
# docker run -p 3000:3000 amoomal-frontend
# ============================================
