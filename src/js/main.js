/**
 * YourHouse application entry point.
 * Boots Theme and i18n modules and handles navigation, active pill sync, and reveal motion.
 */
(() => {
  function initMobileMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) return;

    const closeMenu = () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const next = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", next);
      toggle.setAttribute("aria-expanded", String(next));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  function initActiveNav() {
    const navLinks = Array.from(document.querySelectorAll(".nav-pill .nav-link[href^='#']"));
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    if (!navLinks.length || !sections.length) return;

    const setActive = (id) => {
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", isCurrent);
      });
    };

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const targetId = (link.getAttribute("href") || "").replace("#", "");
        if (targetId) setActive(targetId);
      });
    });

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    const reducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    items.forEach((el) => observer.observe(el));
  }

  function initScrollTop() {
    const btn = document.querySelector("[data-scroll-top]");
    if (!btn) return;

    const reducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const syncVisibility = () => {
      btn.classList.toggle("is-visible", window.scrollY > 420);
    };

    syncVisibility();
    window.addEventListener("scroll", syncVisibility, { passive: true });
    btn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    });
  }

  async function bootstrap() {
    if (window.AppTheme) {
      window.AppTheme.init();
    }

    if (window.AppI18n) {
      await window.AppI18n.init();
    }

    if (window.AppBlinds) {
      window.AppBlinds.init();
    }

    initMobileMenu();
    initActiveNav();
    initReveal();
    initScrollTop();
  }

  document.addEventListener("DOMContentLoaded", bootstrap);
})();
