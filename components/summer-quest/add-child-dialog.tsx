"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGame } from "@/hooks/useGame";

const EMOJI_PRESETS = ["🦁", "🐰", "🐻", "🐯", "🐱", "🐶", "🦊", "🐼", "🐨", "🦄"];

export function AddChildDialog() {
  const { addChildProfile } = useGame();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [emoji, setEmoji] = React.useState(EMOJI_PRESETS[0]);

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    addChildProfile(trimmed, emoji);
    setName("");
    setEmoji(EMOJI_PRESETS[0]);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="size-4" />
          자녀 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>자녀 추가</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="new-child-name">이름</FieldLabel>
            <Input
              id="new-child-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 자녀C"
            />
          </Field>
          <Field>
            <FieldLabel>아바타</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {EMOJI_PRESETS.map((e) => (
                <button
                  key={e}
                  type="button"
                  aria-label={`아바타 ${e} 선택`}
                  aria-pressed={emoji === e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg border text-xl",
                    emoji === e
                      ? "border-primary ring-2 ring-primary"
                      : "border-border"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button onClick={handleAdd} disabled={!name.trim()}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
