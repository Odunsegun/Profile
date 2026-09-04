(function () {
  const SHIP_MARKUP = `
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <path class="space-cursor-ship__wing" d="M12.2 15.2 L14.6 7.6 L19.4 14.2 Z"></path>
      <path class="space-cursor-ship__wing" d="M12.2 16.8 L14.6 24.4 L19.4 17.8 Z"></path>
      <path class="space-cursor-ship__engine" d="M4.4 13.1 L8.6 16 L4.4 18.9 Q3.1 16 4.4 13.1 Z"></path>
      <path class="space-cursor-ship__body" d="M8.2 16 L12.8 11.1 L22.2 12.6 L29.6 16 L22.2 19.4 L12.8 20.9 Z"></path>
      <circle class="space-cursor-ship__canopy" cx="19.4" cy="16" r="2.05"></circle>
    </svg>
  `;

  const interactiveSelector = [
    "a",
    "button",
    "[role='button']",
    "summary",
    "label",
    "input[type='button']",
    "input[type='submit']",
    "input[type='reset']",
    "input[type='checkbox']",
    "input[type='radio']",
    "input[type='file']",
    "[data-cursor='interactive']"
  ].join(",");

  const nativeSelector = [
    "input:not([type='button']):not([type='submit']):not([type='reset']):not([type='checkbox']):not([type='radio']):not([type='file'])",
    "textarea",
    "select",
    "[contenteditable='true']",
    "pre",
    "code",
    "iframe",
    "[data-cursor='native']"
  ].join(",");

  const disabledSelector = "[disabled], [aria-disabled='true']";

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const forcedColors = window.matchMedia("(forced-colors: active)");

  let cleanup = null;

  function interpolateAngle(current, target, amount) {
    let diff = target - current;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;
    return current + diff * amount;
  }

  function canUseCustomCursor() {
    return finePointer.matches && !reducedMotion.matches && !forcedColors.matches;
  }

  function ensureNodes() {
    let beacon = document.querySelector(".space-cursor-beacon");
    let ship = document.querySelector(".space-cursor-ship");

    if (!beacon) {
      beacon = document.createElement("div");
      beacon.className = "space-cursor-beacon";
      beacon.setAttribute("aria-hidden", "true");
      document.body.appendChild(beacon);
    }

    if (!ship) {
      ship = document.createElement("div");
      ship.className = "space-cursor-ship";
      ship.setAttribute("aria-hidden", "true");
      ship.innerHTML = SHIP_MARKUP;
      document.body.appendChild(ship);
    }

    return { beacon, ship };
  }

  function initializeSpaceCursor() {
    if (cleanup) cleanup();
    if (!canUseCustomCursor() || !document.body) return;

    const nodes = ensureNodes();
    const ship = nodes.ship;
    const beacon = nodes.beacon;
    const root = document.documentElement;

    let pointerX = 0;
    let pointerY = 0;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let shipX = 0;
    let shipY = 0;
    let targetAngle = 0;
    let shipAngle = 0;
    let initialized = false;
    let visible = false;
    let animationFrame = 0;
    let trailOpacity = 0;
    let trailLength = 7;
    let pulseTimer = 0;

    function setVisible(nextVisible) {
      visible = nextVisible;
      root.classList.toggle("cursor-visible", nextVisible);
      if (!nextVisible) {
        trailOpacity = 0;
        root.style.setProperty("--cursor-trail-opacity", "0");
        root.classList.remove("cursor-moving");
      }
    }

    function updateTargetState(target) {
      const el = target instanceof Element ? target : target && target.parentElement;
      if (!el || !el.closest) {
        root.classList.remove("cursor-native", "cursor-interactive", "cursor-disabled");
        return;
      }

      const nativeTarget = el.closest(nativeSelector);
      const disabledTarget = el.closest(disabledSelector);
      const interactiveTarget = el.closest(interactiveSelector);

      root.classList.toggle("cursor-native", Boolean(nativeTarget));
      root.classList.toggle("cursor-disabled", !nativeTarget && Boolean(disabledTarget));
      root.classList.toggle(
        "cursor-interactive",
        !nativeTarget && !disabledTarget && Boolean(interactiveTarget)
      );
    }

    function hideCursor() {
      setVisible(false);
    }

    function handlePointerMove(event) {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }

      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!initialized) {
        shipX = pointerX;
        shipY = pointerY;
        previousPointerX = pointerX;
        previousPointerY = pointerY;
        initialized = true;
        root.classList.add("custom-cursor-ready");
        setVisible(true);
        if (!animationFrame) animationFrame = requestAnimationFrame(render);
        updateTargetState(event.target);
        return;
      }

      const dx = pointerX - previousPointerX;
      const dy = pointerY - previousPointerY;
      const speed = Math.hypot(dx, dy);

      if (speed > 1.5) {
        targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        trailLength = Math.min(5 + speed * 0.32, 15);
        trailOpacity = Math.min(speed / 14, 0.8);
      }

      updateTargetState(event.target);
      previousPointerX = pointerX;
      previousPointerY = pointerY;
      setVisible(true);
    }

    function handlePointerEnter(event) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      shipX = pointerX;
      shipY = pointerY;
      previousPointerX = pointerX;
      previousPointerY = pointerY;
      if (initialized) {
        updateTargetState(event.target);
        setVisible(true);
      }
    }

    function handlePointerDown(event) {
      if (event.pointerType && event.pointerType !== "mouse") return;
      root.classList.add("cursor-pressed");
    }

    function handlePointerUp() {
      root.classList.remove("cursor-pressed");
      if (!initialized || !visible) return;
      root.classList.add("cursor-pulse");
      window.clearTimeout(pulseTimer);
      pulseTimer = window.setTimeout(function () {
        root.classList.remove("cursor-pulse");
      }, 220);
    }

    function handleScroll() {
      if (!initialized || !visible) return;
      const el = document.elementFromPoint(pointerX, pointerY);
      if (el) updateTargetState(el);
    }

    function handleVisibility() {
      if (document.visibilityState === "hidden") {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        }
        setVisible(false);
        return;
      }
      if (initialized && !animationFrame) {
        animationFrame = requestAnimationFrame(render);
      }
    }

    function render() {
      const distance = Math.hypot(pointerX - shipX, pointerY - shipY);

      if (distance > 180) {
        shipX = pointerX;
        shipY = pointerY;
      } else {
        shipX += (pointerX - shipX) * 0.18;
        shipY += (pointerY - shipY) * 0.18;
      }

      shipAngle = interpolateAngle(shipAngle, targetAngle, 0.22);
      if (shipAngle > 180) shipAngle -= 360;
      if (shipAngle < -180) shipAngle += 360;

      trailOpacity *= 0.86;
      if (trailOpacity < 0.02) trailOpacity = 0;
      trailLength += (7 - trailLength) * 0.08;

      root.style.setProperty("--cursor-trail-length", trailLength.toFixed(1) + "px");
      root.style.setProperty("--cursor-trail-opacity", String(trailOpacity));
      root.classList.toggle("cursor-moving", trailOpacity > 0.12);

      beacon.style.transform =
        "translate3d(" + pointerX + "px, " + pointerY + "px, 0) translate(-50%, -50%)";
      ship.style.transform =
        "translate3d(" +
        shipX +
        "px, " +
        shipY +
        "px, 0) translate(-50%, -50%) rotate(" +
        shipAngle +
        "deg)";

      animationFrame = requestAnimationFrame(render);
    }

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("mouseenter", handlePointerEnter);
    document.documentElement.addEventListener("mouseleave", hideCursor);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("blur", hideCursor);
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("scroll", handleScroll, { passive: true, capture: true });

    cleanup = function () {
      document.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseenter", handlePointerEnter);
      document.documentElement.removeEventListener("mouseleave", hideCursor);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("blur", hideCursor);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("scroll", handleScroll, true);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      window.clearTimeout(pulseTimer);
      animationFrame = 0;
      root.classList.remove(
        "custom-cursor-ready",
        "cursor-visible",
        "cursor-interactive",
        "cursor-pressed",
        "cursor-native",
        "cursor-disabled",
        "cursor-moving",
        "cursor-pulse"
      );
      cleanup = null;
    };
  }

  function boot() {
    document.body.classList.add("no-cursor-glow");
    if (!canUseCustomCursor()) return;

    const preloader = document.getElementById("preloader");
    if (preloader && document.readyState !== "complete") {
      window.addEventListener(
        "load",
        function () {
          requestAnimationFrame(initializeSpaceCursor);
        },
        { once: true }
      );
      return;
    }

    initializeSpaceCursor();
  }

  function onMediaChange() {
    if (canUseCustomCursor()) initializeSpaceCursor();
    else if (cleanup) cleanup();
  }

  finePointer.addEventListener("change", onMediaChange);
  reducedMotion.addEventListener("change", onMediaChange);
  if (forcedColors.addEventListener) forcedColors.addEventListener("change", onMediaChange);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
