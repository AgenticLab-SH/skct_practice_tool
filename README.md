# SKCT 온라인 연습 도구

> SK그룹 SKCT(인적성 검사) 실전 환경을 완벽 재현한 무료 온라인 연습 도구

🔗 **[바로 사용하기 →](https://agenticlab-sh.github.io/skct_tool/)**

![OG Image](images/og-image.png)

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| **📋 연습용 OMR** | 5지선다 100문항(5과목×20문항) 답안 마킹. 자동 다음 문제 이동. |
| **🕒 다중 페이즈 타이머** | 과목별 시간 + 쉬는시간 자동 전환. 시간 커스터마이징 가능. |
| **✏️ 메모장 & 그림판** | 문제 넘길 때 자동 초기화 (실제 시험과 동일). 브러쉬 시험장 사양. |
| **🧮 키보드 계산기** | 실제 시험과 동일 제한 (Delete, Esc 금지. C 버튼만 허용). |
| **📊 자동 채점** | 정답 입력 후 채점 및 과목별 상세 통계 확인. |
| **📢 실시간 공지** | 관리자 페이지에서 업데이트 시 Firebase를 통해 실시간 공지 전달. |

---

## 🖥️ 사용 방법

### 1. 답안 작성
- 좌측 **연습용 OMR** 버튼 클릭 → OMR 탭 오픈
- 각 문항 번호를 클릭하여 답 마킹 (자동으로 다음 문제 이동)
- **⏭ 건너뛰기**: 마킹 없이 다음 문제로 이동

### 2. 채점
- **📝 정답 입력 모드로 전환**: 정답을 마킹
- **📊 채점 및 통계 확인**: 결과 확인 (녹색=정답, 적색=오답)
- **📋 과목별 상세 통계**: 과목별 세부 성적 확인

### 3. 타이머 & 레이아웃
- 좌측 **⚙ 설정** 버튼에서 시간 및 영역 비율 조정
- 타이머 ▶ 버튼으로 시작/일시정지

---

## 🗂️ 프로젝트 구조

```
skct_tool/
├── index.html              # 메인 페이지 (SPA)
├── docs-pages.css          # guide/faq/pricing/privacy/terms 공통 스타일
├── guide/                  # 사용 가이드 페이지
├── faq/                    # 자주 묻는 질문 페이지
├── pricing/                # 후원 및 유료 기능 안내 페이지
├── privacy/                # 개인정보 처리 안내 페이지
├── terms/                  # 이용 안내 페이지
├── extension-info.html     # 별도 테스트 자료 안내 페이지
├── main.js                 # 메인 앱 로직
├── main.css                # 메인 스타일
├── admin.html              # 관리자 대시보드 (Firebase Auth 기반)
├── admin.css               # 관리자 페이지 스타일
├── community.js            # 커뮤니티 게시판 로직
├── site-text-config.js     # 운영 문구/미리보기 적용 로직
├── subscription-crypto.js  # 신청 암호화 / 라이선스 서명 검증 유틸
├── functions/              # 민감 흐름 서버 분리용 Firebase Functions 준비 코드
├── database.rules.json     # Firebase RTDB 규칙
├── firebase.json           # Firebase 배포 설정
├── scripts/export_public_clean.ps1  # 공개 배포용 파일만 추출하는 스크립트
├── staging/                # 로컬 전용 스테이징 사본
├── images/                 # 이미지 에셋 폴더
├── docs/                   # 문서 폴더 (운영가이드 등)
├── sitemap.xml             # SEO 사이트맵
├── robots.txt              # 검색 봇 가이드
└── README.md               # 이 문서
```

---

## 📌 기술 스택

- **프론트엔드**: Pure HTML / CSS / JavaScript (프레임워크 없음)
- **호스팅**: GitHub Pages
- **백엔드/DB**: Firebase Realtime Database (공지사항, 커뮤니티, 접속 통계 단일화 및 최적화)
- **인증**: Firebase Authentication (관리자)
- **분석**: Google Analytics (GA4)
- **폰트**: [Pretendard](https://github.com/orioncactus/pretendard)

---

## 🔧 운영 가이드 (공지 & 게시판 & 통계)

공지사항, 커뮤니티 게시판, 통계 기능은 모두 **Firebase Realtime Database**를 단일 소스(Single Source of Truth)로 운영됩니다.

1. **공지사항 처리 (`config/notice`)**
   - 관리자 페이지(`admin.html`)에서 직관적인 UI로 공지사항을 작성/수정할 수 있습니다.
   - 공개 페이지 및 커뮤니티에서는 관리자 페이지에서 저장한 데이터를 읽어서 표시합니다.
   
2. **커뮤니티 및 방문 통계**
   - 불필요한 Firebase 다운로드를 방지하기 위해 실시간 자동 구독 대신 **1회 조회 최적화 방식**으로 게시판이 동작합니다.
   - 관리자 페이지도 게시글 수동 새로고침 방식을 사용합니다.
   - 방문자 카운터와 활성 접속자는 Firebase를 통한 자체 구축 방식으로 운영되고 있습니다.

3. **고급 이용권 보호**
   - 공개 페이지는 더 이상 공개 DB의 계정 해시를 읽어 로그인하지 않습니다.
   - 신청 본문은 관리자 공개키로 암호화되고, 승인 후에는 관리자 서명 라이선스만 사용자에게 전달됩니다.
   - 관리자 페이지를 사용하려면 Firebase Auth 로그인과 RTDB rules 배포가 필요합니다.

4. **문서형 페이지 분리**
   - `guide`, `faq`, `pricing`, `privacy`, `terms` 페이지를 별도 경로로 두어 사용법, 정책, 유료 기능 안내를 한 화면에 섞지 않도록 정리합니다.
   - 확장 ZIP은 메인 앱 안의 직접 다운로드가 아니라 `extension-info.html` 같은 별도 안내 페이지에서만 다룹니다.

5. **민감 흐름 서버 분리 준비**
   - `functions/` 아래에 신청 저장, 신청 조회, 고급 라이선스 조회를 서버 경유로 옮길 준비 코드를 둡니다.
   - 관리자 페이지의 `수동 구독 신청 관리`에서 `보안 API 기본 URL`을 저장하면 메인 앱이 direct RTDB 대신 서버 경로를 우선 사용합니다.

6. **공개 배포 경계 정리**
   - `scripts/export_public_clean.ps1`로 공개 앱에 필요한 파일만 `tmp` 또는 `artifacts/releases` 아래로 추출할 수 있습니다.
   - 운영 반영 전에 이 추출 결과를 기준으로 `public-clean` 브랜치를 만들면 작업 파일과 배포 파일이 덜 섞입니다.

---

## ☕ 후원

이 도구가 도움이 되셨다면 커피 한 잔 후원 부탁드립니다!

👉 [투네이션 후원하기](https://toon.at/donate/foreveryonehappy)

---

## 📧 문의

- **이메일**: zhdlsqpdj@gmail.com
- **GitHub**: [@AgenticLab-SH](https://github.com/AgenticLab-SH)

---

<p align="center">
  <sub>SK 합격하시면 꼭 후원하십쇼!!! ㅋㅋㅋ 🎉</sub>
</p>
