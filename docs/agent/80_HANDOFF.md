# SKCT Tool 다음 작업자를 위한 인수인계서 (Handoff)
작성일시: 2026-04-04 03:45:00 KST

본 문서는 현재까지 완료된 SKCT 연습 도구 프로젝트의 아키텍처 상태와, 다음 작업을 맡게 될 시스템/AI 에이전트가 즉각적으로 문맥을 파악하고 작업을 이어나갈 수 있도록 돕는 인수인계서입니다.

## 1. 프로젝트 주요 아키텍처 요약
SKCT Tool은 별도의 백엔드 서버 인프라(Node.js 등) 없이 **순수 프론트엔드(HTML/JS/CSS) + GitHub Pages + Firebase Realtime Database (BaaS)** 조합으로 구성된 완벽한 Serverless Architecture를 따르고 있습니다.
이로 인해 무상 트래픽 처리가 가능하며 유지비용이 없습니다.

*   **사용자 메인 페이지 (`index.html`)**: OMR 마킹, 계산기, 메모장 등 SKCT 툴의 본체 로직과 실시간 접속자 현황 뷰 로직이 포함되어 있습니다.
*   **관리자 페이지 (`admin.html`)**: 비밀번호(SHA-256 해시)로 보호된 관리자 전용 대시보드이며, 실시간 접속자 체크, DB 강제 제어, 후원 내역(CSV 형태) 업로드, 공지사항 글로벌 조작 기능이 통합 관리됩니다.

## 2. 주요 데이터베이스 구조 (Firebase RTDB)
데이터는 다음과 같은 계층 구조로 실시간 동기화 되고 있습니다.
```text
(root)
 ├── active_visitors/     # 하트비트 방식 실시간 접속자 세션 관리 (Key: SessionID, Value: timestamp)
 ├── daily_visits/        # 일자별 순방문자 카운트 (Key: YYYY-MM-DD, Value: count)
 ├── total_visits/        # 앱 런칭 이후 전체 방문자 누적의 합계 (Value: count)
 ├── config/              # 앱의 전역 환경설정
 │    ├── adminHash/      # 관리자 암호 (최초 접속 시 세팅됨)
 │    ├── appName/        # 앱 노출 이름
 │    ├── notice_help/    # 이용가이드(Help) 창 상단 공지사항 (에디터 포맷)
 │    ├── notice_community/# 커뮤니티 창 상단 공지사항
 │    ├── sponsors/       # 투네이션 파싱 데이터 (Array)
 │    └── useful_links/   # 유용한 링크 모음 (Array)
 ├── posts/               # 커뮤니티 게시글 (커뮤니티 기능 활성 시 작동)
 └── replies/             # 커뮤니티 댓글
```

## 3. 핵심 주의사항 및 작업 가이드 (For Next Agent)
1. **GitHub Pages 캐시 고려**: 코드를 갱신하더라도 전 세계에 배포되는 CDN 갱신 타이밍상 최대 10분의 지연이 발생할 수 있으므로 장애 테스트 시 유의할 것.
2. **`index.html` 건드리지 않기 원칙**: `script.js`나 외부 의존성을 제외하고 본체 파일인 `index.html`은 이미 복잡도가 상당히 팽창해 있습니다. 차후 UI를 추가할 일이 있다면 가급적 외부 CSS나 모듈 패턴으로 분리하는 것을 고려할 것.
3. **Heartbeat TTL 필터 유지**: 실시간 접속자(`active_visitors`) 카운트 로직은 절대 DB의 단순 길이(`Object.keys().length`)로 계산해선 안 됩니다. 반드시 `Date.now() - timestamp < 90000`의 필터 로직을 통과한 인원수만을 산출해야 좀비 노드 버그를 막을 수 있습니다. (`index.html` 및 `admin.html` 참조)
4. **배포 방식**: 단순합니다. 변경 사항을 모두 로컬에서 저장/검증한 뒤 `git push`만 수행하면 GitHub Actions 수준의 처리가 자동 실행되어 라이브됩니다.

## 4. 바로 다음으로 고려해봄 직한 액션 플랜 
*   **디자인 고도화**: 커뮤니티 기능(Q&A, Tip 게시판 등)의 뷰가 다소 밋밋하므로 Glassmorphism 등의 이펙트를 도입해볼 수 있습니다.
*   **코드 스플리팅(Code Splitting)**: `admin.html`이나 `index.html` 내부의 거대한 인라인 `<script>` 파일들을 기능 단위 스크립트 파일로 쪼개어 가독성을 높이는 대형 리팩토링이 필요할 수 있습니다.
