# SKCT Tool 운영 노하우 완전 가이드

> 마지막 수정: 2026-04-03

---

## 1. 프로젝트 기본 정보

| 항목 | 내용 |
|---|---|
| 웹사이트 URL | https://agenticlab-sh.github.io/skct_tool/ |
| GitHub 저장소 | https://github.com/AgenticLab-SH/skct_tool (비공개) |
| 기술 스택 | 순수 HTML5 + CSS3 + Vanilla JavaScript (서버리스) |
| 배포 방식 | GitHub Pages (main 브랜치 자동 배포) |

---

## 2. 커피 후원 시스템 (투네이션)

### 선택 이유
| 플랫폼 | 한국 가능 여부 | 비고 |
|---|---|---|
| Buy Me A Coffee | ❌ 불가 | Stripe 미지원 국가 |
| 계좌/토스 직접 공개 | ⚠️ 위험 | 대포통장·핑돈 사기 → 계좌 정지 가능 |
| **투네이션** | ✅ 권장 | 카카오페이/토스/카드 결제, 법인 정산 |

### 후원 페이지 정보
- 투네이션 후원 URL: https://toon.at/donate/foreveryonehappy
- 대시보드(수익 확인): https://toon.at (로그인)
- 신용카드는 비회원도 가능. 카카오페이/네이버페이는 회원가입 필요.

### 코드 연동 위치
`script.js` 내 `donateToggle` 이벤트 리스너:
```javascript
donateToggle.addEventListener('click', () => {
    const msg = "모두의 편안함을 위해 제가 만든 무료 SKCT Tool입니다! 👨‍💻\n\n지속적인 업데이트 동기부여와 소소한 용돈벌이(?)를 위해 따뜻한 커피 한 잔 나눠주시면 정말 감사히 마시겠습니다! ☕💕\n\n(확인을 누르시면 간편 후원 페이지로 이동합니다)";
    if (confirm(msg)) {
        window.open('https://toon.at/donate/foreveryonehappy', '_blank');
    }
});
```

### 후원 URL 교체 방법
`script.js`에서 `toon.at/donate/foreveryonehappy` 부분만 새 URL로 교체 후 커밋/푸시.

---

## 3. 방문자 통계 시스템

## 3. 방문자 통계 및 동기 부여( gamification ) 시스템

### A. Firebase + Chart.js 직접 연동 시스템 (현재 주력 모니터링 수단)
경쟁 심리 자극을 위해 **모달(`🔥 현황`)에 시각화된 그래프**를 제공합니다.
- **실시간 활성 사용자수 (현재 접속자):** Firebase의 `presence` 기능 (`.info/connected`)을 통해 앱을 열고 있는 유저를 실제 초 단위로 추적합니다. 연결이 끊기면 즉각 삭제됩니다.
- **최근 7일 누적 접속자 추세:** LocalStorage를 활용하여 1일 1회만 Firebase `daily_visits` 카운터를 증가시킵니다. `Chart.js`를 이용한 반응형 꺾은선 그래프가 자동 생성됩니다.
- **운영 팁:** 데이터를 확인하거나 강제로 숫자를 변경하고 싶다면, [Firebase 콘솔](https://console.firebase.google.com/)의 `Realtime Database -> daily_visits` 트리에서 값을 직접 조작하실 수도 있습니다!

### B. 간이 방문자 총합 뱃지 (hits.seeyoufarm.com)
- 2026-04-02 이후의 **전체 역대 누적 접속자**를 보여주는 용도로 통계 모달창 하단에 남아있습니다.

### C. Google Analytics 4 (GA4) ← 상세 통계 전문
| 항목 | 내용 |
|---|---|
| 측정 ID | G-ZLHB1RM91X |
| 대시보드 | https://analytics.google.com |

#### 설치 방법 (`index.html` `<head>` 최상단)
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

> **참고**: 설치 후 첫 48시간은 "데이터 수집 활성화 안됨" 경고가 뜨지만 실시간 탭에서 잡히면 정상 작동 중.

---

## 4. SEO (검색 엔진 최적화)

### 4-1. 현재 적용된 것들 (index.html)
```html
<title>SKCT 연습 도구 | OMR 타이머 메모장 계산기 무료 제공</title>
<meta name="description" content="SK그룹 SKCT 인적성 검사 실전 연습 툴...">
<meta name="keywords" content="SKCT, SK그룹, OMR 카드, 취준생...">
<meta name="robots" content="index, follow">
<meta property="og:title" content="...">       <!-- SNS 공유 미리보기 -->
<meta property="og:description" content="...">
<meta property="og:url" content="https://agenticlab-sh.github.io/skct_tool/">
<link rel="canonical" href="https://agenticlab-sh.github.io/skct_tool/">
```

### 4-2. 크롤링 허용 파일
- `robots.txt` → 검색봇 크롤링 허용 + sitemap 경로 안내
- `sitemap.xml` → 사이트 URL을 검색봇에게 명시

### 4-3. 구글 서치 콘솔 (Google Search Console)
- 소유권 인증 파일: `googleb305551590fcb6e6.html` (레포에 커밋됨)
- 사이트맵 제출: `sitemap.xml`
- 대시보드: https://search.google.com/search-console
- **배포/업데이트 후 팁**: [URL 검사] → URL 입력 → **[색인 요청]** 클릭 → 하루 내 검색 반영 가능

### 4-4. 네이버 서치어드바이저 (최적화 완료)
- ✅ **해결 및 적용 완료**: GitHub Pages(`github.io`) 도메인의 소유권 등록 불가 문제를 해결하기 위해 고유 루트 도메인용 브릿지 리포지토리(`AgenticLab-SH.github.io`)를 개설하고 Redirect 및 `robots.txt`를 세팅하여 인증을 완벽하게 통과했습니다.
- 대시보드: https://searchadvisor.naver.com/
- 현재 정상적으로 `hits` 수집 및 사이트 제목, 설명 등이 네이버 검색 봇에 의해 원활하게 수집되고 있습니다.

### 4-5. 타겟 키워드 전략

| 타겟 키워드 | 난이도 | 공략 가능성 |
|---|---|---|
| `SKCT OMR` | 낮음 | ⭐⭐⭐⭐⭐ |
| `SKCT 인적성 도구` | 낮음 | ⭐⭐⭐⭐⭐ |
| `SKCT 무료 프로그램` | 낮음 | ⭐⭐⭐⭐ |
| `SKCT 연습` | 중간 | ⭐⭐⭐ |
| `SK그룹 인적성 준비` | 중간 | ⭐⭐⭐ |

→ **낮은 난이도 키워드**로 먼저 상위 노출 후 점유율을 높이는 전략이 효과적

### 4-6. 링크 빌딩 (지속적 검색 노출 핵심)
구글은 다른 사이트에서 내 URL을 많이 링크할수록 신뢰 점수를 높임.

- `README.md`에 웹사이트 링크 삽입
- 커뮤니티 게시글 작성 시 URL 직접 노출 (단축 말고 풀 URL)
- 블로그가 있다면 SKCT 관련 글 작성 후 링크 삽입

### 4-7. README.md 활용 (GitHub 검색 노출 동시 달성)
```markdown
# SKCT 실전 연습 툴

SK그룹 SKCT 인적성 실전형 연습 툴
OMR 카드 + 다중 페이즈 타이머 + 메모장 + 그림판 + 계산기

**👉 실제 활용**: https://agenticlab-sh.github.io/skct_tool/
```
→ GitHub 검색에서도 키워드 노출 가능

---

## 5. 홍보 전략 (커뮤니티 직접 홍보)

### 추천 채널

| 플랫폼 | 게시판/채널 | 예상 반응 |
|---|---|---|
| 에브리타임 | 취업/인적성 게시판 | ⭐⭐⭐⭐⭐ 최고 |
| 블라인드 | SK그룹 / 취업 게시판 | ⭐⭐⭐⭐ |
| 카카오 오픈채팅 | "SKCT 스터디" 검색 | ⭐⭐⭐⭐ |
| 네이버 카페 | 취업/인적성 카페 | ⭐⭐⭐ |
| X (구 트위터) | #취준 #SKCT 해시태그 | ⭐⭐⭐ |

### 복붙용 홍보 문구
```
📋 SKCT 실전 연습 툴 무료 공유합니다!

브라우저 하나에 OMR카드+타이머+메모장+계산기가 다 들어있어요.
실제 시험처럼 과목별 타이머가 자동으로 돌아가고,
다음 문제 넘어가면 메모장도 자동 초기화됩니다.

👉 https://agenticlab-sh.github.io/skct_tool/

유용하셨다면 커피 한 잔 ☕ 부탁드립니다!
```
