const userInput = document.querySelector("#search-input");
const formInput = document.querySelector(".top-right-info");

const weatherCodes = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog and depositing rime fog",
  48: "Fog and depositing rime fog",
  51: "Drizzle: Light intensity",
  53: "Drizzle: Moderate intensity",
  55: "Drizzle: Dense intensity",
  56: "Freezing Drizzle: Light intensity",
  57: "Freezing Drizzle: Dense intensity",
  61: "Rain: Slight intensity",
  63: "Rain: Moderate intensity",
  65: "Rain: Heavy intensity",
  66: "Freezing Rain: Light intensity",
  67: "Freezing Rain: Heavy intensity",
  71: "Snow fall: Slight intensity",
  73: "Snow fall: Moderate intensity",
  75: "Snow fall: Heavy intensity",
  77: "Snow grains",
  80: "Rain showers: Slight intensity",
  81: "Rain showers: Moderate intensity",
  82: "Rain showers: Violent intensity",
  85: "Snow showers: Slight intensity",
  86: "Snow showers: Heavy intensity",
  95: "Thunderstorm: Slight or moderate",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

const weatherIcons = {
  0: "clear-sky.png",
  1: "mainly-clear.png",
  2: "partly-cloudy.png",
  3: "overcast.png",
  45: "fog.png",
  48: "fog.png",
  51: "slight-rain.png",
  53: "slight-rain.png",
  55: "moderate-rain.png",
  56: "slight-rain.png",
  57: "moderate-rain.png",
  61: "slight-rain.png",
  63: "rain.png",
  65: "moderate-rain.png",
  66: "slight-rain.png",
  67: "moderate-rain.png",
  71: "snow.png",
  73: "snow.png",
  75: "snow.png",
  77: "snow.png",
  80: "slight-rain.png",
  81: "rain.png",
  82: "moderate-rain.png",
  85: "snow.png",
  86: "snow.png",
  95: "storm.png",
  96: "storm.png",
  99: "storm.png",
};

formInput.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${userInput.value}&count=1&language=en&format=json`
    );
    const rawData = await response.json();
    const data = rawData.results[0];
    getCurrentWeather(data.latitude, data.longitude);

    // update city
    const city = document.querySelector("#location");
    city.innerHTML = data.name;
  } catch (error) {
    console.log("submit:", error);
  } finally {
    userInput.value = "";
  }
});

const getCurrentWeather = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min&timezone=Asia%2FBangkok`
    );

    const data = await response.json();
    // console.log(data);

    const videoBackground = document.querySelector(".overlay-video");
    if (data.current.is_day === 0) {
      videoBackground.src = "./asset/night.mp4";
    } else {
      videoBackground.src = "./asset/day.mp4";
    }

    const time = document.querySelector("#date-time");
    time.innerHTML = new Date(data.current.time);

    const currentWeatherIcon = document.querySelector("#current-weather-icon");
    currentWeatherIcon.src = `asset/weather/${
      weatherIcons[data.current.weather_code]
    }`;

    console.log(currentWeatherIcon);
    const weatherName = document.querySelector("#weather-name");
    weatherName.innerHTML = weatherCodes[data.current.weather_code];

    const temperature = document.querySelector("#unit-number");
    temperature.innerHTML = data.current.temperature_2m;

    const humidity = document.querySelector("#humidity");
    humidity.innerHTML = `${data.current.relative_humidity_2m} ${data.current_units.relative_humidity_2m} `;

    const windSpeed = document.querySelector("#wind-speed");
    windSpeed.innerHTML = `${data.current.wind_speed_10m} ${data.current_units.wind_speed_10m}`;
  } catch (error) {
    console.log("current data", error);
  }
};

getCurrentWeather("-6.4213", "106.7217");
