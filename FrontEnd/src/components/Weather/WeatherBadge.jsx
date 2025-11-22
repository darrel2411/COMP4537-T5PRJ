import { useEffect, useState } from "react";

function formatTemperature(value) {
  if (value === null || value === undefined) return "--";
  return Math.round(value);
}

export function WeatherBadge() {
  const [temp, setTemp] = useState(null);
  const [windspeed, setWindspeed] = useState(null);
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // simple mapping for a few common weather codes
  const weatherText = (wcode) => {
    if (wcode === null || wcode === undefined) return "";
    if ([0].includes(wcode)) return "Clear sky";
    if ([1, 2, 3].includes(wcode)) return "Partly cloudy";
    if ([45, 48].includes(wcode)) return "Foggy";
    if ([51, 53, 55, 61, 63, 65].includes(wcode)) return "Rain";
    if ([71, 73, 75, 77].includes(wcode)) return "Snow";
    if ([80, 81, 82].includes(wcode)) return "Showers";
    if ([95, 96, 99].includes(wcode)) return "Thunderstorm";
    return "Weather";
  };

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setError("");

      try {
        // Vancouver coords; units: Celsius, km/h
        const url =
          "https://api.open-meteo.com/v1/forecast?latitude=49.2827&longitude=-123.1207&current_weather=true&timezone=auto";

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch weather");
        const json = await res.json();

        const current = json.current_weather || {};
        setTemp(current.temperature ?? null);
        setWindspeed(current.windspeed ?? null);
        setCode(current.weathercode ?? null);
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError("Failed to load weather");
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-white/10 px-3 py-2 text-xs text-blue-100">
        Loading weather…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-white/10 px-3 py-2 text-xs text-red-100">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white/10 px-3 py-2 text-xs text-blue-50 flex flex-col items-end">
      <span className="font-semibold text-sm">Vancouver</span>
      <span className="text-lg font-bold">{formatTemperature(temp)}°C</span>
      <span className="text-[11px]">
        {weatherText(code)} · Wind {formatTemperature(windspeed)} km/h
      </span>
    </div>
  );
}
