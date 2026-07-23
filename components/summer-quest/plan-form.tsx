"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ProfileId, Weekday } from "@/types/game";
import { useGame } from "@/hooks/useGame";
import { WEEKDAY_LABEL, WEEKDAY_ORDER } from "./weekdays";

export function PlanForm({ profileId }: { profileId: ProfileId }) {
  const { addPlanItem } = useGame();
  const [name, setName] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [weekdays, setWeekdays] = React.useState<string[]>([]);

  const canAdd = name.trim().length > 0 && weekdays.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) return;
    addPlanItem(profileId, {
      id: crypto.randomUUID(),
      name: name.trim(),
      dailyGoal: Number(goal) || 0,
      weekdays: weekdays.map(Number).sort((a, b) => a - b) as Weekday[],
    });
    setName("");
    setGoal("");
    setWeekdays([]);
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="plan-name">이름</FieldLabel>
          <Input
            id="plan-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 수학 문제"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="plan-goal">일일 목표량</FieldLabel>
          <Input
            id="plan-goal"
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="20"
          />
        </Field>
        <Field>
          <FieldLabel>수행 요일 (월~금 중 선택)</FieldLabel>
          <ToggleGroup
            type="multiple"
            value={weekdays}
            onValueChange={setWeekdays}
            variant="outline"
            aria-label="수행 요일"
          >
            {WEEKDAY_ORDER.map((d) => (
              <ToggleGroupItem
                key={d}
                value={String(d)}
                aria-label={WEEKDAY_LABEL[d]}
              >
                {WEEKDAY_LABEL[d]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        <Field>
          <Button type="submit" disabled={!canAdd}>
            추가
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
