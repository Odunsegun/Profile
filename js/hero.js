(function () {
  "use strict";

  const THEME_ATTRIBUTE = "data-theme";
  const HERO_THEME_ATTRIBUTE = "data-hero-theme";
  const SCROLLED_THRESHOLD = 24;
  const SATELLITE_ROTATION_DEG = 540;
  const PLANET_ROTATION_DEG = -420;
  const LIGHT_CLASSES = ["light", "lightmode", "light-mode"];
  const DARK_CLASSES = ["dark", "darkmode", "dark-mode"];

  const systemDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  let hero = null;
  let orbitals = null;
  let satelliteTrack = null;
  let planetTrack = null;
  let pendingTheme = null;

  function normalizeTheme(theme) {
    if (typeof theme !== "string") return null;

    const value = theme.trim().toLowerCase();
    if (["light", "lightmode", "light-mode", "disabled"].includes(value)) {
      return "light";
    }
    if (["dark", "darkmode", "dark-mode", "abled"].includes(value)) {
      return "dark";
    }

    return null;
  }

  function themeFromClasses(element) {
    if (!element) return null;

    if (LIGHT_CLASSES.some((className) => element.classList.contains(className))) {
      return "light";
    }
    if (DARK_CLASSES.some((className) => element.classList.contains(className))) {
      return "dark";
    }

    return null;
  }

  function explicitDocumentTheme() {
    const root = document.documentElement;
    const body = document.body;

    return (
      normalizeTheme(body?.getAttribute(THEME_ATTRIBUTE)) ||
      normalizeTheme(root.getAttribute(THEME_ATTRIBUTE)) ||
      themeFromClasses(body) ||
      themeFromClasses(root)
    );
  }

  function detectedTheme() {
    return explicitDocumentTheme() || (systemDarkQuery.matches ? "dark" : "light");
  }

  function setThemeAttribute(element, attribute, theme) {
    if (element && element.getAttribute(attribute) !== theme) {
      element.setAttribute(attribute, theme);
    }
  }

  function applyHeroTheme(theme) {
    const resolvedTheme = normalizeTheme(theme) || detectedTheme();
    pendingTheme = resolvedTheme;

    hero = hero || document.querySelector(".home-hero");
    orbitals = orbitals || document.querySelector(".space-orbitals");

    setThemeAttribute(hero, THEME_ATTRIBUTE, resolvedTheme);
    setThemeAttribute(hero, HERO_THEME_ATTRIBUTE, resolvedTheme);
    setThemeAttribute(orbitals, HERO_THEME_ATTRIBUTE, resolvedTheme);

    return resolvedTheme;
  }

  // Theme controllers with their own state can call this bridge directly.
  window.setPortfolioHeroTheme = applyHeroTheme;

  function observeDocumentTheme() {
    const root = document.documentElement;
    const body = document.body;
    if (!body) return;

    const observer = new MutationObserver(function (records) {
      let changedTheme = null;

      // Prefer the signal that actually changed. This also handles a legacy
      // class-based switcher when an older data-theme value is still present.
      records.forEach(function (record) {
        if (record.attributeName === THEME_ATTRIBUTE) {
          changedTheme = normalizeTheme(record.target.getAttribute(THEME_ATTRIBUTE));
        } else if (record.attributeName === "class") {
          changedTheme = themeFromClasses(record.target) || changedTheme;
        }
      });

      applyHeroTheme(changedTheme || detectedTheme());
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: [THEME_ATTRIBUTE, "class"],
    });
    observer.observe(body, {
      attributes: true,
      attributeFilter: [THEME_ATTRIBUTE, "class"],
    });

    const onSystemThemeChange = function (event) {
      if (!explicitDocumentTheme()) {
        applyHeroTheme(event.matches ? "dark" : "light");
      }
    };

    if (typeof systemDarkQuery.addEventListener === "function") {
      systemDarkQuery.addEventListener("change", onSystemThemeChange);
    } else {
      systemDarkQuery.addListener(onSystemThemeChange);
    }
  }

  function initScrollMotion() {
    const root = document.documentElement;
    const body = document.body;

    let animationFrame = 0;
    let needsMeasurement = true;
    let maxScroll = 0;
    let satelliteTravel = 0;
    let planetTravel = 0;
    let reducedMotion = reducedMotionQuery.matches;

    function viewportHeight() {
      return window.innerHeight || root.clientHeight || 0;
    }

    function documentHeight() {
      return Math.max(
        root.scrollHeight,
        root.offsetHeight,
        root.clientHeight,
        body?.scrollHeight || 0,
        body?.offsetHeight || 0,
        body?.clientHeight || 0
      );
    }

    function trackHeight(track) {
      if (!track) return 0;

      return (
        track.offsetHeight ||
        track.firstElementChild?.offsetHeight ||
        track.getBoundingClientRect().height ||
        0
      );
    }

    function numericInset(track, property, fallback) {
      if (!track) return fallback;
      const value = Number.parseFloat(window.getComputedStyle(track)[property]);
      return Number.isFinite(value) ? Math.max(0, value) : fallback;
    }

    function measure() {
      const height = viewportHeight();
      maxScroll = Math.max(0, documentHeight() - height);

      // Removing only the track translation yields its CSS-defined start point;
      // child elements keep their separate floating animation.
      satelliteTrack?.style.removeProperty("--orbital-y");
      planetTrack?.style.removeProperty("--orbital-y");

      if (satelliteTrack) {
        const rect = satelliteTrack.getBoundingClientRect();
        const startInset = numericInset(satelliteTrack, "top", Math.max(0, rect.top));
        satelliteTravel = Math.max(0, height - trackHeight(satelliteTrack) - startInset * 2);
      }

      if (planetTrack) {
        const rect = planetTrack.getBoundingClientRect();
        const startInset = numericInset(
          planetTrack,
          "bottom",
          Math.max(0, height - rect.bottom)
        );
        planetTravel = Math.max(0, height - trackHeight(planetTrack) - startInset * 2);
      }

      needsMeasurement = false;
    }

    function scrollTop() {
      const value = window.scrollY ?? root.scrollTop ?? body?.scrollTop ?? 0;
      return Math.max(0, value);
    }

    function setStyleProperty(element, property, value) {
      if (element && element.style.getPropertyValue(property) !== value) {
        element.style.setProperty(property, value);
      }
    }

    function clearOrbitalMotion() {
      orbitals?.style.removeProperty("--orbital-progress");
      satelliteTrack?.style.removeProperty("--orbital-y");
      satelliteTrack?.style.removeProperty("--orbital-rotation");
      planetTrack?.style.removeProperty("--orbital-y");
      planetTrack?.style.removeProperty("--orbital-rotation");
    }

    function render() {
      animationFrame = 0;

      const currentScroll = scrollTop();
      hero.classList.toggle("is-scrolled", currentScroll > SCROLLED_THRESHOLD);

      if (reducedMotion) return;
      if (needsMeasurement) measure();

      const progress = maxScroll > 0 ? Math.min(1, currentScroll / maxScroll) : 0;
      setStyleProperty(orbitals, "--orbital-progress", progress.toFixed(5));
      setStyleProperty(
        satelliteTrack,
        "--orbital-y",
        (progress * satelliteTravel).toFixed(2) + "px"
      );
      setStyleProperty(
        satelliteTrack,
        "--orbital-rotation",
        (progress * SATELLITE_ROTATION_DEG).toFixed(2) + "deg"
      );
      setStyleProperty(
        planetTrack,
        "--orbital-y",
        (-progress * planetTravel).toFixed(2) + "px"
      );
      setStyleProperty(
        planetTrack,
        "--orbital-rotation",
        (progress * PLANET_ROTATION_DEG).toFixed(2) + "deg"
      );
    }

    function scheduleRender() {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    function scheduleMeasurement() {
      needsMeasurement = true;
      scheduleRender();
    }

    function onReducedMotionChange(event) {
      reducedMotion = event.matches;
      needsMeasurement = !reducedMotion;
      if (reducedMotion) clearOrbitalMotion();
      scheduleRender();
    }

    window.addEventListener("scroll", scheduleRender, { passive: true });
    window.addEventListener("resize", scheduleMeasurement, { passive: true });
    window.addEventListener("pageshow", scheduleMeasurement);
    window.addEventListener("load", scheduleMeasurement, { once: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", scheduleMeasurement, { passive: true });
    }

    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", onReducedMotionChange);
    } else {
      reducedMotionQuery.addListener(onReducedMotionChange);
    }

    if (typeof ResizeObserver === "function" && body) {
      const resizeObserver = new ResizeObserver(scheduleMeasurement);
      resizeObserver.observe(body);
    }

    if (reducedMotion) clearOrbitalMotion();
    scheduleRender();
  }

  function init() {
    hero = document.querySelector(".home-hero");
    orbitals = document.querySelector(".space-orbitals");
    satelliteTrack = document.querySelector(".space-orbitals__track--satellite");
    planetTrack = document.querySelector(".space-orbitals__track--planet");

    if (!hero) return;

    applyHeroTheme(pendingTheme || detectedTheme());
    observeDocumentTheme();
    initScrollMotion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
