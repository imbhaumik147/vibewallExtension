/**
 * Wallpaper Manager for Aura Tab
 * Handles full-screen wallpaper rendering, transitions, opacity overlay, blur filters,
 * default gallery switching, and user image upload with image compression.
 */

const WallpaperManager = {
  containerEl: null,
  overlayEl: null,
  currentConfig: null,

  init(config) {
    this.containerEl = document.getElementById('wallpaper-background');
    this.overlayEl = document.getElementById('wallpaper-overlay');
    this.apply(config);
  },

  apply(config) {
    if (!config) return;
    this.currentConfig = config;

    // Apply overlay opacity
    const opacity = typeof config.overlayOpacity === 'number' ? config.overlayOpacity : 0.35;
    if (this.overlayEl) {
      this.overlayEl.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
    }

    // Apply background fitting mode
    const fitMode = config.fitMode || 'stretch';
    if (this.containerEl) {
      this.containerEl.style.filter = `blur(${blur}px)`;
      // Apply scale slightly when blurred so edges don't show white fringes
      this.containerEl.style.transform = blur > 0 ? `scale(${1 + (blur * 0.005)})` : 'scale(1)';

      if (fitMode === 'contain') {
        this.containerEl.style.backgroundSize = 'contain';
      } else if (fitMode === 'cover') {
        this.containerEl.style.backgroundSize = 'cover';
      } else if (fitMode === 'center') {
        this.containerEl.style.backgroundSize = 'auto';
      } else {
        // 'stretch' / 100% 100%: fits the wallpaper exact 100% width and 100% height so no top/bottom edges are clipped
        this.containerEl.style.backgroundSize = '100% 100%';
      }

      // Background image source
      let bgUrl = 'assets/wallpapers/wallpaper1.jpg';
      if (config.type === 'custom' && config.customData) {
        bgUrl = config.customData;
      } else if (config.value) {
        bgUrl = config.value;
      }

      this.containerEl.style.backgroundImage = `url("${bgUrl}")`;
    }
  },

  /**
   * Compress and convert user uploaded image file to high-efficiency base64 string
   */
  async processUploadedFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        return reject(new Error('Please select a valid image file.'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Resize if exceptionally large to preserve smooth rendering & memory
          const MAX_WIDTH = 2560;
          const MAX_HEIGHT = 1440;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width / height > MAX_WIDTH / MAX_HEIGHT) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Export as optimized JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed reading uploaded image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed reading file'));
      reader.readAsDataURL(file);
    });
  }
};

window.WallpaperManager = WallpaperManager;
