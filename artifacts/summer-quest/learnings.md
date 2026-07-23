---
triggers: [spec-coverage.sh, "테스트 미인용", checkpoint, intermediate checkpoint, 중간 체크포인트]
status: verified
scope: this-repo (scripts/spec-coverage.sh)
date: 2026-07-23
---
## spec-coverage.sh --tests는 항상 spec 전체를 검사한다 — 중간 체크포인트에서는 완료된 Task의 ID만 걸러서 판단하라

**지시문**: 중간 체크포인트에서 `scripts/spec-coverage.sh <feature> --tests`가 exit 1이어도 당황하지 말고, 출력의 "테스트 미인용" 목록이 **아직 구현하지 않은 뒤쪽 Task가 담당하는 ID로만** 채워져 있는지 확인하라. 지금까지 완료한 Task가 담당하는 ID가 하나도 안 보이면 그 체크포인트는 사실상 통과다. 스크립트는 plan.md 전체의 ID를 대상으로 검사하므로, 마지막 체크포인트 전에는 구조적으로 exit 0이 나올 수 없다.

**에피소드**: Task 1~4(summer-quest) 완료 후 Checkpoint에서 `--tests` 실행 결과 exit 1. 출력을 보니 S6~S17, INV-1(Task 5~13이 담당, 아직 미구현)만 "테스트 미인용"으로 잡혔고, Task 1~4가 담당한 S1-1~S1-3, S2-1~S2-5, S3-1~S3-4, S4-1~S4-4, S5-1~S5-3, S13-1, S13-3, INV-2, INV-3는 전부 빠져 있었다. 즉 완료된 범위는 전부 커버됐고, 실패는 스크립트의 전체-스펙 스캔 방식 때문이었다.

**증거**: `bash scripts/spec-coverage.sh summer-quest --tests` 실행 (Task 4 완료 커밋 시점) — 미인용 목록에 S1~S5/S13-1/S13-3/INV-2/INV-3 부재 확인.

---
triggers: [radix, Dialog, Portal, "container.querySelector", "testing-library", "toBeNull", jsdom]
status: verified
scope: this-repo (radix-ui Dialog, @testing-library/react)
date: 2026-07-23
---
## shadcn/radix Dialog는 Portal로 document.body에 렌더된다 — render()의 container로 못 찾는다

**지시문**: Dialog(또는 다른 Portal 기반 오버레이: Sheet, Drawer, AlertDialog)의 내부 요소를 `container.querySelector`로 찾으면 항상 null이 나온다. `screen.getByText/getByRole` 같은 document 전역 쿼리를 쓰거나, DOM 속성처럼 CSS 선택자가 필요하면 `document.querySelector`를 써라.

**에피소드**: Task 5(레벨업 다이얼로그)에서 `data-emphasized="true"` 속성을 `container.querySelector`로 검증하다가 "expected null not to be null"로 실패. Dialog의 `DialogContent`가 Radix Portal로 `document.body`에 별도로 붙기 때문에 render()가 반환한 로컬 `container`(테스트별 wrapper div) 안에는 존재하지 않았다. `document.querySelector`로 바꾸자 통과.

**증거**: `components/summer-quest/home-screen.test.tsx` — "[S6-1][S6-2][S6-3][S6-5] EXP 50 도달 시..." 테스트, 수정 후 33 tests pass.

---
triggers: [streak, "완전 파생", "derived state", ChildProgress, "롤백", uncomplete, 완료 해제]
status: verified
scope: this-repo (summer-quest 도메인 로직)
date: 2026-07-23
---
## 완료 이력 전체를 들고 있다면, 파생 가능한 집계 필드는 저장하지 말고 매번 계산하라

**지시문**: "완료/취소 가능한 이벤트 로그(completions)"가 이미 전체 보관되고 있는데 그 위에 "현재 streak" 같은 요약 카운터를 따로 필드로 두려는 유혹이 들면, 그 카운터가 이벤트 로그로부터 순수하게 재계산 가능한지 먼저 확인하라. 가능하면 필드를 두지 말고 파생 함수로 대체한다. 완료 해제(undo) 경로가 있는 도메인에서는 요약 필드 증분·롤백 로직이 항상 두 배로 늘고, 롤백을 깜빡하면 조용히 데이터가 어긋난다.

**에피소드**: Task 1에서 `ChildProgress`에 `streakCount`/`lastAllCompleteDateISO`를 미리 넣었다(plan.md 데이터 모델 초안). Task 6에서 streak 로직을 구현하려니, "완료 시 +1, 해제 시 되돌리기(직전 값을 어떻게 복원?)"를 다뤄야 해서 복잡해졌다. `completions` 배열이 이미 전체 이력을 보관하고 있다는 걸 깨닫고, `computeStreak(plan, completions, today)` 순수 함수로 매번 재계산하는 쪽으로 바꿨다. 요약 필드 두 개를 타입에서 제거했고(`types/game.ts`, `config/game.ts`, `lib/game/progress.test.ts` 갱신), 완료 해제 시 아무 것도 안 해도 streak가 자동으로 맞다.

**증거**: `lib/game/streak.ts` + `lib/game/streak.test.ts` (S7-1/S7-2/S7-3 4 tests pass), `git log` Task 6 커밋에서 `ChildProgress`의 두 필드 삭제 diff.

---
triggers: [queryByRole textbox, "PIN·로그인 게이트", "no auth gate", "textbox toBeNull", 인증 게이트 없음]
status: verified
scope: this-repo (summer-quest, S1-3류 "인증 없음" 판정 기준)
date: 2026-07-23
---
## "인증 게이트 없음"을 "textbox가 하나도 없다"로 테스트하면, 그 화면에 정상 폼이 생기는 순간 거짓 실패한다

**지시문**: "이 화면엔 PIN/로그인이 없다"를 증명할 때 `queryByRole("textbox")`가 null인지로 검증하지 마라. 그 화면에 나중에 다른 Task가 정당한 입력 폼(이름 검색, 보상 등록 등)을 추가하면 textbox가 생기고 테스트가 거짓으로 깨진다. 인증 여부는 `input[type="password"]` 존재나 "PIN"/"비밀번호" 라벨 유무처럼 인증에 고유한 신호로 좁혀서 검증하라.

**에피소드**: Task 1에서 S1-3("부모 진입에 PIN·로그인 게이트가 없다")을 `queryByRole("textbox")`가 null임으로 검증했다. Task 8에서 부모 화면에 보상 등록 폼(이름·가격 Input)을 추가하자 이 테스트가 깨졌다 — 폼 자체는 기준과 무관한데 "textbox 없음"이라는 과도하게 넓은 조건 때문이었다. `document.querySelector('input[type="password"]')`로 좁혀서 해결.

**증거**: `components/summer-quest/app-shell.test.tsx` — "[S1-3]" 테스트, Task 8 커밋에서 수정. 수정 후 48 tests pass.

---
triggers: [matchMedia, "matchMedia is not a function", sonner, next-themes, jsdom, vitest.setup]
status: verified
scope: this-repo (vitest 4.x, jsdom, sonner, next-themes)
date: 2026-07-23
---
## jsdom에는 matchMedia가 없다 — sonner·next-themes를 마운트하는 테스트에서 즉시 터진다

**지시문**: `Toaster`(sonner) 또는 `next-themes`의 `useTheme`을 마운트하는 컴포넌트를 테스트할 때 `TypeError: window.matchMedia is not a function`이 나면, 컴포넌트 버그가 아니라 jsdom에 `matchMedia`가 없어서다. `vitest.setup.ts`에 전역 stub을 추가하라 (한 번만 하면 이후 모든 테스트에 적용됨).

**에피소드**: Task 10에서 `<Toaster />`를 렌더하는 테스트(S14-1)가 `sonner/dist/index.mjs`에서 `window.matchMedia is not a function`으로 실패. `vitest.setup.ts`에 `window.matchMedia` mock을 추가해 해결.

**증거**: `vitest.setup.ts` 수정 (Task 10 커밋), 수정 후 57 tests pass.

---
triggers: [shadcn Progress, "aria-valuenow", "progress-indicator", "components/ui 수정 금지", translateX]
status: verified
scope: this-repo (shadcn Progress 컴포넌트, radix-ui)
date: 2026-07-23
---
## shadcn가 생성한 Progress는 value를 Radix Root에 전달하지 않는다 — aria-valuenow가 항상 비어 있다

**지시문**: `components/ui/progress.tsx`로 만든 진행바를 테스트할 때 `getByRole("progressbar")`의 `aria-valuenow` 속성을 검증하지 마라 — 항상 `null`이다. 이 컴포넌트는 `value` prop을 destructure해서 `Indicator`의 `style.transform` 계산에만 쓰고 `<ProgressPrimitive.Root>`에는 전달하지 않는다(라디언트 자체 버그). `components/ui/*`는 shadcn-guard 규칙상 직접 고치지 않으므로, 시각적 채움 정도를 검증하려면 `[data-slot="progress-indicator"]`의 `style.transform` 값을 직접 확인하라.

**에피소드**: Task 10에서 `ExpBar`(S14-2) 테스트가 `aria-valuenow`로 값 변화를 검증하려다 항상 `null`이라 실패. `document.querySelector('[data-slot="progress-indicator"]').style.transform`으로 바꿔 해결(`translateX(-(100-value)%)` 공식).

**증거**: `components/summer-quest/exp-bar.test.tsx`, Task 10 커밋. 수정 후 57 tests pass.
