최종 결론부터 말하겠습니다.

**지금 네가 해야 할 일은 “서버 구매”가 아니라 “배포 경계 정리 + Firebase 권한 잠금 + 측정 재설계”다.**
네 8일 데이터는 나쁘지 않습니다. 활성 사용자 3,118명, 페이지뷰 20,582, 재사용자 비율 40.1%, direct 유입 77.4%, organic 10.5%면 **제품 검증은 시작된 상태**입니다. 다만 ZIP에서 본 코드 구조는 공개 앱, 관리자, 자료 보관함, 확장기능, 백업, 실험 파일, Firebase 민감 흐름이 한 배포 원본에 섞여 있습니다. 이 상태로 광고·유료·로그인을 계속 얹으면 사고가 나기 쉽습니다.

그리고 기술적으로도 이유가 분명합니다. GitHub Pages는 **정적 호스팅**입니다. HTML/CSS/JS를 저장소에서 바로 게시하는 구조고, GitHub Free는 public 저장소에서만 Pages를 쓸 수 있으며, Pro/Team/Enterprise는 private 저장소도 가능합니다. 하지만 **Pages 사이트는 저장소가 private이어도 인터넷에 공개**되고, GitHub도 **비밀번호나 카드 정보 같은 민감한 트랜잭션에는 쓰지 말라**고 명시합니다. 현재 규모에서는 Pages의 1GB 게시 크기, 월 100GB 소프트 대역폭, 시간당 10빌드 소프트 제한도 충분합니다. 즉, **사이트 전체를 서버로 옮길 필요는 없고, 민감 로직만 백엔드로 빼면 됩니다.** ([GitHub Docs][1])

아래 가이드는 **아직 아무것도 안 한 상태**를 기준으로, 지금까지 대화한 내용과 ZIP 코드 점검 결과를 모두 반영해서 만든 **최종 실행 순서**입니다.

---

## 0. 네 사이트의 최종 목표 구조

최종 구조는 이렇게 가야 합니다.

* **작업용 저장소**: 전체 코드, 백업, 실험, 관리자, 문서, 스크립트 보관
* **배포용 영역**: 실제 공개 앱에 필요한 파일만
* **공개 앱**: 무료 연습 툴 + 문서 페이지
* **민감 기능**: 신청/상태조회/승인/라이선스/자료보관함 로그인 = 별도 서버측 처리
* **광고**: `/guide`, `/faq`, `/pricing`, 나중의 별도 결과 페이지에만
* **풀이 화면**: 광고 없음

이렇게 가야 하는 이유는 단순합니다. GitHub Pages는 정적 파일 게시에 최적화되어 있고, 민감한 로그인/신청/비밀번호 흐름은 맞지 않습니다. 또 배포 원본은 **특정 브랜치나 `/docs` 폴더**로 지정할 수 있으니, 작업 파일과 배포 파일을 분리하는 것이 가장 안전합니다. 변경 내용이 게시 원본 브랜치로 들어가면 그 원본 폴더 내용이 Pages에 게시됩니다. ([GitHub Docs][2])

---

## 1. “공개 레포”를 새로 만들지 말고, 먼저 **배포용 브랜치**부터 만들어라

### 왜 이렇게 하냐

네가 헷갈렸던 지점이 여기입니다.
내가 말한 핵심은 **공개 레포를 만들라**가 아니라 **공개 배포 영역을 따로 만들라**는 뜻이었습니다.

네 상황에 가장 맞는 기본안은 이겁니다.

### 기본안 A — 가장 추천

**private 작업 저장소 유지 + `public-clean` 배포용 브랜치 생성 + GitHub Pages 게시 원본을 그 브랜치로 지정**

이유:

* 현재 `main`이나 작업 브랜치에는 `_backup`, `_trash`, `scripts`, `admin.html`, `study-archive.html`, `chrome-extension`, `database.rules.json`, 운영 메모 같은 파일이 섞여 있음
* 배포용 브랜치를 따로 두면 실수로 그런 파일을 공개 사이트에 올릴 가능성이 줄어듦
* 공개 레포를 따로 만들지 않아도 됨

### 예외안 B — 이 경우만 public 배포 repo를 만든다

**private repo에서 `설정(Settings) → Pages`가 안 되거나, private repo Pages를 쓸 수 없는 요금제라면**,
작업용 private repo는 유지하고 **작은 public 배포 repo 하나**만 따로 만듭니다.

이유:

* GitHub Free는 Pages를 public 저장소에서만 제공하고, private repo Pages는 상위 플랜에서만 가능합니다. ([GitHub Docs][3])

### GitHub에서 배포용 브랜치 만드는 순서

1. 저장소 메인으로 갑니다.
2. 파일 목록 위쪽의 **브랜치 드롭다운**을 누릅니다.
3. `Find or create a branch...` 칸에 `backup-20260409` 같이 백업 브랜치 이름을 입력합니다.
4. **`Create branch`**를 누릅니다.
5. 다시 같은 방식으로 `public-clean` 브랜치를 만듭니다. ([GitHub Docs][4])

**이유**
바로 삭제 작업 들어가면 되돌리기 번거롭습니다. 먼저 `backup-날짜`를 만들고, 실제 배포 정리는 `public-clean`에서만 하세요.

---

## 2. `public-clean` 브랜치에는 “배포할 파일만” 남겨라

이 단계가 제일 중요합니다.

### 왜 이렇게 하냐

GitHub Pages는 게시 원본의 정적 파일을 그대로 공개합니다. 또 branch source 게시를 쓸 때는 `index.html`이 게시 원본 최상단에 있어야 합니다. 네 ZIP에는 `.nojekyll`이 있고, GitHub Pages는 Jekyll이 아닌 정적 파일도 그대로 게시할 수 있습니다. 기본 Jekyll 빌드에서는 `_`로 시작하는 폴더가 제외되지만, `.nojekyll`을 쓰면 그 보호를 기대하면 안 됩니다. 그래서 `_backup`, `_trash` 같은 폴더는 **배포 원본에서 아예 빼야** 합니다. ([GitHub Docs][5])

### `public-clean`에 남길 것

이 파일들만 시작점으로 남기세요.

* `index.html`
* `main.js`
* `main.css`
* `site-text-config.js`
* `subscription-crypto.js`
* `build-info.js`
* `images/`
* `robots.txt`
* `sitemap.xml`
* `googleb305551590fcb6e6.html`

  * 이미 Search Console HTML 파일 검증에 쓰고 있으면 유지

### `public-clean`에서 빼야 할 것

이건 전부 **배포 원본에서 제거**하세요.

* `admin.html`
* `admin.css`
* `advanced-tools.html`
* `study-archive.html`
* `study-archive.js`
* `study-archive.css`
* `bypass.html`
* `community.js`
* `chrome-extension/`
* `skct_extension.zip`
* `scripts/`
* `staging/`
* `logs/`
* `tmp/`
* `test-results/`
* `_backup/`
* `_trash/`
* `docs/`

  * 작업 문서라면 별도 관리
* `firebase.json`
* `database.rules.json`
* `00_PROMPT.md`
* `35_LEARNING_NOTES.md`
* `50_AGENT_LAST_WORK_REPORT.md`
* `70_USER_TODO.md`
* `90_*.md`
* 기타 운영 메모, 백업 zip, 실험 결과

### GitHub 웹에서 파일/폴더 삭제하는 순서

파일 삭제:

1. 삭제할 파일을 엽니다.
2. 우측 상단 **`⋯` 메뉴**를 누릅니다.
3. **`Delete file`**을 누릅니다.
4. 아래에서 **커밋 메시지**를 입력합니다.
5. **`Commit changes...`**를 누릅니다. ([GitHub Docs][6])

폴더 삭제:

1. 삭제할 폴더로 들어갑니다.
2. 우측 상단 **`⋯` 메뉴**를 누릅니다.
3. **`Delete directory`**를 누릅니다.
4. 삭제 예정 파일 목록을 확인합니다.
5. **`Commit changes...`**를 누릅니다. ([GitHub Docs][6])

**실무 팁**
이 작업은 GitHub 웹보다 **로컬 편집기나 `github.dev`**가 낫습니다. 하지만 네가 메뉴 기준 설명을 원했으니 웹 기준으로 적었습니다.

---

## 3. `index.html`에서 지금 당장 잘라야 할 것

이 단계는 “리팩터링”이 아니라 **노출 차단**입니다.

### 왜 이렇게 하냐

ZIP 기준으로 `index.html`에

* 고급 기능 신청/상태 확인/자료 보관함
* 방문자 통계
* 커뮤니티
* 확장기능 ZIP 안내
* SEO 과한 키워드
  가 섞여 있습니다.

지금은 기능을 더 만드는 단계가 아니라, **공개 앱에서 위험한 진입점과 오해를 부르는 요소를 내리는 단계**입니다.

### `index.html`에서 바로 수정할 것

#### 3-1. `meta keywords` 삭제

검색:

* `<meta name="keywords"`

조치:

* **삭제**

이유:

* Google Search는 `keywords` 메타 태그를 검색 랭킹에 사용하지 않습니다.
* 키워드 반복은 스팸 정책 리스크가 있습니다. ([Google for Developers][7])

#### 3-2. 숨은 키워드 뭉치 문구 축소

검색:

* `id="srMainDescription"`
* `id="srMainTitle"`

조치:

* 과한 키워드 반복 문구를 한두 문장 소개로 축소

이유:

* 숨은 키워드 더미는 사용자에게도 안 좋고 검색에도 안 좋습니다. Google은 키워드 스태핑을 스팸으로 봅니다. ([Google for Developers][7])

#### 3-3. 커뮤니티 진입점 제거

검색:

* `id="commentToggle"`
* 커뮤니티 모달 제목/블록
* `<script type="module" src="community.js"></script>`

조치:

* 버튼, 모달, 스크립트 전부 제거 또는 숨김

이유:

* 현재 `database.rules.json` 기준 `posts`, `replies`, `userLikes`가 사실상 public write라 공개 운영하면 스팸과 낙서가 바로 들어옵니다.

#### 3-4. 방문자 통계 제거

검색:

* `id="statsToggle"`
* `active_visitors`
* `daily_visits`
* `total_visits`
* `live_peak_daily`

조치:

* 통계 카드/모달 제거
* 관련 inline 스크립트 제거

이유:

* 현재 구조는 브라우저가 직접 RTDB에 쓰고 읽는 구조라 통계 오염이 쉽습니다.

#### 3-5. 확장기능/ZIP 안내 제거

검색:

* `id="extensionModal"`
* `skct_extension.zip`
* `가림막 완파`
* `무적모드`
* `링커리어 스크린차단 해제`

조치:

* 관련 UI/모달/다운로드 링크 전부 제거

이유:

* 광고 심사, 신뢰, 정책 리스크를 같이 키웁니다.
* 메인 도메인에서 분리하는 게 맞습니다.

#### 3-6. 고급 기능 public 진입점 제거

검색:

* `id="advancedGuideToggle"`
* `id="helpAdvancedLinkBtn"`
* `id="manualSubscriptionSubmitBtn"`
* `id="manualSubscriptionLookupBtn"`
* `id="advancedModeArchiveBtn"`
* `id="studyArchiveOpenBtn"`

조치:

* 버튼, 카드, 모달, 입력 폼을 공개 앱에서 제거 또는 숨김

이유:

* 현재 고급 신청/상태 확인/자료보관함 흐름은 브라우저에서 직접 DB를 만지는 구조라 공개 앱에 그대로 두면 안 됩니다.

#### 3-7. 문구 충돌 수정

검색:

* `결제/광고 없는`

조치:

* `풀이 중 광고 없음` 또는 `핵심 연습 흐름에 광고 없음`으로 바꾸기

이유:

* 지금 페이지는 “광고/결제 없음”이라고 말하면서, 동시에 후원/유료 이용권 신청을 보여주고 있습니다. 신뢰를 깨는 조합입니다.

### GitHub 웹에서 파일 편집 순서

1. 파일을 엽니다.
2. 우측 상단 **연필 아이콘(Edit)** 을 누릅니다.
3. 내용 수정
4. 아래 **`Commit changes...`** 클릭 ([GitHub Docs][8])

---

## 4. `main.js`에서는 “위험한 연결”만 먼저 끊어라

### 왜 이렇게 하냐

네 `main.js`는 큰 단일 파일입니다. 지금 당장 모듈화하려고 들면 오래 걸리고, 핵심 문제도 안 풀립니다.
지금은 **위험한 경로를 끊는 것**이 먼저입니다.

### `main.js`에서 먼저 검색해서 없앨 것

#### 4-1. 숨은 관리자 진입 제거

검색:

* `window.open('admin.html', '_blank')`

조치:

* 이 블록 제거

이유:

* 현재 도움말 제목 더블클릭으로 관리자 페이지가 열리는 숨은 진입점이 있습니다.
* 공개 앱에 남겨둘 이유가 없습니다.

#### 4-2. 신청/상태 조회 RTDB 직결 끊기

검색:

* `subscriptionRequests`
* `subscriptionRequestLookup`
* `advancedAccountLicenses`

조치:

* 관련 fetch/submit/lookup 코드 제거 또는 진입 불가 처리

이유:

* 지금 구조는 브라우저가 직접 `subscriptionRequests/{id}`와 lookup 노드를 때립니다.
* 민감 흐름을 브라우저에서 처리하면 안 됩니다.

#### 4-3. 자료 보관함/레거시 팝업 경로 제거

검색:

* `study-archive.html`
* `advanced-tools.html`

조치:

* public 진입 이벤트 제거

#### 4-4. 방문자 통계 호출 제거

검색:

* `startPresencePolling`
* `fetchVisitorStats`
* `renderActiveVisitors`

조치:

* 통계 UI 제거와 함께 관련 함수 호출도 제거

#### 4-5. 확장기능 모달 연결 제거

검색:

* `extensionModal`

조치:

* 이벤트 리스너 제거

---

## 5. `scripts/local_admin_key_bridge.py`는 즉시 고쳐라

### 왜 이렇게 하냐

ZIP 기준으로 이 파일의 `ALLOWED_HOSTS`에 `agenticlab-sh.github.io`가 들어 있습니다.
그리고 `admin.html`은 `http://127.0.0.1:47831/keys` 브리지를 바라봅니다.

이건 **로컬 관리자 키 브리지인데 production origin을 허용**하고 있는 셈입니다.
아주 위험한 설계입니다.

### 조치

`scripts/local_admin_key_bridge.py`에서:

* `127.0.0.1`
* `localhost`

만 남기고,

* `agenticlab-sh.github.io`

는 제거하세요.

그리고 이 파일은 **배포 브랜치에 절대 두지 마세요.**

---

## 6. Firebase Realtime Database 규칙부터 잠가라

이건 **오늘 바로** 해야 합니다.

### 왜 이렇게 하냐

네 ZIP의 `database.rules.json` 기준으로 아래가 공개 쓰기 상태였습니다.

* `active_visitors`
* `total_visits`
* `daily_visits`
* `stats/live_peak_daily`
* `posts`
* `replies`
* `userLikes`

또 아래는 child read가 열려 있습니다.

* `subscriptionRequests/$requestId`
* `subscriptionRequestLookup/$lookupKey`
* `advancedAccountLicenses/$loginIdKey`

즉, 지금은 통계 조작, 스팸, 공개 데이터 훑기, 신청 상태 추측 같은 문제가 생길 수 있습니다.

### Firebase 콘솔에서 규칙 화면 가는 순서

1. **Firebase 콘솔**에 들어갑니다.
2. 프로젝트를 선택합니다.
3. 왼쪽 메뉴에서 **`Build(빌드)`** 로 갑니다.
4. **`Realtime Database`** 를 클릭합니다.
5. 상단의 **`Rules`** 또는 **`Security Rules`** 탭을 엽니다. Firebase 공식 문서도 여기서 규칙을 편집하라고 안내합니다. ([Firebase][9])

### 지금 바로 적용할 “임시 봉쇄” 기준

아래는 **일단 막는 기준**입니다.

* `active_visitors` → read/write 모두 false
* `total_visits` → read/write 모두 false
* `daily_visits` → read/write 모두 false
* `stats/live_peak_daily` → read/write 모두 false
* `posts` → read/write 모두 false
* `replies` → read/write 모두 false
* `userLikes` → read/write 모두 false
* `subscriptionRequests/$requestId` → read false
* `subscriptionRequestLookup/$lookupKey` → read false
* `advancedAccountLicenses/$loginIdKey` → read false
* `userStudyLibrary/$uid` → 본인 auth만 유지

**중요**
지금은 기능이 잠깐 죽는 게 맞습니다.
데이터가 열려 있는 상태로 운영하는 것보다 훨씬 낫습니다.

---

## 7. Firebase Authentication도 상황 따라 잠깐 꺼라

### 왜 이렇게 하냐

`study-archive.js`는 Firebase Email/Password Auth를 직접 쓰고 있고, `admin.html`도 같은 계열 로그인 흐름을 씁니다. 이 페이지들이 아직 public에서 열리면 위험합니다.

### Firebase 콘솔 클릭 순서

1. Firebase 콘솔
2. 왼쪽 **`Build(빌드)`**
3. **`Authentication`**
4. 상단 **`Sign-in method`**
5. **`Email/Password`** 항목 확인
6. 필요하면 **비활성화**
7. **`Save`** ([Firebase][10])

### 판단 기준

* `admin.html`, `study-archive.html`이 public 배포에서 완전히 빠졌다면: 당장 안 꺼도 됨
* 아직 접근 가능성이 있으면: **일단 끄는 게 맞음**

---

## 8. GitHub Pages 게시 원본을 `public-clean`으로 바꿔라

### 왜 이렇게 하냐

지금부터는 `main`이 아니라 `public-clean`만 공개 사이트로 나가야 합니다.

GitHub Pages는 게시 소스로 **아무 브랜치**나, 그 브랜치의 `/` 루트 또는 `/docs` 폴더를 지정할 수 있습니다. 또 `index.html`은 선택한 게시 원본 최상단에 있어야 합니다. ([GitHub Docs][2])

### 클릭 순서

1. 저장소 상단 **`Settings`**
2. 왼쪽 사이드바 **`Pages`**
3. **`Build and deployment`**
4. `Source` 를 **`Deploy from a branch`** 로 선택
5. `Branch` 를 **`public-clean`**
6. 폴더를 **`/ (root)`**
7. **`Save`** ([GitHub Docs][11])

### 확인할 것

* `public-clean` 루트에 `index.html` 있어야 함
* 배포 후 실제 사이트가 그 브랜치 기준으로 뜨는지 확인

---

## 9. 문서 URL을 분리해라: `/guide`, `/faq`, `/pricing`, `/privacy`, `/terms`

이건 광고, SEO, 신뢰, GA를 위해 꼭 필요합니다.

### 왜 이렇게 하냐

지금 네 사이트는 모든 걸 한 화면에 몰아넣어서

* 검색 노출이 약하고
* 광고 제어가 안 되고
* GA 주요 이벤트 구성이 꼬이고
* “툴 + 신청 + 상태조회 + 확장기능 + 문서”가 섞여 신뢰가 떨어집니다

또 네 유입의 77.4%가 direct라 검색 자산이 약합니다. 문서 페이지를 따로 만들어야 검색과 광고 자리가 생깁니다.

### GitHub에서 새 페이지 만드는 순서

1. `public-clean` 브랜치에서 저장소 메인으로 갑니다.
2. **`Add file`**
3. **`Create new file`**
4. 파일 이름에 아래처럼 입력합니다.

   * `guide/index.html`
   * `faq/index.html`
   * `pricing/index.html`
   * `privacy/index.html`
   * `terms/index.html`
5. 내용 입력
6. **`Commit changes...`**
   GitHub는 파일 이름에 `/`를 넣으면 폴더를 같이 만듭니다. ([GitHub Docs][12])

### 각 페이지에 꼭 들어갈 내용

#### `/guide/`

* OMR 사용법
* 타이머 사용법
* 메모장/계산기 사용법
* 쉬는 시간 흐름
* 결과 해석

#### `/faq/`

* 새로고침해도 되나
* 모바일/데스크탑 권장
* 시험 종료 후 뭐가 저장되나
* 왜 로그인/자료보관함을 잠시 막았는지
* 고급 기능은 언제 열리는지

#### `/pricing/`

* 후원과 유료 기능 차이
* 7일/14일 가격
* 유료 기능이 정확히 뭔지
* 환불/문의 기준
* 광고 정책: “풀이 중 광고 없음”

#### `/privacy/`

* 수집 정보
* 수집 목적
* 보관 기간
* 삭제 요청 방법
* 문의 이메일

#### `/terms/`

* 무료/유료 범위
* 금지 행위
* 서비스 변경/중단 가능성
* 책임 제한
* 문의/환불 원칙

### 루트(`/`) 페이지에는 이것만 둬라

* 앱 시작 버튼
* 사용법
* FAQ
* 후원/고급 기능
* 개인정보처리방침
* 이용약관

---

## 10. Search Console을 지금 구조에 맞게 다시 세팅해라

### 왜 이렇게 하냐

지금은 검색 유입이 약합니다. 문서 페이지를 만든 뒤 Search Console로 색인 상태를 바로 확인해야 합니다.

### 속성 추가 순서

1. Search Console을 엽니다.
2. 좌측 상단 속성 선택 드롭다운
3. **`속성 추가(Add property)`**
4. 두 가지 중 하나를 선택

#### 도메인이 아직 없을 때

* **`URL 접두어(URL-prefix)`** 선택
* 예: `https://agenticlab-sh.github.io/skct_tool/` 또는 나중에 바뀐 루트 URL

#### 커스텀 도메인을 붙였을 때

* **`도메인(Domain property)`** 선택
* 도메인 속성은 전체 도메인과 모든 프로토콜/서브도메인을 포함하지만, 검증은 DNS만 됩니다. ([구글 고객센터][13])

### 검증 방법

#### 이미 `googleb305551590fcb6e6.html` 같은 HTML 파일이 있다면

* 그 파일을 **게시 원본 루트**에 유지
* Search Console의 HTML 파일 방식으로 검증

Search Console은 HTML 검증 파일이 **루트에 정확히 있어야 하고**, 리다이렉트를 따라가지 않습니다. ([구글 고객센터][14])

#### 커스텀 도메인이라면

* DNS TXT 방식 권장
* 검증 후에도 DNS 레코드를 지우지 마세요. ([구글 고객센터][14])

### 사이트맵 제출

1. 왼쪽 메뉴 **`Sitemaps`**
2. `sitemap.xml` 입력
3. **`Submit`**
   Search Console의 Sitemaps 보고서는 새 사이트맵 제출과 파싱 오류 확인에 쓰입니다. ([구글 고객센터][15])

### URL 검사

1. 상단 검색창 **`URL Inspection`**
2. `/`, `/guide/`, `/faq/`, `/pricing/`, `/privacy/`, `/terms/`를 하나씩 검사
3. 라이브 테스트 후 색인 요청
   URL Inspection은 상단 검색창에서 해당 URL을 직접 넣어 검사합니다. ([구글 고객센터][16])

---

## 11. 커스텀 도메인과 HTTPS는 “문서 페이지 만든 뒤” 붙여라

### 왜 이렇게 하냐

광고, 브랜딩, Search Console, `ads.txt` 모두 커스텀 도메인이 훨씬 좋습니다. 또 GitHub에서 도메인 검증을 해두면 **도메인 takeover 방지**에도 도움이 됩니다. ([GitHub Docs][17])

### 언제 하냐

* 지금 도메인이 없으면: 나중에
* 이미 도메인이 있으면: 문서 페이지 분리 후 바로

### GitHub Pages에 커스텀 도메인 연결

1. 저장소 **`Settings`**
2. **`Pages`**
3. `Custom domain` 입력
4. `Save`
   GitHub는 여기서 DNS 검사와 인증서 발급 절차를 진행합니다. DNS가 맞으면 Let’s Encrypt 인증서를 자동으로 붙입니다. ([GitHub Docs][3])

### 조직 계정이면 도메인 검증도 같이

1. GitHub 우측 상단 **프로필 사진**
2. **`Organizations`**
3. 조직 오른쪽 **`Settings`**
4. `Verified domains` 또는 Pages 관련 도메인 검증 메뉴
5. TXT 레코드 추가
6. **`Verify`**
   GitHub 문서도 조직 도메인 검증은 **리포지토리 설정이 아니라 조직 설정**에서 한다고 설명합니다. 검증 후 TXT 레코드는 유지하세요. ([GitHub Docs][17])

### HTTPS 강제

1. 저장소 **`Settings`**
2. **`Pages`**
3. **`Enforce HTTPS`** 체크 ([GitHub Docs][18])

---

## 12. GA4는 “이벤트 수”가 아니라 “주요 이벤트” 기준으로 다시 깔아라

### 왜 이렇게 하냐

네 앱은 인터랙션이 많아서 단순 이벤트 수는 의미가 약합니다.
지금 이 사이트에서 봐야 하는 건:

* 활성 사용자
* 재방문자/재사용자 비율
* 시험 완료
* 돈이 되는 행동

Google Analytics에서는 **수집한 어떤 이벤트든 주요 이벤트(Key event)** 로 만들 수 있습니다. 주요 이벤트로 만들면 그 행동을 한 사용자 수와 마케팅 성과를 보기 쉬워집니다. ([구글 고객센터][19])

### 먼저 켜야 할 설정

1. Google Analytics
2. **`관리(Admin)`**
3. **`데이터 수집 및 수정(Data collection and modification)`**
4. **`데이터 스트림(Data streams)`**
5. 웹 스트림 클릭
6. 아래쪽 **`Google tag settings`** 또는 **`Configure tag settings`**
7. 여기서 확인/활성화

   * `Page views on browser history change`
   * `Outbound clicks`
   * `File downloads`
     SPA에서는 browser history change가 중요합니다. GA는 pushState, popState, replaceState를 감지해 page_view를 잡습니다. ([구글 고객센터][20])

### 네 사이트에서 추천하는 주요 이벤트 4개

* `practice_start`
* `result_view`
* `support_click`
* `advanced_apply_submit`

### 주요 이벤트 만드는 순서

1. **`관리(Admin)`**
2. **`데이터 표시(Data display)`**
3. **`이벤트(Events)`**
4. **`+ Create event`**
5. 이벤트 이름 입력
6. **`Mark as key event`** 토글 켜기
7. **`Create`**
   이 흐름은 Google 공식 가이드와 같습니다. ([구글 고객센터][21])

### no-code 예시

`result_view`는 나중에 `/result/` 같은 별도 URL이 생기면

* 기존 이벤트: `page_view`
* 조건: URL = 결과 페이지
* 새 이벤트 이름: `result_view`
  로 만들면 됩니다. Google도 `page_view + URL` 조건으로 key event 만드는 예시를 제공합니다. ([구글 고객센터][22])

### 내부 트래픽/개발자 트래픽 필터

1. **`관리(Admin)`**
2. **`데이터 수집 및 수정`**
3. **`데이터 필터(Data filters)`**
4. **`Create Filter`**
5. `Internal Traffic`
6. `Developer Traffic` 도 추가
   Google은 internal traffic, developer traffic 필터를 공식 지원합니다. ([구글 고객센터][23])

### 원치 않는 추천/교차도메인

백엔드나 결제/로그인 도메인을 따로 두면 꼭 같이 해야 합니다.

1. **`관리(Admin)`**
2. 웹 데이터 스트림
3. **`Configure tag settings`**
4. **`Show all`**
5. **`List unwanted referrals`**
   원치 않는 추천과 cross-domain 설정을 해두면 자기 도메인 때문에 referral이 쪼개지는 걸 줄일 수 있습니다. ([구글 고객센터][24])

---

## 13. 신청/상태확인/승인/자료보관함은 **정적 사이트에서 빼고 서버측으로** 옮겨라

### 왜 이렇게 하냐

이게 구조상 핵심입니다.

GitHub Pages는 정적 호스팅이고, server-side 언어를 지원하지 않습니다. GitHub도 민감한 비밀번호 전송에는 쓰지 말라고 했습니다. 네 ZIP에서는 현재 신청 저장, 상태 확인, 라이선스 확인이 브라우저에서 직접 Firebase RTDB를 치는 구조이고, 자료 보관함도 Firebase Email/Password 기반입니다. 이건 공개 운영용 경계가 아닙니다. ([GitHub Docs][1])

### 최종 구조

브라우저 → 서버측 API → Firebase

브라우저가 직접 하지 말아야 할 것:

* 신청 저장
* 상태 조회
* 승인 상태 변경
* 라이선스 발급
* 고급 모드 인증
* 관리자 키 조회

### 로그인 방식도 바꿔라

지금처럼 “이메일 + 비밀번호” 조합으로 신청 상태 확인/고급 로그인 같은 걸 묶지 말고:

* **일회용 코드**
* **매직 링크**
* **세션 토큰**
  중 하나로 바꾸는 게 맞습니다.

### 공개 배포에서 완전히 빼야 할 페이지

* `admin.html`
* `study-archive.html`
* `advanced-tools.html`
* `bypass.html`

---

## 14. 광고는 맨 마지막에, 그것도 문서 페이지에만 넣어라

### 왜 이렇게 하냐

너 사이트는 “도구형”입니다.
페이지뷰/세션이 1.96이라 기사형 사이트처럼 광고 슬롯을 많이 돌려서 벌 구조가 아닙니다.
광고를 세게 넣으면 수익보다 UX 훼손이 먼저 옵니다.

또 AdSense의 자동광고에서 **excluded areas는 in-page Auto ads에만 적용**되고, overlay 형식인 anchor 같은 건 막지 못합니다. 자동광고의 ad intents는 기존 텍스트와 페이지에 광고 링크/앵커/칩을 넣는 형식이라, 지금 같은 집중형 툴에는 안 맞습니다. ([구글 고객센터][25])

### 그래서 초기 광고 원칙은 이거다

* `/app` 또는 현재 실제 풀이 화면: **광고 없음**
* `/guide/` 하단: **Multiplex 1개**
* `/faq/` 하단: **Display 1개**
* `/pricing/` 하단: **Display 1개**
* 나중에 결과 화면이 별도 URL이면: 결과 페이지 하단 Display 1개

### 절대 넣지 말 곳

* OMR
* 타이머
* 메모장/계산기 근처
* 쉬는 시간 팝업
* 설정 모달
* 신청/상태확인 폼
* ZIP/확장기능 다운로드 근처

### AdSense 연결 순서

1. AdSense 홈
2. **`Connect your site to AdSense`** 카드에서 시작
3. 사이트 추가
4. 검증 코드 발급
5. 코드를 각 페이지의 `<head>`에 삽입
   AdSense 공식 문서도 사이트 연결 코드를 `<head>...</head>`에 넣으라고 합니다. ([구글 고객센터][26])

### 광고 단위 만드는 순서

Display:

1. AdSense
2. **`Ads`**
3. **`By ad unit`**
4. **`Display ads`**
5. 이름 지정 ([구글 고객센터][27])

Multiplex:

1. AdSense
2. **`Ads`**
3. **`By ad unit`**
4. **`Multiplex ads`**
5. 이름 지정 ([구글 고객센터][28])

### ads.txt

커스텀 도메인을 쓰면 `ads.txt`는 **루트 도메인**에 있어야 합니다. Google은 root domain의 `ads.txt`를 기준으로 판매자 계정을 확인합니다. ([구글 고객센터][29])

### 예상 수익 — 네 데이터 기준, 내가 둔 가정

공식식은 이것뿐입니다.
**Page RPM = (예상 수익 / 페이지뷰) × 1000** 입니다. ([구글 고객센터][30])

내가 Python으로 네 8일치 20,582 PV를 월 런레이트로 환산하면:

* **보수적 월 PV**: 약 **77,183**
* **상단 월 PV**: 약 **88,209**

  * 4월 9일이 부분 집계일 수 있다는 가정 포함

여기서 내가 둔 가정은:

* 문서/결과 페이지만 광고 가능
* monetizable pageview 비중 18%~45%
* page RPM 1,500원~3,200원 가정

그럼 현실적 범위는 이 정도입니다.

* **최소 침습형**: 월 **2.1만~5.8만 원**
* **균형형**: 월 **4.2만~12.7만 원**
* **공격적**: 월 **6.9만~22.9만 원**

이건 **공식 수익 예측이 아니라 내 가정 모델**입니다.
그리고 네 제품 성격상 나는 **최소 침습형~균형형까지만** 추천합니다.

즉, 광고는 “부수입”이고, 네 사이트는 여전히

* 후원
* 7일/14일 유료 기능
* 나중의 직접 스폰서
  가 더 잘 맞습니다.

---

## 15. 서버를 사야 하냐에 대한 최종 답

**전체 서버는 아직 필요 없습니다.**

### 지금 단계에서 맞는 구조

* **프런트**: GitHub Pages 유지
* **민감 기능만**: 별도 백엔드/API
* **도메인**: 나중에 커스텀 도메인
* **광고**: 문서 페이지만

### 왜 이게 맞냐

* 현재 트래픽은 GitHub Pages 제한 안에 들어옴 ([GitHub Docs][31])
* 앱 자체는 HTML/CSS/JS 정적 도구라 Pages와 잘 맞음 ([GitHub Docs][1])
* 문제는 **보안 경계**이지 렌더링 성능이 아님
* GitHub Pages는 비밀번호/민감 트랜잭션에 부적합 ([GitHub Docs][18])

즉, 지금 돈 써야 할 곳은 **풀 서버**가 아니라
**민감 기능 분리, 도메인, 정책 문서, 측정 정리**입니다.

---

## 16. 네가 지금부터 딱 이 순서로 해라

이 순서를 바꾸지 마세요.

### 1차 — 오늘 바로

1. `backup-날짜` 브랜치 생성
2. `public-clean` 브랜치 생성
3. `public-clean`에서 admin/archive/extension/community/backups 삭제
4. `index.html`에서 고급/통계/커뮤니티/ZIP/keywords 제거
5. `main.js`에서 admin open, subscription lookup, visitor stats 연결 제거
6. Firebase RTDB rules 잠금
7. 필요하면 Firebase Email/Password 임시 비활성화
8. Pages source를 `public-clean`으로 변경

### 2차 — 구조 정리

9. `/guide`, `/faq`, `/pricing`, `/privacy`, `/terms` 생성
10. 루트 페이지를 랜딩 페이지로 정리
11. Search Console 속성 추가
12. `sitemap.xml` 제출
13. 주요 URL URL Inspection

### 3차 — 측정

14. GA4 enhanced measurement 재설정
15. `practice_start`, `result_view`, `support_click`, `advanced_apply_submit` 주요 이벤트 생성
16. internal/developer traffic 필터
17. unwanted referrals / cross-domain 준비

### 4차 — 신뢰/브랜드

18. 커스텀 도메인
19. GitHub Pages HTTPS 강제
20. Search Console 도메인 속성으로 확장

### 5차 — 수익화

21. 광고 문구 정정: `풀이 중 광고 없음`
22. AdSense 사이트 연결
23. `/guide`, `/faq`, `/pricing`에만 수동 광고 단위
24. `ads.txt` 루트 배치
25. 결과 페이지가 분리되면 거기에만 1개 추가

### 6차 — 나중

26. 신청/상태조회/승인/라이선스 전부 서버측 API로 이전
27. 자료 보관함 재오픈
28. 그 다음에야 유료 기능 확대

---

## 17. 마지막으로, 네 코드에 대한 최종 한 문장 평가

**네 문제는 실력이 부족해서가 아니라, 기능을 너무 많이 한 화면·한 배포 원본에 몰아넣어서 경계가 무너진 것**입니다.

좋은 툴이다.
초기 사용자 반응도 괜찮다.
하지만 지금은 기능 추가보다 **경계 정리**가 먼저다.

정리하면 이겁니다.

**private 작업 저장소는 유지해라.**
**배포는 `public-clean` 브랜치로 따로 빼라.**
**GitHub Pages는 계속 써도 된다. 대신 비밀번호·신청·관리자·자료보관함은 빼라.**
**GA와 Search Console을 다시 깔고, 광고는 문서 페이지 하단에만 아주 약하게 시작해라.**

원본 ZIP 기준으로 다음 단계는 이미 명확합니다.
이제 순서대로만 하면 됩니다.

[1]: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages "https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages"
[2]: https://docs.github.com/ko/enterprise-cloud%40latest/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site "https://docs.github.com/ko/enterprise-cloud%40latest/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site"
[3]: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site "https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site"
[4]: https://docs.github.com/articles/creating-and-deleting-branches-within-your-repository "https://docs.github.com/articles/creating-and-deleting-branches-within-your-repository"
[5]: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site "https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site"
[6]: https://docs.github.com/en/repositories/working-with-files/managing-files/deleting-files-in-a-repository "https://docs.github.com/en/repositories/working-with-files/managing-files/deleting-files-in-a-repository"
[7]: https://developers.google.com/search/docs/fundamentals/seo-starter-guide "https://developers.google.com/search/docs/fundamentals/seo-starter-guide"
[8]: https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files "https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files"
[9]: https://firebase.google.com/docs/database/security/get-started "https://firebase.google.com/docs/database/security/get-started"
[10]: https://firebase.google.com/docs/auth/web/password-auth "https://firebase.google.com/docs/auth/web/password-auth"
[11]: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site "https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site"
[12]: https://docs.github.com/en/repositories/working-with-files/managing-files/creating-new-files "https://docs.github.com/en/repositories/working-with-files/managing-files/creating-new-files"
[13]: https://support.google.com/webmasters/answer/34592?hl=en "https://support.google.com/webmasters/answer/34592?hl=en"
[14]: https://support.google.com/webmasters/answer/9008080?hl=en "https://support.google.com/webmasters/answer/9008080?hl=en"
[15]: https://support.google.com/webmasters/answer/7451001?hl=en "https://support.google.com/webmasters/answer/7451001?hl=en"
[16]: https://support.google.com/webmasters/answer/9012289?hl=en "https://support.google.com/webmasters/answer/9012289?hl=en"
[17]: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages "https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages"
[18]: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https "https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https"
[19]: https://support.google.com/analytics/answer/9267568?hl=en "https://support.google.com/analytics/answer/9267568?hl=en"
[20]: https://support.google.com/analytics/answer/12131703?hl=en "https://support.google.com/analytics/answer/12131703?hl=en"
[21]: https://support.google.com/analytics/answer/13128484?hl=en "https://support.google.com/analytics/answer/13128484?hl=en"
[22]: https://support.google.com/analytics/answer/12966437?hl=en "https://support.google.com/analytics/answer/12966437?hl=en"
[23]: https://support.google.com/analytics/answer/10104470?hl=en "https://support.google.com/analytics/answer/10104470?hl=en"
[24]: https://support.google.com/analytics/answer/10327750?hl=en "https://support.google.com/analytics/answer/10327750?hl=en"
[25]: https://support.google.com/adsense/answer/12626543?hl=en "https://support.google.com/adsense/answer/12626543?hl=en"
[26]: https://support.google.com/adsense/answer/7584263?hl=en "https://support.google.com/adsense/answer/7584263?hl=en"
[27]: https://support.google.com/adsense/answer/9274025?hl=en "https://support.google.com/adsense/answer/9274025?hl=en"
[28]: https://support.google.com/adsense/answer/9274644?hl=en "https://support.google.com/adsense/answer/9274644?hl=en"
[29]: https://support.google.com/adsense/answer/12171612?hl=en "https://support.google.com/adsense/answer/12171612?hl=en"
[30]: https://support.google.com/adsense/answer/112030?hl=en "https://support.google.com/adsense/answer/112030?hl=en"
[31]: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits "https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits"
