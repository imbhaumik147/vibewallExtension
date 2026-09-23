/**
 * Clock Manager for Aura Tab
 * Supports live ticking, 12h/24h toggle, seconds toggle, date toggle,
 * and 5 visually distinct clock typography layouts:
 * - Style 1: Minimal Clean
 * - Style 2: Bold Brutalist
 * - Style 3: Elegant Editorial Serif
 * - Style 4: Compact Pill
 * - Style 5: Modern Split Stack
 */

const ClockManager = {
  containerEl: null,
  timerId: null,
  config: null,

  DAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  DAYS_SHORT: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  MONTHS_SHORT: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  init(config) {
    this.containerEl = document.getElementById('clock-container');
    this.config = config;
    this.render();
    this.start();
  },

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.render();
  },

  start() {
    if (this.timerId) clearInterval(this.timerId);
    this.updateTime();
    // Update every second smoothly
    this.timerId = setInterval(() => this.updateTime(), 1000);
  },

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  },

  updateTime() {
    if (!this.containerEl || !this.config || !this.config.enabled) return;

    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    let ampm = '';

    if (this.config.format === '12h') {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 hour should be 12
    }
    const strHours = String(hours).padStart(2, '0');

    const dayName = this.DAYS[now.getDay()];
    const dayNameShort = this.DAYS_SHORT[now.getDay()];
    const monthName = this.MONTHS[now.getMonth()];
    const monthNameShort = this.MONTHS_SHORT[now.getMonth()];
    const dateNum = now.getDate();
    const year = now.getFullYear();

    const style = parseInt(this.config.style, 10) || 1;
    const showSec = this.config.showSeconds;
    const showDate = this.config.showDate;

    // Fast-path text updates into structured elements
    const timeEl = this.containerEl.querySelector('.clock-time');
    const dateEl = this.containerEl.querySelector('.clock-date');
    const ampmEl = this.containerEl.querySelector('.clock-ampm');
    const secEl = this.containerEl.querySelector('.clock-seconds');

    if (style === 6) {
      // Vintage round analog clock
      const rawHours = now.getHours();
      const rawMinutes = now.getMinutes();
      const rawSeconds = now.getSeconds();

      const secDeg = (rawSeconds / 60) * 360;
      const minDeg = ((rawMinutes + rawSeconds / 60) / 60) * 360;
      const hourDeg = (((rawHours % 12) + rawMinutes / 60) / 12) * 360;

      const hourHand = this.containerEl.querySelector('.vintage-hand-hour');
      const minHand = this.containerEl.querySelector('.vintage-hand-min');
      const secHand = this.containerEl.querySelector('.vintage-hand-sec');

      if (hourHand) hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
      if (minHand) minHand.style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
      if (secHand) {
        secHand.style.transform = `translateX(-50%) rotate(${secDeg}deg)`;
        secHand.style.display = showSec ? 'block' : 'none';
      }
    }

    if (timeEl) {
      if (style === 5) {
        // Modern split has separate hour and minute slots
        const hourSlot = this.containerEl.querySelector('.clock-hour-val');
        const minSlot = this.containerEl.querySelector('.clock-min-val');
        if (hourSlot) hourSlot.textContent = strHours;
        if (minSlot) minSlot.textContent = minutes;
      } else if (style !== 6) {
        timeEl.textContent = `${strHours}:${minutes}`;
      }
    }

    if (secEl && style !== 6) {
      secEl.textContent = showSec ? `:${seconds}` : '';
      secEl.style.display = showSec ? 'inline' : 'none';
    }

    if (ampmEl && style !== 6) {
      ampmEl.textContent = this.config.format === '12h' ? ` ${ampm}` : '';
      ampmEl.style.display = this.config.format === '12h' ? 'inline-block' : 'none';
    }

    if (dateEl) {
      if (!showDate) {
        dateEl.style.display = 'none';
      } else {
        dateEl.style.display = 'block';
        if (style === 1) {
          // Minimal: Tuesday, September 22
          dateEl.textContent = `${dayName}, ${monthName} ${dateNum}`;
        } else if (style === 2) {
          // Bold uppercase: TUESDAY · SEPTEMBER 22
          dateEl.textContent = `${dayName.toUpperCase()} · ${monthName.toUpperCase()} ${dateNum}`;
        } else if (style === 3) {
          // Elegant: Tuesday — 22 September 2026
          dateEl.textContent = `${dayName} — ${dateNum} ${monthName} ${year}`;
        } else if (style === 4) {
          // Compact: Tue, Sep 22
          dateEl.textContent = `· ${dayNameShort}, ${monthNameShort} ${dateNum}`;
        } else if (style === 5) {
          // Modern: Tue / 22 Sep
          dateEl.textContent = `${dayNameShort.toUpperCase()} / ${dateNum} ${monthNameShort.toUpperCase()} ${year}`;
        } else if (style === 6) {
          // Vintage dial badge: TUE · 22 SEP
          dateEl.textContent = `${dayNameShort.toUpperCase()} · ${dateNum} ${monthNameShort.toUpperCase()}`;
        }
      }
    }
  },

  render() {
    if (!this.containerEl) return;

    if (!this.config || !this.config.enabled) {
      this.containerEl.style.display = 'none';
      return;
    }

    this.containerEl.style.display = 'flex';
    const style = parseInt(this.config.style, 10) || 1;

    // Reset style classes
    this.containerEl.className = `clock-wrapper clock-style-${style}`;

    let html = '';

    switch (style) {
      case 1:
        // Style 1: Minimal Clean
        html = `
          <div class="clock-display">
            <span class="clock-time"></span><span class="clock-seconds"></span><span class="clock-ampm"></span>
          </div>
          <div class="clock-date"></div>
        `;
        break;

      case 2:
        // Style 2: Bold Brutalist
        html = `
          <div class="clock-display">
            <span class="clock-time"></span><span class="clock-seconds"></span><span class="clock-ampm"></span>
          </div>
          <div class="clock-date"></div>
        `;
        break;

      case 3:
        // Style 3: Elegant Editorial Serif
        html = `
          <div class="clock-display">
            <span class="clock-time"></span><span class="clock-seconds"></span><span class="clock-ampm"></span>
          </div>
          <div class="clock-date"></div>
        `;
        break;

      case 4:
        // Style 4: Compact Pill
        html = `
          <div class="clock-pill-content">
            <span class="clock-time"></span><span class="clock-seconds"></span><span class="clock-ampm"></span>
            <span class="clock-date"></span>
          </div>
        `;
        break;

      case 5:
        // Style 5: Modern Split Stack
        html = `
          <div class="clock-display clock-modern-split">
            <div class="clock-split-digits">
              <span class="clock-hour-val">00</span>
              <span class="clock-split-colon">:</span>
              <span class="clock-min-val">00</span>
            </div>
            <div class="clock-split-meta">
              <span class="clock-seconds"></span>
              <span class="clock-ampm"></span>
            </div>
          </div>
          <div class="clock-date"></div>
        `;
        break;

      case 6:
        // Style 6: Old Vintage Round Dial Clock
        html = `
          <div class="vintage-clock-dial">
            <div class="vintage-dial-face">
              <div class="vintage-numeral num-12">XII</div>
              <div class="vintage-numeral num-3">III</div>
              <div class="vintage-numeral num-6">VI</div>
              <div class="vintage-numeral num-9">IX</div>
              <div class="vintage-dial-center">
                <span class="vintage-brand">CHRONOMÈTRE</span>
                <div class="clock-date vintage-date-subdial"></div>
              </div>
              <div class="vintage-hand vintage-hand-hour"></div>
              <div class="vintage-hand vintage-hand-min"></div>
              <div class="vintage-hand vintage-hand-sec"></div>
              <div class="vintage-center-pin"></div>
            </div>
          </div>
        `;
        break;
    }

    this.containerEl.innerHTML = html;
    this.updateTime();
  }
};

window.ClockManager = ClockManager;
