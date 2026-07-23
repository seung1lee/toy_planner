// 순수 날씨 분류·추천 로직. 외부 의존 없음 (DOM·네트워크 무관).

export type WeatherCategory =
  | "clear"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "storm";

/** WMO 날씨 코드를 대략적인 범주로 분류한다. */
export function classifyWeatherCode(code: number): WeatherCategory {
  if (code === 0 || code <= 2) return "clear";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 95) return "storm";
  return "cloudy";
}

const WEATHER_LABEL: Record<WeatherCategory, { emoji: string; label: string }> = {
  clear: { emoji: "☀️", label: "맑음" },
  cloudy: { emoji: "☁️", label: "흐림" },
  fog: { emoji: "🌫️", label: "안개" },
  rain: { emoji: "🌧️", label: "비" },
  snow: { emoji: "❄️", label: "눈" },
  storm: { emoji: "⛈️", label: "뇌우" },
};

export function describeWeatherCode(code: number): { emoji: string; label: string } {
  return WEATHER_LABEL[classifyWeatherCode(code)];
}

/** 날씨·기온 기반 운동 퀘스트 추천 문구 (제안 기본값). */
export function recommendExercise(temperature: number, code: number): string {
  const category = classifyWeatherCode(code);

  if (category === "storm") return "번개가 쳐요! 오늘은 실내에서 스트레칭만 가볍게 해요 ⚡";
  if (category === "rain") return "비가 와요! 실내에서 줄넘기나 계단 오르기 어때요? 🌧️";
  if (category === "snow") return "눈이 와요! 실내 운동이나 집 앞 눈싸움도 좋아요 ❄️";
  if (category === "fog") return "안개가 껴 있어요. 무리하지 말고 가볍게 스트레칭해요 🌫️";

  if (temperature >= 30) return "너무 더워요! 그늘에서 짧게 운동하고 물 많이 마셔요 🥤";
  if (temperature <= 0) return "많이 추워요! 실내에서 몸을 풀고 나가면 가볍게 뛰어요 🧣";
  if (category === "clear") return "날씨가 정말 좋아요! 밖에서 신나게 뛰어놀기 딱이에요 🏃";
  return "오늘 날씨엔 산책이나 줄넘기 정도가 딱 좋아요 🚶";
}
