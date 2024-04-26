document.addEventListener("DOMContentLoaded", function () {
  const app = document.querySelector(".weather-app");
  const temp = document.querySelector(".temp");
  const dateOutput = document.querySelector(".date");
  const timeOutput = document.querySelector(".time");
  const conditionOutput = document.querySelector(".condition");
  const nameOutput = document.querySelector(".name");
  const icon = document.querySelector(".icon");
  const cloudOutput = document.querySelector(".cloud");
  const humidityOutput = document.querySelector(".humidity");
  const windOutput = document.querySelector(".wind");
  const form = document.querySelector("#locationInput");
  const search = document.querySelector(".search");
  const btn = document.querySelector(".submit");
  const cities = document.querySelectorAll(".city");
  const forecastList = document.querySelector(".forecast-list");

  let cityInput = "Chennai";

  cities.forEach((city) => {
    city.addEventListener("click", (e) => {
      cityInput = e.target.innerHTML;
      fetchWeatherData();
      app.style.opacity = "0";
    });
  });

  form.addEventListener("submit", (e) => {
    if (search.value.length == 0) {
      alert("Please type in a city name");
    } else {
      cityInput = search.value;
      fetchWeatherData();
      search.value = "";
      app.style.opacity = "0";
    }
    e.preventDefault();
  });

  function dayOfWeek(day, month, year) {
    const weekday = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return weekday[new Date(`${year}-${month}-${day}`).getDay()];
  }

  function fetchWeatherData() {
    const apiKey = "42d44e22f531570ac6f5af016115f7bf";

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&appid=${apiKey}&units=metric`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("City not found");
        }
        return response.json();
      })
      .then((data) => {
        // Display current weather data
        displayCurrentWeather(data);

        map.setView([data.coord.lat, data.coord.lon], 8);

        // Fetch 5-day forecast data
        return fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${cityInput}&appid=${apiKey}&units=metric`
        );
      })
      .then((response) => response.json())
      .then((data) => {
        displayForecast(data);

        app.style.opacity = "1";
      })
      .catch((error) => {
        alert(error.message);
        app.style.opacity = "1";
      });
  }

  function displayCurrentWeather(data) {
    temp.innerHTML = `${data.main.temp}&#176;`;
    conditionOutput.innerHTML = data.weather[0].main;
    nameOutput.innerHTML = data.name;

    const localTime = new Date((data.dt + data.timezone) * 1000);
    const day = localTime.getDate();
    const month = localTime.getMonth() + 1;
    const year = localTime.getFullYear();
    const hours = localTime.getHours();
    const minutes = localTime.getMinutes();

    // Format time to ensure leading zeros
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    dateOutput.innerHTML = `${dayOfWeek(
      day,
      month,
      year
    )} ${day}/${month}/${year}`;
    timeOutput.innerHTML = `${formattedHours}:${formattedMinutes}`;

    icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

    cloudOutput.innerHTML = `${data.clouds.all}%`;
    humidityOutput.innerHTML = `${data.main.humidity}%`;
    windOutput.innerHTML = `${data.wind.speed}m/s`;

    let timeOfDay = "day";
    const sunrise = new Date(
      (data.sys.sunrise + data.timezone) * 1000
    ).getHours();
    const sunset = new Date(
      (data.sys.sunset + data.timezone) * 1000
    ).getHours();
    if (hours < sunrise || hours >= sunset) {
      timeOfDay = "night";
    }

    if (data.main.temp < 0) {
      app.style.backgroundImage = `url(./images/${timeOfDay}/ice.jpg)`;
      btn.style.background = "#647d75";
    } else if (data.main.temp >= 0 && data.main.temp < 15) {
      app.style.backgroundImage = `url(./images/${timeOfDay}/snowy.jpg)`;
      btn.style.background = "#4d72aa";
    } else if (
      data.weather[0].icon.includes("01") ||
      data.weather[0].icon.includes("02")
    ) {
      app.style.backgroundImage = `url(./images/${timeOfDay}/clear.jpg)`;
      btn.style.background = "#e5ba92";
      if (timeOfDay == "night") {
        btn.style.background = "#181e27";
      }
    } else if (
      data.weather[0].icon.includes("03") ||
      data.weather[0].icon.includes("04")
    ) {
      app.style.backgroundImage = `url(./images/${timeOfDay}/cloudy.jpg)`;
      btn.style.background = "#fa6d1d";
      if (timeOfDay == "night") {
        btn.style.background = "#181e27";
      }
    } else if (
      data.weather[0].icon.includes("09") ||
      data.weather[0].icon.includes("10") ||
      data.weather[0].icon.includes("11")
    ) {
      app.style.backgroundImage = `url(./images/${timeOfDay}/rainy.jpg)`;
      btn.style.background = "#647d75";
      if (timeOfDay == "night") {
        btn.style.background = "#325c80";
      }
    } else {
      app.style.backgroundImage = `url(./images/${timeOfDay}/clear.jpg)`;
      btn.style.background = "#4d72aa";
      if (timeOfDay == "night") {
        btn.style.background = "#1b1b1b";
      }
    }
  }

  function displayForecast(data) {
    forecastList.innerHTML = "";

    for (let i = 0; i < data.list.length; i += 8) {
      const forecast = data.list[i];
      const date = new Date(forecast.dt * 1000);
      const day = date.toLocaleDateString("en", { weekday: "short" });
      const iconCode = forecast.weather[0].icon;
      const temp = Math.round(forecast.main.temp);

      const forecastItem = `
              <li>
              <div>${day}</div>
              <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${forecast.weather[0].description}" />
              <div>${temp}&#176;</div>
              </li>
          `;

      forecastList.insertAdjacentHTML("beforeend", forecastItem);
    }
  }

  // Leaflet map --
  var map = L.map("weatherMap").setView([0, 0], 8);

  L.tileLayer(
    "https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=a630615392155ebe1aaec747bfee72b4",
    {
      attribution: "© OpenWeatherMap contributors",
      layer: "temp_new",
    }
  ).addTo(map);

  fetchWeatherData();
});
