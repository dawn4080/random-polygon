# RP 개발 지침

작업을 시작하기 전에 저장소 루트의 `PROJECT_CONTEXT.md`를 읽고 현재 상태와 다음 작업을 확인한다.

## 핵심 정보

- 프로젝트: RP (Random Polygon) React+Vite UI + JavaScript Canvas 타워 디펜스
- 서비스: https://dawn4080.github.io/random-polygon/
- 배포 전환 중: GitHub Pages 운영본을 유지하면서 Cloudflare Workers 미리보기 검증 후 이전
- 인증·저장: Supabase 이메일 인증, `profiles`, `game_records`, `submit_game_result`
- 현재 규칙: 8x6 그리드, 최대 타워 20기
- 데스크톱과 모바일을 모두 지원해야 한다.

## 필수 원칙

- 기존 게임 규칙을 임의로 바꾸지 않는다.
- 리팩터링과 기능·수치 변경을 한 PR에 섞지 않는다.
- 비밀키와 Supabase `service_role` 키를 저장소에 커밋하지 않는다.
- 브라우저에는 Supabase publishable key만 사용한다.
- 변경 후 JavaScript 문법, 주요 게임 동작, 모바일 화면을 검증한다.
- 작업은 별도 브랜치와 PR로 진행한 뒤 검증 후 `main`에 병합한다.
- 큰 작업을 마치면 `PROJECT_CONTEXT.md`의 현재 구현, 최근 반영, 다음 작업을 갱신한다.

## 현재 우선순위

1. React+Vite 브랜치의 Cloudflare 미리보기 배포 검증
2. 실제 웹 로그인·로그아웃 및 게임 기록 저장 회귀 검증
3. 로그인·랭킹·게임 컨트롤 UI의 React 컴포넌트 전환
4. 모바일 스토리와 조작 재검증
