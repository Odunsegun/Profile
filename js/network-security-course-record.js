(function () {
  "use strict";

  const root = document.getElementById("experience-accordion");
  const evidence = document.getElementById("experience-evidence");
  const evidenceHome = document.getElementById("experience-evidence-home");
  const evidenceStatus = document.getElementById("experience-evidence-status");
  if (!root || !evidence || !evidenceHome) return;

  const sections = [
    {
      id: "program-overview",
      title: "Program Overview",
      icon: "bx-book-open",
      technologies: ["Mentorship", "Practical Labs", "Portfolio Application"],
      paragraphs: [
        "Course-style network and security mentorship with a professional through Maroof Ltd. from September 2025 through August 2026, progressing from core concepts into guided configuration, troubleshooting, and an EVE-NG lab."
      ],
      bullets: [
        "Professional mentorship rather than employment or a certification.",
        "Practised diagrams, configuration checks, and repeatable validation.",
        "Applied the training in the Enterprise Network Security Lab portfolio project."
      ]
    },
    {
      id: "network-fundamentals",
      title: "Network Fundamentals",
      icon: "bx-network-chart",
      technologies: ["Addressing", "Protocols", "Segmentation"],
      paragraphs: [
        "Built the foundation for reading and troubleshooting a network: addressing, protocol roles, device relationships, and the boundary between local and routed traffic.",
        "Diagrams and focused checks were used to connect abstract concepts to the behaviour of connected hosts and network devices."
      ],
      bullets: [
        "Read addressing and subnet relationships without exposing private lab values.",
        "Related common protocol and device responsibilities to observed connectivity behaviour.",
        "Used segmentation as a practical way to reason about scope and traffic paths."
      ]
    },
    {
      id: "switching-routing",
      title: "Switching & Routing",
      icon: "bx-transfer-alt",
      technologies: ["Cisco", "VLANs", "802.1Q"],
      paragraphs: [
        "Practised how access ports, trunks, VLAN membership, and gateway paths work together in a segmented network.",
        "The associated lab includes Cisco switching and an 802.1Q path carrying departmental VLANs toward the gateway."
      ],
      bullets: [
        "Separated the verified HQ departments into dedicated access VLANs.",
        "Checked trunk and gateway relationships when tracing connectivity faults.",
        "Kept addressing examples sanitized and limited to the documented lab scope."
      ]
    },
    {
      id: "security-firewalls",
      title: "Security & Firewalls",
      icon: "bx-shield-quarter",
      technologies: ["FortiGate", "VLAN Gateways", "DHCP"],
      paragraphs: [
        "Studied how firewall interfaces, zones, DHCP services, and policy boundaries shape the path between segmented networks.",
        "The verified lab path uses FortiGate gateway and DHCP services; Palo Alto is referenced only as a platform visible in the sanitized topology."
      ],
      bullets: [
        "Mapped departmental VLANs to gateway interfaces and expected client scope.",
        "Compared expected gateway and DHCP state with client checks to separate an access issue from a gateway-path issue.",
        "No private credentials, sensitive addressing, or unsupported device results are included."
      ]
    },
    {
      id: "enterprise-lab",
      title: "Enterprise EVE-NG Lab",
      icon: "bx-chip",
      technologies: ["EVE-NG", "Cisco", "FortiGate"],
      paragraphs: [
        "Applied the learning in a sanitized enterprise lab with HQ, branch, and partner zones.",
        "The verified HQ phase covers departmental VLANs across Cisco switching, FortiGate gateway and DHCP services, and client connectivity checks."
      ],
      bullets: [
        "Used the topology to trace a path from client access through switching and gateway services.",
        "Validated the documented HQ segmentation path with client checks against local gateways.",
        "The image below is related lab evidence and does not establish a course credential or completion result."
      ]
    },
    {
      id: "verification-preparation",
      title: "Verification, Troubleshooting & Current Preparation",
      icon: "bx-check-shield",
      technologies: ["Path Checks", "Troubleshooting", "CCNA Preparation"],
      paragraphs: [
        "Troubleshooting was treated as a sequence of small checks: confirm the expected state, isolate the layer, then verify the path again.",
        "Current preparation continues through network and security review, with CCNA-oriented study used as a learning path rather than an earned certification claim."
      ],
      bullets: [
        "Checked interface, VLAN, gateway, DHCP, and client reachability conditions where documented.",
        "Recorded what a check established and what it did not establish.",
        "Certification status and test results are intentionally not claimed here."
      ]
    }
  ];

  const mobileLayout = window.matchMedia("(max-width: 760px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeId = "program-overview";
  let evidenceTimer = 0;
  let evidenceToken = 0;

  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  }

  function renderTools(tools) {
    return `<div class="record-evidence__tools"><span>Verified focus</span><ul>${tools.map(function (tool) {
      return `<li>${escapeHtml(tool)}</li>`;
    }).join("")}</ul></div>`;
  }

  function renderFlow(steps) {
    return `<div class="record-flow" aria-label="Evidence flow">${steps.map(function (step, index) {
      const connector = index < steps.length - 1 ? '<i class="bx bx-right-arrow-alt record-flow__connector" aria-hidden="true"></i>' : "";
      return `<div class="record-flow__step"><span class="record-flow__icon"><i class="bx ${escapeHtml(step.icon)}" aria-hidden="true"></i></span><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></div>${connector}`;
    }).join("")}</div>`;
  }

  function programOverviewVisual() {
    return `<div class="network-evidence-grid">
      <section class="network-panel" aria-labelledby="network-path-title">
        <h3 class="network-panel__title" id="network-path-title"><i class="bx bx-map-alt" aria-hidden="true"></i> Learning path</h3>
        <div class="network-path">
          <article class="network-path__step"><i class="bx bx-network-chart" aria-hidden="true"></i><strong>Understand</strong><small>Addressing, roles, and traffic scope</small></article>
          <article class="network-path__step"><i class="bx bx-transfer-alt" aria-hidden="true"></i><strong>Configure</strong><small>Access VLANs and tagged paths</small></article>
          <article class="network-path__step"><i class="bx bx-shield-quarter" aria-hidden="true"></i><strong>Apply</strong><small>Gateway and DHCP services in EVE-NG</small></article>
          <article class="network-path__step"><i class="bx bx-check-double" aria-hidden="true"></i><strong>Verify</strong><small>Trace faults and retest the path</small></article>
        </div>
        <a class="network-record-link" href="/projects/enterprise-network-security-lab/">Explore the related enterprise lab <i class="bx bx-right-arrow-alt" aria-hidden="true"></i></a>
      </section>
      <section class="network-panel" aria-labelledby="network-scope-title">
        <h3 class="network-panel__title" id="network-scope-title"><i class="bx bx-check-shield" aria-hidden="true"></i> Record scope</h3>
        <ul class="network-scope-list">
          <li><i class="bx bx-group" aria-hidden="true"></i><span><strong>Format</strong><span>Professional mentorship and practical training</span></span></li>
          <li><i class="bx bx-calendar" aria-hidden="true"></i><span><strong>Recorded period</strong><span>September 2025 to August 2026</span></span></li>
          <li><i class="bx bx-chip" aria-hidden="true"></i><span><strong>Portfolio outcome</strong><span>Enterprise Network Security Lab</span></span></li>
          <li><i class="bx bx-info-circle" aria-hidden="true"></i><span><strong>Credential boundary</strong><span>Not employment or a certification</span></span></li>
        </ul>
      </section>
    </div>`;
  }

  function networkFundamentalsVisual() {
    return `<div class="network-concept-grid">
      <section class="network-panel" aria-labelledby="network-concept-title">
        <h3 class="network-panel__title" id="network-concept-title"><i class="bx bx-sitemap" aria-hidden="true"></i> Reading a traffic path</h3>
        <div class="network-concept" aria-label="Conceptual client-to-destination traffic path">
          <div class="network-concept__node"><i class="bx bx-desktop" aria-hidden="true"></i><strong>Client</strong><small>Interface and assigned state</small></div>
          <div class="network-concept__node"><i class="bx bx-layer" aria-hidden="true"></i><strong>Local scope</strong><small>Address and subnet relationship</small></div>
          <div class="network-concept__node"><i class="bx bx-git-merge" aria-hidden="true"></i><strong>Switching</strong><small>Access segment and VLAN</small></div>
          <div class="network-concept__node"><i class="bx bx-router" aria-hidden="true"></i><strong>Gateway</strong><small>Boundary for routed traffic</small></div>
          <div class="network-concept__node"><i class="bx bx-target-lock" aria-hidden="true"></i><strong>Destination</strong><small>Expected service or endpoint</small></div>
        </div>
      </section>
      <section class="network-panel" aria-labelledby="network-checkpoints-title">
        <h3 class="network-panel__title" id="network-checkpoints-title"><i class="bx bx-list-check" aria-hidden="true"></i> Useful checkpoints</h3>
        <div class="network-check-list">
          <article class="network-check"><i class="bx bx-broadcast" aria-hidden="true"></i><span><strong>Link and client state</strong><small>Begin with what the host can observe locally.</small></span></article>
          <article class="network-check"><i class="bx bx-shape-square" aria-hidden="true"></i><span><strong>Segment membership</strong><small>Confirm the intended access scope before tracing farther.</small></span></article>
          <article class="network-check"><i class="bx bx-transfer" aria-hidden="true"></i><span><strong>Gateway path</strong><small>Use the local boundary as the next verification point.</small></span></article>
        </div>
      </section>
    </div>`;
  }

  function switchingRoutingVisual() {
    return `<div class="network-hq-map">
      <section class="network-panel" aria-labelledby="network-hq-title">
        <h3 class="network-panel__title" id="network-hq-title"><i class="bx bx-buildings" aria-hidden="true"></i> Verified HQ segmentation</h3>
        <div class="network-departments" aria-label="Four verified HQ department VLANs">
          <article class="network-department"><i class="bx bx-user" aria-hidden="true"></i><strong>Sales</strong><code>VLAN 5</code><small>2 clients</small></article>
          <article class="network-department"><i class="bx bx-bar-chart-alt-2" aria-hidden="true"></i><strong>Marketing</strong><code>VLAN 6</code><small>2 clients</small></article>
          <article class="network-department"><i class="bx bx-group" aria-hidden="true"></i><strong>HR</strong><code>VLAN 7</code><small>2 clients</small></article>
          <article class="network-department"><i class="bx bx-cog" aria-hidden="true"></i><strong>Admin</strong><code>VLAN 8</code><small>2 clients</small></article>
        </div>
      </section>
      <div class="network-device-path" aria-label="Verified switching and gateway path">
        <article class="network-device"><i class="bx bx-desktop" aria-hidden="true"></i><span><strong>Access ports</strong><small>Department VLAN membership</small></span></article>
        <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
        <article class="network-device"><img src="../../assets/cisco-original.svg" width="30" height="30" alt=""><span><strong>Cisco switching</strong><small>One verified tagged path</small></span></article>
        <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
        <article class="network-device"><img src="../../assets/fortigate-original.svg" width="30" height="30" alt=""><span><strong>FortiGate</strong><small>VLAN gateways and DHCP</small></span></article>
      </div>
      <span class="network-path-label">802.1Q carries VLANs 5&ndash;8</span>
    </div>`;
  }

  function securityFirewallsVisual() {
    return `<div class="network-security-grid">
      <section class="network-panel" aria-labelledby="network-boundary-title">
        <h3 class="network-panel__title" id="network-boundary-title"><i class="bx bx-shield-quarter" aria-hidden="true"></i> What the verified path establishes</h3>
        <div class="network-device-path" aria-label="Department to FortiGate service path">
          <article class="network-device"><i class="bx bx-layer" aria-hidden="true"></i><span><strong>Department VLAN</strong><small>Separate client scope</small></span></article>
          <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
          <article class="network-device"><img src="../../assets/fortigate-original.svg" width="30" height="30" alt=""><span><strong>VLAN interface</strong><small>Matching local gateway</small></span></article>
          <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
          <article class="network-device"><i class="bx bx-broadcast" aria-hidden="true"></i><span><strong>DHCP scope</strong><small>Expected client network state</small></span></article>
        </div>
        <p class="record-evidence__privacy"><i class="bx bx-info-circle" aria-hidden="true"></i> The record does not present unverified policy enforcement, internet reachability, or failover results.</p>
      </section>
      <section class="network-panel" aria-labelledby="network-platform-title">
        <h3 class="network-panel__title" id="network-platform-title"><i class="bx bx-layer-plus" aria-hidden="true"></i> Platform boundaries</h3>
        <div class="network-boundaries">
          <article class="network-boundary"><img src="../../assets/fortigate-original.svg" width="30" height="30" alt=""><span><strong>FortiGate</strong><span>Gateway and DHCP work documented for HQ.</span><small>Configured scope</small></span></article>
          <article class="network-boundary"><img src="../../assets/cisco-original.svg" width="30" height="30" alt=""><span><strong>Cisco</strong><span>Access VLAN and trunk work documented.</span><small>Configured scope</small></span></article>
          <article class="network-boundary network-boundary--context"><img src="../../assets/paloalto-original.svg" width="30" height="30" alt=""><span><strong>Palo Alto</strong><span>Visible in the broader topology; no configuration result claimed.</span><small>Topology context</small></span></article>
        </div>
      </section>
    </div>`;
  }

  function enterpriseLabVisual() {
    return `<div>
      <figure class="network-lab-figure">
        <img src="../../assets/projects/enterprise-network-security-lab/topology-overview-sanitized.png" width="1680" height="936" loading="lazy" decoding="async" alt="Sanitized EVE-NG topology showing HQ, branch, and partner zones, department VLANs, switching, and firewall platforms.">
        <figcaption>The full topology provides project context. The documented operational evidence on this record is limited to the HQ Cisco and FortiGate path.</figcaption>
      </figure>
      <div class="network-lab-meta" aria-label="Lab evidence scope"><span><i class="bx bx-check" aria-hidden="true"></i> HQ VLANs 5&ndash;8 documented</span><span><i class="bx bx-check-shield" aria-hidden="true"></i> Credentials and IPs omitted</span><span><i class="bx bx-info-circle" aria-hidden="true"></i> Branch and partner paths are context</span></div>
      <a class="network-record-link" href="/projects/enterprise-network-security-lab/">View the full lab case study <i class="bx bx-right-arrow-alt" aria-hidden="true"></i></a>
    </div>`;
  }

  function verificationVisual() {
    return `<div class="network-verification-grid">
      <section class="network-panel" aria-labelledby="network-incident-title">
        <h3 class="network-panel__title" id="network-incident-title"><i class="bx bx-wrench" aria-hidden="true"></i> Documented troubleshooting sequence</h3>
        <div class="network-incident">
          <article class="network-incident__stage"><span class="network-incident__number">01</span><span><strong>Observe</strong><small>The LACP aggregate remained suspended, while one client learned on VLAN 1 instead of its department VLAN.</small></span></article>
          <article class="network-incident__stage"><span class="network-incident__number">02</span><span><strong>Isolate</strong><small>Compared port-channel state, trunking, MAC learning, access membership, and FortiGate interface behaviour.</small></span></article>
          <article class="network-incident__stage"><span class="network-incident__number">03</span><span><strong>Correct</strong><small>Used one explicit 802.1Q trunk, left the unverified second link inactive, corrected the client VLAN, and refreshed its network state.</small></span></article>
          <article class="network-incident__stage"><span class="network-incident__number">04</span><span><strong>Verify</strong><small>Confirmed the expected DHCP scope and local-gateway reachability for two clients in each HQ VLAN.</small></span></article>
        </div>
      </section>
      <aside class="network-prep-card" aria-labelledby="network-prep-title">
        <span class="network-prep-card__status"><i class="bx bx-time-five" aria-hidden="true"></i> In preparation</span>
        <h3 id="network-prep-title">CCNA 200-301 study path</h3>
        <p>Current preparation reinforces the same disciplined habit: identify the expected state, isolate the layer, and verify the result.</p>
        <div class="network-prep-card__mark" aria-hidden="true"><span>CCNA</span><strong>200-301</strong><small>Study path</small></div>
        <ul><li><i class="bx bx-check" aria-hidden="true"></i><span>Study path only</span></li><li><i class="bx bx-x" aria-hidden="true"></i><span>Not presented as earned</span></li><li><i class="bx bx-x" aria-hidden="true"></i><span>No exam result or schedule claimed</span></li></ul>
      </aside>
    </div>`;
  }

  function getEvidenceView(id) {
    const section = sections.find(function (item) { return item.id === id; }) || sections[0];
    const views = {
      "program-overview": {
        title: "From concepts to a working lab",
        eyebrow: "Program overview",
        badge: "Mentorship",
        intro: "The training connected networking concepts to guided configuration, an EVE-NG portfolio lab, and repeatable troubleshooting.",
        visual: programOverviewVisual()
      },
      "network-fundamentals": {
        title: "A network you can reason about",
        eyebrow: "Foundations",
        badge: "Traffic path",
        intro: "Addressing, protocol roles, device relationships, and segmentation provide the vocabulary for later troubleshooting.",
        visual: networkFundamentalsVisual()
      },
      "switching-routing": {
        title: "Four VLANs, one verified trunk path",
        eyebrow: "Switching and routing",
        badge: "HQ phase",
        intro: "The verified lab path joins access VLANs, Cisco switching, an 802.1Q trunk, and gateway services.",
        visual: switchingRoutingVisual()
      },
      "security-firewalls": {
        title: "Gateway services without overclaiming",
        eyebrow: "Firewall practice",
        badge: "Verified boundary",
        intro: "The completed HQ evidence supports FortiGate VLAN interfaces, local gateways, and DHCP—not broader policy, internet, or failover claims.",
        visual: securityFirewallsVisual()
      },
      "enterprise-lab": {
        title: "Sanitized EVE-NG topology",
        eyebrow: "Related lab evidence",
        badge: "Publication-safe",
        intro: "A topology view of the associated Enterprise Network Security Lab, used here to show applied context rather than course completion.",
        visual: enterpriseLabVisual()
      },
      "verification-preparation": {
        title: "Trace the fault, then prove the correction",
        eyebrow: "Verification and current preparation",
        badge: "Documented incident",
        intro: "One HQ troubleshooting sequence shows how the course concepts became a practical, evidence-led method.",
        visual: verificationVisual()
      }
    };
    return Object.assign({ tools: section.technologies }, views[id] || views["program-overview"]);
  }

  function renderEvidenceFrame(view) {
    return `<div class="record-evidence__content"><div class="record-evidence__head"><div><p class="record-evidence__eyebrow">${escapeHtml(view.eyebrow)}</p><h2 id="experience-evidence-title">${escapeHtml(view.title)}</h2></div><span class="record-evidence__badge">${escapeHtml(view.badge)}</span></div><p class="record-evidence__intro">${escapeHtml(view.intro)}</p><div class="record-evidence__visual">${view.visual}</div>${renderTools(view.tools)}<p class="record-evidence__privacy"><i class="bx bx-check-shield" aria-hidden="true"></i> Portfolio-safe training evidence; no private credentials, sensitive addressing, certification status, or exam results are shown.</p></div>`;
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

  function commitEvidence(id) {
    const view = getEvidenceView(id);
    evidence.innerHTML = renderEvidenceFrame(view);
    evidence.dataset.evidenceFor = id;
    evidence.setAttribute("aria-busy", "false");
    evidence.classList.remove("is-changing");
  }

  function updateEvidence(id) {
    const token = ++evidenceToken;
    window.clearTimeout(evidenceTimer);
    if (reducedMotion.matches || !evidence.firstElementChild) {
      commitEvidence(id);
      return;
    }
    evidence.setAttribute("aria-busy", "true");
    evidence.classList.add("is-changing");
    evidenceTimer = window.setTimeout(function () {
      if (token !== evidenceToken) return;
      commitEvidence(id);
      evidence.classList.remove("is-changing");
    }, 90);
  }

  function setOpen(id, animate) {
    activeId = sections.some(function (section) { return section.id === id; }) ? id : activeId;
    root.querySelectorAll(".experience-accordion__item").forEach(function (item) { setPanelState(item, item.dataset.sectionId === activeId, animate); });
    placeEvidence();
    updateEvidence(activeId || "program-overview");
    if (evidenceStatus) evidenceStatus.textContent = `Evidence updated: ${getEvidenceView(activeId || "program-overview").title}.`;
  }

  renderAccordion();
  placeEvidence();
  updateEvidence(activeId);

  root.addEventListener("click", function (event) {
    const trigger = event.target.closest(".experience-accordion__trigger");
    if (trigger && root.contains(trigger)) setOpen(trigger.dataset.id, true);
  });

  root.addEventListener("keydown", function (event) {
    const triggers = Array.from(root.querySelectorAll(".experience-accordion__trigger"));
    const current = event.target.closest(".experience-accordion__trigger");
    const index = triggers.indexOf(current);
    if (index < 0) return;
    let nextIndex = index;
    if (event.key === "ArrowDown") nextIndex = (index + 1) % triggers.length;
    if (event.key === "ArrowUp") nextIndex = (index - 1 + triggers.length) % triggers.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = triggers.length - 1;
    if (nextIndex !== index) {
      event.preventDefault();
      triggers[nextIndex].focus();
      setOpen(triggers[nextIndex].dataset.id, true);
    }
  });

  const handleLayoutChange = function () { placeEvidence(); };
  if (mobileLayout.addEventListener) mobileLayout.addEventListener("change", handleLayoutChange);
  else mobileLayout.addListener(handleLayoutChange);
})();
