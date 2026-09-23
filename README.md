# VibeWall 🌌

> A modern, customizable, and high-performance **New Tab replacement Chrome Extension (Manifest V3)** built with vanilla HTML5, CSS3, and JavaScript. Powered by a sleek frosted glassmorphism interface, custom full-screen wallpapers, live weather forecasts, draggable desktop widgets, and horology-grade clock typography.

---

## ✨ Features at a Glance

### 🖼️ 1. Full-Screen Wallpaper & Atmosphere Control
* **Bundled High-Res Wallpapers**: Choose from 5 curated aesthetic wallpapers (*Aurora Night*, *Golden Sunset*, *Neon Cyber*, *Midnight Minimal*, and *Emerald Glow*).
* **Local Custom Uploads**: Upload any photo from your computer; images are automatically compressed, aspect-ratio fitted, and stored locally.
* **Shading & Overlay Opacity**: Fine-tune contrast with an overlay slider (0% to 90%) to keep text and widgets readable over bright photography.
* **Real-time Blur Filter**: Soften wallpaper details with a blur slider (0px to 30px) for maximum readability.

### 🕰️ 2. Six Distinct Clock & Date Styles
Switch between 6 typography and layout designs from the Clock panel:
1. **Minimalist Clean** — Elegant geometric sans-serif with balanced date spacing.
2. **Bold Brutalist** — Heavy uppercase typography with smooth vertical gradient fills.
3. **Elegant Editorial** — Classic serif italics paired with warm gold subtext.
4. **Compact Glass Pill** — Single-row frosted horizontal badge for a subtle footprint.
5. **Modern Split Stack** — High-tech dual-tone stacked numerals with a pulsing colon.
6. **Old Vintage Round Dial 🕰️** — Horology-inspired analog watch dial with Roman numerals (*XII*, *III*, *VI*, *IX*), rotating hour/minute/second hands, central brass pin, and date subdial.
* Supports **12-Hour (AM/PM)** and **24-Hour** time formats.
* Toggleable live seconds and date.

### 🌤️ 3. Worldwide Weather Forecast
* **Real-Time Conditions**: Live temperature, weather condition icon, and location info powered by Open-Meteo.
* **Custom City Lookup**: Click the weather widget on the top left or go to the Weather drawer tab to type any city in the world (*e.g., Tokyo, London, New York, Paris*).
* **Automatic Geocoding**: Instant latitude/longitude resolution with polite IP geolocation fallback when no city is specified.
* **Celsius & Fahrenheit**: Switch between °C and °F anytime.

### 📌 4. On-Screen Draggable Widgets
* **Floating Tasks (Todo List)**:
  * Check off tasks, add new ones, and clear completed items.
  * Live remaining tasks counter badge.
  * **Drag and drop** anywhere across your screen using the grab handle (`⠿`).
* **Floating Scratchpad (Notes)**:
  * Instant auto-saving scratchpad for jotting down thoughts, links, and code snippets.
  * Real-time word and character counter.
  * Drag anywhere on the dashboard.
* **Saved Screen Coordinates**: Widget positions (`x`, `y`) are saved automatically to Chrome storage.
* **Show/Hide Controls**: Close widgets from your screen using the `X` button, or reopen them with header buttons.

### 🔍 5. Integrated Search Bar
* Centered glassmorphic search input with instant focus glow and shortcut key (`/`).
* Press `Enter` to search Google or directly navigate if a URL is entered.
* Dedicated clear button (`Escape` or `X` icon).
* Toggleable visibility in settings.

### 🚀 6. Shortcuts Grid
* Pre-populated with popular shortcuts (*Google*, *YouTube*, *GitHub*, *Reddit*, *Gmail*, *Twitter/X*).
* Automatically resolves high-resolution website favicons.
* Add, edit, and delete shortcuts on hover with modal dialog validation.

### ⚙️ 7. Categorized Independent Drawer Pages
* Sliding right panel with a clean wrapped navigation bar (no horizontal sliding).
* Dedicated independent pages for **Wallpaper**, **Clock**, **Weather**, **Tasks**, **Notes**, **Search**, **Shortcuts**, and **Appearance**.
* Live real-time preview — adjustments apply immediately on screen.

### 🔄 8. Multi-Device Synchronization
* Built with a hybrid storage manager using **`chrome.storage.sync`**.
* When you log into Google Chrome on another computer or laptop with the same email address, your shortcuts, tasks, notes, clock preferences, and settings sync across devices automatically.
* Heavy custom wallpaper image data is isolated in `chrome.storage.local` to comply with sync quotas.

---

## 📁 Project Structure

```text
vibewallExtension/
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── newtab.html                # Semantic HTML structure & viewport layout
├── newtab.css                 # Master CSS entrypoint importing component styles
├── newtab.js                  # Main coordinator & lifecycle initializer
│
├── js/
│   ├── storage.js             # Hybrid chrome.storage.sync + local storage manager
│   ├── draggable.js           # Drag-and-drop bounding controller for widgets
│   ├── wallpaper.js           # Wallpaper loader, file upload processor & canvas scaler
│   ├── clock.js               # Clock ticking engine & 6 typography/analog styles
│   ├── weather.js             # Open-Meteo weather fetcher & city geocoding
│   ├── todo.js                # Todo checklist logic & cross-instance sync
│   ├── notes.js               # Auto-saving scratchpad manager
│   ├── search.js              # Search bar input & navigation handler
│   ├── shortcuts.js           # Shortcut CRUD operations & favicon resolution
│   └── customize.js           # Sliding drawer controller & page router
│
├── css/
│   ├── base.css               # Reset styles, design tokens, viewport grid
│   ├── glass.css              # Frosted glassmorphism system & modal overlays
│   ├── clock.css              # 6 typography layouts & vintage analog watch dial
│   ├── weather.css            # Weather pill styling & edit button
│   ├── todo-notes.css         # On-screen draggable widgets & drawer page styles
│   ├── search.css             # Search bar hover/focus animations
│   ├── shortcuts.css          # Shortcuts grid cards & hover action buttons
│   └── customize.css          # Drawer layout, wrapped navbar & settings controls
│
├── assets/
│   ├── wallpapers/            # 5 bundled aesthetic wallpapers
│   └── icons/                 # Extension icons (16px, 48px, 128px)
│
└── README.md                  # Complete documentation and setup guide
```

---

## 🛠️ Installation & Getting Started

VibeWall is 100% vanilla web technologies (HTML5, CSS3, ES6+ JavaScript) and requires no build steps or dependencies.

1. **Clone or Download** this repository to your machine:
   ```bash
   git clone https://github.com/imbhaumik147/vibewallExtension.git
   ```
2. Open **Google Chrome** and navigate to:
   ```text
   chrome://extensions/
   ```
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the cloned repository root folder (`vibewallExtension`).
6. Open a new tab (`Ctrl + T` or `Cmd + T`) to experience **VibeWall**!

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| **`/`** | Focus web search bar immediately |
| **`Enter`** | Execute Google search or direct URL navigation |
| **`Escape`** | Close Drawer / Dismiss Modal dialog / Clear Search query |

---

## 🔒 Privacy & Permissions

* **Local-First & Private**: Your tasks, notes, shortcuts, and settings stay in your browser.
* **Minimal Permissions**: Only requests the standard `"storage"` permission to synchronize preferences across your devices via Chrome profile sync.
* **Zero Trackers**: No third-party tracking, analytics, telemetry, or external ads.
* **Offline Ready**: Clock, custom wallpapers, notes, tasks, and shortcuts function completely offline.

---

## 📄 License

MIT License. Open source and free to use or modify.
