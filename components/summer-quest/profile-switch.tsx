"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ProfileId } from "@/types/game";
import { useActiveProfile } from "@/hooks/useActiveProfile";

export function ProfileSwitch() {
  const { profiles, activeProfileId, setActiveProfile } = useActiveProfile();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">프로필</span>
      <ToggleGroup
        type="single"
        value={activeProfileId}
        onValueChange={(value) => {
          // 빈 값(선택 해제)은 무시 — 항상 하나는 활성
          if (value) setActiveProfile(value as ProfileId);
        }}
        variant="outline"
        aria-label="프로필 전환"
      >
        {profiles.map((p) => (
          <ToggleGroupItem key={p.id} value={p.id} aria-label={p.name}>
            {p.avatarEmoji && <span aria-hidden="true">{p.avatarEmoji}</span>}
            {p.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
