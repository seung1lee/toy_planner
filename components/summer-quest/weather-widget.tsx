"use client";

import * as React from "react";

/** 서울 좌표 — geolocation 거부·실패 시 기본값 */
const DEFAULT_LAT = 37.5665;
const DEFAULT_LON = 126.978;

/** WMO 날씨 코드 → 이모지·한글 라벨 (자주 나오는 코드만 다룬다) */
function describeWeatherCode(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: "☀️", label: "맑음" };
  if (code <= 2) return { emoji: "🌤️", label: "대체로 맑음" };
  if (code === 3) return { emoji: "☁️", label: "흐림" };
  if (code === 45 || code === 48) return { emoji: "🌫️", label: "안개" };
  if (code >= 51 && code <= 57) return { emoji: "🌦️", label: "약한 비" };
  if (code >= 61 && code <= 67) return { emoji: "🌧️", label: "비" };
  if (code >= 71 && code <= 77) return { emoji: "❄️", label: "눈" };
  if (code >= 80 && code <= 82) return { emoji: "🌧️", label: "소나기" };
  if (code >= 95) return { emoji: "⛈️", label: "뇌우" };
  return { emoji: "🌡️", label: "날씨" };
}

interface WeatherState {
  temperature: number;
  code: number;
}

export function WeatherWidget() {
  const [weather, setWeather] = React.useState<WeatherState | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchWeather(lat: number, lon: number) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        if (!res.ok) throw new Error("weather fetch failed");
        const data = await res.json();
        if (!cancelled) {
          setWeather({
            temperature: Math.round(data.current_weather.temperature),
            code: data.current_weather.weathercode,
          });
        }
      } catch {
        // 조용히 실패 — 날씨는 부가 정보이므로 위젯을 숨기는 것으로 충분하다
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(DEFAULT_LAT, DEFAULT_LON),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LON);
    }

    return () => {
      cancelled = true;
    };
  }, []);

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
