import { GameProvider } from "@/hooks/useGame";
import { AppShell } from "@/components/summer-quest/app-shell";

export default function Page() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}
