# 커스텀 도메인 + 광고 수익 준비

작성일시: 2026-06-28 KST

현재 라이브: `https://agenticlab-sh.github.io/skct_practice_tool/` (GitHub Pages, `main` → Actions 배포)

> 실제 도메인 구매/DNS 연결과 AdSense 신청은 **사용자 자원/계정**이 필요합니다. 이 문서는 그 절차와
> "코드에서 바꿔야 할 곳"을 사전 정리해, 도메인이 정해지면 빠르게 일괄 반영할 수 있게 합니다.

---

## 1. 도메인 선택

- 권장: 짧고 명확한 **.com** (신뢰도/SEO/광고 승인에 유리). `.io/.app` 은 비싸고, 무료(.eu.org 등)는 신뢰도/광고 승인에 불리.
- 예: `skct-practice.com`, `skcttool.com` 등. 구매는 Cloudflare Registrar/가비아/Namecheap 등(원가 수준 권장).

## 2. GitHub Pages 커스텀 도메인 연결 절차

1. 저장소 루트에 `CNAME` 파일 추가 (내용: `your-domain.com` 한 줄). → 배포 워크플로가 자동 포함(제외 목록에 없음).
2. DNS 설정(도메인 등록기관):
   - **apex(루트) 도메인**: A 레코드 4개 → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **www 서브도메인**: CNAME → `agenticlab-sh.github.io`
   - (apex 대신 서브도메인만 쓸 경우 CNAME 하나로 충분)
3. GitHub repo → Settings → Pages → Custom domain 입력 → **Enforce HTTPS** 체크.
4. DNS 전파(수십 분~수 시간) 후 https 인증서 자동 발급 확인.

## 3. ★ URL 일괄 갱신 대상 (도메인 확정 후 한 번에 수정)

`agenticlab-sh.github.io/skct_practice_tool` → 새 도메인으로 바꿀 파일 (artifacts 미러 제외 — 미러는 배포 안 됨):

| 파일 | 비고 |
|------|------|
| `sitemap.xml` | URL 6곳 (SEO 핵심) |
| `robots.txt` | sitemap 절대경로 1곳 |
| `index.html` | canonical/og:url/메타 4곳 |
| `bypass.html` | 1곳 |
| `faq/index.html`, `guide/index.html`, `pricing/index.html`, `privacy/index.html`, `terms/index.html` | canonical 각 1곳 |
| `chrome-extension/manifest.json`, `chrome-extension/popup.html` | 확장 연결 URL 각 1곳 |
| `README.md`, `docs/SKCT_PRACTICE_TOOL_운영가이드.md` | 문서(배포 영향 없음, 일관성 위해) |

> 확정 후 일괄 치환 명령(예시, 신중히 검토 후):
> `git grep -l "agenticlab-sh.github.io/skct_practice_tool"` 로 대상 확인 → 새 도메인으로 치환 → 배포 전 로컬 검증.
> 경로 형태(`/skct_practice_tool/` 하위경로 → 새 도메인은 루트)가 바뀌므로 **트레일링 경로**도 함께 점검.

## 4. 광고(AdSense) 준비

- **github.io 서브경로의 한계(사용자 의심이 맞음):** 현재 주소는 `agenticlab-sh.github.io/skct_practice_tool/` =
  **유저 페이지의 하위 프로젝트 경로**. 2025~2026 AdSense 는 서브도메인/공유 호스트보다 **자체 도메인을 강하게 선호**하고,
  승인이 더 어렵습니다. 게다가 `ads.txt` 는 **호스트 루트**(`agenticlab-sh.github.io/ads.txt`)에 있어야 인정되는데,
  이는 별도 저장소(`agenticlab-sh.github.io`)의 루트라 이 프로젝트 경로에서 두기 까다롭습니다.
  → **결론: 광고 수익을 노린다면 커스텀 도메인(.com)이 사실상 필수.**
- **정책 일관성(중요):** 집중 화면(OMR/타이머/풀이)은 광고 배제 유지. pricing 의 "풀이 중 광고 없음" 약속 준수.
- 광고는 **비집중 영역에만**: 가이드/FAQ/대기(쉬는시간)/결과 화면 등.
- AdSense 승인 요건 점검:
  - ⬜ 자체 도메인(2번 완료 후) — 승인의 사실상 전제.
  - ✅ 개인정보 처리방침(`privacy/`) 존재 — 광고/쿠키 문구 보강 필요(아래).
  - ✅ 충분한 고유 콘텐츠(가이드/FAQ) — 필요 시 보강.
  - 인적성/시험 콘텐츠 정책 적합성 + 최소 트래픽 확보 확인.
- 승인 후: 비집중 페이지에 광고 슬롯(`<ins class="adsbygoogle">`), 도메인 **루트에 `ads.txt`** 추가.
- 개인정보방침 보강 항목: Google AdSense 사용, 쿠키/식별자, 맞춤형 광고 옵트아웃 링크.

## 5. 권장 순서

1. 도메인 구매 → 2. Pages 연결 + URL 일괄 갱신(3번 표) → 3. 로컬/스테이징 검증 → 4. 사용자 승인 후 운영 반영
→ 5. privacy 보강 + 콘텐츠 점검 → 6. AdSense 신청 → 7. 승인 후 비집중 영역 광고 슬롯.
