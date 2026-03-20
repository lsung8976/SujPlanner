# SujPlanner

대학원 연구자를 위한 루틴 / 플래너 / 연구 파이프라인 통합 웹앱.

AI 시대에 논문을 빠르게 탐색하면서도, 깊이 있는 연구를 놓치지 않기 위한 **2-Track Research Pipeline**을 중심으로 설계되었습니다.

## 핵심 기능

### 1. 3-Stage Funnel (시간대별 모드)

하루를 세 단계로 나누어 연구 흐름을 관리합니다.

| 시간대 | 모드 | 역할 |
|--------|------|------|
| 아침 | Director Mode (Scouting) | AI에게 논문/실험 탐색 지시, 3줄 로그 작성 |
| 낮 | Architect Mode (Filtering) | AI 결과 크로스체크, 아키텍처 설계, Core 논문 선택 |
| 저녁 | Storyteller Mode (Deep Dive) | 선택한 논문 깊이 파기, 영어 일기, 내일 구상 |

### 2. 2-Track Research Pipeline

| Track | 목적 | 비율 |
|-------|------|------|
| **Track A: AI Radar** | AI가 탐색한 정보를 빠르게 수집하는 임시 보관소 | AI 90% + 나 10% |
| **Track B: Core Research** | 내 논문에 직접 쓸 상위 1% 논문만 깊이 분석 | 나 90% + AI 10% |

- AI Radar에서 **Core로 승격** 시, 목적(실험/수식/벤치마크 등)을 명시하여 단순 창고가 되는 것을 방지
- Core Research는 논문명, 상태, 태그, 내 연구 적용점, 한계점(Critique), 핵심 메모로 구조화

### 3. 몰입 모드 (Flow State)

하루 종일 실험/구상만 한 날을 위한 모드. 체크리스트가 사라지고 자유 기록 텍스트박스만 나타납니다. 텍스트를 작성하면 그날 달성률이 100%로 채워집니다. Core 루틴(수영, 인사이트, 영어일기) 3개만 별도 표시됩니다.

### 4. AI 텍스트 파서

Claude/Gemini 출력을 통째로 붙여넣으면 제목, 태그, 본문이 자동 분리됩니다. 사용자는 "내 생각" 1줄만 작성하면 됩니다.

### 5. 추가 기능

- **캘린더**: 월별 달성률 히트맵 + 일기 작성 표시
- **통계**: 주간 달성률 링 차트, 모드별 30일 통계, 일기 작성률
- **오늘의 한자**: 매일 다른 한자 표시 + 직접 기록
- **3줄 로그**: What / Result / Idea + 태그로 일일 논문 인사이트 기록

## 기술 스택

- **Frontend**: Vanilla HTML/CSS/JS (프레임워크 없음, `file://`에서도 동작)
- **Backend**: Firebase Firestore (실시간 동기화)
- **Storage**: Firebase + localStorage 이중 백업
- **Font**: Pretendard, Noto Serif KR

## 설치 및 실행

### 로컬 실행

`index.html`을 브라우저에서 열면 바로 사용 가능합니다. Firebase 없이 localStorage만으로 동작합니다.

### Firebase 연동

1. [Firebase Console](https://console.firebase.google.com)에서 프로젝트 생성
2. 웹 앱 등록 후 `firebaseConfig` 값 복사
3. `js/firebase-config.js`의 config 객체에 붙여넣기
4. Firestore Database 생성 (테스트 모드, asia-northeast3)

## 브랜치 구조

| 브랜치 | 설명 |
|--------|------|
| `master` | 안정 버전 |
| `feature/2track-research-pipeline` | 2-Track 시스템 + Firebase 배치 최적화 |
| `feature/ux-improvements` | 몰입 모드, AI 파서, 승급 모달 |

## 프로젝트 구조

```
sujPlanner/
├── index.html              # 메인 HTML
├── css/
│   └── style.css           # 전체 스타일 (밝은 테마, 데스크톱 우선)
├── js/
│   ├── firebase-config.js  # Firebase 설정 + DataService (캐시, 배치 쿼리)
│   ├── app.js              # 메인 앱 로직
│   ├── migrate-data.js     # 기존 데이터 마이그레이션
│   └── migrate-notion.js   # Notion 논문 11편 Core Research 마이그레이션
└── README.md
```

## License

MIT
