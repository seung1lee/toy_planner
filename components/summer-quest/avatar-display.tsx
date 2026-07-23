"use client";

import { Sprout, Swords, Shield, Award, Crown, type LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const AVATAR_ICON: Record<string, LucideIcon> = {
  sprout: Sprout,
  apprentice: Swords,
  skilled: Shield,
  veteran: Award,
  legend: Crown,
};

export function AvatarDisplay({
  avatarKey,
  size = "default",
  emphasized = false,
  reacting = false,
  className,
}: {
  avatarKey: string;
  size?: "default" | "sm" | "lg";
  /** 레벨업 진화 연출 강조 상태 (S6-5) */
  emphasized?: boolean;
  /** 퀘스트 완료 순간의 짧은 반응 연출 (S14-3) */
  reacting?: boolean;
  className?: string;
}) {
  const Icon = AVATAR_ICON[avatarKey] ?? Sprout;
  return (
    <Avatar
      size={size}
      data-avatar={avatarKey}
      data-emphasized={emphasized}
      data-reacting={reacting}
      className={cn(
        emphasized && "ring-2 ring-primary ring-offset-2",
        reacting && "animate-bounce",
        className
      )}
    >
      <AvatarFallback>
        <Icon />
      </AvatarFallback>
    </Avatar>
  );
}
