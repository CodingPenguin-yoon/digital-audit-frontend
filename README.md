# Digital Audit frontend

React + Vite 프런트 프로토타입입니다. Stripe Press의 입체 전환을 참고해 감사 기능 5개를 펼쳐지는 카드 메뉴로 구성했습니다.

## 실행

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 4173
```

## 검증과 빌드

```sh
npm run build
```

## Docker 실행

Docker가 실행 중인 상태에서 프런트 폴더에서 빌드하고 실행합니다.

```sh
docker build -t digital-audit-frontend .
docker run --rm --name digital-audit-frontend -p 127.0.0.1:8080:80 digital-audit-frontend
```

브라우저에서 http://127.0.0.1:8080/ 을 열어 확인할 수 있습니다. Node에서 정적 파일을 빌드한 뒤 Nginx로 제공하며, `/healthz`는 상태 확인용 경로입니다. 다른 터미널에서 `docker stop digital-audit-frontend`를 실행하면 종료됩니다.

Docker에서도 예시 데이터만 사용하며 실제 분석이나 파일 업로드 기능은 연결되어 있지 않습니다.

## 구현 범위

- 순차 등장, 카드 원근감과 마우스 기울기, 카드 선택 및 상세 화면 전환
- 데이터 업로드, 이상징후 탐지, 새 패턴 발견, 증빙 대조, 위변조 분석의 예시 화면
- 모바일 가로 카드 탐색, 키보드 접근, Escape 닫기, 동작 줄이기 설정 지원

화면의 거래와 분석 결과는 고정된 예시입니다. 파일을 선택하면 브라우저에서 파일명과 크기만 표시하며, 파일 내용 파싱·서버 전송·실제 이상 탐지는 수행하지 않습니다. 실데이터와 백엔드 연결은 후속 작업입니다.

카드 배경은 이 프로토타입용으로 생성한 로컬 이미지입니다. 폰트는 Google Fonts의 DM Sans와 Noto Sans KR을 사용하고, 네트워크 연결이 없으면 시스템 폰트로 표시됩니다.
