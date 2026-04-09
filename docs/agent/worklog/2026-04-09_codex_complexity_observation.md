# .codex 복잡도 관찰 메모
작성일시: 2026-04-09 11:00:30 +09:00

## 요청

- `.codex` 폴더를 다시 보고, 왜 복잡해 보이는지 확인

## 확인 결과

루트에 활성 기준 문서만 있는 것이 아니라 아래 네 층이 한 번에 섞여 있다.

1. 활성 기준 문서
- `AGENTS.md`
- `10_ENV_RULES.md`
- `20_USER_REQUIREMENTS.md`
- `30_MASTER_DOC.md`
- `35_LEARNING_NOTES.md`

2. 런타임 상태 / 인증 / 로그
- `auth.json`
- `history.jsonl`
- `logs_1.sqlite*`
- `state_5.sqlite*`
- `chrome_debug_profile/`
- `sessions/`
- `logs/`, `log/`

3. 임시/캐시/보관본
- `_trash/`
- `tmp/`
- `.tmp/`
- `backup/`
- `cache/`

4. 코드/문서/스킬 원본
- `src/`
- `docs/`
- `skills/`
- `custom_skills/`

## 파일 수 관찰

상위 폴더 기준 재귀 파일 수:

- `_trash`: 13,793
- `tmp`: 3,658
- `src`: 2,128
- `.tmp`: 1,381
- `vendor`: 1,220
- `chrome_debug_profile`: 1,225
- `skills`: 501
- `docs`: 50

핵심 해석:

- 사람이 실제로 읽는 문서보다, 런타임/보관본 파일 수가 훨씬 많다.
- 즉 “문서가 너무 많아서 복잡하다”보다 “활성 표면과 부산물이 같은 루트에서 같이 보인다”가 더 정확하다.

## 판단

- 지금 복잡도의 원인은 활성 문서 설계보다 런타임 홈 특성 자체에 가깝다.
- 이미 활성 허브는 줄였지만, 시각적 복잡성은 `_trash`, `tmp`, `.tmp`, `chrome_debug_profile`, 루트 DB 파일 때문에 계속 크게 보인다.
- 다음 정리 단계가 있다면 문서 개수 축소보다 `보관본/임시물 노출 축소`가 더 효과적이다.
