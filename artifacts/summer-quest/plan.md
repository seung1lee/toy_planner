# Summer Quest RPG 구현 계획

> 입력: [spec.md](./spec.md), [wireframe.html](./wireframe.html), [idea.md](./idea.md)
> 판정 기준은 spec.md가 원본이다. 이 문서는 ID로만 참조한다.

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| 저장소 seam | 순수 게임 로직은 `lib/`, `StorageAdapter` 인터페이스는 `types/`, localStorage 구현은 `services/` | idea.md의 "화면·훅은 저장소 구현을 모른다". 후속 Supabase 어댑터 교체를 화면 수정 없이 가능하게 함 (INV-3) |
| 도메인 로직 위치 | `lib/game/` 순수 함수 (levelForExp, todayQuests(plan, date), applyComplete/Uncomplete/Redeem, computeStreak, checkAchievements, checkMilestone) | DOM·저장소 의존 없음 → 가장 낮은 증명 경계에서 Vitest 단위 테스트. 결정성(S3-4)·불변식(INV-1/4)을 순수 함수로 증명 |
| 날짜 seam | 순수 함수는 `date`를 인자로 받는다. 앱은 훅 경계에서 `new Date()` 주입. E2E는 `?today=YYYY-MM-DD` dev 오버라이드 | S3(요일별 생성)·S12(주 경계)를 실제 시계 없이 결정적으로 테스트 |
| 상태 배선 | `hooks/useGame` (React Context Provider): 어댑터로 GameState 로드, lib 로직으로 액션 처리, 어댑터로 저장 | 화면은 훅에만 의존. 프로필 스코프 읽기로 INV-2 보장 |
| 계획의 주(week) 바인딩 | PlanItem에 주(week) 필드를 두지 않는다. 계획은 "현재 계획"으로 프로필에 귀속되고 재계획 전까지 유지 | S12-1(지난 주 계획 유지)이 별도 롤오버 로직 없이 성립 |
| 완료 회수 시 코인 (spec 미결정 해소) | 코인은 **0에서 clamp**(음수 불가), 완료 해제는 항상 허용, 소비된 교환은 자동 회수 안 함 | 가장 단순하고 INV-4(음수 불가) 유지. 데모 빈도 낮은 엣지 |
| config 범위 | 레벨 정책 + 게임 상수(EXP·코인 지급값·보너스·업적 목록·마일스톤 임계)를 `config/`에 데이터로 | idea.md "하드코딩 금지" + 재미 요소가 데이터 주도 목록을 요구. 풀 엔진화는 하지 않음 |
| 업적 화면 배치 | 홈에서 진입하는 Dialog(모달) | wireframe의 별도 "페이지"가 아니라 홈의 오버레이 (사용자 확인 완료) |
| 보상 재고 모델 (Task 9) | Reward는 전역 1회성 교환권이다 — 누구든 한 번 교환하면 모든 프로필에서 "교환됨"으로 잠긴다. 자녀별 독립 재고 없음 | idea.md "승인 플로우는 최소" + wireframe의 shop-states 화면이 카드당 단일 상태(교환됨/부족)만 그림. 재고·수량 개념은 spec에 없어 가장 단순한 해석을 택함 |
| 완료/레벨업/마일스톤 연출 | 획득 팝업·토스트(`sonner`), 레벨업·마일스톤은 Dialog, 컨페티는 CSS 연출 요소 | 새 애니메이션 라이브러리 없이 shadcn + CSS로. idea.md의 미설치 라이브러리 방침 |

## 인프라 리소스

None. (저장소는 브라우저 localStorage, 애플리케이션 코드 내 어댑터로 처리)

## 데이터 모델

### GameState (localStorage 루트)
- profiles → Profile[]
- plans: Record<profileId, PlanItem[]>
- completions: Record<profileId, QuestCompletion[]>
- progress: Record<profileId, ChildProgress>
- rewards → Reward[] (부모가 등록, 공유 목록)
- redemptions → Redemption[]

### Profile
- id ('childA' | 'childB' | 'parent') (required)
- name (required)
- role ('child' | 'parent') (required)

### PlanItem
- id (required)
- name (required)
- dailyGoal (required, 예: 20)
- weekdays (required, 1~5 중 다중, 최소 1개) — Mon=1 … Fri=5

### QuestCompletion
- profileId, planItemId, dateISO (required) — (profileId, planItemId, dateISO) 유일

### ChildProgress
- profileId (required)
- exp (number, ≥0)
- coins (number, ≥0)
- unlockedAchievementIds → string[]
- awardedMilestones → number[] (중복 지급 방지)

> **Task 6 변경**: `streakCount`/`lastAllCompleteDateISO`는 저장하지 않는다. streak는 `lib/game/streak.ts`의 `computeStreak(plan, completions, today)`가 plan·completions·today로부터 매번 순수하게 파생한다. 완료 해제(S5)로 과거 완료가 취소돼도 별도 롤백 로직 없이 항상 최신과 일치하는 게 장점이라 Task 1의 초안 필드를 제거했다.

### Reward
- id, name, price (required)

### Redemption
- id, profileId(child), rewardId, rewardName, price, dateISO (required)

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| shadcn | 1~13 (UI 있는 모든 Task) | 컴포넌트 add(toggle-group·progress·avatar·empty·sonner·alert) + Critical Rules. **`components/ui/*` 직접 수정 금지**(shadcn-guard) |
| next-best-practices | 1 (앱 셸) | 상호작용·localStorage 컴포넌트는 `"use client"`. App Router 규약 |
| vercel-react-best-practices | 1, 4, 11 | Context/리렌더 경계, 리스트 렌더 성능 |
| web-design-guidelines | 최종 Checkpoint | 접근성(포커스·aria·대비) 리뷰 |

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `types/game.ts` | New | 1 |
| `types/storage.ts` (StorageAdapter 인터페이스) | New | 1 |
| `config/game.ts` (레벨·상수·업적·마일스톤) | New | 1, 5, 12, 13 |
| `services/localStorageAdapter.ts` | New | 1 |
| `services/seed.ts` (시드 데이터) | New | 1, 2, 8 |
| `lib/game/*.ts` (+ `*.test.ts`) | New | 3, 4, 5, 6, 9, 11, 12, 13 |
| `hooks/useGame.tsx` (Provider) | New/Modify | 1, 4, 8 … |
| `hooks/useActiveProfile.ts` | New | 1 |
| `components/summer-quest/*.tsx` (+ colocated `*.test.tsx`) | New | 1~13 |
| `components/ui/{toggle-group,progress,avatar,empty,sonner,alert}.tsx` | New (shadcn add) | 1, 2, 4, 10 |
| `app/page.tsx` | Modify | 1 |
| `app/layout.tsx` (Toaster 마운트) | Modify | 9 |
| `e2e/summer-quest.spec.ts` | New | 최종 Checkpoint |

## Tasks

> 모든 Task의 검증에 `bun run typecheck`를 포함한다 (CLAUDE.md: Task 단위 타입 검사). 아래 각 Task는 그 위에 Task 고유 단언을 명시한다.

### ✅ Task 1: 프로필 전환 + 저장소 seam (앱 셸)

- **담당 판정 기준**: S1-1, S1-3, S13-3, INV-2, INV-3 / S1-2 (역할 라우팅 골격만; 부모 화면 실체는 Task 8·9에서, 완전 증명은 최종 e2e 9단계)
- **크기**: M (전 레이어 관통 9개 파일 — 파일당 작업량은 작으나 범위가 넓어 구현 중 L 재평가 여지 있음, 필요 시 Task 1a/1b로 분할)
- **의존성**: None
- **참조**: shadcn (toggle-group, avatar add + info로 base 확인 / `"use client"`), next-best-practices (use client)
- **구현 대상**:
  - `types/game.ts`, `types/storage.ts`
  - `config/game.ts` (레벨 정책 + 초기 진행값)
  - `services/localStorageAdapter.ts`, `services/seed.ts` (프로필 3개 + 진행 0/0/Lv1)
  - `hooks/useGame.tsx` (Provider: load/save), `hooks/useActiveProfile.ts`
  - `components/summer-quest/profile-switch.tsx` (ToggleGroup single) + `.test.tsx`
  - `components/summer-quest/app-shell.tsx` (활성 프로필 컨텍스트 렌더) + `.test.tsx`
  - `app/page.tsx` (Provider + shell 마운트)
- **검증**: Vitest — 프로필 전환 시 활성 컨텍스트 전환(자녀→자녀 진행 컨텍스트) `[S1-1]`, 부모 선택 시 부모(관리) 역할 컨텍스트로 라우팅 `[S1-2]`(화면 실체는 Task 8·9), 토글에 PIN/입력 게이트 없음 단언 `[S1-3]`, 초기 진행 0/0/Lv1 표시 `[S13-3]`, 저장 후 재마운트(어댑터 재로드) 시 상태 유지 `[INV-3]`, 프로필 A 데이터가 B 컨텍스트에 노출 안 됨 `[INV-2]`. `bun run typecheck`

---

### ✅ Task 2: 이번 주 계획 + 요일 다중선택

- **담당 판정 기준**: S2-1, S2-3, S2-4, S2-5, S13-1
- **크기**: M
- **의존성**: Task 1 (저장소·프로필)
- **참조**: shadcn (FieldGroup+Field 폼, ToggleGroup **multiple** 요일, Button)
- **구현 대상**:
  - `services/seed.ts` (자녀A·B 시드 계획 2~3개) — Modify
  - `hooks/useGame.tsx` (addPlanItem, removePlanItem) — Modify
  - `components/summer-quest/plan-form.tsx` (이름·목표량·요일 ToggleGroup) + `.test.tsx`
  - `components/summer-quest/plan-list.tsx` + `.test.tsx`
  - `components/summer-quest/plan-screen.tsx`
- **검증**: Vitest — 항목 추가 후 "이름 목표량개 · 요일" 표시 `[S2-1]`, 삭제 시 사라짐 `[S2-3]`, 기존 계획에 추가·삭제 `[S2-4]`, 요일 0개면 추가 버튼 비활성/추가 불가 `[S2-5]`, 시드 계획 2~3개 프리필 `[S13-1]`

---

### ✅ Task 3: 오늘의 퀘스트 자동 생성 (결정적) + 날짜 seam

- **담당 판정 기준**: S3-1, S3-2, S3-3, S3-4
- **크기**: M
- **의존성**: Task 2 (계획)
- **참조**: shadcn (empty — 빈 상태, checkbox — 표시용), 위험: 날짜/요일 경계
- **구현 대상**:
  - `lib/game/today-quests.ts` (`todayQuests(plan, date)`: 순수, 요일 매칭) + `.test.ts`
  - `hooks/useGame.tsx` (오늘 날짜 주입해 파생) — Modify
  - `components/summer-quest/quest-list.tsx` (미완료 표시 + 항목별 보상 미리보기 "+10 EXP · +5코인" + 주말 Empty) + `.test.tsx`
  - `components/summer-quest/home-screen.tsx` (골격: 성장 패널 자리 + 퀘스트)
- **검증**: Vitest (순수 함수, 날짜 인자 고정) — 월요일→월 선택 항목 생성 `[S3-1]`, 화요일→미선택 항목 미생성 `[S3-2]`, 토·일→빈 목록/Empty `[S3-3]`, 동일 날짜 반복 호출 동일 결과 `[S3-4]`

---

### ✅ Task 4: 퀘스트 완료/해제 + EXP·코인 지급/회수

- **담당 판정 기준**: S4-1, S4-2, S4-3, S4-4, S5-1, S5-2, S5-3
- **크기**: M
- **의존성**: Task 3 (퀘스트)
- **참조**: shadcn (Checkbox, Progress — EXP 표시), 위험: 보상 산술·회수
- **구현 대상**:
  - `lib/game/progress.ts` (`applyComplete`, `applyUncomplete`: EXP·코인 +/− with 0 clamp) + `.test.ts`
  - `hooks/useGame.tsx` (completeQuest, uncompleteQuest, 완료 상태 조회) — Modify
  - `components/summer-quest/quest-list.tsx` (체크 토글 + 취소선) — Modify
  - `components/summer-quest/stats-panel.tsx` (EXP·코인 표시) + `.test.tsx`
- **검증**: Vitest — 완료 시 체크·취소선 `[S4-1]`, EXP 10 `[S4-2]`, 코인 5 `[S4-3]`, 진입 후 완료까지 클릭 ≤3 `[S4-4]`; 해제 시 미완료 `[S5-1]`, EXP 0 `[S5-2]`, 코인 0 `[S5-3]`

---

### ✅ Checkpoint: Tasks 1~4 이후 (핵심 루프)
- [x] 모든 테스트 통과: `bun run test` (27 passed)
- [x] 빌드 성공: `bun run build`
- [x] 커버리지 검사 통과: `scripts/spec-coverage.sh summer-quest --tests` (미인용 ID는 전부 미구현 Task 5~13 소관; [[learnings]] 참조)
- [x] 계획→오늘의 퀘스트→완료→EXP·코인 반영→해제→회수가 end-to-end로 동작 (실제 dev 서버, Browser MCP로 확인: 완료 시 EXP 10·코인 5, 해제 시 EXP 0·코인 0)

---

### ✅ Task 5: 레벨·아바타 + 레벨업 연출

- **담당 판정 기준**: S6-1, S6-2, S6-3, S6-4, S6-5, INV-1
- **크기**: M
- **의존성**: Task 4 (EXP)
- **참조**: shadcn (Avatar+AvatarFallback, Dialog — 레벨업 모달, Alert)
- **구현 대상**:
  - `lib/game/level.ts` (`levelForExp(exp)`, `avatarForLevel(level)`: config 기반) + `.test.ts`
  - `config/game.ts` (레벨 티어: level·name·title·minExp·avatar) — Modify
  - `hooks/useGame.tsx` (레벨업 이벤트 감지) — Modify
  - `components/summer-quest/avatar-display.tsx`, `components/summer-quest/levelup-dialog.tsx` (+ `.test.tsx`)
  - `stats-panel.tsx` (레벨명·칭호·아바타) — Modify
- **검증**: Vitest — EXP 50→Lv2 레벨명·칭호 `[S6-1]`, 아바타 티어 변경 `[S6-2]`, 축하 메시지 `[S6-3]`, 회수로 50 미만→Lv1 되돌림 `[S6-4]`, 레벨업 강조 연출 상태(클래스/요소) `[S6-5]`; 완료→레벨업→회수→레벨다운 일관 `[INV-1]`

---

### ✅ Task 6: Streak + 전체 완료 메시지

- **담당 판정 기준**: S7-1, S7-2, S7-3, S8-1, S8-2
- **크기**: M
- **의존성**: Task 4 (완료)
- **참조**: shadcn (Badge — streak 표시)
- **구현 대상**:
  - `lib/game/streak.ts` (`computeStreak`: 배정일 전체완료 연속, 주말 skip) + `.test.ts`
  - `lib/game/today-quests.ts` (전체 완료 판정 헬퍼) — Modify
  - `hooks/useGame.tsx` (streak 갱신) — Modify
  - `components/summer-quest/stats-panel.tsx` (streak) — Modify
  - `components/summer-quest/all-clear-message.tsx` + `.test.tsx`
- **검증**: Vitest (날짜 고정) — 전체완료 시 streak+1 `[S7-1]`, 미완료일 다음 배정일 streak 0 `[S7-2]`, 주말은 불변 `[S7-3]`; 전체완료 메시지 표시 `[S8-1]`, 하나라도 미완료면 미표시 `[S8-2]`

---

### ✅ Task 7: 주 경계 지속성

> 구현 없이 테스트로 검증만 했다 — Task 1~6의 아키텍처 결정(계획 무주-바인딩, streak 완전 파생, progress에 주 리셋 로직 자체가 없음)이 이미 S12를 구조적으로 만족시킨다. `hooks/useGame.tsx` 수정은 불필요해 생략.

- **담당 판정 기준**: S12-1, S12-2, S12-3
- **크기**: S
- **의존성**: Task 3 (날짜), Task 4 (진행), Task 6 (streak)
- **참조**: (없음 — 계획 무(無)주-바인딩 설계의 검증)
- **구현 대상**:
  - `lib/game/today-quests.test.ts` (다음 주 날짜로 생성 유지) — Modify
  - `components/summer-quest/week-boundary.test.tsx` (진행 지속성 + 재계획, 새 파일)
- **검증**: Vitest — 다음 주 월요일 날짜로도 지난 주 계획대로 생성 `[S12-1]`, 진행 지표 이어짐(리셋 없음) `[S12-2]`, 재계획으로 갱신(S2-4 경로) `[S12-3]`

---

### ✅ Checkpoint: Tasks 5~7 이후 (성장·연속)
- [x] `bun run test` (44 passed) / `bun run build` (성공) / `scripts/spec-coverage.sh summer-quest --tests` (미인용은 전부 미구현 Task 8~13 소관)
- [x] 레벨업·아바타·streak·주 경계가 end-to-end로 동작 (실제 dev 서버 확인: EXP 30/코인 15/streak 1일/전체완료 메시지)

---

### ✅ Task 8: 길드 샵 — 부모 보상 등록/자녀 표시

- **담당 판정 기준**: S9-1, S9-2, S9-3, S13-2
- **크기**: M
- **의존성**: Task 1 (저장소·프로필); Task 2 (`services/seed.ts` 순차 수정 — 재배치 시 충돌 방지용 참고)
- **참조**: shadcn (FieldGroup+Field 폼, Card, Button)
- **구현 대상**:
  - `services/seed.ts` (시드 보상 2~3개) — Modify
  - `hooks/useGame.tsx` (addReward, removeReward) — Modify
  - `components/summer-quest/reward-form.tsx`, `reward-list.tsx` (+ `.test.tsx`)
  - `components/summer-quest/parent-screen.tsx`, `shop-screen.tsx` (자녀 뷰)
- **검증**: Vitest — 등록 시 "이름 · 가격코인" 표시 `[S9-1]`, 자녀 샵에도 노출 `[S9-2]`, 삭제 시 사라짐 `[S9-3]`, 시드 보상 프리필 `[S13-2]`

---

### ✅ Task 9: 보상 교환 + 코인 흐름

- **담당 판정 기준**: S10-1, S10-2, S10-3, S11-1, S11-2, INV-4
- **크기**: M
- **의존성**: Task 4 (코인), Task 8 (보상)
- **참조**: shadcn (Button disabled, Badge — 교환됨), 위험: 코인 차감·잔액 일관성
- **구현 대상**:
  - `lib/game/redeem.ts` (`applyRedeem`: 잔액 검사·차감, 음수 불가) + `.test.ts`
  - `hooks/useGame.tsx` (redeemReward, 교환 내역) — Modify
  - `shop-screen.tsx` (교환 버튼·교환됨·부족 비활성) — Modify
  - `parent-screen.tsx` (교환 내역) — Modify
  - `components/summer-quest/redemption-history.tsx` + `.test.tsx`
- **검증**: Vitest — 교환 시 코인 즉시 차감 `[S10-1]`, 교환됨 상태 `[S10-2]`, 부모 내역 반영 `[S10-3]`; 부족 시 버튼 비활성 `[S11-1]`, "코인이 부족해요" `[S11-2]`; 잔액=지급−차감, 음수 불가 `[INV-4]`

---

### ✅ Checkpoint: Tasks 8~9 이후 (코인 루프)
- [x] `bun run test` (54 passed) / `bun run build` (성공) / `scripts/spec-coverage.sh summer-quest --tests` (미인용은 전부 미구현 Task 10~13 소관)
- [x] 부모 등록→자녀 교환→코인 차감→부모 내역이 end-to-end로 동작 (실제 dev 서버 확인: 코인 60→10, "교환됨"·"코인이 부족해요" 표시, 부모 내역에 "자녀A · 치킨 먹기 · 50코인")

---

### ✅ Task 10: 완료 연출 (juice + 캐릭터 반응)

- **담당 판정 기준**: S14-1, S14-2, S14-3
- **크기**: M
- **의존성**: Task 4 (완료), Task 5 (아바타)
- **참조**: shadcn (sonner Toaster — 획득 팝업), 위험: 없음(폴리시)
- **구현 대상**:
  - `app/layout.tsx` (Toaster 마운트) — Modify
  - `components/summer-quest/quest-list.tsx` (완료 시 획득량 팝업 트리거) — Modify
  - `components/summer-quest/exp-bar.tsx` (전환 애니메이션 상태) + `.test.tsx`
  - `avatar-display.tsx` (완료 반응 상태 클래스) — Modify
- **검증**: Vitest — 완료 시 획득량("+10 EXP · +5코인") 요소 등장 `[S14-1]`, EXP 바 전환 상태(클래스/aria-valuenow 변화) `[S14-2]`, 아바타 반응 연출 클래스 부여 `[S14-3]`

---

### Task 11: 진행 게이지 + 전체 완료 보너스·컨페티

- **담당 판정 기준**: S15-1, S15-2, S15-3, S15-4
- **크기**: M
- **의존성**: Task 6 (전체완료 판정), Task 4 (코인)
- **참조**: shadcn (Progress — 게이지)
- **구현 대상**:
  - `lib/game/progress.ts` (전체완료 보너스 지급 로직) — Modify
  - `config/game.ts` (ALL_COMPLETE_BONUS) — Modify
  - `components/summer-quest/progress-gauge.tsx` + `.test.tsx`
  - `components/summer-quest/confetti.tsx` (CSS 연출 요소)
  - `home-screen.tsx` / `all-clear-message.tsx` — Modify
- **검증**: Vitest — 게이지 "2/3"(67%) `[S15-1]`, 마지막 완료→"3/3"(100%) `[S15-2]`, 전체완료 보너스 코인 +10 반영 `[S15-3]`, 컨페티 요소 등장 `[S15-4]`

---

### Task 12: 업적 뱃지

- **담당 판정 기준**: S16-1, S16-2, S16-3, S16-4
- **크기**: M
- **의존성**: Task 4(첫 클리어), Task 5(Lv5), Task 6(7일), Task 9(첫 교환)
- **참조**: shadcn (Dialog — 업적 모달, Badge, sonner — 해제 알림)
- **구현 대상**:
  - `lib/game/achievements.ts` (`checkAchievements(state)`: 조건 평가) + `.test.ts`
  - `config/game.ts` (ACHIEVEMENTS 목록) — Modify
  - `hooks/useGame.tsx` (해제 감지·알림) — Modify
  - `components/summer-quest/achievements-dialog.tsx` + `.test.tsx`
- **검증**: Vitest — 잠금/해제 구분 목록 `[S16-1]`, 첫 완료 시 "첫 클리어" 해제 `[S16-2]`, 해제 알림 등장 `[S16-3]`, 기본 업적 4종 정의 `[S16-4]`

---

### Task 13: streak 마일스톤 보상

- **담당 판정 기준**: S17-1, S17-2, S17-3
- **크기**: S
- **의존성**: Task 6 (streak)
- **참조**: shadcn (Dialog/Alert — 달성 알림)
- **구현 대상**:
  - `lib/game/milestone.ts` (`checkMilestone(streak, awarded)`: 임계 도달·중복 방지·다음까지) + `.test.ts`
  - `config/game.ts` (STREAK_MILESTONES + 보너스) — Modify
  - `hooks/useGame.tsx` (마일스톤 지급) — Modify
  - `components/summer-quest/milestone-dialog.tsx` + `.test.tsx`
- **검증**: Vitest — 마일스톤(3·7·14) 도달 시 보너스 코인 지급 `[S17-1]`, 달성 알림 `[S17-2]`, 다음 마일스톤까지 남은 일수 표시 `[S17-3]`

---

### 최종 Checkpoint
- [ ] `bun run test` / `bun run build` / `scripts/spec-coverage.sh summer-quest --tests` 전부 통과
- [ ] `e2e/summer-quest.spec.ts` (Playwright, `?today=` 오버라이드로 날짜 제어): spec.md **End-to-end 검증** 1~11단계 실행
- [ ] web-design-guidelines로 접근성 리뷰 (포커스·aria·대비), 증거는 `artifacts/summer-quest/evidence/`
- [ ] 통과한 판정 기준의 체크박스를 spec.md에서 켠다 (실행 증거로만)

## 미결정 항목

- (없음 — spec의 "완료 회수 시 코인 음수" 미결정은 위 아키텍처 결정에서 0 clamp로 해소. 데모 사용 후 재확인 여지)
