(function () {
  "use strict";

  const root = document.getElementById("experience-accordion");
  const evidence = document.getElementById("experience-evidence");
  const evidenceHome = document.getElementById("experience-evidence-home");
  const evidenceStatus = document.getElementById("experience-evidence-status");
  if (!root || !evidence || !evidenceHome) return;

  const sections = [
    {
      id: "degree-overview",
      title: "Degree Overview",
      icon: "bxs-graduation",
      technologies: ["Computer Science", "Physics minor", "2021–2025"],
      paragraphs: [
        "Completed a Bachelor of Science in Computer Science with a Physics minor at Ontario Tech University from September 2021 through June 2025.",
        "The program connected computing foundations with mathematical reasoning, scientific modelling, and practical technical work."
      ],
      bullets: [
        "Computer Science developed the software, algorithms, systems, artificial intelligence, and cybersecurity foundation.",
        "The Physics minor extended that foundation through mathematical and computational modelling.",
        "Course artifacts demonstrate how those areas were applied, not just studied in isolation."
      ]
    },
    {
      id: "computer-science-foundation",
      title: "Computer Science Foundation",
      icon: "bx-code-alt",
      technologies: ["Algorithms", "Systems", "Software", "Data"],
      paragraphs: [
        "The Computer Science foundation covered how data is represented, how algorithms solve problems, how software is organized, and how systems are built and verified.",
        "Available artifacts range from algorithm implementations and C builds to computer vision, data visualization, and technical reports."
      ],
      bullets: [
        "Implemented merge sort, heap sort, depth-first search, longest common subsequence, and knapsack exercises.",
        "Organized systems work with C source, header boundaries, Makefiles, and terminal-based verification.",
        "Applied the foundation through software engineering, artificial intelligence, cybersecurity, and data-focused work."
      ]
    },
    {
      id: "physics-modelling",
      title: "Physics & Modelling",
      icon: "bx-orbit",
      technologies: ["Physics", "Python", "VPython", "RK4"],
      paragraphs: [
        "The Physics minor strengthened the mathematical and computational reasoning used to represent changing systems.",
        "Interstellar Cannon is the clearest completed artifact: an interactive simulation combining launch input, summed gravity, numerical integration, collision behavior, and real-time visual feedback."
      ],
      bullets: [
        "As main developer, I combined the project’s physics relationships into one simulation loop.",
        "A custom four-stage RK4 routine advances position and velocity under summed gravity.",
        "The implementation separates numerical updates from VPython input and scene rendering."
      ]
    },
    {
      id: "applied-projects",
      title: "Applied Projects",
      icon: "bx-cube-alt",
      technologies: ["Computer Vision", "Simulation", "R Analysis"],
      paragraphs: [
        "Selected academic projects turned theory into inspectable software and visual outputs across three different problem spaces.",
        "Football Tracking represents Computer Vision work, Interstellar Cannon represents simulation and modelling, and R Internet Analysis represents information visualization."
      ],
      bullets: [
        "Process match footage through a detection, tracking, and annotated-output pipeline.",
        "Translate physical relationships and user input into a live numerical simulation.",
        "Prepare mixed public datasets and communicate descriptive patterns through an R Markdown report."
      ]
    },
    {
      id: "carried-forward",
      title: "What I Carried Forward",
      icon: "bx-sparkles",
      technologies: ["Build", "Model", "Analyze", "Explain"],
      paragraphs: [
        "The degree established a practical way of working: break a problem into parts, choose an appropriate representation, implement it carefully, and evaluate what the output actually supports.",
        "Combining Computer Science and Physics made it natural to move between software structure, numerical behaviour, data evidence, and technical explanation."
      ],
      bullets: [
        "Build systems from smaller, testable components.",
        "Treat models and visualizations as evidence with assumptions and limits.",
        "Explain technical decisions in a form other people can inspect and use."
      ]
    }
  ];

  const mobileLayout = window.matchMedia("(max-width: 760px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeId = "computer-science-foundation";
  let evidenceTimer = 0;
  let evidenceToken = 0;

  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function renderTools(tools) {
    if (!tools.length) return "";
    return `<div class="record-evidence__tools"><span>Verified focus</span><ul>${tools.map(function (tool) {
      return `<li>${escapeHtml(tool)}</li>`;
    }).join("")}</ul></div>`;
  }

  function renderEvidenceFrame(view) {
    return `<div class="record-evidence__content">
      <div class="record-evidence__head"><div><p class="record-evidence__eyebrow">${escapeHtml(view.eyebrow)}</p><h2 id="experience-evidence-title">${escapeHtml(view.title)}</h2></div><span class="record-evidence__badge">${escapeHtml(view.badge)}</span></div>
      <p class="record-evidence__intro">${escapeHtml(view.intro)}</p>
      <div class="record-evidence__visual">${view.visual}</div>
      ${renderTools(view.tools || [])}
      <p class="record-evidence__privacy"><i class="bx bx-check-shield" aria-hidden="true"></i> Portfolio-safe academic evidence; no grades, student records, credentials, or private identifiers are shown.</p>
    </div>`;
  }

  function academicMap(defaultView) {
    const visual = `<div class="ontario-map" aria-label="Academic focus map">
      <div class="ontario-map__core"><span class="ontario-map__mark" aria-hidden="true"><i class="bx bxs-graduation"></i></span><div><strong>BSc Computer Science</strong><small>with a Physics minor</small></div></div>
      <div class="ontario-map__grid">
        <article><i class="bx bx-code-alt" aria-hidden="true"></i><strong>Build</strong><span>Software, algorithms, and systems</span></article>
        <article><i class="bx bx-orbit" aria-hidden="true"></i><strong>Model</strong><span>Physics and numerical behaviour</span></article>
        <article><i class="bx bx-data" aria-hidden="true"></i><strong>Analyze</strong><span>Prepare and visualize data</span></article>
        <article><i class="bx bx-book-open" aria-hidden="true"></i><strong>Explain</strong><span>Document methods and limits</span></article>
      </div>
      <div class="ontario-map__timeline"><span>Sep 2021</span><i aria-hidden="true"></i><span>Jun 2025</span></div>
    </div>`;
    return {
      eyebrow: defaultView ? "Education workspace" : "Degree evidence",
      title: defaultView ? "Evidence & Visuals" : "Academic map",
      badge: "Ontario Tech",
      intro: defaultView ? "Choose a theme to inspect verified coursework, technical artifacts, and the skills connecting them." : "The degree joined a Computer Science core with a Physics minor and applied both through code, models, analysis, and technical communication.",
      visual,
      tools: ["Computer Science", "Physics minor", "Sep 2021–Jun 2025"]
    };
  }

  function computerScienceEvidence() {
    const visual = `<div class="ontario-foundation">
      <article class="ontario-studio-card ontario-studio-card--code"><div class="ontario-studio-card__head"><span><i class="bx bx-code-block" aria-hidden="true"></i> Code & Systems</span><small>Python · C</small></div><pre aria-label="Verified algorithm and systems artifacts"><code>algorithms/
  merge_sort   heap_sort
  dfs          lcs
  knapsack

systems/
  source.c     headers
  Makefile     terminal output</code></pre><a href="/projects/football-tracking/">Explore applied code <i class="bx bx-right-arrow-alt" aria-hidden="true"></i></a></article>
      <article class="ontario-studio-card ontario-studio-card--visual"><div class="ontario-studio-card__head"><span><i class="bx bx-orbit" aria-hidden="true"></i> Math & Modelling</span><small>Simulation</small></div><a class="ontario-studio-card__preview" href="/projects/interstellar-cannon/" aria-label="Open the Interstellar Cannon simulation case study"><img src="../../assets/interstellar-cannon.png" width="1454" height="634" loading="lazy" decoding="async" alt=""><span>Gravity <i class="bx bx-right-arrow-alt" aria-hidden="true"></i> RK4 update <i class="bx bx-right-arrow-alt" aria-hidden="true"></i> rendered state</span></a><a href="/projects/interstellar-cannon/">View simulation evidence <i class="bx bx-right-arrow-alt" aria-hidden="true"></i></a></article>
      <article class="ontario-studio-card ontario-studio-card--visual"><div class="ontario-studio-card__head"><span><i class="bx bx-line-chart" aria-hidden="true"></i> Data & Visualization</span><small>R Markdown</small></div><a class="ontario-studio-card__preview" href="/projects/r-internet-analysis/" aria-label="Open the R Internet Analysis case study"><img src="../../assets/projects/r-internet-analysis/broadband-growth.png" width="1344" height="960" loading="lazy" decoding="async" alt=""><span>Prepared public data and descriptive output</span></a><a href="/projects/r-internet-analysis/">View analysis evidence <i class="bx bx-right-arrow-alt" aria-hidden="true"></i></a></article>
      <article class="ontario-studio-card ontario-studio-card--writing"><div class="ontario-studio-card__head"><span><i class="bx bx-book-open" aria-hidden="true"></i> Technical Writing</span><small>R Markdown · LaTeX</small></div><div class="ontario-writing-preview"><img src="../../assets/latex.svg" width="32" height="32" alt="" aria-hidden="true"><div><code>methods</code><code>assumptions</code><code>results</code><code>limitations</code></div></div><p>Technical output is paired with methods, observations, assumptions, and limits.</p><a href="https://github.com/Odunsegun/R-Internet-Analysis" target="_blank" rel="noopener noreferrer">View R / R Markdown source <i class="bx bx-link-external" aria-hidden="true"></i></a></article>
    </div>`;
    return { eyebrow: "Foundation workspace", title: "From fundamentals to evidence", badge: "Verified artifacts", intro: "The foundation is represented by real implementation, systems, modelling, visualization, and writing artifacts rather than a generated course list.", visual, tools: ["Algorithms", "C systems", "Software", "Data", "Documentation"] };
  }

  function physicsEvidence() {
    const visual = `<div class="ontario-feature">
      <figure class="ontario-feature__media"><img src="../../assets/interstellar-cannon.png" width="1454" height="634" loading="lazy" decoding="async" alt="Interstellar Cannon VPython scene with the Sun, labelled planets, asteroid field, rocket trail, and live speed display."><figcaption>Verified VPython runtime from the completed course simulation.</figcaption></figure>
      <div class="ontario-process" aria-label="Interstellar Cannon modelling workflow">
        <article><i class="bx bx-mouse-alt" aria-hidden="true"></i><span><strong>Launch input</strong><small>Direction and power</small></span></article><i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
        <article><i class="bx bx-math" aria-hidden="true"></i><span><strong>Physics state</strong><small>Summed gravity</small></span></article><i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
        <article><i class="bx bx-git-branch" aria-hidden="true"></i><span><strong>RK4 update</strong><small>Position and velocity</small></span></article><i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
        <article><i class="bx bx-cube" aria-hidden="true"></i><span><strong>Scene output</strong><small>Trail and feedback</small></span></article>
      </div><a class="ontario-feature__link" href="/projects/interstellar-cannon/">Explore the complete simulation case study <i class="bx bx-right-arrow-alt" aria-hidden="true"></i></a>
    </div>`;
    return { eyebrow: "Physics & modelling", title: "Equations into a working simulation", badge: "Main developer", intro: "Interstellar Cannon demonstrates the bridge between physical relationships, a numerical update method, and an interactive rendered system.", visual, tools: ["Python", "VPython", "NumPy", "Custom RK4"] };
  }

  function artifactCard(config) {
    return `<a class="ontario-artifact" href="${escapeHtml(config.href)}"><span class="ontario-artifact__media"><img src="${escapeHtml(config.src)}" width="${escapeHtml(config.width)}" height="${escapeHtml(config.height)}" loading="lazy" decoding="async" alt="${escapeHtml(config.alt)}"></span><span class="ontario-artifact__body"><small>${escapeHtml(config.category)}</small><strong>${escapeHtml(config.title)}</strong><span>${escapeHtml(config.summary)}</span><em>View case study <i class="bx bx-right-arrow-alt" aria-hidden="true"></i></em></span></a>`;
  }

  function appliedProjectsEvidence() {
    const visual = `<div class="ontario-artifacts">
      ${artifactCard({ href: "/projects/football-tracking/", src: "../../assets/ML-photo.png", width: "1125", height: "750", alt: "Annotated football frame with tracked identities and movement labels.", category: "Computer Vision", title: "Football Tracking", summary: "Detection, tracking, spatial processing, and annotated video output." })}
      ${artifactCard({ href: "/projects/interstellar-cannon/", src: "../../assets/interstellar-cannon.png", width: "1454", height: "634", alt: "Interstellar Cannon VPython simulation scene.", category: "Simulation & Modelling", title: "Interstellar Cannon", summary: "Mouse-directed launch input, gravity, RK4 integration, and visual feedback." })}
      ${artifactCard({ href: "/projects/r-internet-analysis/", src: "../../assets/projects/r-internet-analysis/broadband-growth.png", width: "1344", height: "960", alt: "Broadband subscriptions scatter plot with yearly arithmetic averages.", category: "Information Visualization", title: "R Internet Analysis", summary: "Public-data preparation, joining, descriptive visualization, and reporting." })}
    </div>`;
    return { eyebrow: "Applied work", title: "Three disciplines, three artifacts", badge: "Real project output", intro: "Each artifact shows a different way the academic foundation became working software or an inspectable technical result.", visual, tools: ["Computer Vision", "Simulation", "Information Visualization"] };
  }

  function carriedForwardEvidence() {
    const visual = `<div class="ontario-synthesis">
      <div class="ontario-synthesis__path" aria-label="Problem-solving approach"><span><i class="bx bx-search-alt" aria-hidden="true"></i><strong>Understand</strong><small>Question and constraints</small></span><i class="bx bx-right-arrow-alt" aria-hidden="true"></i><span><i class="bx bx-shape-square" aria-hidden="true"></i><strong>Represent</strong><small>Data, model, or system</small></span><i class="bx bx-right-arrow-alt" aria-hidden="true"></i><span><i class="bx bx-code-alt" aria-hidden="true"></i><strong>Build</strong><small>Small inspectable parts</small></span><i class="bx bx-right-arrow-alt" aria-hidden="true"></i><span><i class="bx bx-check-double" aria-hidden="true"></i><strong>Evaluate</strong><small>Evidence and limits</small></span></div>
      <div class="ontario-synthesis__grid"><article><i class="bx bx-layer" aria-hidden="true"></i><strong>Systems thinking</strong><p>Trace how components, data, and control affect one another.</p></article><article><i class="bx bx-target-lock" aria-hidden="true"></i><strong>Model-aware engineering</strong><p>Keep assumptions visible when software represents a physical or measured system.</p></article><article><i class="bx bx-message-square-detail" aria-hidden="true"></i><strong>Technical clarity</strong><p>Pair implementation with documentation that makes the result understandable.</p></article></div>
    </div>`;
    return { eyebrow: "Cross-disciplinary synthesis", title: "A reusable way of solving problems", badge: "Carried forward", intro: "The lasting value is a repeatable process that works across software, simulations, and data—not a disconnected list of course topics.", visual, tools: ["Problem decomposition", "Modelling", "Implementation", "Evaluation"] };
  }

  function getEvidenceView(id) {
    switch (id) {
      case "degree-overview": return academicMap(false);
      case "computer-science-foundation": return computerScienceEvidence();
      case "physics-modelling": return physicsEvidence();
      case "applied-projects": return appliedProjectsEvidence();
      case "carried-forward": return carriedForwardEvidence();
      default: return academicMap(true);
    }
  }

  function renderAccordion() {
    root.innerHTML = sections.map(function (section) {
      const open = section.id === activeId;
      const badges = section.technologies.map(function (technology) { return `<span class="exp-badge">${escapeHtml(technology)}</span>`; }).join("");
      const paragraphs = section.paragraphs.map(function (paragraph) { return `<p>${escapeHtml(paragraph)}</p>`; }).join("");
      const bullets = `<ul>${section.bullets.map(function (bullet) { return `<li>${escapeHtml(bullet)}</li>`; }).join("")}</ul>`;
      return `<section class="experience-accordion__item${open ? " is-open" : ""}" data-section-id="${escapeHtml(section.id)}"><div class="experience-accordion__bar"><h2><button type="button" class="experience-accordion__trigger" aria-expanded="${open ? "true" : "false"}" aria-controls="${escapeHtml(section.id)}-panel" id="${escapeHtml(section.id)}-trigger" data-id="${escapeHtml(section.id)}"><span class="experience-accordion__icon" aria-hidden="true"><i class="bx ${escapeHtml(section.icon)}"></i></span><span class="experience-accordion__title">${escapeHtml(section.title)}</span><i class="bx bx-chevron-down experience-accordion__chevron" aria-hidden="true"></i></button></h2><div class="experience-accordion__badges" aria-label="Related technologies and topics">${badges}</div></div><div id="${escapeHtml(section.id)}-panel" class="experience-accordion__panel${open ? " is-open" : ""}" role="region" aria-labelledby="${escapeHtml(section.id)}-trigger" ${open ? "" : "hidden"}><div class="experience-accordion__panel-inner">${paragraphs}${bullets}</div></div></section><div class="experience-record__mobile-evidence-slot" data-evidence-slot="${escapeHtml(section.id)}"></div>`;
    }).join("");
  }

  function setPanelState(item, open, animate) {
    const trigger = item.querySelector(".experience-accordion__trigger");
    const panel = item.querySelector(".experience-accordion__panel");
    if (!trigger || !panel) return;
    window.clearTimeout(panel._experienceHideTimer);
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    item.classList.toggle("is-open", open);
    if (open) {
      panel.hidden = false;
      if (!animate || reducedMotion.matches) panel.classList.add("is-open");
      else window.requestAnimationFrame(function () { panel.classList.add("is-open"); });
      return;
    }
    panel.classList.remove("is-open");
    if (!animate || reducedMotion.matches) panel.hidden = true;
    else panel._experienceHideTimer = window.setTimeout(function () { if (trigger.getAttribute("aria-expanded") === "false") panel.hidden = true; }, 240);
  }

  function placeEvidence() {
    if (mobileLayout.matches && activeId) {
      const slot = root.querySelector(`[data-evidence-slot="${activeId}"]`);
      if (slot) slot.append(evidence);
      evidence.classList.add("record-evidence--inline");
    } else {
      evidenceHome.append(evidence);
      evidence.classList.remove("record-evidence--inline");
    }
  }

  function commitEvidence(id, announce) {
    const view = getEvidenceView(id);
    evidence.innerHTML = renderEvidenceFrame(view);
    evidence.dataset.evidenceFor = id || "default";
    evidence.setAttribute("aria-busy", "false");
    evidence.classList.remove("is-changing");
    if (announce && evidenceStatus) evidenceStatus.textContent = `Evidence updated: ${view.title}.`;
  }

  function updateEvidence(id, options) {
    const settings = options || {};
    const announce = settings.announce !== false;
    const animate = settings.animate !== false && !reducedMotion.matches;
    const token = ++evidenceToken;
    window.clearTimeout(evidenceTimer);
    if (!animate || !evidence.firstElementChild) return commitEvidence(id, announce);
    evidence.setAttribute("aria-busy", "true");
    evidence.classList.add("is-changing");
    evidenceTimer = window.setTimeout(function () { if (token === evidenceToken) commitEvidence(id, announce); }, 90);
  }

  function setOpen(id, options) {
    const settings = options || {};
    activeId = sections.some(function (section) { return section.id === id; }) ? id : null;
    root.querySelectorAll(".experience-accordion__item").forEach(function (item) { setPanelState(item, item.dataset.sectionId === activeId, settings.animate !== false); });
    placeEvidence();
    updateEvidence(activeId, settings);
  }

  renderAccordion();
  placeEvidence();
  updateEvidence(activeId, { animate: false, announce: false });

  root.addEventListener("click", function (event) {
    const trigger = event.target.closest(".experience-accordion__trigger");
    if (trigger && root.contains(trigger)) setOpen(activeId === trigger.dataset.id ? null : trigger.dataset.id, { animate: true, announce: true });
  });

  root.addEventListener("keydown", function (event) {
    const triggers = Array.from(root.querySelectorAll(".experience-accordion__trigger"));
    const current = event.target.closest(".experience-accordion__trigger");
    const index = triggers.indexOf(current);
    if (index < 0) return;
    let nextIndex = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (index + 1) % triggers.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (index - 1 + triggers.length) % triggers.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = triggers.length - 1;
    else if (event.key === "Escape" && activeId) {
      event.preventDefault();
      setOpen(null, { animate: true, announce: true });
      current.focus();
      return;
    } else return;
    event.preventDefault();
    triggers[nextIndex].focus();
  });

  const handleLayoutChange = function () { placeEvidence(); };
  if (typeof mobileLayout.addEventListener === "function") mobileLayout.addEventListener("change", handleLayoutChange);
  else mobileLayout.addListener(handleLayoutChange);
})();
