(function () {
  const grid = document.getElementById("projects-grid");
  const upcomingSection = document.getElementById("projects-upcoming");
  const upcomingRow = document.getElementById("projects-upcoming-row");
  const countEl = document.getElementById("project-filter-status");
  const filtersRoot = document.getElementById("projects-filters");
  const projects = window.PROJECT_ARCHIVE || [];
  const upcoming = window.UPCOMING_MISSIONS || [];

  if (!grid || !filtersRoot) return;

  const FILTER_LABELS = {
    all: "All",
    software: "Software",
    "ai-ml": "AI / ML",
    cloud: "Cloud",
    "network-security": "Network & Security",
    mobile: "Mobile",
    data: "Data",
    simulation: "Simulation",
    upcoming: "Upcoming",
  };

  const STATUS_LABELS = {
    deployed: "Deployed",
    active: "Active",
    documented: "Documented",
    planned: "Planned",
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCard(project, index) {
    const cats = project.categories.join(" ");
    const status = project.status;
    const statusLabel = STATUS_LABELS[status] || status;
    const categoryLabel = project.categories
      .map(function (category) {
        return FILTER_LABELS[category] || category;
      })
      .join(" \u00b7 ");
    const eager = index < 4;
    const prefix = document.documentElement.dataset.assetPrefix || "";
    const titleId = "project-" + project.slug + "-title";
    const detailsUrl = project.caseStudyUrl || "/projects/" + project.slug + "/";
    const visualTechnologyLabel = (project.technologies || [])
      .slice(0, 2)
      .map(function (technology) {
        return technology.name;
      })
      .join(" + ");
    const media = project.image
      ? `<img src="${escapeHtml(prefix + project.image)}" alt="${escapeHtml(project.imageAlt)}" width="640" height="360" decoding="async" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} />`
      : `<div class="archive-project-card__placeholder" role="img" aria-label="${escapeHtml(project.title)} project visual">
           <span class="archive-project-card__placeholder-icon" aria-hidden="true">
             <i class="bx ${escapeHtml(project.placeholderIcon || "bx-code-alt")}"></i>
           </span>
           <span class="archive-project-card__placeholder-title">${escapeHtml(project.title)}</span>
           <span class="archive-project-card__placeholder-label">${escapeHtml(categoryLabel)}</span>
           <span class="archive-project-card__placeholder-stack">${escapeHtml(visualTechnologyLabel)}</span>
         </div>`;

    const tags = (project.technologies || [])
      .slice(0, 2)
      .map(function (tech) {
        return `<li class="archive-tech" style="--tech-brand: ${escapeHtml(tech.brand)}">
          <span class="archive-tech__name">${escapeHtml(tech.name)}</span>
        </li>`;
      })
      .join("");

    const externalActions = [];
    if (project.repositoryUrl) {
      externalActions.push(
        `<a class="archive-project-icon-link" href="${escapeHtml(project.repositoryUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(project.title)} repository on GitHub in a new tab">
          <i class="bx bxl-github" aria-hidden="true"></i>
        </a>`
      );
    }
    if (project.liveUrl) {
      externalActions.push(
        `<a class="archive-project-icon-link" href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(project.title)} live demo in a new tab">
          <i class="bx bx-link-external" aria-hidden="true"></i>
        </a>`
      );
    }

    return `<article class="archive-project-card" data-categories="${escapeHtml(cats)}" aria-labelledby="${escapeHtml(titleId)}">
      <div class="archive-project-card__media">
        ${media}
        <div class="archive-project-card__media-actions" role="group" aria-label="${escapeHtml(project.title)} external links">
          ${externalActions.join("")}
        </div>
      </div>
      <div class="archive-project-card__body">
        <h2 id="${escapeHtml(titleId)}">${escapeHtml(project.title)}</h2>
        <div class="archive-project-card__meta">
          <p class="project-status project-status--${escapeHtml(status)}">
            <span aria-hidden="true"></span>
            ${escapeHtml(statusLabel)}
          </p>
          <span class="archive-project-card__meta-separator" aria-hidden="true">&middot;</span>
          <p class="archive-project-card__category">${escapeHtml(categoryLabel)}</p>
        </div>
        <p class="archive-project-card__summary">${escapeHtml(project.summary)}</p>
        <div class="archive-project-card__footer">
          <ul class="archive-project-card__tags" aria-label="${escapeHtml(project.title)} technologies">${tags}</ul>
          <a class="archive-project-link archive-project-link--details" href="${escapeHtml(detailsUrl)}">
            <span>Explore details</span>
            <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </article>`;
  }

  function renderUpcoming(mission, index) {
    const titleId = "upcoming-mission-" + index + "-title";
    return `<article class="upcoming-card" aria-labelledby="${titleId}">
      <span class="upcoming-card__hex" aria-hidden="true"><i class="bx bx-lock-alt"></i></span>
      <div class="upcoming-card__copy">
        <h3 class="upcoming-card__title" id="${titleId}">${escapeHtml(mission.title)}</h3>
        <p class="project-status project-status--planned"><span aria-hidden="true"></span> Planned</p>
        <p class="upcoming-card__hint">Details unlock when development begins</p>
      </div>
      <i class="bx bx-chevron-right upcoming-card__chevron" aria-hidden="true"></i>
    </article>`;
  }

  grid.innerHTML = projects.map(renderCard).join("");
  if (upcomingRow) {
    upcomingRow.innerHTML = upcoming.map(renderUpcoming).join("");
  }

  const cards = Array.from(grid.querySelectorAll(".archive-project-card"));
  const filterButtons = Array.from(filtersRoot.querySelectorAll("[data-filter]"));

  function setHidden(element, hidden) {
    if (!element) return;
    element.hidden = hidden;
    element.toggleAttribute("inert", hidden);
  }

  function getFilterFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const value = (params.get("filter") || "all").toLowerCase();
    return FILTER_LABELS[value] ? value : "all";
  }

  function setQueryFilter(filter) {
    const url = new URL(window.location.href);
    if (filter === "all") {
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("filter", filter);
    }
    window.history.replaceState({}, "", url);
  }

  function cardMatches(card, filter) {
    const cats = (card.getAttribute("data-categories") || "")
      .split(/\s+/)
      .filter(Boolean);
    return cats.includes(filter);
  }

  function applyFilter(filter, pushQuery) {
    filterButtons.forEach(function (btn) {
      const active = btn.getAttribute("data-filter") === filter;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    let visibleCount = 0;

    if (filter === "upcoming") {
      setHidden(grid, true);
      setHidden(upcomingSection, false);
      visibleCount = upcoming.length;
    } else {
      setHidden(grid, false);
      cards.forEach(function (card) {
        const show = filter === "all" || cardMatches(card, filter);
        setHidden(card, !show);
        if (show) visibleCount += 1;
      });
      setHidden(upcomingSection, filter !== "all");
    }

    if (countEl) {
      const label = FILTER_LABELS[filter] || "All";
      if (filter === "upcoming") {
        countEl.textContent = visibleCount + " upcoming";
        countEl.setAttribute(
          "aria-label",
          "Showing " + visibleCount + " upcoming mission" + (visibleCount === 1 ? "" : "s")
        );
      } else if (visibleCount === 0) {
        countEl.textContent = "0 projects";
        countEl.setAttribute("aria-label", "No projects in " + label);
      } else {
        countEl.textContent = visibleCount + " project" + (visibleCount === 1 ? "" : "s");
        countEl.setAttribute(
          "aria-label",
          "Showing " +
            visibleCount +
            " project" +
            (visibleCount === 1 ? "" : "s") +
            (filter === "all" ? "" : " in " + label)
        );
      }
    }

    if (pushQuery !== false) setQueryFilter(filter);
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFilter(btn.getAttribute("data-filter") || "all");
    });
  });

  window.addEventListener("popstate", function () {
    applyFilter(getFilterFromQuery(), false);
  });

  applyFilter(getFilterFromQuery(), false);

  const chatToggle = document.getElementById("chat-toggle");
  if (chatToggle) {
    chatToggle.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        chatToggle.click();
      }
    });
  }
})();
