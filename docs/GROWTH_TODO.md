# 성장 작업 할 일 (광고 · 분석 · 검색/AI 노출)

작성일시: 2026-06-29 KST
사이트: https://skct.agenticfabworks.com (구주소 github.io는 301 자동 이동됨)

> 구분: [나-코드]=코드/배포로 내가 처리 가능 / [너-계정]=네 계정·심사 필요 / [선택]=optional

## 0-A. 도구 사이트 확장 + SEO 강화 (2026-06-29 완료)

- [x] [나-코드] tools 6종 라이브: 연봉 실수령액 / D-Day / 만 나이 / 글자수 세기 / 주식 평단가 / 복리 (전부 값검증)
- [x] [나-코드] 자동광고 전환: 무효 `data-ad-slot="auto"` 수동블록 제거 → AdSense 자동광고(head 스니펫) 기반
- [x] [나-코드] 제목 40자 이내(네이버 권고), FAQPage + ItemList + WebApplication 구조화 데이터, favicon
- [x] [나-코드] sitemap/랜딩/허브 카드 6종 동기화, 9개 URL 라이브 200 검증
- [ ] [너-계정] 승인 후 AdSense 대시보드에서 자동광고 ON (집중화면 배제는 거기서 토글)
- [ ] [너-계정] 새 도구 URL 네이버 수집요청(`/average/`, `/compound/` 추가분)

## 0-B. dev/projects 상업화 폴더 평가 (2026-06-29)

세 폴더 조사 결과: 대부분 **서버·DB·결제·인증이 필요한 SaaS형**이라 "정적 + AdSense" 모델과 안 맞고, 하룻밤 자율 배포 위험. 별도 인프라 작업(서버/도메인/결제)으로 분리 필요.
- `02_trading_automation`: 실거래·키움 자격증명 대형 백엔드 → 정적화 불가. (영감 → 금융 계산기로 전환: 평단가·복리 추가함)
- `01_YoutubePlaylistsManager`: 백엔드+private 데이터 앱 → 정적화 불가.
- `03/오르다·biz_diagnostic·grant_matcher·invest_intel`: SaaS형(결제·DB·구독) → 별도 풀배포 프로젝트.
- 채택 전략: 각 도메인에서 **검색량 크고 정적 완결되는 계산기**를 tools에 계속 추가(현재 6종). 다음 후보: 대출이자(DSR)·부가세·환율·전세대출·퇴직금 계산기.

## 0. 신규 사이트 런칭 (2026-06-29 완료)

- [x] [나-코드] 루트 허브 `agenticfabworks.com` 제작·배포 (repo: agenticfabworks_hub) — HTTPS 200, AdSense 스니펫+ads.txt+GA
- [x] [나-코드] 도구 모음 `tools.agenticfabworks.com` 제작·배포 (repo: agenticfabworks_tools)
- [x] [나-코드] 연봉 실수령액 계산기 `tools.../salary/` (Node 값검증 완료)
- [x] [나-코드] D-Day 계산기 `tools.../dday/`
- [x] [나-코드] 허브에 AdSense 루트 확인용 콘텐츠+스니펫 → AdSense "사이트 확인" 재시도 가능 상태
- [ ] [너-계정] AdSense 사이트 확인 재요청(이제 루트 콘텐츠 있음) + 심사
- [ ] [너-계정] Search Console: `agenticfabworks.com`·`tools.agenticfabworks.com` 속성 추가 + sitemap 제출
      (도메인 속성이면 `agenticfabworks.com` 하나로 전부 커버. sitemap: 각 `/sitemap.xml`)
- [ ] [너-계정] 네이버: 두 사이트 등록 + 소유확인(메타값 hub index에 포함) + sitemap 제출
- [x] [나-스킬] 전 과정 자동화 스킬 `web-service-launch-monetize` 생성 (~/.codex/skills)

## 0-1. SKCT 좌측 패널·고급기능 개선 (대형, 다음 작업)

- [ ] [나-코드] 좌측 패널 정리: 미완성/중복/비일관 UI 점검 후 정돈 (디자인·형식 유지, 내부만)
- [ ] [나-코드] 고급 구독 기능 미구현 항목 전수 점검·완성
- 원칙: `backup-20260629-045539-pre-optimize` 태그 존재. 작업 전 새 백업 → 브랜치 → 로컬검증 → 승인 후 운영.

---

## 1. 광고 (AdSense)

- [ ] **[너-계정] AdSense 가입 + 사이트 등록 + 심사 통과** → 게시자 ID(ca-pub-...) 발급
- [ ] [나-코드] 루트 `ads.txt` 추가 (`google.com, pub-XXXX, DIRECT, f08c47fec0942fa0`)
- [ ] [나-코드] AdSense 자동광고 스니펫 또는 수동 광고단위 삽입
- [ ] [나-코드] 비집중 영역에만 광고 배치(가이드/FAQ/결과/대기). 집중화면(OMR/타이머/풀이) 광고 배제 유지
- [x] [나-코드] privacy 페이지 광고·쿠키·맞춤광고 거부 문구 (완료)

## 2. 분석 (Analytics)

- [x] [나-코드] Google Analytics(GA4) 이미 설치됨: `G-ZLHB1RM91X` → 새 도메인에서도 자동 집계
- [ ] [너-계정][선택] GA4 데이터 스트림 URL을 `skct.agenticfabworks.com`으로 갱신(보고서 정확도)
- [ ] [나-코드][선택] 커스텀 이벤트 추가 점검(practice_start/result_view/advanced_apply 등 이미 존재)
- [ ] [너-계정][선택] Cloudflare Web Analytics 켜기(쿠키리스, 동의배너 불필요)

## 3. 구글 검색 노출 (Search Console + SEO)

- [ ] **[너-계정] Google Search Console에 `skct.agenticfabworks.com` 등록 + 소유확인 + sitemap 제출**
- [ ] [나-코드] sitemap `lastmod` 최신화 + 페이지 우선순위 점검
- [ ] [나-코드] 각 페이지 title/description/keywords 도메인 기준 재점검
- [ ] [나-코드] JSON-LD(WebApplication/FAQPage 등) 보강
- [ ] [나-코드] OG/twitter 카드 이미지 실제 렌더 확인

## 4. AI 노출 (ChatGPT/Perplexity 등 LLM 크롤러)

- [ ] [나-코드] `llms.txt` 생성(사이트 요약 + 주요 링크, AI 친화 색인)
- [ ] [나-코드] robots.txt에 AI 크롤러(GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended) 허용 명시
- [ ] [나-코드] 구조화 데이터/명확한 heading으로 LLM 파싱 친화 콘텐츠 유지

## 5. 네이버 노출

- [ ] **[너-계정] 네이버 서치어드바이저에 `skct.agenticfabworks.com` 등록 + 소유확인 + sitemap 제출 + 수집요청**
- [x] [나-코드] robots.txt Yeti(네이버봇) 허용 + sitemap 라인 (완료)
- [x] [나-코드] naver-site-verification 메타태그 (index.html에 존재 — 소유확인에 사용)

## 6. 도메인 이전 마무리

- [x] 구주소 → 신주소 301 자동 리다이렉트 (GitHub Pages 기본동작, 확인완료)
- [x] 코드 내 전 주소 신도메인으로 교체 + HTTPS 강제 (완료)
- [ ] [선택] 안정화 후 구주소 흔적 정리(현재는 자동 연결 유지가 안전)

---

## 지금 막혀 있는 핵심 (네가 해야 풀림)
1. AdSense 가입·심사 → 광고 ID
2. Google Search Console 등록 → 구글 색인
3. 네이버 서치어드바이저 등록 → 네이버 색인

위 3개의 계정 작업만 해주면, 나머지 코드/배포(ads.txt, 광고슬롯, llms.txt, robots AI봇, JSON-LD, sitemap)는 내가 다 처리.
