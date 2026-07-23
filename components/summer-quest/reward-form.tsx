"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useGame } from "@/hooks/useGame";

export function RewardForm() {
  const { addReward } = useGame();
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");

  const canAdd = name.trim().length > 0 && Number(price) > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) return;
    addReward({
      id: crypto.randomUUID(),
      name: name.trim(),
      price: Number(price),
    });
    setName("");
    setPrice("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="reward-name">이름</FieldLabel>
          <Input
            id="reward-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 치킨 먹기"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="reward-price">코인 가격</FieldLabel>
          <Input
            id="reward-price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="50"
          />
        </Field>
        <Field>
          <Button type="submit" disabled={!canAdd}>
            등록
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
