"use client";

import { describeWeatherCode } from "@/lib/game/weather";
import type { WeatherData } from "@/hooks/useWeather";

export function WeatherWidget({
  weather,
  loading,
}: {
  weather: WeatherData | null;
  loading: boolean;
}) {
  if (loading || !weather) return null;

  const { emoji, label } = describeWeatherCode(weather.code);

  return (
    <div className="flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
      <span aria-hidden="true">{emoji}</span>
      <span>
        {label} {weather.temperature}°C
      </span>
    </div>
  );
}
