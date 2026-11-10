const assetPath = (file) => {
  const prefix = document.documentElement.dataset.assetPrefix || "";
  return `${prefix}${file}`;
};

document.addEventListener("scroll", () => {
  const progressBar = document.querySelector(".scroll-progress");
  if (!progressBar) return;

  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  progressBar.style.width = `${scrolled}%`;
  const brightness = 0.6 + (scrolled / 100) * 0.8;
  progressBar.style.filter = `brightness(${brightness})`;
});

document.addEventListener("DOMContentLoaded", () => {
  const timelineContainers = document.querySelectorAll(".timeline-container");
  if (!timelineContainers.length) return;

  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
  }

  function handleScroll() {
    timelineContainers.forEach((container) => {
      if (isInViewport(container)) {
        container.style.opacity = "1";
        container.style.transform = "translateY(0)";
      }
    });
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll();
});

document.addEventListener("DOMContentLoaded", () => {
  const chatbox = document.getElementById("chatbox");
  const oldLauncher = document.getElementById("chat-toggle");
  if (!chatbox || !oldLauncher || chatbox.dataset.insightReady) return;
  chatbox.dataset.insightReady = "true";

  // One shared UI for every existing route. Never interpolate visitor/model text here.
  const icon = (paths) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  const icons = {
    new: icon('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 12h8m-4-4v8"/>'),
    expand: icon('<path d="M14 4h6v6m0-6-7 7M4 14v6h6m-6 0 7-7"/>'),
    close: icon('<path d="m5 5 14 14M5 19 19 5"/>'),
    send: icon('<path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3"/>'),
    folder: icon('<path d="M3 7V5h7l3 3h8v12H3V7Z"/>'),
    building: icon('<path d="M8 21V3h8v18M4 21V11h4m8 2h4v8M2 21h20M11 7h2m-2 4h2m-2 4h2m-1 3v3"/>'),
    skills: icon('<path stroke-width="3" d="M5 20v-5m7 5V9m7 11V3"/>'),
    mail: icon('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>'),
    planet: icon('<circle cx="12" cy="12" r="7"/><ellipse cx="12" cy="12" rx="13" ry="4" transform="rotate(-35 12 12)"/>')
  };
  const launcher = document.createElement("button");
  launcher.id = "chat-toggle";
  launcher.className = "chat-toggle insight-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Open Insight portfolio assistant");
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "chatbox");
  const launcherImage = document.createElement("img");
  launcherImage.src = assetPath("assets/chat.svg");
  launcherImage.alt = "";
  launcher.append(launcherImage);
  oldLauncher.replaceWith(launcher);
  // Escape transformed page sections and keep modal isolation local to this widget.
  document.body.append(chatbox, launcher);
  document.getElementById("reset-modal")?.remove();
  chatbox.classList.add("insight-chat", "hidden");
  chatbox.setAttribute("role", "dialog");
  chatbox.setAttribute("aria-labelledby", "insight-title");
  chatbox.setAttribute("aria-hidden", "true");
  chatbox.innerHTML = '<div class="insight-header"><div class="insight-identity"><img class="insight-avatar" alt=""/><div><h2 id="insight-title">Insight</h2><p>Portfolio assistant</p></div></div><div class="insight-controls"><button id="chat-reset" type="button" aria-label="Start a new conversation">' + icons.new + '</button><button id="chat-expand" type="button" aria-label="Expand chat" aria-pressed="false">' + icons.expand + '</button><button id="chat-close" type="button" aria-label="Close chat">' + icons.close + '</button></div></div><div class="insight-thread"><div id="chat-messages" tabindex="0" role="region" aria-label="Conversation"></div><button id="chat-new-message" type="button" hidden>New reply ↓</button></div><div class="insight-composer"><div id="chat-feedback" hidden><span></span><button id="chat-retry" type="button" hidden>Retry</button></div><form id="chat-form"><label class="insight-sr-only" for="chat-input">Ask about Israel’s work</label><textarea id="chat-input" rows="2" maxlength="6000" placeholder="Ask about Israel’s work…"></textarea><button id="chat-send" type="submit" aria-label="Send message">' + icons.send + '</button><button id="chat-stop" type="button" hidden aria-label="Stop generating reply">Stop</button></form><p class="insight-notice">AI answers may be incomplete. Check linked records.</p></div><div id="chat-status" class="insight-sr-only" role="status" aria-live="polite" aria-atomic="true"></div><div id="reset-modal" class="insight-reset" hidden aria-hidden="true"><div role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description"><h3 id="reset-title">Start a new conversation?</h3><p id="reset-description">This clears the messages in this chat.</p><div><button id="reset-close" type="button">Keep chatting</button><button id="reset-confirm" type="button">Start new chat</button></div></div></div>';
  chatbox.querySelector(".insight-avatar").src = assetPath("assets/avatar.svg");
  const $ = (id) => chatbox.querySelector("#" + id);
  const input = $("chat-input"), form = $("chat-form"), messages = $("chat-messages");
  const send = $("chat-send"), stop = $("chat-stop"), expand = $("chat-expand");
  const feedback = $("chat-feedback"), retry = $("chat-retry"), status = $("chat-status");
  const reset = $("reset-modal"), newMessage = $("chat-new-message");
  const mobile = window.matchMedia("(max-width: 639px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let history = [], active = null, pending = null, generation = 0, open = false;
  let composing = false, announceTimer, isolated = [], savedOverflow = null;
  const requestTimeout = 30000;

  function announce(text) {
    clearTimeout(announceTimer);
    status.textContent = "";
    announceTimer = setTimeout(() => { status.textContent = text; }, 40);
  }
  function nearBottom() {
    return messages.scrollHeight - messages.clientHeight - messages.scrollTop < 80;
  }
  function bottom() {
    messages.scrollTop = messages.scrollHeight;
    newMessage.hidden = true;
  }
  function grow() {
    input.rows = 1;
    input.style.height = "auto";
    const style = getComputedStyle(input);
    const line = parseFloat(style.lineHeight);
    const height = Math.min(input.scrollHeight, line * 5 + 22, parseFloat(style.maxHeight));
    input.style.height = height + "px";
    input.style.overflowY = input.scrollHeight > height ? "auto" : "hidden";
  }
  function welcome() {
    messages.replaceChildren();
    const group = document.createElement("div");
    group.id = "welcome-card";
    group.className = "insight-welcome";
    group.innerHTML = '<div class="insight-planet">' + icons.planet + '</div><h3>Explore Israel’s work<span>.</span></h3><p>Ask about projects, skills, experience, or how to get in touch.</p><div class="insight-starters"></div><div class="insight-suggestion"><span>Try:</span><button type="button">Show me a computer vision project</button></div>';
    const starters = [
      ["folder", "Explore projects", "Tell me about Israel’s featured projects."],
      ["building", "Experience at CHS", "What did Israel work on during his internship at CHS (Constellation HomeBuilder Systems)?"],
      ["skills", "Skills & credentials", "What are Israel’s main technical skills and certifications?"],
      ["mail", "Contact Israel", "How can I contact Israel about a role or collaboration?"]
    ];
    starters.forEach(([glyph, label, question]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = icons[glyph] + '<span></span>';
      button.querySelector("span").textContent = label;
      button.addEventListener("click", () => submit(question));
      group.querySelector(".insight-starters").append(button);
    });
    group.querySelector(".insight-suggestion button").addEventListener("click", () => submit("Show me a computer vision project"));
    messages.append(group);
  }
  function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = "insight-message insight-message--" + role;
    if (role === "bot") {
      const avatar = document.createElement("img");
      avatar.src = assetPath("assets/avatar.svg");
      avatar.alt = "Insight";
      row.append(avatar);
    }
    const body = document.createElement("div");
    body.className = "insight-message-text";
    body.textContent = text;
    row.append(body);
    messages.append(row);
    return row;
  }
  // Defense in depth: only the approved site records, images and exact public
  // destinations can become DOM URLs, even if an API response is malformed.
  const recordPaths = new Set([
    "/projects/azure-fitness-tracker/", "/projects/football-tracking/",
    "/projects/enterprise-network-security-lab/", "/projects/interstellar-cannon/",
    "/projects/hotel-management-system/", "/projects/vacation-finder/",
    "/projects/web-ctf/", "/projects/r-internet-analysis/",
    "/experience/constellation-software/", "/profile.json"
  ]);
  const cardImages = new Set(["/assets/fitness-tracker.png", "/assets/ML-photo.png", "/assets/interstellar-cannon.png"]);
  const externalLinks = new Set([
    "https://github.com/Odunsegun/azure-fitness-tracker", "https://github.com/Odunsegun/football-tracking",
    "https://github.com/Odunsegun/enterprise-network-security-lab", "https://github.com/Odunsegun/Interstellar-Cannon",
    "https://github.com/Odunsegun/Hotel-Management-System", "https://github.com/Odunsegun/Vacation-Finder-App",
    "https://github.com/Odunsegun/Capture-The-Flag-CTF-Web-Security-Challenge", "https://github.com/Odunsegun/R-Internet-Analysis",
    "https://wonderful-forest-08c0abc0f.1.azurestaticapps.net/"
  ]);
  const recordIds = new Map([...recordPaths].map(url => [
    url === "/profile.json" ? "profile:certifications"
      : (url.startsWith("/projects/") ? "project:" : "experience:") + url.split("/")[2], url
  ]));
  const safeText = (value, maximum) => typeof value === "string" && value.trim() && value.length <= maximum;
  function cardLink(label, url, internalOnly = false) {
    if (!safeText(label, 250) || !(recordPaths.has(url) || (!internalOnly && externalLinks.has(url)))) return null;
    const link = document.createElement("a");
    link.textContent = label;
    link.href = url;
    if (externalLinks.has(url)) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", label + " (opens in a new tab)");
    }
    return link;
  }
  function addRichReply(data) {
    const row = addMessage("bot", data.reply);
    const body = row.querySelector(".insight-message-text");
    // Small text-only Markdown subset; never inject model output as HTML.
    body.replaceChildren();
    function inline(parent, text) {
      for (const part of text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g)) {
        const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
        if (link) parent.append(cardLink(link[1], link[2]) || document.createTextNode(link[1]));
        else if (part.startsWith("**") && part.endsWith("**")) {
          const strong = document.createElement("strong");
          strong.textContent = part.slice(2, -2);
          parent.append(strong);
        } else parent.append(document.createTextNode(part));
      }
    }
    let list;
    for (const block of data.reply.split(/\n\s*\n/)) {
      for (const line of block.split("\n")) {
        const bullet = line.match(/^\s*[-*]\s+(.+)/);
        const heading = line.match(/^#{1,6}\s+(.+)/);
        if (bullet) {
          if (!list) { list = document.createElement("ul"); body.append(list); }
          const item = document.createElement("li"); inline(item, bullet[1]); list.append(item);
        } else {
          list = null;
          const element = document.createElement(heading ? "h3" : "p");
          inline(element, heading ? heading[1] : line); body.append(element);
        }
      }
      list = null;
    }
    const content = document.createElement("div");
    content.className = "insight-answer";
    body.replaceWith(content);
    content.append(body);
    const seenCards = new Set();
    const cards = Array.isArray(data.cards) ? data.cards : [];
    for (const card of cards.slice(0, 2)) {
      if (!card || seenCards.has(card.id) || recordIds.get(card.id) !== card.detailUrl ||
          !["project", "experience", "credentials"].includes(card.type) ||
          !safeText(card.title, 200) || !safeText(card.summary, 2000)) continue;
      const action = cardLink(card.type === "project" ? "View project ↗" : "View record ↗", card.detailUrl, true);
      if (!action) continue;
      seenCards.add(card.id);
      const article = document.createElement("article");
      article.className = "insight-card";
      article.setAttribute("aria-label", card.title);
      if (cardImages.has(card.image?.src) && safeText(card.image?.alt, 300)) {
        const img = document.createElement("img");
        img.className = "insight-card-image";
        img.alt = card.image.alt;
        img.decoding = "async";
        // Reserve space before loading so readers of older messages do not jump.
        img.width = 640;
        img.height = 360;
        img.addEventListener("error", () => {
          if (!row.isConnected) return;
          const wasNearBottom = nearBottom();
          const oldTop = messages.scrollTop;
          img.remove();
          if (wasNearBottom) bottom();
          else messages.scrollTop = oldTop;
        }, { once: true });
        img.src = card.image.src;
        article.append(img);
      }
      const details = document.createElement("div");
      details.className = "insight-card-details";
      const title = document.createElement("h3");
      title.textContent = card.title;
      details.append(title);
      if (Array.isArray(card.tags)) {
        const tags = document.createElement("ul");
        tags.className = "insight-card-tags";
        tags.setAttribute("aria-label", card.type === "project" ? "Technologies" : "Record highlights");
        for (const tag of card.tags.slice(0, 8)) {
          if (!safeText(tag, 80)) continue;
          const item = document.createElement("li");
          item.textContent = tag;
          tags.append(item);
        }
        if (tags.childElementCount) details.append(tags);
      }
      const summary = document.createElement("p");
      summary.textContent = card.summary;
      action.className = "insight-card-action";
      details.append(summary, action);
      const links = document.createElement("div");
      links.className = "insight-card-links";
      for (const link of (Array.isArray(card.links) ? card.links : []).slice(0, 3)) {
        const anchor = cardLink(link?.label, link?.url);
        if (anchor) links.append(anchor);
      }
      if (links.childElementCount) details.append(links);
      article.append(details);
      content.append(article);
    }
    const sources = document.createElement("ul");
    sources.className = "insight-sources";
    sources.setAttribute("aria-label", "Supporting public records");
    const seenSources = new Set();
    for (const source of (Array.isArray(data.sources) ? data.sources : []).slice(0, 3)) {
      if (!source || seenSources.has(source.id) || recordIds.get(source.id) !== source.url) continue;
      const anchor = cardLink(source.title, source.url, true);
      if (!anchor) continue;
      seenSources.add(source.id);
      const item = document.createElement("li");
      const prefix = document.createElement("span");
      prefix.textContent = "Source: ";
      item.append(prefix, anchor);
      sources.append(item);
    }
    if (sources.childElementCount) content.append(sources);
    const prompts = document.createElement("div");
    prompts.className = "insight-follow-ups";
    prompts.setAttribute("role", "group");
    prompts.setAttribute("aria-label", "Suggested follow-up questions");
    for (const question of [...new Set(Array.isArray(data.followUps) ? data.followUps : [])].slice(0, 3)) {
      if (!safeText(question, 160)) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = question;
      button.addEventListener("click", () => submit(question));
      prompts.append(button);
    }
    if (prompts.childElementCount) content.append(prompts);
    return row;
  }
  function typing() {
    $("typing-indicator")?.remove();
    if (!active) return;
    const row = addMessage("bot", "Thinking…");
    row.id = "typing-indicator";
    row.setAttribute("aria-hidden", "true");
    const dots = document.createElement("span");
    dots.className = "insight-typing-dots";
    for (let index = 0; index < 3; index++) dots.append(document.createElement("span"));
    row.querySelector(".insight-message-text").replaceChildren(dots);
  }
  reducedMotion.addEventListener("change", () => { const follow = nearBottom(); typing(); if (follow) bottom(); });
  function controls() {
    const busy = !!active;
    send.hidden = busy;
    send.disabled = busy || !input.value.trim();
    stop.hidden = !busy;
    retry.disabled = busy;
    chatbox.querySelectorAll(".insight-follow-ups button").forEach(button => { button.disabled = busy; });
    form.setAttribute("aria-busy", String(busy));
  }
  function showFeedback(text, canRetry = false) {
    feedback.hidden = !text;
    feedback.querySelector("span").textContent = text;
    retry.hidden = !canRetry;
    if (text) announce(text);
  }
  function finish(request) {
    clearTimeout(request.timer);
    if (active !== request) return;
    const restoreInputFocus = document.activeElement === stop;
    active = null;
    $("typing-indicator")?.remove();
    controls();
    if (restoreInputFocus) input.focus({ preventScroll: true });
  }
  function cancel(reason) {
    const request = active;
    if (!request) return;
    ++generation;
    request.controller.abort();
    finish(request);
    if (reason === "stop") showFeedback("Stopped. You can retry this question or ask another.", true);
  }
  async function submit(text, isRetry = false) {
    text = text.trim();
    if (active || !text) return;
    if (!isRetry) {
      $("welcome-card")?.remove();
      if (pending) pending.row.dataset.delivery = "unanswered";
      pending = { text, history: history.map(turn => ({ ...turn })), row: addMessage("user", text) };
      input.value = "";
      grow();
    } else if (!pending) return;
    const turn = pending;
    const request = { id: ++generation, controller: new AbortController(), timer: null };
    active = request;
    showFeedback("");
    controls();
    typing();
    bottom();
    input.focus({ preventScroll: true });
    announce("Insight is preparing a reply. Stop is available.");
    request.timer = setTimeout(() => {
      if (active !== request) return;
      ++generation;
      request.controller.abort();
      finish(request);
      showFeedback("The reply took too long. Please try again.", true);
    }, requestTimeout);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: turn.text, history: turn.history }),
        signal: request.controller.signal
      });
      if (!response.ok) {
        const error = new Error("HTTP error");
        error.status = response.status;
        throw error;
      }
      let data;
      try { data = await response.json(); }
      catch { throw new Error("invalid-reply"); }
      if (!data || typeof data.reply !== "string" || !data.reply.trim()) throw new Error("invalid-reply");
      if (active !== request || request.id !== generation) return;
      const follow = nearBottom();
      finish(request);
      const replyRow = addRichReply(data);
      history.push({ role: "user", content: turn.text }, { role: "assistant", content: data.reply });
      pending = null;
      if (follow) {
        bottom();
        // Start a tall rich answer at its beginning so its text and thumbnail
        // are readable; never move somebody already reading older messages.
        if (replyRow.querySelector(".insight-card") && replyRow.offsetHeight > messages.clientHeight) {
          messages.scrollTop += replyRow.getBoundingClientRect().top - messages.getBoundingClientRect().top - 12;
        }
      }
      else newMessage.hidden = false;
      announce("Insight replied. " + data.reply);
    } catch (error) {
      if (active !== request || request.id !== generation) return;
      finish(request);
      if (error.name === "AbortError") return;
      const text = error.status === 429 ? "Too many requests. Please wait a moment, then retry."
        : error.status >= 500 ? "Insight is temporarily unavailable. Please try again."
        : error.status ? "The request could not be completed. Please try again."
        : error.message === "invalid-reply" ? "Insight returned an unreadable reply. Please try again."
        : "Couldn’t connect to Insight. Check your connection and try again.";
      showFeedback(text, true);
    } finally {
      clearTimeout(request.timer);
    }
  }
  form.addEventListener("submit", event => { event.preventDefault(); submit(input.value); });
  input.addEventListener("input", () => { grow(); controls(); });
  input.addEventListener("compositionstart", () => { composing = true; });
  input.addEventListener("compositionend", () => { composing = false; controls(); });
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing && !composing && event.keyCode !== 229) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  retry.addEventListener("click", () => { if (pending) submit(pending.text, true); });
  stop.addEventListener("click", () => cancel("stop"));
  newMessage.addEventListener("click", () => { bottom(); messages.focus({ preventScroll: true }); });
  messages.addEventListener("scroll", () => { if (nearBottom()) newMessage.hidden = true; });

  function restorePage() {
    isolated.forEach(([element, wasInert]) => { element.inert = wasInert; });
    isolated = [];
    if (savedOverflow !== null) {
      document.body.style.overflow = savedOverflow;
      savedOverflow = null;
    }
  }
  function modality() {
    restorePage();
    const modal = open && (mobile.matches || !reset.hidden);
    chatbox.setAttribute("aria-modal", String(modal));
    if (modal) {
      for (const element of document.body.children) {
        if (element === chatbox || ["SCRIPT", "STYLE", "LINK"].includes(element.tagName)) continue;
        isolated.push([element, element.inert]);
        element.inert = true;
      }
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    if (open && mobile.matches && !chatbox.contains(document.activeElement)) $("chat-close").focus({ preventScroll: true });
  }
  function viewport() {
    const view = window.visualViewport;
    chatbox.style.setProperty("--insight-viewport-height", (view?.height || window.innerHeight) + "px");
    chatbox.style.setProperty("--insight-viewport-top", (view?.offsetTop || 0) + "px");
    grow();
  }
  function closeReset() {
    reset.hidden = true;
    reset.setAttribute("aria-hidden", "true");
    for (const child of chatbox.children) if (child !== reset) child.inert = false;
    modality();
  }
  function setOpen(value) {
    open = value;
    if (!value) closeReset();
    chatbox.classList.toggle("hidden", !value);
    chatbox.setAttribute("aria-hidden", String(!value));
    launcher.setAttribute("aria-expanded", String(value));
    launcher.setAttribute("aria-label", value ? "Close Insight portfolio assistant" : "Open Insight portfolio assistant");
    modality();
    if (value) {
      viewport();
      // Avoid automatically opening the mobile keyboard.
      (mobile.matches ? $("chat-close") : input).focus({ preventScroll: true });
    } else launcher.focus({ preventScroll: true });
  }
  launcher.addEventListener("click", () => setOpen(!open));
  $("chat-close").addEventListener("click", () => setOpen(false));
  expand.addEventListener("click", () => {
    const expanded = chatbox.classList.toggle("insight-expanded");
    expand.setAttribute("aria-pressed", String(expanded));
    expand.setAttribute("aria-label", expanded ? "Compact chat" : "Expand chat");
    grow();
  });
  $("chat-reset").addEventListener("click", () => {
    reset.hidden = false;
    reset.setAttribute("aria-hidden", "false");
    for (const child of chatbox.children) if (child !== reset) child.inert = true;
    modality();
    $("reset-close").focus();
  });
  $("reset-close").addEventListener("click", () => { closeReset(); $("chat-reset").focus(); });
  $("reset-confirm").addEventListener("click", () => {
    cancel("reset");
    ++generation;
    history = [];
    pending = null;
    clearTimeout(announceTimer);
    status.textContent = "";
    showFeedback("");
    welcome();
    input.value = "";
    closeReset();
    grow();
    controls();
    bottom();
    input.focus({ preventScroll: true });
    announce("New conversation started.");
  });
  const focusable = (root) => [...root.querySelectorAll('button:not([disabled]), textarea, [tabindex="0"]')].filter(element => !element.closest("[hidden], [inert]") && element.getClientRects().length);
  document.addEventListener("keydown", event => {
    if (!open) return;
    if (event.key === "Escape") {
      if (event.isComposing || composing) return;
      event.preventDefault();
      if (!reset.hidden) { closeReset(); $("chat-reset").focus(); }
      else setOpen(false);
    } else if (event.key === "Tab" && (mobile.matches || !reset.hidden)) {
      const items = focusable(reset.hidden ? chatbox : reset);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !items.includes(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !items.includes(document.activeElement))) { event.preventDefault(); first?.focus(); }
    }
  });
  mobile.addEventListener("change", () => { modality(); viewport(); });
  window.visualViewport?.addEventListener("resize", viewport);
  window.visualViewport?.addEventListener("scroll", viewport);
  window.addEventListener("resize", viewport);
  welcome();
  controls();
});

document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".arsenal-filters button");
  const allCards = document.querySelectorAll(
    ".language-card, .tool-card, .framework-card, .all-card"
  );

  if (filterButtons.length && allCards.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter");
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        allCards.forEach((card) => {
          const flexItem = card.closest(".card-touch") || card;
          if (filter === "all" || card.classList.contains(filter)) {
            flexItem.classList.remove("hidden");
          } else {
            flexItem.classList.add("hidden");
          }
        });
      });
    });
  }
});

document.addEventListener("scroll", () => {
  const timeline = document.querySelector(".timeline");
  if (!timeline) return;

  const timelineHeight = timeline.scrollHeight;
  const viewportHeight = window.innerHeight;
  const timelineTop = timeline.getBoundingClientRect().top;
  const scrolledPercentage = Math.min(
    1,
    Math.max(0, (viewportHeight - timelineTop) / timelineHeight)
  );

  const line = timeline.querySelector(".timeline-line");
  if (line) line.style.height = `${scrolledPercentage * 100}%`;
  timeline.style.setProperty("--line-height", `${scrolledPercentage * 100}%`);
});

window.addEventListener("load", () => {
  const gallery = document.querySelector(".gallery");
  const previewImage = document.querySelector(".preview-img img");
  if (!gallery || !previewImage || typeof gsap === "undefined") return;

  const radius = 350;
  const totalItems = 25;
  const angleIncrement = 360 / totalItems;
  const items = [];
  const imageSources = [
    "images/Grey.co_pic.png",
    "images/Chemist_joke.jpg",
    "images/python-fun.png",
    "images/real-life.png",
    "images/Grey.co_pic.png",
    "images/Chemist_joke.jpg",
    "images/python-fun.png",
    "images/real-life.png",
    "images/Grey.co_pic.png",
    "images/Chemist_joke.jpg",
    "images/python-fun.png",
    "images/real-life.png",
    "images/Grey.co_pic.png",
    "images/Chemist_joke.jpg",
    "images/python-fun.png",
    "images/real-life.png",
    "images/Grey.co_pic.png",
    "images/Chemist_joke.jpg",
    "images/python-fun.png",
    "images/real-life.png",
  ];

  const imageLinks = [
    "http://127.0.0.1:5501/Profile/index.html",
    "http://127.0.0.1:5501/Profile/index.html",
    "https://www.youtube.com/",
    "http://127.0.0.1:5501/Profile/index.html",
    "https://www.youtube.com/",
    "http://127.0.0.1:5501/Profile/index.html",
    "https://www.youtube.com/",
    "http://127.0.0.1:5501/Profile/index.html",
    "hhttps://www.youtube.com/",
    "http://127.0.0.1:5501/Profile/index.html",
    "https://www.youtube.com/",
    "http://127.0.0.1:5501/Profile/index.html",
    "http://127.0.0.1:5501/Profile/index.html",
    "https://www.youtube.com/",
    "http://127.0.0.1:5501/Profile/index.html",
    "https://www.youtube.com/",
    "http://127.0.0.1:5501/Profile/index.html",
    "https://www.youtube.com/",
  ];

  for (let i = 0; i < totalItems; i++) {
    const item = document.createElement("div");
    item.className = "gallery-item";

    const link = document.createElement("a");
    link.href = imageLinks[i % imageLinks.length];
    link.target = "_blank";

    const img = document.createElement("img");
    img.src = imageSources[i % imageSources.length];
    img.className = "gallery-img";

    link.appendChild(img);
    item.appendChild(link);
    gallery.appendChild(item);
    items.push(item);
  }

  function placeItems(rotationOffset = 0) {
    items.forEach((item, i) => {
      const angle = i * angleIncrement + rotationOffset;
      gsap.set(item, {
        rotationY: angle,
        transformOrigin: `-100% -100% ${-radius}px`,
        z: radius,
        yPercent: -50,
      });
    });
  }

  let currentRotation = 0;
  let animationId;
  function animateGallery() {
    currentRotation += 0.2;
    placeItems(currentRotation);
    animationId = requestAnimationFrame(animateGallery);
  }

  animateGallery();

  items.forEach((item) => {
    item.addEventListener("mouseover", () => {
      cancelAnimationFrame(animationId);
      previewImage.src = item.querySelector("img").src;
      gsap.to(item, { scale: 1.2, duration: 0.3, ease: "power2.out" });
    });

    item.addEventListener("mouseout", () => {
      animateGallery();
      gsap.to(item, { scale: 1, duration: 0.3, ease: "power2.out" });
    });
  });
});

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".stack-tab");
if (tabButtons.length && tabContents.length) {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const target = button.getAttribute("data-tab");
      tabContents.forEach((tab) => {
        tab.classList.remove("active");
        if (tab.id === target) tab.classList.add("active");
      });
    });
  });
}

const greetingText = document.getElementById("greeting-text");
if (greetingText) {
  const greetings = ["Hi", "Salut", "Bawo ni"];
  let index = 0;
  setInterval(() => {
    greetingText.textContent = greetings[index];
    index = (index + 1) % greetings.length;
  }, 3000);
}

document
  .querySelectorAll(".language-card, .tool-card, .framework-card, .all-card")
  .forEach((card) => {
    const img = card.querySelector("img");
    if (!img) return;
    const originalSrc = img.getAttribute("src");
    const hoverSrc = img.getAttribute("data-hover");

    card.addEventListener("mouseenter", () => {
      if (hoverSrc) img.src = hoverSrc;
    });

    card.addEventListener("mouseleave", () => {
      if (originalSrc) img.src = originalSrc;
    });
  });

document.querySelectorAll(".logo-swap").forEach((container) => {
  const svg = container.querySelector("svg");
  const hoverSrc = container.dataset.hover;
  if (!svg || !hoverSrc) return;

  const img = document.createElement("img");
  img.src = hoverSrc;
  img.style.display = "none";
  img.style.width = svg.style.width || "50px";
  img.style.height = svg.style.height || "50px";
  img.className = "java-logo";
  container.appendChild(img);

  container.addEventListener("mouseenter", () => {
    svg.style.display = "none";
    img.style.display = "block";
  });

  container.addEventListener("mouseleave", () => {
    svg.style.display = "block";
    img.style.display = "none";
  });
});

if (
  !document.body.classList.contains("no-cursor-glow") &&
  !document.documentElement.classList.contains("custom-cursor-ready")
) {
  const glow = document.createElement("div");
  glow.classList.add("cursor-glow");
  document.body.appendChild(glow);

  document.addEventListener("mousemove", (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });
}

const satellite = document.querySelector(".scroll-space .satellite");
const planet = document.querySelector(".scroll-space .planet");
if (satellite && planet) {
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    satellite.style.transform = `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.05}deg)`;
    planet.style.transform = `translateY(-${scrollY * 0.1}px) rotate(-${scrollY * 0.05}deg)`;
  });
}

const modal = document.getElementById("resumeModal");
const resumeBtn = document.getElementById("viewResumeBtn");
const closeBtn = modal?.querySelector(".close");
if (modal && resumeBtn && closeBtn) {
  resumeBtn.onclick = () => {
    modal.style.display = "block";
  };
  closeBtn.onclick = () => {
    modal.style.display = "none";
  };
  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
  };
}
