import { CONFIG } from "../config/env.js";
import { log } from "../utils/logger.js";

export async function executeTool(name, args) {
  const start = Date.now();
  log("INFO", `🛠️  TOOL-START: Executing '${name}'`, args);

  try {
    let result = null;

    if (name === "get_local_time") {
      const now = new Date().toLocaleString("en-GB");
      result = { location: "Server Local Time", datetime: now };
    }
    else if (name === "get_city_time") {
      // Resolve city to timezone
      const geo = await getGeoData(args.city);
      if (!geo.timezone) throw new Error(`Timezone not found for ${args.city}`);

      const now = new Date().toLocaleString("en-GB", { timeZone: geo.timezone });
      result = { 
        location: `${geo.name}, ${geo.country}`, 
        timezone: geo.timezone, 
        datetime: now 
      };
    }
    else if (name === "get_weather") {
      // Resolve city to coordinates
      const geo = await getGeoData(args.city);

      // Fetch weather
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
      log("DEBUG", `🌤️ Weather Fetch URL: ${weatherUrl}`);
      
      const res = await fetch(weatherUrl);
      if (!res.ok) throw new Error(`Weather API returned status ${res.status}`);
      
      const data = await res.json();
      const current = data.current;
      const units = data.current_units;
      
      result = {
        location: `${geo.name}, ${geo.country}`,
        coordinates: { lat: geo.latitude, lon: geo.longitude },
        temperature: `${current.temperature_2m} ${units.temperature_2m}`,
        humidity: `${current.relative_humidity_2m} ${units.relative_humidity_2m}`,
        wind_speed: `${current.wind_speed_10m} ${units.wind_speed_10m}`,
        condition: getWeatherDescription(current.weather_code),
        time: current.time
      };
    }
    else if (name === "search_internet") {
      const query = args.query;
      const searchUrl = `${CONFIG.SEARXNG_URL}/search?q=${encodeURIComponent(query)}&format=json`;
      log("DEBUG", `🔍 SearXNG Fetch URL: ${searchUrl}`);

      const res = await fetch(searchUrl);
      if (!res.ok) throw new Error(`SearXNG returned status ${res.status}`);
      
      const json = await res.json();
      if (!json.results || json.results.length === 0) {
        result = { result: "No results found." };
      } else {
        const validResults = json.results
          .filter(r => r.url && r.url.startsWith("http"))
          .slice(0, 3)
          .map(r => ({ title: r.title, url: r.url, snippet: r.content }));
        result = { results: validResults };
      }
    }
    else if (name === "invert_matrix") {
      const url = `${CONFIG.MCP_MATRIX_URL}/tool/matrix`;
      result = await postToMcp(url, args);
    }
    else if (name === "solve_hanoi") {
      const url = `${CONFIG.MCP_HANOI_URL}/tool/hanoi`;
      result = await postToMcp(url, args);
    }
    else {
      result = { error: "Unknown tool name" };
    }

    const duration = Date.now() - start;
    log("INFO", `✅ TOOL-END: '${name}' completed in ${duration}ms`, result);
    return result;

  } catch (error) {
    const duration = Date.now() - start;
    log("ERROR", `❌ TOOL-FAIL: '${name}' failed in ${duration}ms`, { error: error.message });
    return { error: `Tool execution failed: ${error.message}` };
  }
}

async function postToMcp(url, body) {
  const resp = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
  });
  if (!resp.ok) throw new Error(await resp.text());
  return await resp.json();
}

/**
 * Helper to get Lat, Lon, and Timezone for a city using Open-Meteo Geocoding API.
 */
async function getGeoData(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding API failed: ${res.status}`);
  
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`Location '${city}' not found.`);
  }

  return data.results[0]; // { latitude, longitude, timezone, name, country, ... }
}

function getWeatherDescription(code) {
  const codes = {
    0: "Clear sky",
    1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
  };
  return codes[code] || "Unknown condition";
}