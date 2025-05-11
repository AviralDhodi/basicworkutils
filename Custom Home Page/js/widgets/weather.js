/**
 * Weather Widget for Homepage
 * Uses Tomorrow.io API to display weather information
 * Supports both automatic location detection and manual location entry
 */

const WeatherWidget = (function() {
    // API configuration
    const API_KEY = 'HKk3o4iXOYfjoxPuuUv5yAXbUgicLSYG'; // Replace with your API key
    
    // DOM Elements
    const weatherWidget = document.getElementById('weather-widget');
    const weatherContent = document.getElementById('weather-content');
    const weatherLoading = document.getElementById('weather-loading');
    const weatherError = document.getElementById('weather-error');
    const weatherLocation = document.getElementById('weather-location');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherDesc = document.getElementById('weather-desc');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherHumidity = document.getElementById('weather-humidity');
    const weatherWind = document.getElementById('weather-wind');
    const unitCBtn = document.getElementById('unit-c');
    const unitFBtn = document.getElementById('unit-f');
    const editWeatherBtn = document.getElementById('edit-weather');
    const weatherEditForm = document.getElementById('weather-edit');
    const locationInput = document.getElementById('location-input');
    const cancelWeatherEditBtn = document.getElementById('cancel-weather-edit');
    const applyWeatherEditBtn = document.getElementById('apply-weather-edit');
    const useCurrentLocationBtn = document.getElementById('use-current-location');
    const locationSuggestions = document.getElementById('location-suggestions');
    
    // Weather settings
    const weatherSettings = {
      location: localStorage.getItem('weatherLocation') || '',
      unit: localStorage.getItem('weatherUnit') || 'metric', // metric or imperial
      isCurrentLocation: localStorage.getItem('weatherIsCurrentLocation') === 'true' || false
    };
    
    // Location search timer
    let locationSearchTimer = null;
    
    // Weather code mapping to icons and descriptions
    const weatherCodes = {
      0: { icon: '☀️', description: 'Clear, Sunny' },
      1000: { icon: '☀️', description: 'Clear, Sunny' },
      1001: { icon: '☁️', description: 'Cloudy' },
      1100: { icon: '🌤️', description: 'Mostly Clear' },
      1101: { icon: '🌥️', description: 'Partly Cloudy' },
      1102: { icon: '☁️', description: 'Mostly Cloudy' },
      2000: { icon: '🌫️', description: 'Fog' },
      2100: { icon: '🌫️', description: 'Light Fog' },
      3000: { icon: '🌬️', description: 'Light Wind' },
      3001: { icon: '💨', description: 'Wind' },
      3002: { icon: '🌪️', description: 'Strong Wind' },
      4000: { icon: '🌧️', description: 'Drizzle' },
      4001: { icon: '🌧️', description: 'Rain' },
      4200: { icon: '🌧️', description: 'Light Rain' },
      4201: { icon: '🌧️', description: 'Heavy Rain' },
      5000: { icon: '❄️', description: 'Snow' },
      5001: { icon: '❄️', description: 'Flurries' },
      5100: { icon: '🌨️', description: 'Light Snow' },
      5101: { icon: '❄️', description: 'Heavy Snow' },
      6000: { icon: '🌧️', description: 'Freezing Drizzle' },
      6001: { icon: '🌧️', description: 'Freezing Rain' },
      6200: { icon: '🌧️', description: 'Light Freezing Rain' },
      6201: { icon: '🌧️', description: 'Heavy Freezing Rain' },
      7000: { icon: '🧊', description: 'Ice Pellets' },
      7101: { icon: '🧊', description: 'Heavy Ice Pellets' },
      7102: { icon: '🧊', description: 'Light Ice Pellets' },
      8000: { icon: '⛈️', description: 'Thunderstorm' }
    };
    
    // Initialize the widget
    function init() {
      // Set up event listeners
      editWeatherBtn.addEventListener('click', toggleWeatherEdit);
      cancelWeatherEditBtn.addEventListener('click', toggleWeatherEdit);
      applyWeatherEditBtn.addEventListener('click', applyWeatherLocation);
      useCurrentLocationBtn.addEventListener('click', useCurrentLocation);
      unitCBtn.addEventListener('click', () => changeWeatherUnit('metric'));
      unitFBtn.addEventListener('click', () => changeWeatherUnit('imperial'));
      
      // Set up location search
      locationInput.addEventListener('input', handleLocationInput);
      
      // Set active unit button
      setWeatherUnitButton();
      
      // Load weather data
      loadWeather();
      
      console.log('Weather Widget initialized');
    }
    
    // Toggle weather edit form
    function toggleWeatherEdit() {
      weatherContent.classList.toggle('hidden');
      weatherEditForm.classList.toggle('hidden');
      
      if (!weatherEditForm.classList.contains('hidden')) {
        // Focus the input when showing edit form
        locationInput.focus();
        locationInput.value = localStorage.getItem('weatherLocation') || '';
        
        // Clear any location suggestions
        if (locationSuggestions) {
          locationSuggestions.innerHTML = '';
          locationSuggestions.classList.add('hidden');
        }
      }
    }
    
    // Handle location input with search
    function handleLocationInput() {
      const query = locationInput.value.trim();
      
      // Clear previous timer
      if (locationSearchTimer) {
        clearTimeout(locationSearchTimer);
      }
      
      // If query is too short, hide suggestions
      if (query.length < 2) {
        if (locationSuggestions) {
          locationSuggestions.innerHTML = '';
          locationSuggestions.classList.add('hidden');
        }
        return;
      }
      
      // Set new timer for location search
      locationSearchTimer = setTimeout(() => {
        searchLocations(query);
      }, 500); // 500ms debounce
    }
    
    // Search locations from the Tomorrow.io API
    async function searchLocations(query) {
      try {
        // Build API URL for locations
        const apiUrl = `https://api.tomorrow.io/v4/locations?query=${encodeURIComponent(query)}&apikey=${API_KEY}`;
        
        // Fetch locations
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Display location suggestions
        if (data && data.data && data.data.locations && data.data.locations.length > 0) {
          displayLocationSuggestions(data.data.locations);
        } else {
          if (locationSuggestions) {
            locationSuggestions.innerHTML = '<div class="location-no-results">No locations found</div>';
            locationSuggestions.classList.remove('hidden');
          }
        }
      } catch (error) {
        console.error('Error searching locations:', error);
        if (locationSuggestions) {
          locationSuggestions.innerHTML = '<div class="location-error">Error searching locations</div>';
          locationSuggestions.classList.remove('hidden');
        }
      }
    }
    
    // Display location suggestions
    function displayLocationSuggestions(locations) {
      if (!locationSuggestions) return;
      
      locationSuggestions.innerHTML = '';
      
      locations.forEach(location => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'location-suggestion-item';
        suggestionItem.textContent = location.name;
        
        // Add click event to select this location
        suggestionItem.addEventListener('click', () => {
          locationInput.value = location.name;
          locationSuggestions.innerHTML = '';
          locationSuggestions.classList.add('hidden');
          locationInput.focus();
        });
        
        locationSuggestions.appendChild(suggestionItem);
      });
      
      locationSuggestions.classList.remove('hidden');
    }
    
    // Apply weather location from form
    function applyWeatherLocation() {
      const location = locationInput.value.trim();
      
      if (location) {
        localStorage.setItem('weatherLocation', location);
        localStorage.setItem('weatherIsCurrentLocation', 'false');
        weatherSettings.location = location;
        weatherSettings.isCurrentLocation = false;
        loadWeather();
        toggleWeatherEdit();
      }
    }
    
    // Use current location
    function useCurrentLocation() {
      // Clear saved location to force geolocation
      localStorage.removeItem('weatherLocation');
      localStorage.setItem('weatherIsCurrentLocation', 'true');
      weatherSettings.location = '';
      weatherSettings.isCurrentLocation = true;
      loadWeather();
      toggleWeatherEdit();
    }
    
    // Change weather unit (metric/imperial)
    function changeWeatherUnit(unit) {
      localStorage.setItem('weatherUnit', unit);
      weatherSettings.unit = unit;
      setWeatherUnitButton();
      loadWeather();
    }
    
    // Set the active weather unit button
    function setWeatherUnitButton() {
      const unit = weatherSettings.unit;
      
      if (unit === 'metric') {
        unitCBtn.classList.add('active');
        unitFBtn.classList.remove('active');
      } else {
        unitCBtn.classList.remove('active');
        unitFBtn.classList.add('active');
      }
    }
    
    // Load weather data from API
    async function loadWeather() {
      // Show loading state
      showLoading();
      
      try {
        let locationParam;
        let isCurrentLocation = weatherSettings.isCurrentLocation;
        
        if (weatherSettings.location && !isCurrentLocation) {
          // Use saved location
          locationParam = encodeURIComponent(weatherSettings.location);
        } else {
          // Try to get current location
          try {
            const position = await getCurrentPosition();
            const { latitude, longitude } = position.coords;
            locationParam = `${latitude},${longitude}`;
            isCurrentLocation = true;
          } catch (error) {
            console.error('Error getting location:', error);
            hideLoading(); // Hide loading on error
            showError('Location access denied. Please enter a location manually.');
            return;
          }
        }
        
        // Build API URL
        const apiUrl = `https://api.tomorrow.io/v4/weather/realtime?location=${locationParam}&apikey=${API_KEY}&units=${weatherSettings.unit === 'imperial' ? 'imperial' : 'metric'}`;
        
        // Fetch weather data
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Process and display weather data
        if (data && data.data && data.data.values) {
          hideLoading(); // Hide loading before displaying
          displayWeather(data, isCurrentLocation);
        } else {
          hideLoading(); // Hide loading on error
          showError('Could not retrieve weather data. Please try again later.');
        }
      } catch (error) {
        console.error('Error loading weather:', error);
        hideLoading(); // Hide loading on error
        showError('Failed to load weather data. Please check your connection and try again.');
      }
    }
    
    // Show loading state
    function showLoading() {
        weatherLoading.style.display = '';
      weatherContent.classList.add('hidden');
      weatherError.classList.add('hidden');
    }
    
    // Hide loading state
    function hideLoading() {
        console.log("called");
        weatherLoading.style.display = 'none';
    }
    
    // Display weather data
    function displayWeather(data, isCurrentLocation) {
      const weatherData = data.data.values;
      const location = data.location;
      
      // Get weather code and icon
      const weatherCode = weatherData.weatherCode;
      const weatherInfo = weatherCodes[weatherCode] || { icon: '❓', description: 'Unknown' };
      
      // Update DOM elements
      weatherTemp.textContent = `${Math.round(weatherData.temperature)}°${weatherSettings.unit === 'metric' ? 'C' : 'F'}`;
      weatherDesc.textContent = weatherInfo.description;
      weatherIcon.textContent = weatherInfo.icon;
      weatherHumidity.textContent = `${weatherData.humidity}%`;
      weatherWind.textContent = `${Math.round(weatherData.windSpeed)} ${weatherSettings.unit === 'metric' ? 'km/h' : 'mph'}`;
      
      // Set location name with current location prefix if needed
      if (location && location.name) {
        if (isCurrentLocation) {
          weatherLocation.textContent = `Current Location (${location.name})`;
        } else {
          weatherLocation.textContent = location.name;
        }
        
        // Save location if it's from geolocation
        if (isCurrentLocation && !weatherSettings.location) {
          localStorage.setItem('weatherLocation', location.name);
          weatherSettings.location = location.name;
        }
      } else {
        if (isCurrentLocation) {
          weatherLocation.textContent = 'Current Location';
        } else {
          weatherLocation.textContent = weatherSettings.location || 'Unknown Location';
        }
      }
      
      // Show weather content
      weatherError.classList.add('hidden');
      weatherContent.classList.remove('hidden');
    }
    
    // Show error message
    function showError(message) {
      weatherContent.classList.add('hidden');
      weatherError.classList.remove('hidden');
      weatherError.textContent = message;
    }
    
    // Get current position using geolocation API
    function getCurrentPosition() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
        } else {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        }
      });
    }
    
    // Public API
    return {
      init,
      loadWeather,
      changeWeatherUnit
    };
  })();
  
  // Initialize the weather widget when DOM is loaded
  document.addEventListener('DOMContentLoaded', WeatherWidget.init);