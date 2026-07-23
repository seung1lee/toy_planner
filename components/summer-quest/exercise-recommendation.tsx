"use client";

import { recommendExercise } from "@/lib/game/weather";
import type { WeatherData } from "@/hooks/useWeather";

export function ExerciseRecommendation({
  weather,
}: {
  weather: WeatherData | null;
}) {
  if (!weather) return null;

  return (
    <p className="rounded-lg border bg-muted/50 p-3 text-center text-sm text-muted-foreground">
      {recommendExercise(weather.temperature, weather.code)}
    </p>
  );
}
