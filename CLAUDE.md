## 진행 현황 (한글)

### summer-quest (Summer Quest RPG)
- **상태**: spec → wireframe → plan → 구현(Task 1~13) → E2E까지 완료. 브랜치 `feat/summer-quest`.
- **핵심 루프**: 이번 주 계획(요일 선택) → 오늘의 퀘스트(자동 생성) → 완료 시 EXP·코인·레벨업·아바타·streak·업적·마일스톤·전체완료 보너스·컨페티 → 길드 샵 교환 → 부모 관리.
- **검증**: Vitest 79개, Playwright E2E 2개(spec.md 11단계 전체 + smoke) — 전부 통과.
- **PR**: https://github.com/seung1lee/toy_planner/pull/1
- **추가 기능 진행 (사용자 요청, 우선순위대로)**:
  - ✅ 브라우저 탭 제목 "Tony Planner"
  - ✅ streak → "연속" 한글화
  - ✅ 프로필 이름/아바타 설정 다이얼로그
  - ✅ 자녀 홈 진입 시 응원 문구
  - ✅ 계획 항목별 EXP·코인 보상 커스터마이즈
  - ✅ 오렌지/퍼플 "모험" 테마 (CSS 변수만 조정, components/ui 미수정)
  - ✅ 자녀 프로필 동적 추가 (ProfileId를 string으로 완화)
  - ✅ 날씨 정보 표시 (Open-Meteo, API 키 불필요 — geolocation 우선, 서울 fallback)
  - ✅ 날씨 기반 운동 퀘스트 추천
- 자세한 내용: [artifacts/summer-quest/spec.md](./artifacts/summer-quest/spec.md), [plan.md](./artifacts/summer-quest/plan.md), [learnings.md](./artifacts/summer-quest/learnings.md)

### 백로그 — 다음에 할 일 (미착수, 변경량 커서 후순위)

과제 제출 시간 제약으로 아래는 착수하지 않고 미뤘다. 다시 잡을 때 참고할 이유를 남긴다.

| 항목 | 내용 | 미룬 이유 |
|---|---|---|
| 지난주 달성률 기반 다음주 목표 추천 | 주간 통계 집계 + 추천 로직 | 통계 집계 레이어 신규 설계, idea.md의 "적응형 목표 추천" hypothesis와 겹침(루프 검증 후 도입 대상으로 이미 보류 중) |
| 캘린더 / 휴식일 연동 반영 | 공휴일·휴가 등 예외일 처리 | 퀘스트 생성 규칙(요일 기반)에 예외 개념을 추가하는 스키마 변경, 여러 화면에 영향 |
| Google Calendar 연동 | OAuth 인증 + Google API 연동 | 인증 플로우 신규 구축, 외부 계정 연결이라 보안·동의 처리 필요 — 가장 큰 변경량 |

재개할 때: 이 표를 `/idea-refine` 또는 `/write-spec`의 입력으로 사용해 우선순위·범위를 다시 정한다.

## Workflow

### 코어 경로 (Spec-Driven Development)

| Phase | Skill | 산출물 |
|---|---|---|
| Specify | `/write-spec` | `artifacts/<feature>/spec.md` |
| Plan | `/draft-plan` | `artifacts/<feature>/plan.md` |
| Build | `/execute-plan` | 코드 + 커밋, `artifacts/<feature>/learnings.md` |
| Compound | `/compound` | learnings.md 정리 (병합·폐기·확정) |

한 세션에 끝나고 diff를 한 문장으로 설명할 수 있는 작업은 코어 경로 대신 내장 plan 모드로 진행한다.

phase 산출물이 확정되면 다음 phase는 새 세션(`/clear`)에서 시작한다. 필요한 상태는 artifacts가 전부 들고 있다.

`artifacts/*/learnings.md`는 feature 간 메모리 레이어다. 항목마다 `triggers` 검색 키워드를 달고, `/draft-plan`(Step 2)과 `/execute-plan`(Step 1, 에러 발생 시)이 grep으로 검색해 걸린 항목만 소비한다. `status: verified`는 지시문을 따르고, `hypothesis`는 참고만 한다.

### 옵션 모듈 (조건이 맞을 때만 켠다)

| 모듈 | 켜는 조건 | 산출물 |
|---|---|---|
| `/idea-refine` | 아이디어가 막연하거나 방향을 정해야 할 때 | `artifacts/<feature>/idea.md` |
| `/sketch-wireframe` | 레이아웃 구조가 바뀌는 UI feature | `artifacts/<feature>/wireframe.html` |
| `plan-reviewer` 에이전트 | Task 5개 이상, wireframe 존재, 또는 되돌리기 비싼 도메인 | plan 독립 검토 |

### 판정 기준 체계

- spec.md의 판정 기준이 유일한 원본이다. plan과 테스트는 ID(`S1`, `S1-1`, `INV-1`)로 참조하고, 기준 문장을 복사하지 않는다.
- 테스트 이름에 담당 ID를 `[S1-1]` 형식으로 인용한다.
- 커버리지 검사: `scripts/spec-coverage.sh <feature> [--tests] [--wireframe]`
- spec의 판정 기준 체크박스는 실행 증거(테스트 통과, End-to-end 확인)로만 켠다.

## Skills 관리

- `skills-lock.json`에 등록된 외부 스킬은 파일을 절대 직접 수정하지 않는다. 동작 조정이 필요하면 스킬 바깥에서 한다: `.claude/rules/`, hooks, `settings.json`(permissions).

## Development Workflow

- 패키지 매니저: `bun`

### 커밋 규칙
- Conventional 규칙을 따르고, feature 단위로 커밋한다.

## Testing

### 원칙
**판정 기준을 정의한다. 검증될 때까지 반복한다.**

- 모든 변경에는 측정 가능한 판정 기준(구체적인 입력, 관찰 가능한 결과)이 필요하다
- 각 기준은 이를 증명하는 테스트를 가지고, 테스트 이름은 기준 ID를 인용한다
- 판정 기준이 실제로 증명되는 가장 낮은 경계를 선택한다. mock이 기준을 가린다면 거기서 mock하지 않는다.

### Stack & 파일 배치

| 도구 | 용도 | 위치 |
|---|---|---|
| Vitest (jsdom, `@testing-library/react`) | 단위·통합·판정 기준 | `<file>.test.tsx` colocated |
| Playwright | E2E | `e2e/*.spec.ts` |

### Commands

| 명령 | 범위 |
|---|---|
| `bun run typecheck` | tsc 타입 검사 (Task 단위 검증용, 풀빌드는 체크포인트에서만) |
| `bun run test` | Vitest |
| `bun run test:watch` | Vitest watch |
| `bun run test:e2e` | Playwright |

## Architecture

순환 의존 방지를 위해 역방향 의존을 금지한다. 의존성이 적은 것부터 구현한다.

| 순서 | 디렉토리 | 허용 의존성 |
|---|---|---|
| 1 | `types/` | 없음 |
| 2 | `config/` | types |
| 3 | `lib/` | types, config |
| 4 | `services/` | types, config, lib |
| 5 | `hooks/` | types, config, lib, services |
| 6 | `components/` | types, config, lib, hooks |
| 7 | `app/` | 모두 |
