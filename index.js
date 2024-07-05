const container = document.querySelector("#container");
const userInput = document.querySelector("#search-input");
const formInput = document.querySelector(".top-right-info");
const city = document.querySelector("#location");
const dateTime = document.querySelector("#date-time");
const loading = document.querySelector("#loading");
let initialTimezone = "Asia/Jakarta";

const weatherCodes = {
  0: "Langit cerah",
  1: "Cerah sebagian",
  2: "Berawan sebagian",
  3: "Mendung",
  45: "Kabut dan kabut rime",
  48: "Kabut dan kabut rime",
  51: "Gerimis: Intensitas ringan",
  53: "Gerimis: Intensitas sedang",
  55: "Gerimis: Intensitas lebat",
  56: "Gerimis beku: Intensitas ringan",
  57: "Gerimis beku: Intensitas lebat",
  61: "Hujan: Intensitas ringan",
  63: "Hujan: Intensitas sedang",
  65: "Hujan: Intensitas lebat",
  66: "Hujan beku: Intensitas ringan",
  67: "Hujan beku: Intensitas lebat",
  71: "Salju: Intensitas ringan",
  73: "Salju: Intensitas sedang",
  75: "Salju: Intensitas lebat",
  77: "Butiran salju",
  80: "Hujan deras: Intensitas ringan",
  81: "Hujan deras: Intensitas sedang",
  82: "Hujan deras: Intensitas berat",
  85: "Hujan salju: Intensitas ringan",
  86: "Hujan salju: Intensitas berat",
  95: "Badai petir: Intensitas ringan atau sedang",
  96: "Badai petir dengan hujan es kecil",
  99: "Badai petir dengan hujan es besar",
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
  loading.style.display = "flex";
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${userInput.value}&count=1&language=id&format=json`
    );
    const rawData = await response.json();
    const data = rawData.results[0];

    getCurrentWeather(data.latitude, data.longitude, data.timezone);
    getDailyWeather(data.latitude, data.longitude, data.timezone);
    userInput.value = "";

    // update city
    city.innerHTML =
      data.name == data.country ? data.name : `${data.name}, ${data.country}`;
    const flag = document.createElement("img");
    flag.src = `https://open-meteo.com//images/country-flags/${String(
      data.country_code
    ).toLowerCase()}.svg`;
    flag.width = 30;
    city.append(flag);
  } catch (error) {
    console.log("submit:", error);
    const errorText = document.getElementById("error-text");
    setTimeout(() => {
      errorText.innerHTML = "";
    }, 5000);
    errorText.innerHTML = error ? "Location is invalid" : "";
  } finally {
    setTimeout(() => {
      loading.style.display = "none";
    }, 1000);
  }
});

const formattingDate = (dateData, selector, wTime) => {
  let days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  let months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Augustus",
    "September",
    "October",
    "November",
    "Desember",
  ];
  let dateString = new Date(dateData);

  const date = dateString.getDate();
  const day = days[dateString.getDay()];
  const month = months[dateString.getMonth()];
  const year = dateString.getFullYear();

  const options = {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: initialTimezone,
  };

  const timeString = new Intl.DateTimeFormat("en-US", options).format(
    dateString
  );

  selector.innerHTML = wTime
    ? `${day}, ${date} ${month} ${year} ${timeString}`
    : `${day}, ${date} ${month} ${year}`;
};

const getCurrentWeather = async (
  latitude,
  longitude,
  timezone = initialTimezone
) => {
  const timeZone = String(timezone).replace("/", "%2F");
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min&timezone=${
        timeZone || timezone
      }`
    );

    const data = await response.json();

    const videoBackground = document.querySelector(".overlay-video");
    if (data.current.is_day === 0) {
      videoBackground.src = "./asset/night.mp4";
    } else {
      videoBackground.src = "./asset/day.mp4";
    }

    formattingDate(data.current.time, dateTime, true, timezone);
    updateClock(timezone);

    const currentWeatherIcon = document.querySelector("#current-weather-icon");
    currentWeatherIcon.src = `asset/weather/${
      weatherIcons[data.current.weather_code]
    }`;

    const weatherName = document.querySelector("#weather-name");
    weatherName.innerHTML = weatherCodes[data.current.weather_code];

    const temperatureNumber = document.querySelector("#temp-number");
    const temperatureUnitNumber = document.createElement("span");
    temperatureNumber.innerHTML = data.current.temperature_2m;
    temperatureUnitNumber.innerHTML = data.current_units.temperature_2m;
    temperatureNumber.append(temperatureUnitNumber);

    const humidity = document.querySelector("#humidity");
    humidity.innerHTML = `${data.current.relative_humidity_2m} ${data.current_units.relative_humidity_2m} `;

    const windSpeed = document.querySelector("#wind-speed");
    windSpeed.innerHTML = `${data.current.wind_speed_10m} ${data.current_units.wind_speed_10m}`;
  } catch (error) {
    console.log("current data", error);
  }
};

const getDailyWeather = async (latitude, longitude, timezone) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=${timezone}`
    );
    const data = await response.json();

    const bottomInfo = document.querySelector(".bottom-info");
    bottomInfo.innerHTML = "";
    data.daily.time.map((item, index) => {
      // parent
      const weatherInfoElement = document.createElement("div");
      weatherInfoElement.classList.add("weather-info");

      // days
      const infoDay = document.createElement("p");
      infoDay.id = "info-day";
      let date = new Date(item);
      formattingDate(date, infoDay);
      weatherInfoElement.append(infoDay);

      // icons
      const infoWeatherIcon = document.createElement("img");
      infoWeatherIcon.id = "info-weather-icon";
      infoWeatherIcon.width = 70;
      infoWeatherIcon.title = weatherCodes[data.daily.weather_code[index]];
      infoWeatherIcon.src = `asset/weather/${
        weatherIcons[data.daily.weather_code[index]]
      }`;
      weatherInfoElement.append(infoWeatherIcon);

      // temperatures max to min
      const temperatures = document.createElement("div");
      temperatures.classList.add("temperatures");
      const maxTemp = document.createElement("p");
      maxTemp.innerHTML = `${data.daily.temperature_2m_max[index]} °`;
      maxTemp.style.fontWeight = "bold";
      const minTemp = document.createElement("p");
      minTemp.innerHTML = `${data.daily.temperature_2m_min[index]} °`;
      temperatures.append(maxTemp);
      temperatures.append(minTemp);
      weatherInfoElement.append(temperatures);

      bottomInfo.append(weatherInfoElement);
    });
  } catch (error) {
    console.log("daily weather:", error);
  }
};

const getInitialWeatherInfo = () => {
  loading.style.display = "flex";
  container.style.display = "none";
  const flag = document.createElement("img");
  flag.src = "https://open-meteo.com//images/country-flags/id.svg";
  flag.width = 30;
  getCurrentWeather("-6.4213", "106.7217", initialTimezone);
  getDailyWeather("-6.4213", "106.7217", initialTimezone);
  setTimeout(() => {
    loading.style.display = "none";
    container.style.display = "flex";
    city.innerHTML = "Bogor, Indonesia";
    city.append(flag);
  }, 2000);
};

getInitialWeatherInfo();

function updateClock() {
  const clock = document.getElementById("clock");
  const now = new Date();
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: initialTimezone,
  };

  const timeString = new Intl.DateTimeFormat("en-US", options).format(now);
  clock.innerHTML = timeString;
}

setInterval(updateClock, 1000);
