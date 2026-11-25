/**
 * YourHouse spring-physics Blinds expander strip.
 * Mirrors feral-blinds behavior (shape="slant", labelStyle="steady", bottom labels, spring tuning).
 */
(() => {
  const DEFAULTS = {
    expandRatio: 5,
    k: 90,
    c: 17,
    lean: 0.55,
    squeeze: 1,
    autoPlay: 3400,
  };

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function stepSpring(w, v, target, k, c, dt) {
    const accel = k * (target - w) - c * v;
    const nextV = v + accel * dt;
    const nextW = w + nextV * dt;
    return [nextW, nextV];
  }

  function mountBlinds(root) {
    const items = Array.from(root.querySelectorAll(".blind-item"));
    if (!items.length) return;

    const opts = { ...DEFAULTS };
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let active = 0;
    let stripPos = active;
    let stripVel = 0;
    const weights = items.map((_, i) => (i === active ? opts.expandRatio : 1));
    const velocities = items.map(() => 0);
    let rafId = 0;
    let lastTime = 0;
    let paused = false;
    let timerId = 0;

    function render() {
      const leanDeg = clamp(-stripVel * opts.lean * 0.65, -2.2, 2.2);
      root.style.setProperty("--blind-lean", `${leanDeg.toFixed(3)}deg`);

      items.forEach((el, i) => {
        const vel = velocities[i];
        const squeezeVal = 1 + clamp(vel * 0.012 * opts.squeeze, -0.04, 0.04);

        el.style.flexGrow = Math.max(0.25, weights[i]).toFixed(4);
        el.style.setProperty("--blind-squeeze", squeezeVal.toFixed(4));
      });
    }

    function syncActiveClasses() {
      items.forEach((el, i) => {
        const isCurrent = i === active;
        el.classList.toggle("is-active", isCurrent);
        el.setAttribute("aria-pressed", String(isCurrent));
      });
    }

    function tick(now) {
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.032) : 0.016;
      lastTime = now;

      let settled = true;
      const [nextPos, nextStripVel] = stepSpring(
        stripPos,
        stripVel,
        active,
        opts.k,
        opts.c,
        dt,
      );
      stripPos = nextPos;
      stripVel = nextStripVel;

      if (Math.abs(active - nextPos) > 0.001 || Math.abs(nextStripVel) > 0.001) {
        settled = false;
      } else {
        stripPos = active;
        stripVel = 0;
      }

      for (let i = 0; i < items.length; i += 1) {
        const target = i === active ? opts.expandRatio : 1;
        const [nextW, nextV] = stepSpring(
          weights[i],
          velocities[i],
          target,
          opts.k,
          opts.c,
          dt,
        );
        weights[i] = nextW;
        velocities[i] = nextV;

        if (Math.abs(target - nextW) > 0.001 || Math.abs(nextV) > 0.001) {
          settled = false;
        } else {
          weights[i] = target;
          velocities[i] = 0;
        }
      }

      render();

      if (settled) {
        rafId = 0;
        lastTime = 0;
        return;
      }
      rafId = window.requestAnimationFrame(tick);
    }

    function setActive(index) {
      const next = (index + items.length) % items.length;
      if (next === active) return;
      active = next;
      syncActiveClasses();

      if (reducedMotion) {
        stripPos = active;
        stripVel = 0;
        for (let i = 0; i < items.length; i += 1) {
          weights[i] = i === active ? opts.expandRatio : 1;
          velocities[i] = 0;
        }
        render();
        return;
      }

      if (!rafId) {
        lastTime = 0;
        rafId = window.requestAnimationFrame(tick);
      }
    }

    function navigateTo(el) {
      const href = el.getAttribute("data-href");
      if (!href) return;
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      }
    }

    function stopAutoPlay() {
      if (timerId) {
        window.clearInterval(timerId);
        timerId = 0;
      }
    }

    function startAutoPlay() {
      stopAutoPlay();
      if (reducedMotion || opts.autoPlay <= 0 || document.hidden) return;
      timerId = window.setInterval(() => {
        if (!paused && !document.hidden) {
          setActive(active + 1);
        }
      }, opts.autoPlay);
    }

    items.forEach((el, i) => {
      el.addEventListener("pointerenter", () => setActive(i));
      el.addEventListener("focus", () => setActive(i));
      el.addEventListener("click", () => {
        if (i === active) {
          navigateTo(el);
        } else {
          setActive(i);
        }
      });
      el.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          const next = (i + 1) % items.length;
          setActive(next);
          items[next].focus();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          const prev = (i - 1 + items.length) % items.length;
          setActive(prev);
          items[prev].focus();
        }
      });
    });

    root.addEventListener("pointerenter", () => {
      paused = true;
    });
    root.addEventListener("pointerleave", () => {
      paused = false;
    });
    root.addEventListener("focusin", () => {
      paused = true;
    });
    root.addEventListener("focusout", (event) => {
      if (!root.contains(event.relatedTarget)) paused = false;
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAutoPlay();
      else startAutoPlay();
    });

    syncActiveClasses();
    render();
    startAutoPlay();
  }

  function init() {
    document.querySelectorAll("[data-blinds]").forEach(mountBlinds);
  }

  if (typeof window !== "undefined") {
    window.AppBlinds = { init, stepSpring };
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { stepSpring };
  }
})();
