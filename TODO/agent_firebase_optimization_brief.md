# SKCT Tool Firebase 비용 최적화 작업 지시 문서

## 0. 문서 목적
이 문서는 **현재 기능을 유지하면서 Firebase Realtime Database 사용량과 비용을 크게 줄이기 위한 리팩터링 작업 지시서**다.

핵심 목표는 아래 4가지다.

1. 사용자 체감 기능은 유지한다.
2. 공개 페이지의 상시 실시간 구독을 최대한 제거한다.
3. 방문 통계/그래프는 Firebase가 아니라 GA4 기반 캐시로 이관한다.
4. Firebase는 실시간성이 진짜 필요한 최소 기능만 담당하게 만든다.

이 문서는 최신 업로드 코드 기준으로 작성되었다.

---

## 1. 현재 서비스 개요
서비스는 SKCT 온라인 연습 도구이며, Pure HTML/CSS/JavaScript + GitHub Pages + Firebase Realtime Database + GA4 조합으로 운영 중이다.

현재 메인 기능은 다음과 같다.

- OMR 연습
- 타이머
- 메모장 / 그림판
- 계산기
- 사용 가이드(Help)
- 접속자/통계 모달
- 커뮤니티 게시판
- 관리자 페이지(admin.html)
- 후원 링크

현재 메인 페이지에는 GA4 기본 태그가 이미 붙어 있다. Firebase는 공개 페이지와 관리자 페이지에서 현재 접속자, 방문 통계, 게시판, 공지/설정값 등에 사용된다.

---

## 2. 현재 코드 기준 핵심 문제

### 2.1 공개 페이지에서 상시 실시간 구독이 많다
현재 `index.html`은 아래를 포함한다.

- `active_visitors` 전체를 `onValue`로 실시간 구독
- `total_visits`를 `onValue`로 실시간 구독
- stats 모달 오픈 시 최근 7일 `daily_visits`를 7회 개별 `get()`
- Help 공지를 `config/notice` 실시간 구독으로 로드

즉, 공개 페이지에 접속한 모든 사용자가 Firebase를 계속 듣고 있다.

### 2.2 게시판이 posts 전체를 실시간 구독한다
현재 `community.js`는 `onValue(ref(db, 'posts'))`로 전체 게시글 트리를 듣는다.

문제점:
- 좋아요 1개 변화에도 전체 posts 재렌더 가능
- replyCount 변경에도 전체 posts 영향
- 게시판 사용자가 늘수록 다운로드량이 빠르게 증가

### 2.3 좋아요 구조가 비효율적이다
현재 게시글 데이터에 `likedBy` 객체가 직접 들어가 있다.

문제점:
- 목록 로딩 때 게시글 본문 + 모든 좋아요 세션 데이터가 같이 내려올 수 있음
- 게시판이 커질수록 payload가 과도하게 커짐

### 2.4 방문 통계를 Firebase가 담당한다
현재는 `daily_visits`, `total_visits`를 Firebase에 직접 누적하고,
공개 페이지/관리자 페이지/차트가 이를 직접 읽는다.

문제점:
- 방문 수가 많을수록 읽기/쓰기 비용 증가
- 공개 사용자가 차트를 볼 때마다 7회 조회 발생
- `BASE_YESTERDAY_VISITS` 같은 수동 보정값 존재
- GA4가 이미 있으므로 역할 중복

### 2.5 공지/설정값 경로가 혼재되어 있다
현재 구조는 아래처럼 섞여 있다.

- `notice.json` 정적 파일
- `config/notice` Firebase
- `config/popularConfig` Firebase
- `config/adminHash` Firebase

Help 모달, 커뮤니티, 관리자 페이지에서 서로 다른 읽기 방식이 섞여 있어 구조가 불필요하게 복잡하다.

---

## 3. 작업 원칙

1. **사용자 기능은 유지한다.**
2. **실시간은 꼭 필요한 것만 남긴다.**
3. **공개 페이지는 listener 대신 on-demand + polling + cache 중심으로 바꾼다.**
4. **분석/통계는 Firebase에서 GA4로 이관한다.**
5. **관리자 페이지는 편의 기능을 유지하되 저비용 방식으로 바꾼다.**
6. **코드 변경은 점진적으로 하고, 한 번에 전체 구조를 뒤엎지 않는다.**

---

## 4. 최종 목표 구조

### 4.1 Firebase에 남길 것
- presence write
- 게시글/댓글 저장
- 게시글/댓글 수정/삭제
- 관리자용 설정값 저장
- 필요 시 공지 저장

### 4.2 Firebase에서 줄이거나 제거할 것
- 공개 페이지의 `active_visitors` 실시간 구독
- 공개 페이지의 `total_visits` 실시간 구독
- 공개 페이지의 `daily_visits` 7회 조회
- 공개 페이지의 `config/notice` 상시 실시간 구독
- 게시판 전체 `posts` 실시간 구독
- 게시글 목록에서 `likedBy` 전체 다운로드

### 4.3 GA4로 이관할 것
- 일별 방문자 수
- 누적 사용자/트래픽 추이
- 차트용 7일 방문 데이터
- 관리자 대시보드의 방문 수 요약
- 필요 시 기능 사용 이벤트

---

## 5. 반드시 유지해야 하는 UX 요구사항

### 5.1 현재 접속자 기능 유지
사용자는 현재 접속자 숫자를 계속 볼 수 있어야 한다.
단, 실시간 listener가 아니라 **10초 폴링**으로 변경한다.

또한 이 폴링 주기는 관리자 페이지에서 설정 가능해야 한다.

기본값:
- public/client presence poll = 10초
- admin presence poll = 10초

주의:
- stats 모달이 닫혀 있으면 공개 페이지 presence 조회를 중지한다.
- 문서가 hidden 상태면 폴링을 중지하거나 완화한다.
- 탭이 다시 active가 되면 즉시 1회 갱신한다.

### 5.2 게시판 기능 유지
게시판은 유지한다.
실시간 자동 갱신은 제거하고, 사용자가 직접 새로고침하도록 만든다.

요구사항:
- 게시판 최초 오픈 시 1회 조회
- 이후 자동 갱신 없음
- 수동 새로고침 버튼 제공
- 조회 제한(limit)은 두지 않음
- 같은 세션에서 재오픈 시 캐시를 사용할 수 있음

### 5.3 7일 방문 차트 유지
차트는 유지한다.
다만 데이터 출처를 Firebase에서 GA4 캐시 파일로 바꾼다.
갱신 주기는 기본 10분이며, 관리자 페이지에서 클라이언트 재조회 주기를 조절 가능하게 한다.

### 5.4 관리자 페이지 유지
관리자 페이지의 공지 관리, 게시글 관리, 댓글 관리 기능은 유지한다.
다만 통계와 게시글 로딩 방식을 저비용 구조로 바꾼다.

---

## 6. 구현 계획

## 6.1 현재 접속자(Presence) 최적화

### 현재 문제
- 공개 페이지가 `active_visitors` 전체를 실시간 구독 중
- 관리자 페이지도 동일하게 실시간 구독 중
- 접속/이탈마다 모든 리스너에 변경 전파 가능

### 목표 구조

#### write는 유지
- `.info/connected` 기반 presence write는 유지한다.
- `onDisconnect().remove()`도 유지한다.

#### read는 폴링으로 변경
- 공개 페이지에서는 `onValue(active_visitors)` 제거
- 관리자 페이지에서도 `onValue(active_visitors)` 제거
- 대신 REST API `shallow=true` 또는 최소 payload 1회 조회 방식으로 N초마다 count 계산

#### 추가 최적화
- 브라우저당 대표 탭 1개만 presence write 하도록 leader election 적용 검토
- `BroadcastChannel` 우선, fallback으로 `localStorage` heartbeat 사용 가능
- 팝업 모드/중복 창에서 presence가 과다 집계되지 않도록 한다

### 구현 요구사항
- `config/publicRuntime/presencePollSec` 값 추가
- 기본값 10
- stats 모달이 열렸을 때만 공개 페이지 presence polling 시작
- stats 모달이 닫히면 중지
- page visibility hidden이면 일시정지

### 산출물
- `presenceService` 모듈 또는 유틸 함수
- `startPresencePolling()` / `stopPresencePolling()` 분리
- 기존 `onValue(presenceRef)` 제거

---

## 6.2 방문 통계와 7일 차트의 GA4 이관

### 현재 문제
- `daily_visits`, `total_visits`를 Firebase에서 직접 누적
- 공개 페이지 차트 오픈 시 최근 7일 7회 개별 `get()` 호출
- `BASE_YESTERDAY_VISITS` 보정값 사용
- 관리자 페이지도 Firebase 통계 사용

### 목표 구조
방문 통계는 Firebase에서 제거하고 **GA4 Data API 기반 정적 캐시**로 전환한다.

### 제안 구조

#### 1. 정적 캐시 파일 생성
예시 파일:
- `/data/analytics-cache.json`

예상 구조:
```json
{
  "generatedAt": "2026-04-03T12:00:00Z",
  "last7days": [
    {"date":"2026-03-28","users":123},
    {"date":"2026-03-29","users":145}
  ],
  "todayUsers": 132,
  "totalUsersApprox": 9876,
  "cacheTtlSec": 600
}
```

#### 2. 캐시 생성 방식
- GitHub Action 또는 외부 스크립트가 GA4 Data API `runReport` 호출
- 10분 주기로 캐시 JSON 업데이트
- 공개 페이지와 관리자 페이지는 Firebase 대신 이 파일을 읽음

#### 3. 공개 페이지
- stats 모달 열릴 때 `analytics-cache.json` 1회 fetch
- localStorage/sessionStorage TTL 캐시 가능
- 7회 Firebase 조회 제거

#### 4. 관리자 페이지
- 오늘 방문자, 누적 방문자도 동일한 cache 파일 사용
- 관리 페이지는 자체 주기로 refetch 가능

### 구현 요구사항
- 기존 `daily_visits`, `total_visits`, `BASE_YESTERDAY_VISITS` 로직 제거
- Firebase transaction 기반 방문 집계 제거
- 클라이언트는 GA cache만 읽음
- cache TTL 기본값 600초
- admin 설정에서 "클라이언트 새로고침 주기" 조절 가능

### 주의
- 캐시 생성 주기와 클라이언트 재조회 주기는 분리 가능
- 캐시 생성 주기를 admin에서 동적으로 바꾸는 것은 GitHub Actions 구조상 비효율적일 수 있으므로,
  우선은 **cache 생성 10분 고정 + 클라이언트 refetch 주기 설정 가능** 구조로 시작

---

## 6.3 게시판(posts) 최적화

### 현재 문제
- `community.js`가 `onValue(ref(db, 'posts'))`로 전체 게시글 구독
- 작은 변경도 전체 posts 재처리 가능

### 목표 구조
- 게시판 오픈 시 1회 `get(posts)`
- 자동 실시간 갱신 제거
- 수동 새로고침 버튼 제공
- 새로고침은 사용자가 직접
- 조회 limit은 두지 않음

### 구현 요구사항
- `startListening()` / `stopListening()` 제거 또는 deprecated 처리
- `loadPostsOnce()` 함수 신설
- 게시판 상단에 `새로고침` 버튼 추가
- 게시판 모달/패널 최초 오픈 시 1회 로드
- 같은 세션에서 다시 열면 메모리 캐시 사용 가능
- 사용자가 새로고침 버튼을 누르면 강제 최신화

### 추가 최적화
- 카테고리 필터/정렬은 로컬 메모리 캐시에서 처리
- FAQ/인기글도 추가 Firebase read 없이 로컬 posts 데이터에서 계산

---

## 6.4 좋아요 데이터 구조 분리

### 현재 문제
각 post 아래에 `likedBy` 객체가 직접 들어있다.

### 목표 구조
게시글 목록과 좋아요 세션 데이터를 분리한다.

### 새 구조 예시
- `posts/{pid}`
  - content
  - nickname
  - category
  - timestamp
  - likesCount
  - replyCount
  - pinned
  - deleted
- `userLikes/{sessionId}/{pid}: true`

### 동작 방식
- 게시글 목록 로딩 시 `posts`만 받음
- 현재 세션 좋아요 상태는 `userLikes/{sessionId}` 1회 조회
- 좋아요 클릭 시:
  - `userLikes/{sessionId}/{pid}` set/remove
  - `posts/{pid}/likesCount` runTransaction

### 기대 효과
- 게시판 목록 payload 대폭 감소
- 좋아요 세션 맵이 게시글 목록에 섞이지 않음
- 기능 유지

### 주의
- 기존 `likes` 필드는 `likesCount`로 명확히 변경 권장
- 마이그레이션이 부담되면 우선 `likes` 유지, `likedBy`만 분리해도 됨

---

## 6.5 댓글(replies) 최적화

### 현재 상태
- 게시글 확장 시 `get(replies/${pid})`
- 이 방향 자체는 괜찮음

### 개선점
- 댓글은 lazy load 유지
- 같은 세션에서 같은 post 댓글 재오픈 시 메모리 캐시 사용
- 댓글 작성/수정/삭제 후 해당 post 댓글 캐시만 무효화
- 관리자 reply modal도 같은 캐시 전략 적용

### 구현 요구사항
- `replyCache[pid]` 구조 추가
- `loadReplies(pid, {force:false})` 함수화
- 수정/삭제/등록 후 `force:true` 재로드

---

## 6.6 공지 및 설정값(config) 정리

### 현재 문제
공지/설정값이 아래처럼 혼재되어 있다.

- `notice.json`
- `config/notice`
- `config/popularConfig`
- `config/adminHash`

그리고 공개 페이지/커뮤니티는 Firebase 실시간 구독으로 읽는 부분이 있다.

### 목표 구조
Firebase는 유지하되 **공개 페이지에서는 one-shot + cache 방식**으로 읽는다.

### 권장 구조

#### Firebase 경로 재편
- `config/publicRuntime`
  - `presencePollSec`
  - `statsRefreshSec`
  - `noticeCacheTtlSec`
  - `communityAutoRefresh` = false
- `config/notice`
- `config/popularConfig`
- `config/adminHash`

#### 공개 페이지
- Help 모달 오픈 시 `config/notice` 1회 get + localStorage TTL cache
- community 오픈 시 `config/popularConfig` 1회 get + cache
- `adminHash`는 공개 페이지가 읽지 않도록 구조 조정

#### 관리자 페이지
- 설정값 편집 UI 확장
- 기존 공지/인기글 기준 설정 유지
- 런타임 설정 카드 추가

### 중요한 요구사항
- `config` 전체를 통째로 듣는 `onValue(ref(db,'config'))` 제거
- 반드시 필요한 하위 노드만 1회 get 또는 관리 페이지에서만 수정

---

## 6.7 관리자 페이지 최적화

### 현재 문제
관리자 페이지도 통계와 게시글을 실시간 구독하는 구조다.

### 목표 구조
- 관리자 페이지는 실시간보다 **저비용 + 수동 제어** 중심

### 변경 요구사항

#### 통계 카드
- `statActive`: presence polling
- `statToday`, `statTotal`: analytics-cache.json 사용
- `statPosts`: 게시글 로드 시점에 계산

#### 게시글 관리
- 페이지 진입 후 1회 posts 로드
- 새로고침 버튼 제공
- 자동 실시간 구독 제거

#### 댓글 관리 모달
- 열 때 1회 조회
- 캐시 가능

#### 설정 관리
새 카드 추가:
- 현재 접속자 조회 주기(초)
- 차트 데이터 클라이언트 재조회 주기(초)
- 공지 캐시 TTL(초)

이 값들은 `config/publicRuntime`에 저장

---

## 7. 우선순위

### Phase 1 — 비용 급감용 필수 작업
1. 공개 페이지 `active_visitors` 실시간 구독 제거
2. 공개 페이지 방문 통계 Firebase 의존 제거
3. 게시판 전체 `posts` 실시간 구독 제거
4. Help/Community 공개 구독을 one-shot + cache로 변경
5. `BASE_YESTERDAY_VISITS` 제거

### Phase 2 — 데이터 구조 최적화
6. `likedBy` 분리
7. replies 캐시 추가
8. 관리자 페이지 live 구독 제거

### Phase 3 — 운영 편의성 강화
9. admin 런타임 설정 UI 추가
10. analytics cache fetch 구조 정리
11. leader tab 기반 presence write 최적화

---

## 8. 절대 하지 말 것

1. 사용자 기능을 눈에 띄게 제거하지 말 것
2. 공개 페이지에서 `config` 전체 실시간 구독을 유지하지 말 것
3. `posts` 전체 실시간 구독을 다른 큰 listener로 대체하지 말 것
4. 방문 통계를 Firebase에 계속 추가 누적하지 말 것
5. 관리자 편의를 이유로 공개 사용자에게 상시 listener를 다시 붙이지 말 것

---

## 9. 성공 기준

### 비용 측면
- 10분당 다운로드 사용률이 현재 대비 크게 낮아져야 함
- 공개 페이지 1인당 Firebase 다운로드량이 체감적으로 감소해야 함

### 기능 측면
- 현재 접속자 숫자는 유지
- 게시판 사용 가능
- 좋아요/댓글/관리 기능 유지
- 7일 차트 유지
- 공지 표시 유지

### UX 측면
- 공개 페이지에서 stats 모달을 열었을 때 1~2초 안에 숫자/차트 표시
- 게시판 수동 새로고침이 명확하게 보일 것
- 관리자 페이지에서 폴링 주기/TTL을 조정할 수 있을 것

---

## 10. 권장 구현 세부안

### 10.1 presence count 구현
가능하면 아래 순서로 검토

1. REST shallow GET
2. 인증이 필요 없으면 공개 읽기 사용
3. 응답 객체 key count로 현재 접속자 수 계산
4. polling scheduler는 stats modal open 상태에만 활성화

### 10.2 analytics cache 구현
권장 방식

- GitHub Action cron 10분
- Node script로 GA4 Data API `runReport`
- `/data/analytics-cache.json` 커밋 또는 배포 산출물 갱신

### 10.3 게시판 캐시
- `postsCache = { data, fetchedAt }`
- stale threshold 예: 60초
- 사용자가 새로고침 누르면 강제 갱신

### 10.4 replies 캐시
- `replyCache[pid] = { data, fetchedAt }`
- write 이후 해당 pid만 invalidate

---

## 11. 최종 방향 요약
이 작업의 본질은 Firebase를 버리는 것이 아니라,

- **실시간이 필요한 것만 Firebase에 남기고**
- **공개 사용자의 상시 listener를 없애고**
- **통계는 GA4 캐시로 이관하며**
- **게시판은 수동 새로고침 + 데이터 구조 분리로 경량화**

하는 것이다.

최종적으로 agent는 아래 결과를 만들어야 한다.

1. 현재 접속자 유지 + 폴링화
2. 방문 통계 Firebase 제거 + GA4 cache 전환
3. 게시판 실시간 제거 + 수동 refresh
4. 좋아요 구조 분리
5. replies 캐시
6. 공지/설정 공개 구독 제거
7. 관리자 런타임 설정 추가

