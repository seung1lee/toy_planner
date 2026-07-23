"use client";

import * as React from "react";
import { Settings } from "lucide-react";
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
import { useActiveProfile } from "@/hooks/useActiveProfile";

const EMOJI_PRESETS = ["🦁", "🐰", "🐻", "🐯", "🐱", "🐶", "🦊", "🐼", "🐨", "🦄"];

export function ProfileSettingsDialog() {
  const { activeProfile } = useActiveProfile();
  const { updateProfile } = useGame();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(activeProfile.name);
  const [emoji, setEmoji] = React.useState(activeProfile.avatarEmoji ?? "🙂");

  React.useEffect(() => {
    if (open) {
      setName(activeProfile.name);
      setEmoji(activeProfile.avatarEmoji ?? "🙂");
    }
  }, [open, activeProfile.name, activeProfile.avatarEmoji]);

  function handleSave() {
    updateProfile(activeProfile.id, {
      name: name.trim() || activeProfile.name,
      avatarEmoji: emoji,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="size-4" />
          프로필 설정
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로필 설정</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="profile-name">이름</FieldLabel>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
