"use client";

import * as React from "react";

const QUOTES = [
  "오늘도 한 걸음, 내일은 두 걸음! 💪",
  "작은 습관이 큰 나를 만든다 🌱",
  "포기하지 않으면 반드시 는다 🔥",
  "오늘의 나는 어제보다 강하다 ⭐",
  "꾸준함이 최고의 재능이다 🏆",
  "시작이 반이다, 오늘도 시작해보자! 🚀",
];

export function EncouragementMessage() {
  const [quote] = React.useState(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)]
  );
  return (
    <p className="rounded-lg border bg-muted/50 p-3 text-center text-sm text-muted-foreground">
      {quote}
    </p>
  );
}
