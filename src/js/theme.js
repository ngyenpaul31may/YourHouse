/**
 * YourHouse lightweight theme switcher.
 * Defaults to "light" on first visit and persists user choice ("light" | "dark") in localStorage.
 */
(() => {
  const STORAGE_KEY = "yourhouse_theme";
  const THEMES = ["light", "dark"];

  const state = {
    theme: "light",
  };

  function tr(key, fallback) {
    if (window.AppI18n && typeof window.AppI18n.t === "function") {
      const val = window.AppI18n.t(key, fallback);
      if (val !== key) return val;
    }
    return fallback;
  }

  function resolveInitialTheme() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && THEMES.includes(saved)) {
        return saved;
      }
    } catch {
      // Ignore storage read errors
    }
    return "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;

    const isDark = theme === "dark";
    const nextThemeLabel = isDark
      ? tr("theme.light", "Light")
      : tr("theme.dark", "Dark");
    const nextAriaLabel = isDark
      ? tr("theme.switchToLight", "Switch to light theme")
      : tr("theme.switchToDark", "Switch to dark theme");

    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute("aria-label", nextAriaLabel);
      const labelEl = btn.querySelector("[data-theme-label]");
      if (labelEl) {
        labelEl.textContent = nextThemeLabel;
      } else {
        btn.textContent = nextThemeLabel;
      }
    });
  }

  function setTheme(nextTheme) {
    const target = THEMES.includes(nextTheme) ? nextTheme : "light";
    state.theme = target;

    try {
      window.localStorage.setItem(STORAGE_KEY, target);
    } catch {
      // Ignore storage write errors
    }

    applyTheme(target);
    window.dispatchEvent(
      new CustomEvent("yourhouse:themechange", { detail: { theme: target } }),
    );
  }

  function toggleTheme() {
    setTheme(state.theme === "dark" ? "light" : "dark");
  }

  function init() {
    state.theme = resolveInitialTheme();
    applyTheme(state.theme);

    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", toggleTheme);
    });

    window.addEventListener("yourhouse:langchange", () => {
      applyTheme(state.theme);
    });
  }

  window.AppTheme = {
    init,
    setTheme,
    toggleTheme,
    getTheme: () => state.theme,
  };
})();
