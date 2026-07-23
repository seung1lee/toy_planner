"use client";

import type { Profile, ProfileId } from "@/types/game";
import { useGame, useActiveProfileObject } from "./useGame";

interface UseActiveProfileResult {
  profiles: Profile[];
  activeProfile: Profile;
  activeProfileId: ProfileId;
  setActiveProfile: (id: ProfileId) => void;
}

export function useActiveProfile(): UseActiveProfileResult {
  const { state, activeProfileId, setActiveProfileId } = useGame();
  const activeProfile = useActiveProfileObject();
  return {
    profiles: state.profiles,
    activeProfile,
    activeProfileId,
    setActiveProfile: setActiveProfileId,
  };
}
