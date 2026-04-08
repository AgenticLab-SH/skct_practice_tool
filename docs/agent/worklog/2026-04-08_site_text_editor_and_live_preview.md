# 2026-04-08 사이트 텍스트 편집기 및 실시간 미리보기 구축 기록
작성일시: 2026-04-08 15:14:33 KST

## 사용자 요청
- 현재 웹 사이트에서 보이는 세부 문구를 개발자 페이지에서 쉽게 수정하고 싶음
- 가능하면 실제 페이지를 보면서 직접 수정하는 흐름이 필요함
- 설계와 제작을 깊게 고민한 뒤 운영에 반영까지 원함

## 기존 문제
- 후원 문구처럼 일부 영역만 관리자 페이지에서 바꿀 수 있었음
- 많은 안내 문구가 `index.html`, `main.js` 안에 직접 박혀 있어 운영자가 코드를 열지 않으면 수정이 어려웠음
- 어떤 문구가 어느 화면에 대응되는지 바로 찾기 어렵고, 수정 후 실제 보이는 모습도 즉시 확인하기 어려웠음

## 적용한 구조
- `site-text-config.js`
  - 운영 페이지와 관리자 페이지가 함께 쓰는 공통 텍스트 카탈로그 추가
  - 기본 문구, 선택자, 속성(`text`, `html`, `placeholder`, `content`, `title`)을 한곳에서 관리
  - iframe 미리보기와 클릭 선택을 위한 postMessage 브리지 추가
- `admin.html`
  - `사이트 텍스트 편집기` 섹션 추가
  - 검색 가능한 문구 목록, 선택된 문구 편집 textarea, 실시간 상태 메시지, 운영 페이지 iframe 미리보기 추가
  - `미리보기 클릭 선택` 토글을 넣어 실제 페이지 요소를 눌러 해당 문구를 바로 선택할 수 있게 구성
  - `config/siteTextConfig` 저장 로직과 전체 저장 흐름에 신규 텍스트 설정 반영
- `index.html`
  - 주요 안내 블록에 안정적인 ID를 부여해 카탈로그가 정확히 연결되도록 정리
  - `textEditor=1` 런타임 플래그와 `site-text-config.js` 로드 추가
  - Firebase 설정 로드 시 `config/siteTextConfig`를 운영 화면에 적용하도록 연결
- `main.js`
  - 고급 이용 안내, 신청/조회 관련 상태 메시지 일부를 텍스트 카탈로그 기반으로 치환
- `staging/site/index.html`
  - 동일한 텍스트 로더를 읽도록 연결해 스테이징 사본도 같은 확장 포인트를 공유하게 정리

## 핵심 설계 판단
- 단순히 입력칸을 몇 개 더 늘리는 방식 대신 `텍스트 카탈로그 + 선택자 매핑 + 미리보기 브리지` 구조를 선택함
- 이유
  - 운영자가 어떤 문구를 바꾸는지 찾는 시간이 줄어듦
  - 새 문구 추가 시 HTML/JS/관리자 페이지를 매번 따로 설계하지 않고 카탈로그에 항목을 추가하면 됨
  - 저장 전에도 iframe에서 실제 렌더링을 즉시 확인할 수 있어 문구 수정 실수가 줄어듦

## 검증
- `node --check site-text-config.js`
- `node --check main.js`
- 로컬 정적 서버(`python -m http.server 4173`)로 실제 페이지 확인
- 브라우저 검증 결과
  - 운영 페이지에서 `applyRemoteSiteTextConfig()` 호출 시 버튼/모달 제목이 즉시 변경되는 것 확인
  - `textEditor=1` 모드에서 요소가 `data-site-text-key`로 주석 처리되고 선택 모드 하이라이트가 동작하는 것 확인
  - 관리자 페이지 숨김 대시보드 DOM 기준으로 텍스트 목록 렌더링, 검색, 선택, 미리보기 highlight, iframe 실시간 반영이 동작하는 것 확인

## 후속 보정
- 사용자 피드백에 따라 사이트 텍스트 편집기 좌측 목록이 별도 스크롤되도록 `admin.css`를 보정함
- 원인
  - 좌측 패널은 `overflow-y: auto`만 있었고, 실제 스크롤 높이를 제한하는 `max-height`와 flex 축소 조건이 약했음
  - 우측 미리보기 iframe이 길어질 때 좌측 패널도 같이 늘어나 목록만 독립적으로 스크롤된다는 느낌이 약해졌음
- 조치
  - `.site-text-editor`에 `align-items: start`를 추가해 사이드바가 우측 높이에 맞춰 과도하게 늘어나지 않게 함
  - `.site-text-sidebar`를 `position: sticky`, `top: 16px`, `max-height: calc(100vh - 32px)`로 제한해 화면 내에서 고정형 작업 패널처럼 동작하게 함
  - `.site-text-list`에 `flex: 1 1 auto`, `min-height: 0`, `overscroll-behavior: contain`을 추가해 내부 목록이 독립 스크롤 컨테이너로 안정적으로 작동하게 함
- 모바일 구간에서는 sticky를 해제해 기존 세로 흐름을 유지함
- 로컬 브라우저 데스크톱 검증(`1440x1200`)에서 좌측 목록의 `scrollHeight > clientHeight` 상태와 sticky 상단 고정을 함께 확인함

## 저장 구조 메모
- 사이트 텍스트 편집기의 실제 저장 위치는 Firebase Realtime Database의 `config/siteTextConfig` 경로임
- 좌측 목록 선택과 textarea 입력은 먼저 브라우저 메모리의 `loadedConfig.siteTextConfig`와 iframe 미리보기에만 반영됨
- 실제 운영 설정값 반영은 `저장` 버튼 또는 전체 저장 흐름에서 `saveSiteTextSettings()`가 호출될 때 `set(ref(db, 'config/siteTextConfig'), loadedConfig.siteTextConfig)`로 이루어짐
- 즉, 현재 구조는 “미리보기는 즉시 반영, Firebase 저장은 명시적 저장 버튼 시점”이며 자동 실시간 저장 방식은 아님

## 한계 및 다음 후보
- 이번 카탈로그는 운영에 자주 쓰는 주요 안내 문구와 핵심 상태 메시지를 우선 포함함
- 커뮤니티 내부 문구, 일부 세부 경고/오류 문구까지 100% 카탈로그화하려면 같은 패턴으로 항목을 더 확장하면 됨
- 로그인 후 Firebase 저장까지의 완전한 관리자 실동선은 실제 관리자 비밀번호가 필요한 영역이라 로컬 브라우저에서 강제 로그인 없이 저장 버튼 성공까지는 검증하지 않았음
