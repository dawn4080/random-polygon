# RP (Random Polygon)

코딩 동아리에서 제작하는 React 기반 랜덤 머지 디펜스 게임입니다.

## 현재 상태

- React 19 + Vite 7 앱 진입 구조
- 기존 Canvas 게임 엔진 모듈 유지
- 사각형 순환 PATH 유지
- 현재 그리드 8×6, 최대 타워 20기
- 무지개 전설 기어와 연쇄 폭발 구현
- 연구소를 열어도 전투가 계속 진행됨
- 휴대폰 반응형 화면 지원

## 개발 실행

Node.js가 설치된 환경에서 다음 명령을 실행합니다.

```bash
npm install
npm run dev
```

Windows에서는 `게임실행.bat`을 사용할 수도 있습니다.

## 검사와 빌드

```bash
npm test
npm run build
```

빌드 결과는 `dist/`에 생성됩니다.

## 배포

- 프런트엔드: Cloudflare Workers Static Assets
- 인증·DB: Supabase
- `main`은 운영 배포, 기능 브랜치는 미리보기 배포에 사용합니다.

`RP_게임실행.html`은 React 전환 이전의 레거시 실행본이며 더 이상 최신 기능을 반영하지 않습니다.
