# MCP 플러그인 비활성화 후 확인 포인트
작성일시: 2026-04-08 16:21:11 +09:00

## 사용자 조치
- 전역 Codex 설정에서 MCP 관련 플러그인을 비활성화했다고 공유함

## 안내 내용
- Codex를 다시 실행했을 때 `stripe`, `supabase`, `vercel` 로그인 경고가 사라지는지 확인하면 된다.
- 만약 경고가 계속 나오면 `C:\Users\kshcg\.codex\config.toml`에서 플러그인 설정이 실제로 `enabled = false`인지 다시 확인한다.
- 브라우저 자동화용 `playwright`, `chrome-devtools`는 별도 설정이라 계속 보일 수 있다.
