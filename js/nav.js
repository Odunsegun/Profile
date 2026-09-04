(function () {
  const TOP_NAV_HEIGHT = 72;

  function initMobileMenu() {
    const toggle = document.getElementById("mobile-menu-toggle");
    const panel = document.getElementById("mobile-menu-panel");
    if (!toggle || !panel) return;

    const open = () => {
      panel.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
    };

    const close = () => {
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    };

    toggle.addEventListener("click", () => {
      if (panel.classList.contains("is-open")) close();
      else open();
    });

    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", close);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && panel.classList.contains("is-open")) {
        close();
        toggle.focus();
      }
    });

    document.addEventListener("click", (e) => {
      if (
        panel.classList.contains("is-open") &&
        !panel.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        close();
      }
    });
  }

  function initHomeLink() {
    const homeLinks = document.querySelectorAll('[data-nav-home="true"]');
    homeLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        if (document.body.dataset.page === "home") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  }

  function initHomeRail() {
    const rail = document.querySelector(".home-rail");
    if (!rail) return;

    const links = rail.querySelectorAll(".home-rail__link");
    const sections = [];

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href?.startsWith("#")) return;
      const target = document.querySelector(href);
      if (target) sections.push({ link, target });
    });

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach((link) => {
              const match = link.getAttribute("href") === `#${id}`;
              link.classList.toggle("is-active", match);
              if (match) link.setAttribute("aria-current", "location");
              else link.removeAttribute("aria-current");
            });
          }
        });
      },
      {
        rootMargin: `-${TOP_NAV_HEIGHT + 24}px 0px -45% 0px`,
        threshold: 0.1,
      }
    );

    sections.forEach(({ target }) => observer.observe(target));
  }

  function initTopNavScroll() {
    const bar = document.querySelector(".site-topnav");
    if (!bar) return;
    const onScroll = () => {
      bar.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function init() {
    initMobileMenu();
    initHomeLink();
    initHomeRail();
    initTopNavScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
