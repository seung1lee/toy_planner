"use client";

import { PartyPopper, Sparkles, Star } from "lucide-react";

/** 전체 완료 순간의 순수 CSS 축하 연출 요소 (S15-4). 장식용이라 접근성 트리에서 숨긴다. */
export function Confetti() {
  return (
    <div
      data-testid="confetti"
      aria-hidden="true"
      className="flex items-center justify-center gap-4 text-muted-foreground/50"
    >
      <PartyPopper className="size-6" />
      <Sparkles className="size-5" />
      <Star className="size-5" />
      <PartyPopper className="size-6" />
    </div>
  );
}
