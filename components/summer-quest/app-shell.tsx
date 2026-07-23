"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { ProfileSwitch } from "./profile-switch";
import { ProfileSettingsDialog } from "./profile-settings-dialog";
import { AddChildDialog } from "./add-child-dialog";
import { PlanScreen } from "./plan-screen";
import { HomeScreen } from "./home-screen";
import { ShopScreen } from "./shop-screen";
import { ParentScreen } from "./parent-screen";

type ChildView = "home" | "plan" | "shop";

export function AppShell() {
  const { activeProfile } = useActiveProfile();
  const [childView, setChildView] = React.useState<ChildView>("home");

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <ProfileSwitch />
        <div className="flex items-center gap-2">
          <AddChildDialog />
          <ProfileSettingsDialog />
        </div>
      </div>

      {activeProfile.role === "parent" ? (
        <ParentScreen />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              variant={childView === "home" ? "default" : "outline"}
              size="sm"
              onClick={() => setChildView("home")}
            >
              홈
            </Button>
            <Button
              variant={childView === "plan" ? "default" : "outline"}
              size="sm"
              onClick={() => setChildView("plan")}
            >
              이번 주 계획
            </Button>
            <Button
              variant={childView === "shop" ? "default" : "outline"}
              size="sm"
              onClick={() => setChildView("shop")}
            >
              길드 샵
            </Button>
          </div>

          {childView === "home" && <HomeScreen profile={activeProfile} />}
          {childView === "plan" && <PlanScreen profileId={activeProfile.id} />}
          {childView === "shop" && <ShopScreen profileId={activeProfile.id} />}
        </div>
      )}
    </main>
  );
}
