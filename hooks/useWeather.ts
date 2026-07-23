"use client";

import * as React from "react";

/** 서울 좌표 — geolocation 거부·실패 시 기본값 */
const DEFAULT_LAT = 37.5665;
const DEFAULT_LON = 126.978;

export interface WeatherData {
  temperature: number;
  code: number;
}

/**
 * 현재 위치(또는 서울 fallback)의 날씨를 Open-Meteo에서 가져온다. API 키 불필요.
 * 실패해도 조용히 null을 유지한다 — 날씨는 부가 정보라 에러를 노출하지 않는다.
 */
export function useWeather(): { weather: WeatherData | null; loading: boolean } {
  const [weather, setWeather] = React.useState<WeatherData | null>(null);
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
        // 조용히 실패
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

  return { weather, loading };
}
