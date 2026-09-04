(function () {
  const root = document.getElementById("project-detail");
  const slug = document.body.dataset.projectSlug;
  const projects = window.PROJECT_ARCHIVE || [];
  const project = projects.find(function (item) {
    return item.slug === slug;
  });

  if (!root || !project) return;

  const prefix = document.documentElement.dataset.assetPrefix || "";
  const TECH_ICONS = {
    React: "assets/react-original.svg",
    "Tailwind CSS": "assets/tailwindcss.svg",
    "Azure Functions": "assets/azure-original.svg",
    "Cosmos DB": "assets/cosmosdb-original.svg",
    Python: "assets/python-original.svg",
    YOLO: "assets/yolo.svg",
    OpenCV: "assets/opencv-original.svg",
    "EVE-NG": "assets/eveng-original.svg",
    "Cisco IOS": "assets/cisco-original.svg",
    FortiGate: "assets/fortigate-original.svg",
    "Palo Alto": "assets/paloalto-original.svg",
    VPython: "assets/python-original.svg",
    Pygame: "assets/python-original.svg"
  };
  const STATUS = {
    deployed: "Deployed",
    documented: "Documented",
    active: "Active",
    planned: "Planned",
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  document.title = project.title + " | Israel Odunaiya";

  const tags = (project.technologies || [])
    .map(function (tech) {
      const icon = TECH_ICONS[tech.name]
        ? `<img src="${escapeHtml(prefix + TECH_ICONS[tech.name])}" alt="" width="16" height="16">`
        : "";
      return `<li tabindex="0" style="--tech-brand: ${escapeHtml(tech.brand)}">${icon}${escapeHtml(tech.name)}</li>`;
    })
    .join("");

  const actions = [];
  if (project.liveUrl) {
    actions.push(
      `<a class="project-detail__btn project-detail__btn--primary" href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer">Live Demo <i class="bx bx-link-external" aria-hidden="true"></i></a>`
    );
  }
  if (project.repositoryUrl) {
    actions.push(
      `<a class="project-detail__btn" href="${escapeHtml(project.repositoryUrl)}" target="_blank" rel="noopener noreferrer"><i class="bx bxl-github" aria-hidden="true"></i> GitHub</a>`
    );
  }

  const shot = project.image
    ? `<img src="${escapeHtml(prefix + project.image)}" alt="${escapeHtml(project.imageAlt)}" width="960" height="600">`
    : `<div class="project-detail__placeholder"><i class="bx ${escapeHtml(project.placeholderIcon || "bx-code-alt")}" aria-hidden="true"></i><span>${escapeHtml(project.title)}</span></div>`;

  const cards = [];
  cards.push(`<article class="project-detail__card">
    <div class="project-detail__card-head">
      <span class="project-detail__icon" aria-hidden="true"><i class="bx bx-code-alt"></i></span>
      <h2>What I Built</h2>
    </div>
    <p>${escapeHtml(project.summary)}</p>
  </article>`);

  if (project.features && project.features.length) {
    cards.push(`<article class="project-detail__card">
      <div class="project-detail__card-head">
        <span class="project-detail__icon" aria-hidden="true"><i class="bx bx-star"></i></span>
        <h2>Key Features</h2>
      </div>
      <ul>${project.features.map(function (item) {
        return `<li>${escapeHtml(item)}</li>`;
      }).join("")}</ul>
    </article>`);
  }

  const withPages = projects.filter(function (item) {
    return item.caseStudyUrl;
  });
  const index = withPages.findIndex(function (item) {
    return item.slug === project.slug;
  });
  const next = withPages[(index + 1) % withPages.length];

  root.innerHTML = `
    <p class="project-detail__crumb"><a href="/projects/">Projects</a> / ${escapeHtml(project.title)}</p>
    <div class="project-detail__hero">
      <div>
        <p class="project-detail__eyebrow">${escapeHtml(project.eyebrow || "")}</p>
        <h1>${escapeHtml(project.title)}</h1>
        <p class="project-status project-status--${escapeHtml(project.status)}"><span aria-hidden="true"></span> ${escapeHtml(STATUS[project.status] || project.status)}</p>
        <ul class="project-detail__tags" aria-label="Technologies">${tags}</ul>
        <div class="project-detail__actions">${actions.join("")}</div>
      </div>
      <div class="project-detail__shot">${shot}</div>
    </div>
    <div class="project-detail__grid">${cards.join("")}</div>
    ${next && next.slug !== project.slug ? `<p class="project-detail__next"><a href="${escapeHtml(next.caseStudyUrl)}">Next: ${escapeHtml(next.title)} →</a></p>` : ""}
  `;
})();
