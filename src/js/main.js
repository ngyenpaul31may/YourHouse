/**
 * YourHouse application entry point.
 * Boots Theme and i18n modules and exposes clean hooks for future UI features.
 */
(() => {
  async function bootstrap() {
    if (window.AppTheme) {
      window.AppTheme.init();
    }

    if (window.AppI18n) {
      await window.AppI18n.init();
    }
  }

  window.addEventListener("yourhouse:langchange", () => {
    // Hook for future localized dynamic components
  });

  window.addEventListener("yourhouse:themechange", () => {
    // Hook for future theme-aware components
  });

  document.addEventListener("DOMContentLoaded", bootstrap);
})();
