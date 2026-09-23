/**
 * Weather Manager for VibeWall
 * Fetches real-time weather using Open-Meteo free API (no API key required),
 * supports explicit custom city lookup via Open-Meteo Geocoding API,
 * location detection with IP fallback, and custom city prompt on click.
 */

const WeatherManager = {
  containerEl: null,
  config: null,
  onSaveCallback: null,

  WEATHER_CODES: {
    0: { desc: 'Clear sky', icon: '☀️' },
    1: { desc: 'Mainly clear', icon: '🌤️' },
    2: { desc: 'Partly cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Foggy', icon: '🌫️' },
    48: { desc: 'Depositing rime fog', icon: '🌫️' },
    51: { desc: 'Light drizzle', icon: '🌦️' },
    53: { desc: 'Moderate drizzle', icon: '🌧️' },
    55: { desc: 'Dense drizzle', icon: '🌧️' },
    61: { desc: 'Slight rain', icon: '🌦️' },
    63: { desc: 'Moderate rain', icon: '🌧️' },
    65: { desc: 'Heavy rain', icon: '🌧️' },
    71: { desc: 'Slight snow', icon: '🌨️' },
    73: { desc: 'Moderate snow', icon: '🌨️' },
    75: { desc: 'Heavy snow', icon: '❄️' },
    80: { desc: 'Slight rain showers', icon: '🌦️' },
    81: { desc: 'Moderate rain showers', icon: '🌧️' },
    82: { desc: 'Violent rain showers', icon: '⛈️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' },
    96: { desc: 'Thunderstorm with hail', icon: '⛈️' }
  },

  init(config, onSave) {
    this.config = config || { enabled: true, unit: 'celsius', customCity: '' };
    this.onSaveCallback = onSave;
    this.containerEl = document.getElementById('weather-widget');
    this.apply(this.config);

    // Render immediately from cache if available so UI is instantaneous
    if (this.config.cachedData && typeof this.config.cachedData.temp !== 'undefined') {
      this.render(this.config.cachedData);
    } else {
      this.renderLoading();
    }

    this.fetchWeather();
  },

  apply(config) {
    this.config = config;
    if (!this.containerEl) return;
    this.containerEl.style.display = config && config.enabled !== false ? 'flex' : 'none';
  },

  /**
   * Geocode a user-provided city name using Open-Meteo free geocoding API
   */
  async geocodeCity(cityName) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding service unavailable');
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const top = data.results[0];
      return {
        lat: top.latitude,
        lon: top.longitude,
        name: `${top.name}${top.country_code ? ', ' + top.country_code : ''}`
      };
    }
    throw new Error(`City "${cityName}" not found`);
  },

  async promptChangeCity() {
    const current = this.config.customCity || this.config.city || '';
    const input = prompt('Enter city name for weather (leave empty for auto-detect):', current);
    if (input === null) return; // user cancelled

    const trimmed = input.trim();
    if (!trimmed) {
      // Revert to auto-detect
      this.config.customCity = '';
      this.config.lat = null;
      this.config.lon = null;
      this.config.lastFetched = 0;
      this.renderLoading();
      await this.fetchWeather();
    } else {
      try {
        const geo = await this.geocodeCity(trimmed);
        this.config.customCity = trimmed;
        this.config.city = geo.name;
        this.config.lat = geo.lat;
        this.config.lon = geo.lon;
        this.config.lastFetched = 0;
        this.renderLoading();
        await this.fetchWeather();
      } catch (err) {
        alert(err.message || 'Could not find that city. Please try another.');
      }
    }
  },

  async fetchWeather() {
    if (!this.containerEl || !this.config || this.config.enabled === false) return;

    // Check cached data if fetched within 15 minutes
    const now = Date.now();
    if (this.config.cachedData && typeof this.config.cachedData.temp !== 'undefined' && (now - (this.config.lastFetched || 0) < 15 * 60 * 1000)) {
      this.render(this.config.cachedData);
      return;
    }

    try {
      let lat = this.config.lat;
      let lon = this.config.lon;
      let city = this.config.city;

      // If user specified customCity, geocode it if coordinates not set
      if (this.config.customCity && (!lat || !lon)) {
        try {
          const geo = await this.geocodeCity(this.config.customCity);
          lat = geo.lat;
          lon = geo.lon;
          city = geo.name;
          this.config.lat = lat;
          this.config.lon = lon;
          this.config.city = city;
        } catch (e) {
          console.warn('Geocoding error:', e);
        }
      }

      // If still no lat/lon, auto-detect via IP
      if (!lat || !lon) {
        try {
          const geoRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.latitude && geoData.longitude) {
              lat = parseFloat(geoData.latitude);
              lon = parseFloat(geoData.longitude);
              city = geoData.city ? `${geoData.city}, ${geoData.country_code}` : geoData.country || 'Local Weather';
            }
          }
        } catch (e) {
          // fallback coordinates if offline/blocked
          lat = 28.6139;
          lon = 77.2090;
          city = 'Local Weather';
        }
      }

      if (!lat || !lon) {
        lat = 28.6139;
        lon = 77.2090;
        city = 'Local Weather';
      }

      // Fetch Open-Meteo weather
      const isFahrenheit = this.config.unit === 'fahrenheit';
      const tempParam = isFahrenheit ? '&temperature_unit=fahrenheit' : '';
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m${tempParam}&timezone=auto`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API unreachable');
      const data = await res.json();

      if (!data.current || typeof data.current.temperature_2m === 'undefined') {
        throw new Error('Invalid weather data structure');
      }

      const current = data.current;
      const weatherInfo = this.WEATHER_CODES[current.weather_code] || { desc: 'Clear', icon: '☀️' };

      const processed = {
        city: city || this.config.customCity || 'Weather',
        temp: Math.round(current.temperature_2m),
        unit: isFahrenheit ? '°F' : '°C',
        desc: weatherInfo.desc,
        icon: weatherInfo.icon,
        humidity: current.relative_humidity_2m || 0,
        wind: `${Math.round(current.wind_speed_10m || 0)} km/h`
      };

      this.config.cachedData = processed;
      this.config.lastFetched = now;
      this.config.city = processed.city;
      this.config.lat = lat;
      this.config.lon = lon;

      if (this.onSaveCallback) {
        this.onSaveCallback(this.config);
      }

      this.render(processed);
    } catch (err) {
      console.warn('Weather fetch warning:', err);
      if (this.config.cachedData && typeof this.config.cachedData.temp !== 'undefined') {
        this.render(this.config.cachedData);
      } else {
        this.renderFallback();
      }
    }
  },

  render(data) {
    if (!this.containerEl || !data) return;
    const tempDisplay = typeof data.temp !== 'undefined' ? `${data.temp}${data.unit || '°C'}` : '--°C';
    const cityDisplay = data.city || 'Weather';
    const iconDisplay = data.icon || '☀️';
    const descDisplay = data.desc || 'Weather';

    this.containerEl.innerHTML = `
      <div class="weather-pill glass-panel" title="${descDisplay} • Click to change city">
        <span class="weather-icon">${iconDisplay}</span>
        <div class="weather-details">
          <span class="weather-temp">${tempDisplay}</span>
          <span class="weather-city">${cityDisplay}</span>
        </div>
        <button class="weather-edit-city-btn" title="Change City" aria-label="Change City">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>
    `;

    const pill = this.containerEl.querySelector('.weather-pill');
    if (pill) {
      pill.addEventListener('click', () => {
        this.promptChangeCity();
      });
    }
  },

  renderLoading() {
    if (!this.containerEl) return;
    const city = this.config.customCity || this.config.city || 'Weather';
    this.containerEl.innerHTML = `
      <div class="weather-pill glass-panel" title="Fetching latest weather...">
        <span class="weather-icon">⏳</span>
        <div class="weather-details">
          <span class="weather-temp">Loading...</span>
          <span class="weather-city">${city}</span>
        </div>
      </div>
    `;
  },

  renderFallback() {
    if (!this.containerEl) return;
    const city = this.config.customCity || this.config.city || 'Set City';
    this.containerEl.innerHTML = `
      <div class="weather-pill glass-panel" title="Click to set city">
        <span class="weather-icon">🌤️</span>
        <div class="weather-details">
          <span class="weather-temp">--°C</span>
          <span class="weather-city">${city}</span>
        </div>
      </div>
    `;
    const pill = this.containerEl.querySelector('.weather-pill');
    if (pill) {
      pill.addEventListener('click', () => this.promptChangeCity());
    }
  }
};

window.WeatherManager = WeatherManager;
