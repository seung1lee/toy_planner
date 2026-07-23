"use client";

export function AllClearMessage({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      role="status"
      className="rounded-lg border bg-muted p-4 text-center font-bold"
    >
      오늘의 모험을 전부 클리어했어요! 🎉
    </div>
  );
}
