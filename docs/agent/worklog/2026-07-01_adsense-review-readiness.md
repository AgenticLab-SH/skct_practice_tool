# 2026-07-01 AdSense 검토 준비 보완

## 요청
- AdSense 검토 안내 메일의 권장 사항이 현재 사이트에 반영되어 있는지 확인.
- 로컬에서 개선한 내용이 운영 서버에 반영되어 있는지 확인.

## 확인
- 운영 사이트에는 Guide, FAQ, Pricing, Privacy, Terms, sitemap, robots, AdSense 스크립트, Google Analytics 태그가 존재한다.
- Privacy/Terms/FAQ/Pricing/Guide에는 문의 이메일이 포함되어 있다.
- 별도 `소개` 및 `문의하기` 페이지는 없었으므로 보완이 필요했다.
- `guide/index.html`의 title 태그가 닫히지 않은 상태여서 SEO/문서 파싱상 보완이 필요했다.

## 처리
- `/about/` 소개 페이지를 추가했다.
- `/contact/` 문의하기 페이지를 추가했다.
- Guide, FAQ, Pricing, Privacy, Terms 상단 문서 네비게이션에 About/Contact 링크를 추가했다.
- sitemap.xml에 `/about/`, `/contact/`를 추가했다.
- `guide/index.html`의 title 태그를 정상화했다.

## 검증
- 로컬 서버에서 `/about/`, `/contact/`, `/guide/`, `/faq/`, `/pricing/`, `/privacy/`, `/terms/`, `/sitemap.xml` 모두 200 확인.
