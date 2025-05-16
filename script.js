// --- DOM Elements ---
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherInfoDiv = document.getElementById("weatherInfo");
const errorMessageDiv = document.getElementById("errorMessage");

const cityNameEl = document.getElementById("cityName");
const temperatureEl = document.getElementById("temperature");
const descriptionEl = document.getElementById("description");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("windSpeed");
const weatherIconEl = document.getElementById("weatherIcon");

// --- API Configuration ---
const apiKey = config.API_KEY;
const apiBaseUrl = config.API_URL;

// --- Event Listeners ---
searchBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    handleSearch();
  }
});

// --- Functions ---

function handleSearch() {
  const city = cityInput.value.trim();
  console.log("Search initiated for city:", city); // Debug log

  if (!city) {
    displayError("Please enter a city name.");
    return;
  }
  fetchWeatherData(city);
}

async function fetchWeatherData(city) {
  const apiUrl = `${apiBaseUrl}?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`; // Added encodeURIComponent for safety
  console.log("Requesting URL:", apiUrl); // Debug log

  clearDisplay();

  try {
    const response = await fetch(apiUrl);
    console.log("API Response Status:", response.status, response.statusText); // Debug log with status text

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to parse error response" })); // Attempt to get error message from API
      console.error("API Error Response Data:", errorData); // Debug log for error response
      if (response.status === 404) {
        throw new Error(
          `City not found: ${city}. Message: ${errorData.message || ""}`
        );
      } else if (response.status === 401) {
        throw new Error(
          `Invalid API Key or not activated. Message: ${
            errorData.message || "Check API key in OpenWeatherMap dashboard."
          }`
        );
      } else {
        throw new Error(
          `HTTP error! Status: ${response.status}. Message: ${
            errorData.message || response.statusText
          }`
        );
      }
    }

    const data = await response.json();
    console.log("API Data Received (raw):", data); // Debug log - VERY IMPORTANT
    displayWeatherData(data);
  } catch (error) {
    console.error("Error in fetchWeatherData:", error); // More specific error log
    displayError(
      error.message ||
        "Could not fetch weather data. Check console for details."
    );
  }
}

function displayWeatherData(data) {
  console.log("Attempting to display data (inside displayWeatherData):", data); // Debug log

  // More robust check for essential data properties
  if (
    !data ||
    typeof data !== "object" ||
    !data.main ||
    !data.weather ||
    !Array.isArray(data.weather) ||
    data.weather.length === 0 ||
    !data.name ||
    !data.sys
  ) {
    console.error("Invalid or incomplete data received from API. Data:", data); // Debug log
    displayError(
      "Received invalid or incomplete data from the weather service. Cannot display weather."
    );
    return;
  }

  // Check if DOM elements are found
  if (
    !cityNameEl ||
    !temperatureEl ||
    !descriptionEl ||
    !humidityEl ||
    !windSpeedEl ||
    !weatherIconEl
  ) {
    console.error(
      "One or more DOM elements for displaying weather are missing. Check HTML IDs."
    );
    displayError(
      "Internal error: UI elements not found. Please contact support."
    );
    return;
  }
  console.log("All display DOM elements seem to be found."); // Debug log

  // Extract relevant data
  const city = data.name;
  const country = data.sys.country;
  const temp = Math.round(data.main.temp);
  const description = data.weather[0].description;
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  console.log("Extracted data:", {
    city,
    country,
    temp,
    description,
    humidity,
    windSpeed,
    iconUrl,
  }); // Debug log

  // Update the DOM elements
  cityNameEl.textContent = `${city}, ${country}`;
  temperatureEl.textContent = `${temp}°C`;
  descriptionEl.textContent = `Condition: ${
    description.charAt(0).toUpperCase() + description.slice(1)
  }`; // Capitalize description
  humidityEl.textContent = `Humidity: ${humidity}%`;
  windSpeedEl.textContent = `Wind Speed: ${windSpeed} m/s`;
  weatherIconEl.src = iconUrl;
  weatherIconEl.alt = description;

  weatherInfoDiv.style.display = "block";
  errorMessageDiv.style.display = "none";
  errorMessageDiv.textContent = "";
  console.log("Weather data displayed successfully."); // Debug log
}

function displayError(message) {
  console.log("Displaying error:", message); // Debug log
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = "block";
  weatherInfoDiv.style.display = "none";
}

function clearDisplay() {
  console.log("Clearing display."); // Debug log
  weatherInfoDiv.style.display = "none";
  errorMessageDiv.style.display = "none";
  errorMessageDiv.textContent = "";
  // Optional: Clear previous data text content if desired
  if (cityNameEl) cityNameEl.textContent = "";
  if (temperatureEl) temperatureEl.textContent = "";
  if (descriptionEl) descriptionEl.textContent = "";
  if (humidityEl) humidityEl.textContent = "";
  if (windSpeedEl) windSpeedEl.textContent = "";
  if (weatherIconEl) {
    weatherIconEl.src = "";
    weatherIconEl.alt = "";
  }
}
