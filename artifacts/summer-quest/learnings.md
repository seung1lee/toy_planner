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
