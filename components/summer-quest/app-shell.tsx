"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { ProfileSwitch } from "./profile-switch";
import { PlanScreen } from "./plan-screen";
import { HomeScreen } from "./home-screen";

type ChildView = "home" | "plan";

export function AppShell() {
  const { activeProfile } = useActiveProfile();
  const [childView, setChildView] = React.useState<ChildView>("home");

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <ProfileSwitch />

      {activeProfile.role === "parent" ? (
        <Card>
          <CardHeader>
            <CardTitle>부모 · 길드 샵 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              보상 등록 · 교환 내역 (구현 예정)
            </p>
          </CardContent>
        </Card>
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
          </div>

          {childView === "home" ? (
            <HomeScreen profile={activeProfile} />
          ) : (
            <PlanScreen profileId={activeProfile.id} />
          )}
        </div>
      )}
    </main>
  );
}
