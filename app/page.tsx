import { GameProvider } from "@/hooks/useGame";
import { AppShell } from "@/components/summer-quest/app-shell";

interface PageProps {
  /** `?today=YYYY-MM-DD`로 "오늘"을 오버라이드한다 (E2E에서 날짜를 결정적으로 제어). */
  searchParams: Promise<{ today?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { today: todayParam } = await searchParams;
  const today = todayParam ? new Date(`${todayParam}T00:00:00`) : undefined;

  return (
    <GameProvider today={today}>
      <AppShell />
    </GameProvider>
  );
}
