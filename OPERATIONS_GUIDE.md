# SKCT Tool 운영 노하우 문서

## 1. 프로젝트 기본 정보
- 웹사이트 URL: https://agenticlab-sh.github.io/skct_tool/
- GitHub 저장소: https://github.com/AgenticLab-SH/skct_tool (비공개)
- 기술 스택: 순수 HTML5 + CSS3 + Vanilla JavaScript (서버리스)
- 배포 방식: GitHub Pages (main 브랜치 자동 배포)

---

## 2. 커피 후원 시스템 (투네이션)

### 선택 이유
- Buy Me A Coffee → 한국 미지원 (Stripe 정책)
- 토스/계좌 직접 공개 → 대포통장/핑돈 사기 위험 (계좌 정지 가능)
- **투네이션(Toonation)** → 한국인 카카오페이/토스/신용카드로 비회원 결제 가능 + 법인 정산으로 계좌 보안 100%

### 후원 페이지 정보
- 투네이션 후원 URL: https://toon.at/donate/foreveryonehappy
- 투네이션 대시보드: https://toon.at (로그인 후 수익 확인)

### 코드 연동 방식
```javascript
// script.js 내 donateToggle 이벤트 리스너
const donateToggle = document.getElementById('donateToggle');
donateToggle.addEventListener('click', () => {
    const msg = "모두의 편안함을 위해 제가 만든 무료 SKCT Tool입니다! ...\n(확인을 누르시면 간편 후원 페이지로 이동합니다)";
    if (confirm(msg)) {
        window.open('https://toon.at/donate/foreveryonehappy', '_blank');
    }
});
```

### 후원 URL 교체 방법
후원 플랫폼이 바뀌면 `script.js`에서 `toon.at/donate/foreveryonehappy` 부분만 새 URL로 교체 후 커밋/푸시.

---

## 3. 방문자 통계 시스템

### A. 간이 방문자 뱃지 (hits.seeyoufarm.com)
- 별도 가입 없이 무료로 누적 카운터 뱃지 제공
- 도움말(HELP) 모달 하단에 삽입됨
- URL 패턴: `https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=인코딩된URL&...`
- **주의**: 새로고침마다 카운트 올라가며 정밀도 낮음 (참고용)

### B. Google Analytics 4 (GA4) - 주요 통계 수단
- 측정 ID: `G-ZLHB1RM91X`
- 연동 계정 구글: (본인 구글 계정)
- 대시보드: https://analytics.google.com

#### 설치 방법 (index.html `<head>` 최상단에 삽입)
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### 볼 수 있는 데이터
- 실시간 접속자 수
- 일별/주별/월별 방문자 추이
- 접속 국가 및 도시
- 사용 기기 (PC/모바일/태블릿)
- 유입 경로 (직접 접속/검색/SNS 링크)
- 평균 체류 시간

---

## 4. SEO (검색 엔진 최적화)

### 적용된 메타태그 (index.html)
```html
<title>SKCT 연습 도구 | OMR 타이머 메모장 계산기 무료 제공</title>
<meta name="description" content="SK그룹 SKCT 인적성 검사 실전 연습 툴...">
<meta name="keywords" content="SKCT, SK그룹, OMR 카드, 취준생 ...">
<meta name="robots" content="index, follow">
<!-- Open Graph (SNS 공유 시 미리보기) -->
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="https://agenticlab-sh.github.io/skct_tool/">
<!-- 정식 URL 명시 -->
<link rel="canonical" href="https://agenticlab-sh.github.io/skct_tool/">
```

### 크롤링 허용 파일
- `robots.txt`: 모든 검색봇 크롤링 허용 + sitemap 경로 안내
- `sitemap.xml`: 사이트 URL 구조를 검색봇에게 명시

### 구글 서치 콘솔 등록 완료
- 소유권 인증 파일: `googleb305551590fcb6e6.html`
- 사이트맵 제출: `sitemap.xml`
- 대시보드: https://search.google.com/search-console

### 네이버 서치어드바이저
- **등록 불가**: GitHub Pages는 `github.io`가 공용 도메인이라 호스트 소유권 인증 불가
- 해결책: 커스텀 도메인 구입 후 연결하면 가능

### 검색 노출 개선 체크리스트
- [x] 한국어 title/description/keywords 메타태그 설정
- [x] Open Graph 태그 (SNS 링크 미리보기)
- [x] robots.txt 생성
- [x] sitemap.xml 생성
- [x] Google Search Console 등록 및 sitemap 제출
- [x] Google Analytics 방문자 추적 설치
- [ ] (선택) 커스텀 도메인 연결 시 네이버 등록
- [ ] (선택) 커뮤니티(에브리타임, 블라인드, 오픈카톡) 홍보 게시글 작성

---

## 5. 홍보 전략 (검색 외 트래픽 획득)

SKCT 준비생이 주로 활동하는 곳에 직접 게시글을 올리면 초기 트래픽 확보에 효과적입니다.

### 추천 커뮤니티
| 플랫폼 | 채널 | 예상 반응 |
|---|---|---|
| 에브리타임 | 취업/인적성 게시판 | ⭐⭐⭐⭐⭐ 최고 |
| 블라인드 | SK그룹 / 취업 게시판 | ⭐⭐⭐⭐ |
| 카카오오픈채팅 | "SKCT 스터디" 검색 | ⭐⭐⭐⭐ |
| 네이버 카페 | 취업/인적성 카페 | ⭐⭐⭐ |
| X (구 트위터) | #취준 #SKCT 해시태그 | ⭐⭐⭐ |

### 추천 홍보 문구 예시
```
📋 SKCT 실전 연습 툴 무료 공유합니다!

브라우저 하나에 OMR카드+타이머+메모장+계산기가 다 들어있어요.
실제 시험처럼 과목별 타이머가 자동으로 돌아가고,
다음 문제 넘어가면 메모장도 자동 초기화됩니다.

👉 https://agenticlab-sh.github.io/skct_tool/

유용하셨다면 커피 한 잔 ☕ 부탁드립니다 (투네이션 연결)
```
