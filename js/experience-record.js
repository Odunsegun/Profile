(function () {
  const root = document.getElementById("experience-accordion");
  const evidence = document.getElementById("experience-evidence");
  const evidenceHome = document.getElementById("experience-evidence-home");
  const evidenceStatus = document.getElementById("experience-evidence-status");
  const record = window.CONSTELLATION_RECORD;

  if (!root || !evidence || !evidenceHome || !record) return;

  const sectionOrder = [
    "overview",
    "api-contract-work",
    "testing-verification",
    "import-export",
    "debugging-docs",
  ];
  const sections = sectionOrder
    .map(function (id) {
      return record.sections.find(function (section) {
        return section.id === id;
      });
    })
    .filter(Boolean);
  const mobileLayout = window.matchMedia("(max-width: 760px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const initialSection = sections.some(function (section) {
    return section.id === "api-contract-work";
  })
    ? "api-contract-work"
    : sections[0]?.id || null;

  let activeId = initialSection;
  let evidenceTimer = 0;
  let evidenceToken = 0;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderFlow(steps, modifier) {
    return `<div class="record-flow${modifier ? ` ${modifier}` : ""}">
      ${steps
        .map(function (step, index) {
          const connector =
            index < steps.length - 1
              ? `<span class="record-flow__connector" aria-hidden="true"><i class="bx bx-right-arrow-alt"></i></span>`
              : "";

          return `<article class="record-flow__step">
            <span class="record-flow__icon" aria-hidden="true"><i class="bx ${escapeHtml(step.icon)}"></i></span>
            <h3>${escapeHtml(step.title)}</h3>
            <p>${escapeHtml(step.text)}</p>
          </article>${connector}`;
        })
        .join("")}
    </div>`;
  }

  function renderTools(tools) {
    if (!tools.length) return "";

    return `<div class="record-evidence__tools">
      <span>Tools and practices</span>
      <ul>
        ${tools
          .map(function (tool) {
            return `<li>${escapeHtml(tool)}</li>`;
          })
          .join("")}
      </ul>
    </div>`;
  }

  function renderEvidenceFrame(view) {
    return `<div class="record-evidence__content">
      <div class="record-evidence__head">
        <div>
          <p class="record-evidence__eyebrow">${escapeHtml(view.eyebrow)}</p>
          <h2 id="experience-evidence-title">${escapeHtml(view.title)}</h2>
        </div>
        <span class="record-evidence__badge">${escapeHtml(view.badge)}</span>
      </div>
      <p class="record-evidence__intro">${escapeHtml(view.intro)}</p>
      <div class="record-evidence__visual">${view.visual}</div>
      ${renderTools(view.tools || [])}
      <p class="record-evidence__privacy"><i class="bx bx-shield-quarter" aria-hidden="true"></i> Sanitized conceptual evidence—no internal code, routes, customer data, or private system details.</p>
    </div>`;
  }

  function internshipScopeEvidence(isDefault) {
    const visual = `<div class="record-scope">
      <div class="record-scope__context">
        <span>Established enterprise platform</span>
        <p>Contributions were made within existing application contracts and development workflows.</p>
      </div>
      ${renderFlow(
        [
          { icon: "bx-code-alt", title: "API work", text: "Understand and validate contracts." },
          { icon: "bx-cog", title: "Application services", text: "Work with existing handlers and behaviour." },
          { icon: "bx-check-shield", title: "Automated testing", text: "Verify workflows across appropriate layers." },
          { icon: "bx-book-open", title: "Documented behaviour", text: "Leave repeatable technical evidence." },
        ],
        "record-flow--scope"
      )}
    </div>`;

    return {
      eyebrow: isDefault ? "Record overview" : "Selected work area",
      title: isDefault ? "Evidence · Internship scope" : "Evidence · Contribution map",
      badge: "Sanitized overview",
      intro: isDefault
        ? "Select a work area to inspect a portfolio-safe representation of that contribution."
        : "A high-level view of how API, service, testing, and documentation work supported reliable behaviour in an existing product.",
      visual,
      tools: ["REST APIs", "Automated testing", "Workflow automation", "Documentation"],
    };
  }

  function apiEvidence() {
    const visual = `<div class="record-api" aria-label="Sanitized generic API contract example">
      <div class="record-api__examples">
        <article class="record-request">
          <div class="record-request__topline">
            <span class="record-method record-method--get">GET</span>
            <code>/v1/items</code>
            <span>Generic route</span>
          </div>
          <div class="record-request__body">
            <div>
              <h3>Query parameters</h3>
              <dl class="record-contract-list">
                <div><dt>limit</dt><dd>integer</dd></div>
                <div><dt>status</dt><dd>string</dd></div>
              </dl>
            </div>
            <div>
              <h3>Example success response</h3>
              <pre><code>{
  "items": [
    { "id": "item_123", "name": "Item" }
  ]
}</code></pre>
            </div>
          </div>
        </article>
        <article class="record-request">
          <div class="record-request__topline">
            <span class="record-method record-method--post">POST</span>
            <code>/v1/items</code>
            <span>Generic route</span>
          </div>
          <div class="record-request__body">
            <div>
              <h3>Example request body</h3>
              <pre><code>{
  "name": "Item",
  "status": "active"
}</code></pre>
            </div>
            <div>
              <h3>Example success response</h3>
              <pre><code>{
  "id": "item_123",
  "name": "Item",
  "status": "active"
}</code></pre>
            </div>
          </div>
        </article>
      </div>
      ${renderFlow(
        [
          { icon: "bx-file", title: "Contract", text: "Define methods and schemas." },
          { icon: "bx-cog", title: "Handler", text: "Connect to existing services." },
          { icon: "bx-shield-quarter", title: "Validation", text: "Check input and expected errors." },
          { icon: "bx-check-circle", title: "Test", text: "Verify documented behaviour." },
        ],
        "record-flow--compact"
      )}
    </div>`;

    return {
      eyebrow: "Selected work area",
      title: "Evidence · API contracts",
      badge: "Sanitized example",
      intro: "A generic contract view showing the request, response, validation, and handler relationships used when reasoning about API behaviour.",
      visual,
      tools: ["Swagger / OpenAPI", "NestJS", "REST APIs"],
    };
  }

  function testingEvidence() {
    const visual = `<div class="record-verification">
      ${renderFlow(
        [
          { icon: "bx-test-tube", title: "Unit tests", text: "Check focused application logic." },
          { icon: "bx-layer", title: "Integration tests", text: "Verify components work together." },
          { icon: "bx-window-alt", title: "End-to-end checks", text: "Exercise user-facing workflows." },
          { icon: "bx-clipboard", title: "Evidence", text: "Record reproducible outcomes." },
        ],
        "record-flow--verification"
      )}
      <div class="record-verification__grid">
        <article><span class="record-verification__mark" aria-hidden="true"><i class="bx bx-code-block"></i></span><div><h3>Contract behaviour</h3><p>Expected schemas, responses, and validation paths.</p></div><span class="record-verification__tool">Jest</span></article>
        <article><span class="record-verification__mark" aria-hidden="true"><i class="bx bx-error-circle"></i></span><div><h3>Failure investigation</h3><p>Separate application defects from test-data or environment issues.</p></div><span class="record-verification__tool">Verification</span></article>
        <article><span class="record-verification__mark" aria-hidden="true"><i class="bx bx-window"></i></span><div><h3>Browser workflows</h3><p>Capture repeatable evidence for user-facing behaviour.</p></div><span class="record-verification__tool">Playwright</span></article>
      </div>
    </div>`;

    return {
      eyebrow: "Selected work area",
      title: "Evidence · Verification flow",
      badge: "Sanitized workflow",
      intro: "Verification moved from focused logic checks through connected workflows, with failed checks investigated before conclusions were recorded.",
      visual,
      tools: ["Jest", "Playwright", "Unit testing", "Integration testing", "End-to-end testing"],
    };
  }

  function importExportEvidence() {
    const visual = `<div class="record-workflow">
      ${renderFlow(
        [
          { icon: "bx-select-multiple", title: "Choose operation", text: "Select an export mode or import action." },
          { icon: "bx-check-shield", title: "Validate", text: "Check file and request conditions." },
          { icon: "bx-data", title: "Process records", text: "Apply the supported workflow." },
          { icon: "bx-detail", title: "Review session", text: "Inspect completed or error states." },
        ],
        "record-flow--workflow"
      )}
      <div class="record-workflow__details">
        <section>
          <h3><i class="bx bx-export" aria-hidden="true"></i> Export modes</h3>
          <ul><li>Blank Templates</li><li>Selected Records</li><li>Current View</li><li>All Filtered Records</li></ul>
        </section>
        <section>
          <h3><i class="bx bx-import" aria-hidden="true"></i> Import actions</h3>
          <ul><li>Create</li><li>Update</li><li>Delete</li></ul>
        </section>
        <section>
          <h3><i class="bx bx-history" aria-hidden="true"></i> Session review</h3>
          <ul><li>Completed</li><li>Errors</li><li>Multiple-file handling</li><li>File-size rules</li></ul>
        </section>
      </div>
    </div>`;

    return {
      eyebrow: "Selected work area",
      title: "Evidence · Import/export workflow",
      badge: "Sanitized workflow",
      intro: "A conceptual view of the supported operation, validation, processing, and session-review stages without exposing records or internal filenames.",
      visual,
      tools: ["REST APIs", "Reusable workflows", "Session validation"],
    };
  }

  function debuggingEvidence() {
    const visual = `<div class="record-debugging">
      ${renderFlow(
        [
          { icon: "bx-revision", title: "Reproduce", text: "Establish consistent steps." },
          { icon: "bx-search-alt", title: "Isolate", text: "Narrow the affected layer." },
          { icon: "bx-file-find", title: "Compare contract", text: "Check expected against observed behaviour." },
          { icon: "bx-check-double", title: "Validate fix", text: "Repeat the relevant checks." },
          { icon: "bx-book-content", title: "Document result", text: "Leave reusable guidance and evidence." },
        ],
        "record-flow--debugging"
      )}
      <div class="record-debugging__notes">
        <div><span aria-hidden="true"><i class="bx bx-list-check"></i></span><p><strong>Reproduction notes</strong> keep the investigation repeatable.</p></div>
        <div><span aria-hidden="true"><i class="bx bx-git-compare"></i></span><p><strong>Contract comparison</strong> separates expected behaviour from assumptions.</p></div>
        <div><span aria-hidden="true"><i class="bx bx-book-open"></i></span><p><strong>Technical documentation</strong> records validation steps without exposing private details.</p></div>
      </div>
    </div>`;

    return {
      eyebrow: "Selected work area",
      title: "Evidence · Reproducible debugging",
      badge: "Sanitized sequence",
      intro: "A repeatable investigation path for understanding application behaviour, isolating issues, validating changes, and documenting the result.",
      visual,
      tools: ["Azure DevOps", "Swagger / OpenAPI", "Automated tests", "Documentation"],
    };
  }

  function getEvidenceView(id) {
    switch (id) {
      case "overview":
        return internshipScopeEvidence(false);
      case "api-contract-work":
        return apiEvidence();
      case "testing-verification":
        return testingEvidence();
      case "import-export":
        return importExportEvidence();
      case "debugging-docs":
        return debuggingEvidence();
      default:
        return internshipScopeEvidence(true);
    }
  }

  function renderAccordion() {
    root.innerHTML = sections
      .map(function (section) {
        const open = section.id === activeId;
        const badges = (section.technologies || [])
          .map(function (tech) {
            const description = tech.used
              ? ` aria-label="${escapeHtml(`${tech.name}: ${tech.used}`)}" title="${escapeHtml(tech.used)}"`
              : "";
            return `<span class="exp-badge"${description} style="--tech-brand: ${escapeHtml(tech.brand)}">${escapeHtml(tech.name)}</span>`;
          })
          .join("");
        const paragraphs = (section.paragraphs || [])
          .map(function (paragraph) {
            return `<p>${escapeHtml(paragraph)}</p>`;
          })
          .join("");
        const bullets = (section.bullets || []).length
          ? `<ul>${section.bullets
              .map(function (bullet) {
                return `<li>${escapeHtml(bullet)}</li>`;
              })
              .join("")}</ul>`
          : "";

        return `<section class="experience-accordion__item${open ? " is-open" : ""}" data-section-id="${escapeHtml(section.id)}">
          <div class="experience-accordion__bar">
            <h2>
              <button
                type="button"
                class="experience-accordion__trigger"
                aria-expanded="${open ? "true" : "false"}"
                aria-controls="${escapeHtml(section.id)}-panel"
                id="${escapeHtml(section.id)}-trigger"
                data-id="${escapeHtml(section.id)}"
              >
                <span class="experience-accordion__icon" aria-hidden="true"><i class="bx ${escapeHtml(section.icon)}"></i></span>
                <span class="experience-accordion__title">${escapeHtml(section.title)}</span>
                <i class="bx bx-chevron-down experience-accordion__chevron" aria-hidden="true"></i>
              </button>
            </h2>
            <div class="experience-accordion__badges" aria-label="Related technologies and topics">${badges}</div>
          </div>
          <div
            id="${escapeHtml(section.id)}-panel"
            class="experience-accordion__panel${open ? " is-open" : ""}"
            role="region"
            aria-labelledby="${escapeHtml(section.id)}-trigger"
            ${open ? "" : "hidden"}
          >
            <div class="experience-accordion__panel-inner">
              ${paragraphs}
              ${bullets}
            </div>
          </div>
        </section>
        <div class="experience-record__mobile-evidence-slot" data-evidence-slot="${escapeHtml(section.id)}"></div>`;
      })
      .join("");
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
      if (!animate || reducedMotion.matches) {
        panel.classList.add("is-open");
      } else {
        window.requestAnimationFrame(function () {
          panel.classList.add("is-open");
        });
      }
      return;
    }

    panel.classList.remove("is-open");
    if (!animate || reducedMotion.matches) {
      panel.hidden = true;
      return;
    }

    panel._experienceHideTimer = window.setTimeout(function () {
      if (trigger.getAttribute("aria-expanded") === "false") panel.hidden = true;
    }, 240);
  }

  function placeEvidence() {
    if (mobileLayout.matches && activeId) {
      const slot = root.querySelector(`[data-evidence-slot="${activeId}"]`);
      if (slot) slot.append(evidence);
      evidence.classList.add("record-evidence--inline");
      return;
    }

    evidenceHome.append(evidence);
    evidence.classList.remove("record-evidence--inline");
  }

  function commitEvidence(id, announce) {
    const view = getEvidenceView(id);
    evidence.innerHTML = renderEvidenceFrame(view);
    evidence.dataset.evidenceFor = id || "default";
    evidence.setAttribute("aria-busy", "false");
    evidence.classList.remove("is-changing");

    if (announce && evidenceStatus) {
      evidenceStatus.textContent = `Evidence updated: ${view.title.replace(/^Evidence · /, "")}.`;
    }
  }

  function updateEvidence(id, options) {
    const settings = options || {};
    const announce = settings.announce !== false;
    const animate = settings.animate !== false && !reducedMotion.matches;
    evidenceToken += 1;
    const token = evidenceToken;
    window.clearTimeout(evidenceTimer);

    if (!animate || !evidence.firstElementChild) {
      commitEvidence(id, announce);
      return;
    }

    evidence.setAttribute("aria-busy", "true");
    evidence.classList.add("is-changing");
    evidenceTimer = window.setTimeout(function () {
      if (token !== evidenceToken) return;
      commitEvidence(id, announce);
    }, 90);
  }

  function setOpen(id, options) {
    const settings = options || {};
    const nextId = sections.some(function (section) {
      return section.id === id;
    })
      ? id
      : null;

    activeId = nextId;
    root.querySelectorAll(".experience-accordion__item").forEach(function (item) {
      setPanelState(item, item.dataset.sectionId === activeId, settings.animate !== false);
    });
    placeEvidence();
    updateEvidence(activeId, settings);
  }

  renderAccordion();
  placeEvidence();
  updateEvidence(activeId, { animate: false, announce: false });

  root.addEventListener("click", function (event) {
    const trigger = event.target.closest(".experience-accordion__trigger");
    if (!trigger || !root.contains(trigger)) return;

    const id = trigger.dataset.id;
    setOpen(activeId === id ? null : id, { animate: true, announce: true });
  });

  root.addEventListener("keydown", function (event) {
    const triggers = Array.from(root.querySelectorAll(".experience-accordion__trigger"));
    const current = event.target.closest(".experience-accordion__trigger");
    const index = triggers.indexOf(current);
    if (index < 0) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      current.click();
      return;
    }

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

  const handleLayoutChange = function () {
    placeEvidence();
  };

  if (typeof mobileLayout.addEventListener === "function") {
    mobileLayout.addEventListener("change", handleLayoutChange);
  } else {
    mobileLayout.addListener(handleLayoutChange);
  }
})();
