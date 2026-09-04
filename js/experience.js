(function () {
  const timeline = document.querySelector("#experience .timeline");
  if (!timeline) return;

  const rocket = timeline.querySelector(".timeTraveller");
  const entries = timeline.querySelectorAll(".timeline-entry");

  const pinRocket = () => {
    if (!rocket) return;
    const rect = timeline.getBoundingClientRect();
    if (rect.height <= 0) return;

    const mid = window.innerHeight / 2;
    const top = Math.max(12, Math.min(rect.height - 12, mid - rect.top));
    rocket.style.top = `${top}px`;
  };

  pinRocket();
  window.addEventListener("scroll", pinRocket, { passive: true });
  window.addEventListener("resize", pinRocket);

  if (!entries.length) return;

  const observer = new IntersectionObserver(
    (observed) => {
      observed.forEach((entry) => {
        if (entry.isIntersecting) {
          entries.forEach((el) => el.classList.remove("is-active"));
          entry.target.classList.add("is-active");
        }
      });
    },
    {
      rootMargin: "-20% 0px -45% 0px",
      threshold: 0.2,
    }
  );

  entries.forEach((entry) => {
    entry.setAttribute("tabindex", "0");
    observer.observe(entry);
  });
})();

(function () {
  const list = document.getElementById("flight-log");
  const preview = document.getElementById("experience-preview");
  const milestones = window.EXPERIENCE_MILESTONES || [];
  if (!list || !preview || !milestones.length) return;

  const TRANSITION_MS = 200;
  const TRANSITION_HALF_MS = TRANSITION_MS / 2;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let openId = null;
  let transitionToken = 0;
  let transitionTimers = [];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getItemDomIds(item, index) {
    const token = String(item.id || item.organization || "record")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "record";
    const base = `experience-${index + 1}-${token}`;

    return {
      trigger: `${base}-toggle`,
      panel: `${base}-panel`,
      heading: `${base}-heading`,
      year: `${base}-year`,
      category: `${base}-category`,
      summary: `${base}-summary`,
      previewTitle: `${base}-preview-title`,
      focusTitle: `${base}-focus-title`,
      evidenceTitle: `${base}-evidence-title`,
    };
  }

  function getItemIds(item) {
    const index = milestones.indexOf(item);
    return getItemDomIds(item, index < 0 ? 0 : index);
  }

  function renderRecordIcon(item) {
    if (item.iconSrc) {
      return `<img class="flight-log__icon-image" src="${escapeHtml(item.iconSrc)}" alt="" width="28" height="28">`;
    }

    return `<i class="bx ${escapeHtml(item.icon)}"></i>`;
  }

  function renderItems(initialOpenId) {
    list.innerHTML = milestones
      .map(function (item, index) {
        const expanded = item.id === initialOpenId;
        const ids = getItemDomIds(item, index);
        const category = item.category
          ? `<span class="flight-log__category" id="${ids.category}">${escapeHtml(item.category)}</span>`
          : "";
        const describedBy = [item.category ? ids.category : "", ids.summary]
          .filter(Boolean)
          .join(" ");

        return `<li class="flight-log__entry${expanded ? " is-open" : ""}" data-id="${escapeHtml(item.id)}">
          <article class="flight-log__record${expanded ? " is-open" : ""}">
            <button
              type="button"
              class="flight-log__item"
              id="${ids.trigger}"
              aria-expanded="${expanded ? "true" : "false"}"
              aria-controls="${ids.panel}"
              aria-labelledby="${ids.heading} ${ids.year}"
              aria-describedby="${describedBy}"
              data-id="${escapeHtml(item.id)}"
            >
              <span class="flight-log__icon" aria-hidden="true">${renderRecordIcon(item)}</span>
              <span class="flight-log__content">
                <span class="flight-log__head">
                  <span class="flight-log__heading" id="${ids.heading}" role="heading" aria-level="2">${escapeHtml(item.organization)}</span>
                  <span class="flight-log__year" id="${ids.year}">${escapeHtml(item.year)}</span>
                </span>
                ${category}
                <span class="experience-item__summary flight-log__summary" id="${ids.summary}">${escapeHtml(item.summary)}</span>
              </span>
              <span class="flight-log__chevron" aria-hidden="true"><i class="bx bx-chevron-down"></i></span>
            </button>
          </article>
        </li>`;
      })
      .join("");
  }

  function renderFocusAreas(item, ids) {
    const areas = (item.focusAreas || []).slice(0, 3);
    if (!areas.length) return "";

    return `<section class="experience-preview__section" aria-labelledby="${ids.focusTitle}">
      <h3 class="experience-preview__section-title" id="${ids.focusTitle}">Focus areas</h3>
      <div class="experience-preview__focus-grid">
        ${areas
          .map(function (area) {
            return `<article class="experience-preview__row">
              <span class="flight-log__icon" aria-hidden="true"><i class="bx ${escapeHtml(area.icon)}"></i></span>
              <div>
                <h4>${escapeHtml(area.title)}</h4>
                <p>${escapeHtml(area.text)}</p>
              </div>
            </article>`;
          })
          .join("")}
      </div>
    </section>`;
  }

  function renderChips(item) {
    const chips = (item.chips || []).slice(0, 5);
    if (!chips.length) return "";

    return `<ul class="experience-preview__chips" aria-label="Verified technologies and topics">
      ${chips
        .map(function (chip) {
          return `<li class="experience-preview__chip">${escapeHtml(chip)}</li>`;
        })
        .join("")}
    </ul>`;
  }

  function renderEvidence(item, ids) {
    const evidence = item.evidence;
    if (!evidence) return "";

    const image = evidence.image
      ? `<img class="experience-preview__evidence-image" src="${escapeHtml(evidence.image)}" alt="${escapeHtml(evidence.alt || "")}" loading="lazy">`
      : `<span class="experience-preview__evidence-icon" aria-hidden="true"><i class="bx bx-check-shield"></i></span>`;
    const caption = evidence.caption
      ? `<p class="experience-preview__evidence-caption">${escapeHtml(evidence.caption)}</p>`
      : "";

    return `<section class="experience-preview__evidence" aria-labelledby="${ids.evidenceTitle}">
      ${image}
      <div class="experience-preview__evidence-copy">
        <h3 id="${ids.evidenceTitle}">${escapeHtml(evidence.title)}</h3>
        <p>${escapeHtml(evidence.text)}</p>
        ${caption}
      </div>
    </section>`;
  }

  function renderRecordPanel(item) {
    const ids = getItemIds(item);
    const link = item.recordUrl
      ? `<div class="experience-preview__footer"><a class="experience-preview__link" href="${escapeHtml(item.recordUrl)}">${escapeHtml(item.recordLabel || "View full record")}</a></div>`
      : "";

    return `<section
      class="experience-preview__panel"
      id="${ids.panel}"
      data-preview-id="${escapeHtml(item.id)}"
      aria-labelledby="${ids.previewTitle}"
      hidden
    >
      <div class="experience-preview__head">
        <span class="flight-log__icon experience-preview__icon" aria-hidden="true">${renderRecordIcon(item)}</span>
        <div>
          <h2 class="experience-preview__org" id="${ids.previewTitle}">${escapeHtml(item.organization)}</h2>
          <p class="experience-preview__role">${escapeHtml(item.role)}</p>
          <p class="experience-preview__year">${escapeHtml(item.year)}</p>
        </div>
      </div>
      <p class="experience-preview__overview">${escapeHtml(item.summary)}</p>
      ${renderFocusAreas(item, ids)}
      ${renderChips(item)}
      ${renderEvidence(item, ids)}
      ${link}
    </section>`;
  }

  function renderPreviewPanels(initialOpenId) {
    const overviewActive = initialOpenId === null;
    const overview = `<section
      class="experience-preview__panel experience-preview__panel--overview${overviewActive ? " is-active" : ""}"
      id="experience-archive-overview"
      data-preview-id="overview"
      aria-labelledby="experience-archive-overview-title"
      ${overviewActive ? "" : "hidden"}
    >
      <div class="experience-preview__overview-state">
        <span class="experience-preview__overview-icon" aria-hidden="true"><i class="bx bx-map-alt"></i></span>
        <p class="experience-preview__eyebrow">Flight log overview</p>
        <h2 class="experience-preview__org" id="experience-archive-overview-title">Explore the experience archive</h2>
        <p class="experience-preview__overview">Choose a record to review its dates, focus areas, verified topics, evidence, and any available related page.</p>
      </div>
    </section>`;

    preview.innerHTML = overview + milestones.map(renderRecordPanel).join("");

    if (initialOpenId !== null) {
      const activePanel = getPanel(initialOpenId);
      if (activePanel) {
        activePanel.hidden = false;
        activePanel.classList.add("is-active");
      }
    }
  }

  function getPanel(id) {
    if (id === null) return document.getElementById("experience-archive-overview");

    const item = milestones.find(function (entry) {
      return entry.id === id;
    });
    if (!item) return null;

    const panelId = getItemIds(item).panel;
    return document.getElementById(panelId);
  }

  function clearTransitionTimers() {
    transitionTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    transitionTimers = [];
  }

  function normalizePanels(activePanel) {
    preview.querySelectorAll(".experience-preview__panel").forEach(function (panel) {
      panel.classList.remove("is-active", "is-fading-out", "is-fading-in");
      panel.hidden = panel !== activePanel;
    });

    if (activePanel) activePanel.classList.add("is-active");
    preview.setAttribute("aria-busy", "false");
  }

  function transitionToPanel(nextId, animate) {
    const nextPanel = getPanel(nextId);
    const currentPanel = preview.querySelector(".experience-preview__panel.is-active");
    if (!nextPanel) return;

    transitionToken += 1;
    const token = transitionToken;
    clearTransitionTimers();

    if (!animate || reducedMotion.matches || !currentPanel || currentPanel === nextPanel) {
      normalizePanels(nextPanel);
      return;
    }

    preview.querySelectorAll(".experience-preview__panel").forEach(function (panel) {
      panel.classList.remove("is-fading-out", "is-fading-in");
      if (panel !== currentPanel) panel.hidden = true;
    });
    currentPanel.classList.add("is-fading-out");
    preview.setAttribute("aria-busy", "true");

    transitionTimers.push(window.setTimeout(function () {
      if (token !== transitionToken) return;
      currentPanel.hidden = true;
      currentPanel.classList.remove("is-active", "is-fading-out");
      nextPanel.hidden = false;
      nextPanel.classList.add("is-active", "is-fading-in");

      // Force the hidden-to-visible state to commit before the fade-in begins.
      void nextPanel.offsetWidth;
      nextPanel.classList.remove("is-fading-in");
    }, TRANSITION_HALF_MS));

    transitionTimers.push(window.setTimeout(function () {
      if (token !== transitionToken) return;
      normalizePanels(nextPanel);
      transitionTimers = [];
    }, TRANSITION_MS));
  }

  function updateDisclosureState(nextId) {
    list.querySelectorAll(".flight-log__item").forEach(function (trigger) {
      const expanded = trigger.getAttribute("data-id") === nextId;
      trigger.setAttribute("aria-expanded", expanded ? "true" : "false");
      const entry = trigger.closest(".flight-log__entry");
      const record = trigger.closest(".flight-log__record");
      if (entry) entry.classList.toggle("is-open", expanded);
      if (record) record.classList.toggle("is-open", expanded);
    });
  }

  function updateUrl(nextId) {
    const url = new URL(window.location.href);
    if (nextId === milestones[0].id) url.searchParams.delete("record");
    else url.searchParams.set("record", nextId === null ? "overview" : nextId);
    window.history.replaceState(window.history.state, "", url);
  }

  function setOpenId(nextId, options) {
    const settings = options || {};
    const resolvedId = milestones.some(function (item) {
      return item.id === nextId;
    })
      ? nextId
      : null;

    openId = resolvedId;
    updateDisclosureState(openId);
    transitionToPanel(openId, settings.animate !== false);
    if (settings.updateUrl !== false) updateUrl(openId);
  }

  function resolveUrlState() {
    const record = new URLSearchParams(window.location.search).get("record");
    if (record === "overview") return null;
    if (!record) return milestones[0].id;
    return milestones.some(function (item) {
      return item.id === record;
    })
      ? record
      : milestones[0].id;
  }

  openId = resolveUrlState();
  renderItems(openId);
  renderPreviewPanels(openId);

  list.addEventListener("click", function (event) {
    const trigger = event.target.closest(".flight-log__item");
    if (!trigger || !list.contains(trigger)) return;
    const id = trigger.getAttribute("data-id");
    setOpenId(openId === id ? null : id, { animate: true, updateUrl: true });
  });

  list.addEventListener("keydown", function (event) {
    const triggers = Array.from(list.querySelectorAll(".flight-log__item"));
    const current = event.target.closest(".flight-log__item");
    const index = triggers.indexOf(current);
    if (index < 0) return;

    if (event.key === "Escape" && openId !== null) {
      event.preventDefault();
      setOpenId(null, { animate: true, updateUrl: true });
      current.focus();
      return;
    }

    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % triggers.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + triggers.length) % triggers.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = triggers.length - 1;
    else return;
    event.preventDefault();
    triggers[next].focus();
  });

  window.addEventListener("popstate", function () {
    setOpenId(resolveUrlState(), { animate: false, updateUrl: false });
  });
})();
