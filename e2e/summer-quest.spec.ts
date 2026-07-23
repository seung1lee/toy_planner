import { expect, test, type Page } from "@playwright/test";

/**
 * spec.md의 End-to-end 검증 절차(1~11단계)를 순서대로 실행한다.
 * `?today=YYYY-MM-DD`로 날짜를 결정적으로 제어한다 (날짜 seam).
 *
 * childA 시드 계획: 수학(월수금), 영어(매일), 독서(화목).
 * 여기에 "한자쓰기"(월수금)를 추가해, 월·화·수 3일을 완전 완료로 만들면
 * 레벨업(50 EXP)과 streak 3일 마일스톤이 같은 흐름에서 자연스럽게 발생한다:
 *   월: 수학+영어+한자쓰기 (3개, EXP+30) → 전체완료 1일차
 *   화: 영어+독서 (2개, EXP+20, 누적 50) → 레벨업 발생 지점
 *   수: 수학+영어+한자쓰기 (3개, EXP+30) → streak 3일 마일스톤 발생 지점
 */

async function goto(page: Page, todayISO: string) {
  await page.goto(`/?today=${todayISO}`);
}

test("summer-quest — spec.md End-to-end 검증 1~11단계", async ({ page }) => {
  // 1. 첫 진입 — 자녀A·B 시드 계획, 부모 길드 샵 시드 보상 (S13, S1)
  await goto(page, "2024-01-01"); // 월요일
  await page.getByRole("button", { name: "이번 주 계획" }).click();
  await expect(page.getByText("수학 문제 20개 · 월·수·금")).toBeVisible();
  await expect(page.getByText("영어 단어 30개 · 월·화·수·목·금")).toBeVisible();

  await page.getByRole("radio", { name: "부모" }).click();
  await expect(page.getByText("치킨 먹기 · 50코인")).toBeVisible();
  await expect(page.getByText("게임 1시간 · 30코인")).toBeVisible();

  // 자녀A로 돌아가면 이전에 열어둔 "이번 주 계획" 탭이 그대로 유지된다 (AppShell의 childView는
  // profile 전환에 영향받지 않는 로컬 상태)
  await page.getByRole("radio", { name: "자녀A" }).click();

  // 2. 이번 주 계획에 항목 추가 (S2)
  await page.getByPlaceholder("예: 수학 문제").fill("한자쓰기");
  await page.getByPlaceholder("20").fill("10");
  await page.getByRole("button", { name: "월", exact: true }).click();
  await page.getByRole("button", { name: "수", exact: true }).click();
  await page.getByRole("button", { name: "금", exact: true }).click();
  await page.getByRole("button", { name: "추가" }).click();
  await expect(page.getByText("한자쓰기 10개 · 월·수·금")).toBeVisible();

  // 3. 오늘의 퀘스트 자동 생성 — 월요일엔 보이고 화요일엔 안 보인다 (S3)
  await page.getByRole("button", { name: "홈" }).click();
  const hanjaCheckbox = page.getByRole("checkbox", { name: "한자쓰기 완료" });
  await expect(hanjaCheckbox).toBeVisible();

  await goto(page, "2024-01-02"); // 화요일
  await expect(page.getByRole("checkbox", { name: "한자쓰기 완료" })).toHaveCount(0);

  await goto(page, "2024-01-01"); // 다시 월요일

  // 4. 완료 → EXP·코인 반영 (3클릭 이내). 해제 → 회수 (S4, S5)
  await page.getByRole("checkbox", { name: "한자쓰기 완료" }).click(); // 1클릭
  await expect(page.getByText("EXP 10")).toBeVisible();
  await expect(page.getByText("코인 5")).toBeVisible();
  await page.getByRole("checkbox", { name: "한자쓰기 완료" }).click();
  await expect(page.getByText("EXP 0")).toBeVisible();
  await expect(page.getByText("코인 0")).toBeVisible();

  // 6(일부). 완료 순간 획득량 팝업이 나타난다 (S14-1)
  await page.getByRole("checkbox", { name: "한자쓰기 완료" }).click();
  await expect(page.locator("[data-sonner-toast]").first()).toBeVisible();
  // "첫 클리어" 업적 알림도 이 시점에 함께 뜬다 (S16-2, S16-3)
  await expect(page.getByText('새 업적 획득: "첫 클리어"!')).toBeVisible();

  // 월요일 나머지 항목 완료 → 오늘(월) 전체완료: EXP 30, 코인 15+10(보너스)=25 (S7-1, S8-1, S15, S14)
  await page.getByRole("checkbox", { name: "수학 문제 완료" }).click();
  await page.getByRole("checkbox", { name: "영어 단어 완료" }).click();
  await expect(page.getByText("오늘의 모험을 전부 클리어했어요! 🎉")).toBeVisible();
  await expect(page.getByTestId("confetti")).toBeVisible();
  await expect(page.getByText("streak 1일")).toBeVisible();
  await expect(page.getByText("EXP 30")).toBeVisible();
  await expect(page.getByText("코인 25")).toBeVisible();

  // 화요일: 영어+독서 완료 → 오늘도 전체완료, EXP 30+20=50 → 레벨업 (S6, INV-1)
  await goto(page, "2024-01-02");
  await page.getByRole("checkbox", { name: "영어 단어 완료" }).click();
  await page.getByRole("checkbox", { name: "독서 완료" }).click();
  await expect(page.getByText("🎉 레벨업! 🎉")).toBeVisible();
  await page.getByRole("button", { name: "계속하기" }).click();
  await expect(page.getByText("Lv2")).toBeVisible();
  await expect(page.getByText("견습 모험가")).toBeVisible();

  // 화요일 완료 해제 → EXP가 50 미만으로 내려가면 다시 Lv1로 되돌아간다 (S6-4)
  await page.getByRole("checkbox", { name: "독서 완료" }).click();
  await expect(page.getByText("Lv1")).toBeVisible();
  await page.getByRole("checkbox", { name: "독서 완료" }).click(); // 다시 완료 (다음 단계를 위해 원복)

  // 수요일: 수학+영어+한자쓰기 완료 → 오늘도 전체완료, streak 3일 → 마일스톤 (S7, S17)
  await goto(page, "2024-01-03");
  await page.getByRole("checkbox", { name: "수학 문제 완료" }).click();
  await page.getByRole("checkbox", { name: "영어 단어 완료" }).click();
  await page.getByRole("checkbox", { name: "한자쓰기 완료" }).click();
  await expect(page.getByText("3일 연속 달성! 🔥")).toBeVisible();
  await expect(page.getByText("다음 마일스톤(7일)까지 4일 남았어요")).toBeVisible();
  await page.getByRole("button", { name: "계속하기" }).click();
  await expect(page.getByText("streak 3일")).toBeVisible();

  // 8. 길드 샵에서 보상 교환 — 코인 즉시 차감, 교환됨 표시. 코인 부족 보상은 비활성 (S10, S11, INV-4)
  await page.getByRole("button", { name: "길드 샵" }).click();
  const chickenCard = page.getByTestId("reward-card-seed-reward-chicken");
  await chickenCard.getByRole("button", { name: "교환" }).click();
  await expect(chickenCard.getByRole("button", { name: "교환됨" })).toBeDisabled();

  // 9. 부모로 전환 → 교환 내역 확인, 새 보상 등록 → 자녀 화면에도 노출 (S1, S9)
  await page.getByRole("radio", { name: "부모" }).click();
  await expect(page.getByText("자녀A · 치킨 먹기 · 50코인")).toBeVisible();

  await page.getByPlaceholder("예: 치킨 먹기").fill("보드게임");
  await page.getByPlaceholder("50").fill("20");
  await page.getByRole("button", { name: "등록" }).click();
  await expect(page.getByText("보드게임 · 20코인")).toBeVisible();

  await page.getByRole("radio", { name: "자녀A" }).click();
  await page.getByRole("button", { name: "길드 샵" }).click();
  await expect(page.getByText("보드게임")).toBeVisible();

  // 10. 새로고침 후에도 상태 유지 (INV-3). 자녀B로 바꿔도 자녀A 진행이 섞이지 않는다 (INV-2)
  // 새로고침은 전체 리마운트라 화면 탭은 기본값("홈")으로 돌아간다 — 데이터(길드 샵 항목)는 유지된다.
  await page.reload();
  await page.getByRole("button", { name: "길드 샵" }).click();
  await expect(page.getByText("보드게임")).toBeVisible();

  await page.getByRole("button", { name: "홈" }).click();
  await expect(page.getByText("streak 3일")).toBeVisible();

  await page.getByRole("radio", { name: "자녀B" }).click();
  await expect(page.getByText("streak 3일")).toHaveCount(0);
  await expect(page.getByText("EXP 0")).toBeVisible(); // 자녀B는 별도 진행
  await page.getByRole("radio", { name: "자녀A" }).click();

  // 11. 다음 주 월요일에도 지난 주 계획으로 퀘스트가 생성되고 성장 지표가 이어진다 (S12)
  await goto(page, "2024-01-08"); // 다음 주 월요일
  await expect(page.getByRole("checkbox", { name: "한자쓰기 완료" })).toBeVisible();
  await expect(page.getByText("EXP 80")).toBeVisible(); // 30+20+30, 리셋되지 않음
});
