(function () {
  const certs = window.CERTIFICATIONS || [];
  if (!certs.length) return;

  const prefix = document.documentElement.dataset.assetPrefix || "";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function earnedCards() {
    return certs.filter(function (cert) {
      return cert.status === "earned";
    });
  }

  function preparationCards() {
    return certs.filter(function (cert) {
      return cert.status === "in-preparation";
    });
  }

  function renderBadge(cert, eager) {
    if (cert.badge) {
      return `<img
        class="certs-vault-card__badge-img"
        src="${escapeHtml(prefix + cert.badge)}"
        alt="${escapeHtml(cert.badgeAlt || cert.shortName)}"
        width="88"
        height="88"
        decoding="async"
        ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}
      >`;
    }
    return `<span class="certs-vault-card__badge-placeholder" role="img" aria-label="Official badge artwork not supplied">
      <i class="bx ${escapeHtml(cert.icon || "bx-badge-check")}" aria-hidden="true"></i>
      <span aria-hidden="true">Badge pending</span>
    </span>`;
  }

  function renderSkills(cert) {
    if (!cert.skills || !cert.skills.length) {
      return `<ul class="certs-vault-card__skills certs-vault-card__skills--empty" aria-hidden="true"></ul>`;
    }
    return `<ul class="certs-vault-card__skills">
      ${cert.skills
        .map(function (skill) {
          return `<li>${escapeHtml(skill)}</li>`;
        })
        .join("")}
    </ul>`;
  }

  function safeExternalUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;

    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch (error) {
      return null;
    }
  }

  function renderVerify(cert) {
    const credentialUrl = safeExternalUrl(cert.credentialUrl);
    if (!credentialUrl) return "";

    return `<a
      class="certs-vault-card__verify"
      href="${escapeHtml(credentialUrl)}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View credential for ${escapeHtml(cert.code)} ${escapeHtml(cert.shortName)}"
    >View credential <i class="bx bx-link-external" aria-hidden="true"></i></a>`;
  }

  function renderEarned(cert, index) {
    return `<article class="certs-vault-card" aria-labelledby="earned-${escapeHtml(cert.id)}-code earned-${escapeHtml(cert.id)}-name">
      <div class="certs-vault-card__badge">${renderBadge(cert, index < 4)}</div>
      <h3 class="certs-vault-card__code" id="earned-${escapeHtml(cert.id)}-code">${escapeHtml(cert.code)}</h3>
      <p class="certs-vault-card__name" id="earned-${escapeHtml(cert.id)}-name">${escapeHtml(cert.name || cert.shortName)}</p>
      <div class="certs-vault-card__meta">
        <p class="certs-vault-card__issuer">${escapeHtml(cert.issuer)}</p>
        <p class="certs-vault-card__status">
          <i class="bx bx-check" aria-hidden="true"></i>
          Earned
        </p>
      </div>
      ${renderSkills(cert)}
      ${renderVerify(cert)}
    </article>`;
  }

  function renderLocked(cert) {
    const studyPathUrl = safeExternalUrl(cert.studyPathUrl);
    const studyPath = studyPathUrl
      ? `<a
          class="certs-locked-card__link"
          href="${escapeHtml(studyPathUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="${escapeHtml(cert.studyPathLabel || "View study path")} for ${escapeHtml(cert.code)}"
        >${escapeHtml(cert.studyPathLabel || "View study path")} <i class="bx bx-link-external" aria-hidden="true"></i></a>`
      : "";
    return `<article class="certs-locked-card" aria-labelledby="prep-${escapeHtml(cert.id)}-code prep-${escapeHtml(cert.id)}-name">
      <div class="certs-locked-card__visual" aria-hidden="true">
        <div class="certs-locked-card__orbit"></div>
        <div class="certs-locked-card__icon">
          <i class="bx bx-lock-alt"></i>
        </div>
      </div>
      <div class="certs-locked-card__content">
        <h3 class="certs-locked-card__code" id="prep-${escapeHtml(cert.id)}-code">${escapeHtml(cert.code)}</h3>
        <p class="certs-locked-card__name" id="prep-${escapeHtml(cert.id)}-name">${escapeHtml(cert.name || cert.shortName)}</p>
        <div class="certs-locked-card__meta">
          <p class="certs-locked-card__issuer">${escapeHtml(cert.issuer)}</p>
          <p class="certs-locked-card__status">
            <i class="bx bx-lock-alt" aria-hidden="true"></i>
            In preparation
          </p>
        </div>
        <p class="certs-locked-card__focus">${escapeHtml(cert.focus || "")}</p>
        ${studyPath}
      </div>
    </article>`;
  }

  function renderArchive() {
    const earnedRoot = document.getElementById("earned-credentials");
    const prepRoot = document.getElementById("preparation-credentials");
    if (!earnedRoot || !prepRoot) return;

    earnedRoot.innerHTML = earnedCards().map(renderEarned).join("");
    prepRoot.innerHTML = preparationCards().map(renderLocked).join("");
  }

  function hydrateHomeOrbit() {
    const orbit = document.querySelector("#certifications .credentials-orbit");
    if (!orbit) return;

    orbit.querySelectorAll("article.credential-card").forEach(function (card) {
      const codeEl = card.querySelector(".credential-card__code");
      if (!codeEl) return;

      const cert = certs.find(function (item) {
        return item.code === codeEl.textContent.trim();
      });
      if (!cert) return;

      const nameEl = card.querySelector(".credential-card__name");
      const statusEl = card.querySelector(".credential-card__status");
      if (nameEl) nameEl.textContent = cert.shortName;

      const locked = cert.status === "in-preparation";
      card.classList.toggle("credential-card--locked", locked);

      const badge = card.querySelector(".credential-card__badge");
      let lock = card.querySelector(".credential-card__lock");

      if (locked) {
        if (!lock && badge) {
          badge.insertAdjacentHTML(
            "beforeend",
            '<span class="credential-card__lock"><i class="bx bx-lock-alt"></i></span>'
          );
        }
        if (statusEl) {
          statusEl.innerHTML =
            '<i class="bx bx-lock-alt" aria-hidden="true"></i> In preparation';
        }
      } else {
        if (lock) lock.remove();
        if (statusEl) {
          statusEl.innerHTML =
            '<i class="bx bx-check" aria-hidden="true"></i> Earned';
        }
      }
    });
  }

  function enhanceChatAccessibility() {
    const toggle = document.getElementById("chat-toggle");
    const chatbox = document.getElementById("chatbox");
    const chatInput = document.getElementById("chat-input");
    const resetButton = document.getElementById("chat-reset");
    const resetModal = document.getElementById("reset-modal");
    if (!toggle || !chatbox) return;

    let chatWasOpen = !chatbox.classList.contains("hidden");

    function syncChatState(moveFocus) {
      const open = !chatbox.classList.contains("hidden");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute(
        "aria-label",
        open ? "Close portfolio assistant" : "Open portfolio assistant"
      );
      chatbox.setAttribute("aria-hidden", String(!open));

      if (!moveFocus) return;
      if (open) {
        window.requestAnimationFrame(function () {
          if (!chatbox.classList.contains("hidden")) chatInput?.focus();
        });
      } else if (chatbox.contains(document.activeElement)) {
        toggle.focus();
      }
    }

    syncChatState(false);
    new MutationObserver(function () {
      const open = !chatbox.classList.contains("hidden");
      const changed = open !== chatWasOpen;
      chatWasOpen = open;
      syncChatState(changed);
    }).observe(chatbox, { attributes: true, attributeFilter: ["class"] });

    if (resetModal) {
      let resetWasOpen = !resetModal.classList.contains("hidden");

      function syncResetState(moveFocus) {
        const open = !resetModal.classList.contains("hidden");
        resetModal.setAttribute("aria-hidden", String(!open));
        if (!moveFocus) return;

        if (open) {
          resetModal.querySelector("button")?.focus();
        } else if (resetModal.contains(document.activeElement)) {
          resetButton?.focus();
        }
      }

      syncResetState(false);
      new MutationObserver(function () {
        const open = !resetModal.classList.contains("hidden");
        const changed = open !== resetWasOpen;
        resetWasOpen = open;
        syncResetState(changed);
      }).observe(resetModal, { attributes: true, attributeFilter: ["class"] });

      document.addEventListener("keydown", function (event) {
        if (resetModal.classList.contains("hidden") || event.key !== "Tab") return;

        const controls = Array.from(
          resetModal.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (!controls.length) return;

        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (resetModal && !resetModal.classList.contains("hidden")) return;
      if (chatbox.classList.contains("hidden")) return;

      chatbox.classList.add("hidden");
      toggle.focus();
    });
  }

  renderArchive();
  hydrateHomeOrbit();
  enhanceChatAccessibility();
})();
