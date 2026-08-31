# Random Polygon 프로젝트 현황

> 새 채팅 시작 문구: `random-polygon 저장소의 PROJECT_CONTEXT.md를 읽고 이어서 작업해줘.`

## 프로젝트

- GitHub: https://github.com/dawn4080/random-polygon
- 운영 주소: https://random-polygon.dawn01542.workers.dev
- 기술: React 19 + Vite 7 UI, JavaScript Canvas 게임 엔진, Supabase, Cloudflare Workers
- 배포: `main` 병합 시 Cloudflare가 자동 빌드·배포

## 현재 구현

- 시작 화면: 로그인, 게스트 시작, 랭킹, 설정
- 게임: 순환 경로, 웨이브, 소환, 판매, 합성, 연구, 배속, 보스, 전설 기어
- 계정: Supabase 회원가입·로그인·기록 저장·온라인 랭킹
- 게임 중 설정과 게임 종료
- PC·모바일 반응형 화면

## 진행 중

- PR #15: https://github.com/dawn4080/random-polygon/pull/15
- 작업: 초반 난도 완화, 타워별 효율 보정, 무한 성장 곡선 조정
- 미리보기: https://balance-early-game-infinite-scaling-random-polygon.dawn01542.workers.dev
- 상태: 미리보기 배포 성공, 사용자 플레이 검증 중, 아직 `main`에 병합하지 않음

## PR #15 주요 수치

- 시작 골드: 150G → 160G
- 일반 적 수: 1웨이브 18마리에서 시작해 5웨이브 22마리
- 삼각형 공격력·사거리·연구 효율 강화
- 사각형 기본 화력·공격 주기 강화
- 보스 이후 난도 증가: 15% → 10%
- 고난도 처치 보상은 제곱근 배율로 변경해 골드 폭증 억제

## 다음 작업

1. PR #15 미리보기를 플레이하며 초반과 타워 효율 평가
2. 필요한 수치를 추가 조정
3. 검증 후 PR #15를 `main`에 병합
4. 이후 UI 고급화와 신규 콘텐츠 작업

## 개발 원칙

- 기존 Canvas 전투 엔진과 게임 규칙을 함부로 재작성하지 않는다.
- 별도 브랜치 → Cloudflare 미리보기 → 사용자 확인 → `main` 병합 순서로 진행한다.
- 리팩터링과 게임 규칙 변경을 한 PR에 섞지 않는다.
- PC와 모바일을 모두 확인한다.
- 비밀키와 Supabase `service_role` 키를 저장소에 넣지 않는다.
- 큰 작업을 마칠 때 이 문서를 갱신한다.
