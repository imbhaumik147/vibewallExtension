# VibeWall 🌌

> A modern, customizable, and high-performance **New Tab replacement Chrome Extension (Manifest V3)** built with vanilla HTML5, CSS3, and JavaScript. Powered by a sleek frosted glassmorphism interface, custom full-screen wallpapers, live weather forecasts, standalone draggable & resizable desktop widgets, task due dates, numerical goal tracking, and horology-grade clock typography.

---

## ✨ Features at a Glance

### 🖼️ 1. Full-Screen Wallpaper & Auto-Adjust Fitting
* **Bundled High-Res Gallery**: Choose from curated aesthetic wallpapers including the high-impact **VibeWall Collage (3840x2160)**, *Aurora Night*, *Golden Sunset*, *Neon Cyber*, *Midnight Minimal*, and *Emerald Glow*.
* **Wallpaper Fit Mode (Auto-Adjust)**:
  * **Auto-Fit Entire Screen (`100% 100%` - No Clipping)**: Scales wallpaper to 100% width and 100% height, ensuring full image artwork (from top row to bottom row) fits without top or bottom edges hiding.
  * **Cover (Fill Screen)**: Crops edges to fill viewport aspect ratio.
  * **Contain (Fit Aspect Ratio)**: Fits entire image with letterboxing.
  * **Center / Original**: Centered unscaled wallpaper artwork.
* **Local Custom Uploads**: Upload any custom background image from your computer; images are automatically compressed and stored locally.
* **Shading & Overlay Opacity**: Fine-tune contrast with an overlay slider (0% to 90%) to keep text and widgets readable over bright photography.
* **Real-Time Blur Filter**: Soften wallpaper details with a blur slider (0px to 30px) for maximum readability.

---

### 🎯 2. Goal Tracker & Standalone Goal Cards
* **Numerical Goal Setting**: Create target-based goals (e.g., set target = **100** for *"Get Profile Reviews"*).
* **Completed / Target Progress Stats**: Displays clear progress readout: **`50 / 100 Completed (50%)`**.
* **Visual Progress Bar**: Sleek gradient progress bar that dynamically animates to match progress.
* **Daily Quick Update Controls**:
  * **`+1` button**: Increment progress daily with a single click.
  * **`-1` button**: Decrement progress count.
  * **`Set` button**: Directly update progress value via prompt modal.
* **Standalone Floating Goal Cards**: Every goal can float as its own individual, draggable, and resizable card widget anywhere on your wallpaper background!
* **Header Action Button**: Quick-toggle **`🎯 Goals`** trigger button in the top navigation bar to show/hide the Goals widget anytime.

---

### 📝 3. Enhanced Task Features & Standalone Floating Task Cards
* **Task Due Dates**: Set target completion dates with dynamic color-coded status badges:
  * 🚨 **Overdue** (highlighted in red for past deadlines)
  * ⚡ **Due Today** (amber highlight)
  * 📅 **Due Tomorrow** / **Due [Date]**
* **Priority Levels**: Option to choose **High** (Red), **Medium** (Orange), or **Low** (Blue) priority badges.
* **Standalone Floating Task Cards**: Each task also renders as its own separate floating draggable card element on screen so you can arrange tasks wherever you want on your dashboard!
* **Expandable Form Options**: Expandable `⚙️ Options` panel for due date selection and priority controls.
* **Filter Bar**: Instantly filter items by **All**, **Tasks**, **Goals 🎯**, and **Done**.

---

### 📐 4. Floating Scratchpad & Multiple Sticky Notes
* **Multiple Floating Note Cards**: Click **`+ Note`** to add individual draggable floating sticky notes anywhere on screen.
* **Main Scratchpad**: Central auto-saving notes widget in the dashboard.
* **Real-time Stats**: Dynamic word and character counter (`0w · 0c`).
* **Custom Positioning & Resizing**: Drag any note card by its header bar and resize from the bottom-right handle (`◢`).
Switch between 6 typography and horology designs from the Clock panel:
1. **Minimalist Clean** — Elegant geometric sans-serif with balanced date spacing.
2. **Bold Brutalist** — Heavy uppercase typography with smooth vertical gradient fills.
3. **Elegant Editorial** — Classic serif italics paired with warm gold subtext.
4. **Compact Glass Pill** — Single-row frosted horizontal badge for a subtle footprint.
5. **Modern Split Stack** — High-tech dual-tone stacked numerals with a pulsing colon.
6. **Old Vintage Round Dial 🕰️** — Horology-inspired analog watch dial with Roman numerals (*XII*, *III*, *VI*, *IX*), rotating hour/minute/second hands, central brass pin, and date subdial.
* Supports **12-Hour (AM/PM)** and **24-Hour** time formats.
* Toggleable live seconds and date.

---

### 🌤️ 6. Worldwide Weather Forecast
* **Real-Time Conditions**: Live temperature, weather condition icon, and location info powered by Open-Meteo.
* **Custom City Lookup**: Click the weather widget on the top left or go to the Weather drawer tab to type any city in the world (*e.g., Tokyo, London, New York, Paris*).
* **Automatic Geocoding**: Instant latitude/longitude resolution with polite IP geolocation fallback when no city is specified.
* **Celsius & Fahrenheit**: Switch between °C and °F anytime.

---

### 📝 7. Floating Scratchpad Notes
* Instant auto-saving scratchpad for jotting down thoughts, links, and code snippets.
* Real-time word and character counter.
* Independent draggable position and drag-to-resize sizing.

---

### 🔍 8. Integrated Search Bar
* Centered glassmorphic search input with instant focus glow and shortcut key (`/`).
* Press `Enter` to search Google or directly navigate if a URL is entered.
* Dedicated clear button (`Escape` or `X` icon).
* Toggleable visibility in settings.

---

### 🚀 9. Shortcuts Grid
* Pre-populated with popular shortcuts (*Google*, *YouTube*, *GitHub*, *Reddit*, *Gmail*, *Twitter/X*).
* Automatically resolves high-resolution website favicons.
* Add, edit, and delete shortcuts on hover with modal dialog validation.

---

### ⚙️ 10. Categorized Independent Drawer Pages
* Sliding right panel with a clean wrapped navigation bar.
* Dedicated independent pages for **Wallpaper**, **Clock**, **Weather**, **Tasks**, **Notes**, **Search**, **Shortcuts**, and **Appearance**.
* Live real-time preview — adjustments apply immediately on screen.

---

### 🔄 11. Multi-Device Synchronization
* Built with a hybrid storage manager using **`chrome.storage.sync`**.
* When you log into Google Chrome on another computer or laptop with the same email address, your shortcuts, tasks, goals, notes, clock preferences, and settings sync across devices automatically.
* Heavy custom wallpaper image data is isolated in `chrome.storage.local` to comply with sync quotas.

---

## 📁 Project Structure

```text
vibewallExtension/
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── newtab.html                # Semantic HTML structure & viewport layout
├── newtab.css                 # Master CSS entrypoint importing component styles
├── newtab.js                  # Main coordinator & lifecycle initializer
├── vibewall_3840x2160.png     # Default 3840x2160 full collage wallpaper
│
├── js/
│   ├── storage.js             # Hybrid chrome.storage.sync + local storage manager
│   ├── draggable.js           # Drag-and-drop bounding controller & resize handler
│   ├── wallpaper.js           # Wallpaper loader, fit mode scaler & file uploader
│   ├── clock.js               # Clock ticking engine & 6 typography/analog styles
│   ├── weather.js             # Open-Meteo weather fetcher & city geocoding
│   ├── todo.js                # Task options, Goal tracker, filter tabs & widget sync
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
│   ├── todo-notes.css         # Tasks, Goals, Notes widgets & resize handles
│   ├── search.css             # Search bar hover/focus animations
│   ├── shortcuts.css          # Shortcuts grid cards & hover action buttons
│   └── customize.css          # Drawer layout, wrapped navbar & settings controls
│
├── assets/
│   ├── wallpapers/            # Bundled aesthetic wallpapers
│   └── icons/                 # Extension icons (16px, 48px, 128px)
│
└── README.md                  # Complete documentation and feature guide
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

* **Local-First & Private**: Your tasks, goals, notes, shortcuts, and settings stay in your browser.
* **Minimal Permissions**: Only requests the standard `"storage"` permission to synchronize preferences across your devices via Chrome profile sync.
* **Zero Trackers**: No third-party tracking, analytics, telemetry, or external ads.
* **Offline Ready**: Clock, wallpapers, notes, tasks, goals, and shortcuts function completely offline.

---

## 📄 License

MIT License. Open source and free to use or modify.
