# 성장 작업 할 일 (광고 · 분석 · 검색/AI 노출)

작성일시: 2026-06-29 KST
사이트: https://skct.agenticfabworks.com (구주소 github.io는 301 자동 이동됨)

> 구분: [나-코드]=코드/배포로 내가 처리 가능 / [너-계정]=네 계정·심사 필요 / [선택]=optional

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
