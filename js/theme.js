(function () {
  const STORAGE_KEY = "darkMode";
  const DARK_MODE = "abled";
  const LIGHT_MODE = "disabled";
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  let currentMode;

  function getSavedMode() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === DARK_MODE || saved === LIGHT_MODE ? saved : null;
  }

  function getPreferredMode() {
    return colorScheme.matches ? DARK_MODE : LIGHT_MODE;
  }

  function applyTheme(mode) {
    const isDark = mode === DARK_MODE;
    const theme = isDark ? "dark" : "light";
    const root = document.documentElement;

    currentMode = isDark ? DARK_MODE : LIGHT_MODE;

    root.classList.toggle("theme-dark", isDark);
    root.classList.toggle("theme-light", !isDark);
    root.dataset.theme = theme;
    document.body.classList.toggle("darkmode", isDark);
    document.body.classList.toggle("lightmode", !isDark);
    document.body.dataset.theme = theme;

    const toggle = document.getElementById("dark-mode-toggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
    }

    if (typeof window.setPortfolioHeroTheme === "function") {
      window.setPortfolioHeroTheme(theme);
    }
  }

  function initTheme() {
    const saved = getSavedMode();
    applyTheme(saved || getPreferredMode());

    const toggle = document.getElementById("dark-mode-toggle");
    toggle?.addEventListener("click", () => {
      const next = currentMode === DARK_MODE ? LIGHT_MODE : DARK_MODE;
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });

    const handlePreferenceChange = (event) => {
      if (getSavedMode() === null) {
        applyTheme(event.matches ? DARK_MODE : LIGHT_MODE);
      }
    };

    if (typeof colorScheme.addEventListener === "function") {
      colorScheme.addEventListener("change", handlePreferenceChange);
    } else {
      colorScheme.addListener(handlePreferenceChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }
})();
