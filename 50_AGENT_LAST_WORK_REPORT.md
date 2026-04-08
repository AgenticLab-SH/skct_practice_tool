# SKCT Tool 최근 운영 반영 리포트
작성일시: 2026-04-08 18:50:00 KST

이 문서는 최근 운영 반영 기준을 빠르게 이어보기 위한 요약 기록입니다.

## 2026-04-08 운영 반영 완료: 보안 강화 및 인증 구조 정리
- 관리자 로그인은 공개 RTDB 해시 비교 대신 Firebase Auth 기준으로 정리했습니다.
- 고급 기능 해금은 로컬 저장소 플래그가 아니라 서명된 라이선스 번들 검증 구조로 바꿨습니다.
- 수동 신청 승인 흐름은 고급 계정을 DB에 직접 추가하는 대신, 신청별 라이선스를 발급해 사용자 브라우저에서 검증하는 방식으로 바뀌었습니다.
- 운영/스테이징 페이지의 공지, 후원 문구, 링크 렌더링 경로에 sanitize 를 적용해 저장형 XSS 재현 경로를 막았습니다.
- 공개 페이지는 더 이상 Firebase `config` 루트를 통째로 읽지 않고, 공개가 필요한 키만 개별 조회합니다.
- `database.rules.json` 기준 RTDB rules 배포까지 완료했습니다.
- 운영 RTDB `config/manualSubscriptionConfig`에는 라이선스 검증 공개키를 추가했고, `config/siteTextConfig/advancedGuide`, `config/siteTextConfig/messages`도 최신 흐름 기준으로 동기화했습니다.
- 운영 RTDB의 레거시 민감 경로 `config/adminHash`, `config/advancedFeatureConfig`는 실제 DB에서도 제거했습니다.

## 확인 메모
- GitHub Pages와 Firebase RTDB rules 반영까지 모두 끝났습니다.
- 공개 검증 결과 `config.json`, `config/adminHash.json`, `config/advancedFeatureConfig.json`은 비인증 `401`, `config/appName.json`은 공개 `200`입니다.
- 자세한 수정/검증 기록은 `docs/agent/worklog/2026-04-08_security_hardening_and_public_config_lockdown.md`를 우선 참고합니다.
