import type { Weekday } from "@/types/game";

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  1: "월",
  2: "화",
  3: "수",
  4: "목",
  5: "금",
};

export const WEEKDAY_ORDER: Weekday[] = [1, 2, 3, 4, 5];

/** [1,3,5] → "월·수·금" */
export function formatWeekdays(weekdays: Weekday[]): string {
  return [...weekdays]
    .sort((a, b) => a - b)
    .map((w) => WEEKDAY_LABEL[w])
    .join("·");
}
