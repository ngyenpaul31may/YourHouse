/**
 * YourHouse lightweight i18n module.
 * Defaults to English ("en") and supports switching locales with fallback to "en".
 */
(() => {
  const DEFAULT_LANG = "en";
  const SUPPORTED_LANGS = ["en", "vi"];
  const STORAGE_KEY = "yourhouse_lang";

  const state = {
    lang: DEFAULT_LANG,
    fallback: {},
    messages: {},
    requestSeq: 0,
  };

  function getNested(obj, path) {
    if (!obj || typeof path !== "string") return undefined;
    return path.split(".").reduce((acc, part) => {
      if (acc && Object.prototype.hasOwnProperty.call(acc, part)) {
        return acc[part];
      }
      return undefined;
    }, obj);
  }

  function resolveInitialLang() {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang");
      if (urlLang && SUPPORTED_LANGS.includes(urlLang)) {
        return urlLang;
      }
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGS.includes(saved)) {
        return saved;
      }
    } catch {
      // Ignore storage/URL access errors in restricted environments
    }
    return DEFAULT_LANG;
  }

  async function loadJson(lang) {
    const response = await fetch(`i18n/${lang}.json`, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Failed to load i18n/${lang}.json (${response.status})`);
    }
    return response.json();
  }

  function t(key, fallbackText = "") {
    const activeValue = getNested(state.messages, key);
    if (activeValue !== undefined) return activeValue;
    const baseValue = getNested(state.fallback, key);
    if (baseValue !== undefined) return baseValue;
    return fallbackText || key;
  }

  function applyTranslations() {
    document.documentElement.lang = state.lang;

    const titleText = t("meta.title", document.title);
    if (typeof titleText === "string" && titleText) {
      document.title = titleText;
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const descText = t(
        "meta.description",
        metaDesc.getAttribute("content") || "",
      );
      if (typeof descText === "string" && descText) {
        metaDesc.setAttribute("content", descText);
      }
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && typeof titleText === "string" && titleText) {
      ogTitle.setAttribute("content", titleText);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      const descText = t("meta.description", ogDesc.getAttribute("content") || "");
      if (typeof descText === "string" && descText) {
        ogDesc.setAttribute("content", descText);
      }
    }

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = t(key);
      if (typeof value === "string" && value !== key) {
        el.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const value = t(key);
      if (typeof value === "string" && value !== key) {
        el.setAttribute("placeholder", value);
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      const value = t(key);
      if (typeof value === "string" && value !== key) {
        el.setAttribute("aria-label", value);
      }
    });

    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      const isCurrent = btn.getAttribute("data-lang-btn") === state.lang;
      btn.classList.toggle("is-active", isCurrent);
      btn.setAttribute("aria-pressed", String(isCurrent));
    });
  }

  async function setLanguage(nextLang) {
    const target = SUPPORTED_LANGS.includes(nextLang) ? nextLang : DEFAULT_LANG;
    const seq = ++state.requestSeq;

    try {
      const fallback = Object.keys(state.fallback).length
        ? state.fallback
        : await loadJson(DEFAULT_LANG);
      const messages =
        target === DEFAULT_LANG ? fallback : await loadJson(target);

      if (seq !== state.requestSeq) return;

      state.fallback = fallback;
      state.messages = messages;
      state.lang = target;

      try {
        window.localStorage.setItem(STORAGE_KEY, target);
      } catch {
        // Ignore storage write errors
      }

      applyTranslations();
    } catch (err) {
      if (seq !== state.requestSeq) return;
      // Keep pre-rendered English HTML or revert to loaded English baseline if fetch fails
      console.warn("[AppI18n]", err.message);
      state.lang = DEFAULT_LANG;
      document.documentElement.lang = DEFAULT_LANG;
      if (Object.keys(state.fallback).length) {
        state.messages = state.fallback;
        applyTranslations();
      }
    }

    window.dispatchEvent(
      new CustomEvent("yourhouse:langchange", { detail: { lang: state.lang } }),
    );
  }

  function bindLanguageButtons() {
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-lang-btn");
        if (target && target !== state.lang) {
          setLanguage(target);
        }
      });
    });
  }

  async function init() {
    bindLanguageButtons();
    const initial = resolveInitialLang();
    await setLanguage(initial);
  }

  window.AppI18n = {
    init,
    setLanguage,
    t,
    getLanguage: () => state.lang,
  };
})();
