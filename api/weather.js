// api/weather.js
export default async function handler(req, res) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({
      error: "Missing latitude or longitude"
    });
  }

  try {
    // STEP 1: Get NWS grid point info
    const pointResponse = await fetch(
      `https://api.weather.gov/points/${lat},${lon}`,
      {
        headers: {
          "User-Agent": "FirefighterCopilotDemo (demo@copilot.ai)"
        }
      }
    );

    const pointData = await pointResponse.json();
    const forecastHourlyUrl =
      pointData.properties.forecastHourly;

    // STEP 2: Get hourly forecast (includes wind)
    const forecastResponse = await fetch(
      forecastHourlyUrl,
      {
        headers: {
          "User-Agent": "FirefighterCopilotDemo (demo@copilot.ai)"
        }
      }
    );

    const forecastData = await forecastResponse.json();
    const current = forecastData.properties.periods[0];

    // STEP 3: Normalize data for ElevenLabs
    const liveWeather = {
      Location:
        pointData.properties.relativeLocation.properties.city,
      Wind_Direction: current.windDirection,
      Wind_Speed_MPH: parseInt(current.windSpeed),
      Temperature_F: current.temperature,
      Red_Flag_Warning:
        current.shortForecast
          .toLowerCase()
          .includes("red flag")
          ? "Yes"
          : "No",
      Timestamp: new Date().toLocaleTimeString()
    };

    // STEP 4: Return structured data
    res.status(200).json({
      LIVE_WEATHER_DATA: liveWeather
    });

  } catch (error) {
    res.status(500).json({
      error: "Unable to retrieve weather data"
    });
  }
}
