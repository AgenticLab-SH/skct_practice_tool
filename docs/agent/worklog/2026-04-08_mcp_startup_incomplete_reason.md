# MCP startup incomplete 원인 확인
작성일시: 2026-04-08 16:16:31 +09:00

## 사용자 요청
- Codex 시작 시 `supabase`, `stripe`, `vercel` MCP 로그인 경고가 왜 뜨는지 확인 요청

## 확인 내용
- 전역 Codex 설정 파일 `C:\Users\kshcg\.codex\config.toml`에서 `build-web-apps@openai-curated` 플러그인이 `enabled = true` 상태임을 확인했다.
- 플러그인 정의 파일 `C:\Users\kshcg\.codex\plugins\cache\openai-curated\build-web-apps\a371d3cea09e87c3d5f94c8255db290db095ee10\agents\openai.yaml`에서 `stripe`, `vercel`, `supabase` MCP 서버를 의존성으로 자동 등록하는 것을 확인했다.
- 같은 플러그인의 `.mcp.json`에도 동일한 세 MCP 엔드포인트가 정의되어 있었다.

## 결론
- 프로젝트 자체가 MCP를 많이 켜는 것이 아니라, 전역 Codex 플러그인 `Build Web Apps`가 활성화되어 있어서 시작 시 세 MCP를 함께 올리려는 구조다.
- 현재 경고는 로그인 미완료 상태를 알리는 것이며, 해당 서비스 기능을 실제로 쓰지 않으면 치명적 오류는 아니다.

## 사용자에게 안내한 핵심
- 그대로 무시 가능: Stripe/Vercel/Supabase 작업을 하지 않을 때
- 로그인 후 사용: `codex mcp login stripe`, `codex mcp login supabase`, `codex mcp login vercel`
- 경고 제거 우선: 전역 `config.toml`에서 `build-web-apps@openai-curated` 플러그인 비활성화 검토
