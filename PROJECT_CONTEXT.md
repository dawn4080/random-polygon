# RP 프로젝트 인수인계

> 새 채팅 시작 문구: `random-polygon 저장소의 PROJECT_CONTEXT.md를 읽고 이어서 작업해줘.`

## 프로젝트

- 이름: RP (Random Polygon)
- 형태: React+Vite UI와 JavaScript Canvas 게임 엔진을 결합한 타워 디펜스
- 저장소: https://github.com/dawn4080/random-polygon
- 서비스: https://dawn4080.github.io/random-polygon/
- 팀: 고등학교 코딩 동아리 5명

## 현재 구현

- 8x6 그리드, 최대 타워 20기
- 순환형 적 경로와 웨이브 전투
- 타워 소환·판매·합성·강화·배속
- 연구소를 열어도 전투 진행
- 연구소 바깥 클릭 시 닫기
- 데스크톱·모바일 반응형 화면
- 모바일 스토리 모달 보완
- Supabase 이메일 회원가입·로그인·로그아웃
- 게임 종료 시 점수·웨이브 저장 연결
- 최고 점수 기준 온라인 랭킹 UI(상위 10명, 내 기록 강조, 새로고침)
- 게임 진입 전 시작 화면(로그인·게스트 시작·랭킹·설정)
- 브라우저 저장형 설정(스토리 재생, UI 애니메이션 줄이기)
- 게임 중 설정 열기 및 시작 화면으로 나가기
- React+Vite 앱 진입 기반과 Cloudflare Workers Static Assets 설정
- GitHub Pages 자동 배포

## 외부 서비스

- Supabase 프로젝트: `random-polygon`
- Project URL: `https://vqdlexfgsmvbdmypykja.supabase.co`
- DB: `profiles`, `game_records`
- RPC: `submit_game_result(integer, integer)`
- 인증 Site URL: `https://dawn4080.github.io/random-polygon/`
- Redirect URL: `https://dawn4080.github.io/random-polygon/**`
- 비밀키나 `service_role` 키는 저장소에 넣지 않는다. 브라우저에는 publishable key만 사용한다.

## 최근 반영

- PR #6을 `main`에 병합
- Supabase 인증 UI와 DB 연결 반영
- GitHub Pages 재배포 성공
- 온라인 랭킹 UI 구현 브랜치 작업
- 랭킹 조회용 `profiles` SELECT 권한 누락 수정
- 로그인과 게임 시작 흐름을 분리한 시작 화면 구현
- 게임 화면 설정 버튼과 안전 확인형 게임 종료 기능 구현
- React+Vite 1단계 전환: 시작 화면·설정 상태를 React가 담당
- Cloudflare Workers 배포 설정과 GitHub 미리보기 기반 추가

## 다음 작업

1. 실제 웹에서 회원가입·로그인·로그아웃 확인
2. 게임 오버 후 `profiles`, `game_records` 저장 확인
3. 온라인 랭킹의 실제 데이터 조회 확인
4. 모바일에서 스토리·게임 조작 및 랭킹 모달 재검증
5. 시작 화면과 설정의 모바일·데스크톱 실기기 재검증
6. React 전환 브랜치의 Cloudflare 미리보기 배포 검증
7. 로그인·랭킹·게임 컨트롤 UI의 React 컴포넌트 전환
8. 중복된 초안 PR #3~#5 정리

## 개발 원칙

- 리팩터링과 게임 규칙 변경을 한 PR에 섞지 않는다.
- 작업은 별도 브랜치와 PR로 진행하고 검증 후 `main`에 병합한다.
- 모바일과 데스크톱을 모두 확인한다.
- 클라이언트 점수 저장은 MVP 방식이다. 정식 서비스 전 서버 검증을 추가한다.
- 큰 작업을 마칠 때 이 문서의 `현재 구현`, `최근 반영`, `다음 작업`을 갱신한다.
