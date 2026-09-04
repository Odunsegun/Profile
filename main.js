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
  const chatToggle = document.getElementById("chat-toggle");
  const chatbox = document.getElementById("chatbox");
  const chatClose = document.getElementById("chat-close");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  if (!chatToggle || !chatbox || !chatMessages) return;

  const resetBtn = document.getElementById("chat-reset");
  const resetModal = document.getElementById("reset-modal");
  const resetClose = document.getElementById("reset-close");
  const resetConfirm = document.getElementById("reset-confirm");

  let chatHistory = [];

  function showTyping() {
    let typingIndicator = document.getElementById("typing-indicator");
    if (!typingIndicator) {
      typingIndicator = document.createElement("div");
      typingIndicator.id = "typing-indicator";
      typingIndicator.className = "typing-indicator";
      typingIndicator.innerHTML = `
        <img src="${assetPath("assets/avatar.svg")}" class="msg-avatar" alt="Insight AI">
        <div class="msg bot">
          <lottie-player
            src="${assetPath("assets/chat.json")}"
            background="transparent"
            speed="1"
            style="width: 40px; height: 40px;"
            loop
            autoplay>
          </lottie-player>
        </div>
      `;
      chatMessages.appendChild(typingIndicator);
    }
  }

  function hideTyping() {
    document.getElementById("typing-indicator")?.remove();
  }

  function addMessage(role, text) {
    const msgWrapper = document.createElement("div");
    msgWrapper.className = `msg-wrapper ${role}`;

    if (role === "bot") {
      const avatar = document.createElement("img");
      avatar.src = assetPath("assets/avatar.svg");
      avatar.alt = "Insight AI";
      avatar.className = "msg-avatar";
      msgWrapper.appendChild(avatar);
    }

    const msg = document.createElement("div");
    msg.className = `msg ${role}`;
    msg.textContent = text;

    msgWrapper.appendChild(msg);
    chatMessages.appendChild(msgWrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  chatToggle.addEventListener("click", () => {
    chatbox.classList.toggle("hidden");
    if (!chatbox.classList.contains("hidden") && !chatMessages.querySelector(".msg-wrapper")) {
      addMessage("bot", "What can I do for you today?");
    }
  });

  chatClose?.addEventListener("click", () => chatbox.classList.add("hidden"));

  chatForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput?.value.trim();
    if (!text) return;

    addMessage("user", text);
    chatHistory.push({ role: "user", content: text });
    if (chatInput) chatInput.value = "";

    try {
      showTyping();
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: chatHistory }),
      });
      const data = await resp.json();
      hideTyping();
      const reply = data.reply || "Sorry, I could not generate a reply.";
      addMessage("bot", reply);
      chatHistory.push({ role: "assistant", content: reply });
    } catch (err) {
      hideTyping();
      console.error("Chat error:", err);
      addMessage("bot", "There was an error. Please try again.");
    }
  });

  const openResetModal = () => resetModal?.classList.remove("hidden");
  const closeResetModal = () => resetModal?.classList.add("hidden");

  resetBtn?.addEventListener("click", openResetModal);
  resetClose?.addEventListener("click", closeResetModal);
  resetModal?.addEventListener("click", (e) => {
    if (e.target === resetModal) closeResetModal();
  });
  document.addEventListener("keydown", (e) => {
    if (resetModal && !resetModal.classList.contains("hidden") && e.key === "Escape") {
      closeResetModal();
    }
  });

  resetConfirm?.addEventListener("click", () => {
    chatHistory.length = 0;
    document.querySelectorAll("#chat-messages .msg-wrapper").forEach((el) => el.remove());
    addMessage("bot", "What can I do for you today?");
    closeResetModal();
  });

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
