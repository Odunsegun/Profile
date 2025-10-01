document.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrolled = (scrollTop / docHeight) * 100;

  const progressBar = document.querySelector(".scroll-progress");
  progressBar.style.width = scrolled + "%";

  // Brightness increases as you scroll down
  const brightness = 0.6 + (scrolled / 100) * 0.8; // 0.6 → 1.4
  progressBar.style.filter = `brightness(${brightness})`;
});


let darkMode = localStorage.getItem("darkMode");
const darkModeToggle = document.querySelector('#dark-mode-toggle');
//check if dark mod is enabled
//if abled, turn it off
//if disaled, turn it on

const abledDarkMode = () => {
    //add class darkmode
    document.body.classList.add('darkmode');
    document.body.classList.remove('lightmode');
    //update darkMode in localstorage
    localStorage.setItem('darkMode', 'abled')
};

const disabledDarkMode = () => {
    //add class darkmode
    document.body.classList.remove('darkmode');
    document.body.classList.add('lightmode');
    //update darkMode in localstorage
    localStorage.setItem('darkMode', 'disabled')
};

if (darkMode === 'abled' || darkMode===null) {
    abledDarkMode();
} else {
    disabledDarkMode(); 
}

darkModeToggle.addEventListener("click", () => {
    darkMode = localStorage.getItem("darkMode");
    if (darkMode != 'abled'){
        abledDarkMode();
        console.log(darkMode);
    } 
    else{
        disabledDarkMode();
    }
}); 

const body = document.querySelector("body"),
    sidebar = body.querySelector(".sidebar"),
    toggle = body.querySelector(".toggle"),
    searchBtn = body.querySelector(".search-box");

    toggle.addEventListener("click", () =>{
        sidebar.classList.toggle("close");
    });

document.addEventListener("DOMContentLoaded", () => {
    const timelineContainers = document.querySelectorAll(".timeline-container");
  
    // Function to check if an element is in the viewport
    function isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      );
    }
  
    // Function to add animation class when in viewport
    function handleScroll() {
      timelineContainers.forEach((container) => {
        if (isInViewport(container)) {
          container.style.opacity = "1";
          container.style.transform = "translateY(0)";
        }
      });
    }
  
    // Event listener for scrolling
    window.addEventListener("scroll", handleScroll);
  
    // Initial check on page load
    handleScroll();
});

document.addEventListener("DOMContentLoaded", () => {
  const chatToggle  = document.getElementById("chat-toggle");
  const chatbox     = document.getElementById("chatbox");
  const chatClose   = document.getElementById("chat-close");
  const chatForm    = document.getElementById("chat-form");
  const chatInput   = document.getElementById("chat-input");
  const chatMessages= document.getElementById("chat-messages");
  const typing      = document.getElementById("typing-indicator");

  // NEW: modal elements
  const resetBtn    = document.getElementById("chat-reset");
  const resetModal  = document.getElementById("reset-modal");
  const resetClose  = document.getElementById("reset-close");
  const resetConfirm= document.getElementById("reset-confirm");

  let chatHistory = []; // ← same scope used by submit & reset

  // helpers
  function showTyping() {
    let typingIndicator = document.getElementById("typing-indicator");
    if (!typingIndicator) {
      typingIndicator = document.createElement("div");
      typingIndicator.id = "typing-indicator";
      typingIndicator.className = "typing-indicator";
      typingIndicator.innerHTML = `
        <img src="assets/avatar.svg" class="msg-avatar" alt="Insight AI">
        <div class="msg bot">
          <lottie-player 
            src="assets/chat.json"  
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
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) typingIndicator.remove();
  }


  function addMessage(role, text) {
    const msgWrapper = document.createElement("div");
    msgWrapper.className = `msg-wrapper ${role}`;

    if (role === "bot") {
      const avatar = document.createElement("img");
      avatar.src = "assets/avatar.svg";
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



  // open / close
  chatToggle?.addEventListener("click", () => {
    chatbox.classList.toggle("hidden");
    if (!chatbox.classList.contains("hidden") && !chatMessages.children.length) {
      // Add welcome card first
      const welcome = document.createElement("div");
      welcome.className = "welcome-card";
      welcome.innerHTML = `
        <img src="assets/avatar.svg" alt="Insight Avatar">
        <h3>Insight</h3>
        <p>Your personal AI assistant. Ask me about Israel’s projects, skills, or experience!</p>
      `;
      chatMessages.appendChild(welcome);

      // Then the first bot message
      addMessage("bot", "What can I do for you today?");
    }
  });
  chatClose?.addEventListener("click", () => chatbox.classList.add("hidden"));

  // submit → backend (you already have this wired; keep your fetch)
  chatForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage("user", text);
    chatHistory.push({ role: "user", content: text });
    chatInput.value = "";
    try {
      showTyping();
      const resp = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: chatHistory })
      });
      const data = await resp.json();
      hideTyping();
      const reply = data.reply || "⚠️ Sorry, I couldn’t generate a reply.";
      addMessage("bot", reply);
      chatHistory.push({ role: "assistant", content: reply });
    } catch (err) {
      hideTyping();
      console.error("Chat error:", err);
      addMessage("bot", "⚠️ There was an error. Please try again.");
    }
  });

  // —— RESET MODAL LOGIC ——
  const openResetModal  = () => resetModal?.classList.remove("hidden");
  const closeResetModal = () => resetModal?.classList.add("hidden");

  // show modal
  resetBtn?.addEventListener("click", openResetModal);

  // close modal by X
  resetClose?.addEventListener("click", closeResetModal);

  // click outside dialog closes
  resetModal?.addEventListener("click", (e) => {
    if (e.target === resetModal) closeResetModal();
  });

  // Esc key closes
  document.addEventListener("keydown", (e) => {
    if (!resetModal.classList.contains("hidden") && e.key === "Escape") {
      closeResetModal();
    }
  });

  // confirm restart
  resetConfirm?.addEventListener("click", () => {
    chatHistory.length = 0;           // clear array in-place
    document.querySelectorAll("#chat-messages .msg-wrapper").forEach(el => el.remove());
    addMessage("bot", "What can I do for you today?");
    closeResetModal();
  });



  const filterButtons = document.querySelectorAll(".arsenal-filters button");

  // All the inner “card” DIVs we use for matching
  const allCards = document.querySelectorAll(
    ".language-card, .tool-card, .framework-card, .all-card"
  );

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");

      // active button UI
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      allCards.forEach(card => {
        // THIS is the flex item in your layout:
        const flexItem = card.closest(".card-touch") || card;

        // show/hide the WHOLE flex item
        if (filter === "all" || card.classList.contains(filter)) {
          flexItem.classList.remove("hidden");
        } else {
          flexItem.classList.add("hidden");
        }
      });
    });
  });

});



document.addEventListener("scroll", () => {
    const timeline = document.querySelector('.timeline');
    const timelineHeight = timeline.scrollHeight; // Full height of the timeline
    const viewportHeight = window.innerHeight; // Viewport height
    const timelineTop = timeline.getBoundingClientRect().top; // Position of timeline relative to viewport

    // Calculate how much of the timeline is in the viewport
    const scrolledPercentage = Math.min(1, Math.max(0, (viewportHeight - timelineTop) / timelineHeight));

    // Dynamically set the height of the line
    const line = timeline.querySelector('.timeline-line'); // CSS ::after pseudo-element
    line.style.height = `${scrolledPercentage * 100}%`;
    timeline.style.setProperty('--line-height', `${scrolledPercentage * 100}%`);
});



//GALLERY
window.onload = function () {
    const gallery = document.querySelector(".gallery");
    const previewImage = document.querySelector(".preview-img img");
    //const previewVideo = document.querySelector(".preview-img video");

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
        "https://www.youtube.com/"
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

        link.appendChild(img);  // put image inside the <a>
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
                yPercent: -50 // This centers the image vertically in the ring
              });
              
        });
    }

    let currentRotation = 0;
    let animationId
    function animateGallery() {
        currentRotation += 0.2;
        placeItems(currentRotation);
        animationId = requestAnimationFrame(animateGallery);
    }

    animateGallery();

    // Hover interaction
    items.forEach((item) => {
        item.addEventListener("mouseover", () => {
            cancelAnimationFrame(animationId);
            previewImage.src = item.querySelector("img").src;
            //previewVideo.src = videoSources[i % videoSources.length];
            //previewVideo.play()
            gsap.to(item, {
                scale: 1.2,
                duration: 0.3,
                ease: "power2.out",
            });
        });

        item.addEventListener("mouseout", () => {
            animateGallery();
            //previewVideo.pause();
            gsap.to(item, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
            });
        });
    });
};


function setupRotation() {
    // Add anything here if needed
}


//Tools Frameworks
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.stack-tab');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const target = button.getAttribute('data-tab');
    tabContents.forEach(tab => {
      tab.classList.remove('active');
      if (tab.id === target) tab.classList.add('active');
    });
  });
});

//Greetngs
const greetings = ["Hi", "Salut", "Bawo ni"];
let index = 0;
setInterval(() => {
  document.getElementById("greeting-text").textContent = greetings[index];
  index = (index + 1) % greetings.length;
}, 3000);


//Hover card
document.querySelectorAll(
    '.language-card, .tool-card, .framework-card, .all-card'
  ).forEach(card => {
    const img = card.querySelector('img');
    const originalSrc = img?.getAttribute('src');
    const hoverSrc = img?.getAttribute('data-hover');
  
    card.addEventListener('mouseenter', () => {
      if (hoverSrc) img.src = hoverSrc;
    });
  
    card.addEventListener('mouseleave', () => {
      if (originalSrc) img.src = originalSrc;
    });
  });

  document.querySelectorAll('.logo-swap').forEach(container => {
    const svg = container.querySelector('svg');
    const hoverSrc = container.dataset.hover;

    // Create <img> for hover
    const img = document.createElement('img');
    img.src = hoverSrc;
    img.style.display = 'none';
    img.style.width = svg.style.width || '50px';
    img.style.height = svg.style.height || '50px';
    img.className = 'java-logo'; // optional for consistent styling
    container.appendChild(img);

    container.addEventListener('mouseenter', () => {
      svg.style.display = 'none';
      img.style.display = 'block';
    });

    container.addEventListener('mouseleave', () => {
      svg.style.display = 'block';
      img.style.display = 'none';
    });
  });

//MOUSE LIGHT
const glow = document.createElement('div');
glow.classList.add('cursor-glow');
document.body.appendChild(glow);

document.addEventListener('mousemove', (e) => {
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
});



//scroll animation
  const satellite = document.querySelector('.satellite');
  const planet = document.querySelector('.planet');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Adjust these multipliers for speed/direction
    satellite.style.transform = `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.05}deg)`;
    planet.style.transform = `translateY(-${scrollY * 0.1}px) rotate(-${scrollY * 0.05}deg)`;
  });


/* SIDENAVVVVVVVV */
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

/* ===== Slider logic (radio-driven) ===== */
const radios = Array.from(document.querySelectorAll('input[name="radio-btn"]'));
if (radios.length) {
  const mql = window.matchMedia('(max-width: 768px)');
  const maxSlides = () => (mql.matches ? 4 : 2);

  const getIndex = () => {
    const i = radios.findIndex(r => r.checked);
    return i === -1 ? 0 : i;
  };
  const setIndex = (i) => { radios[i].checked = true; };

  const nextSlide = () => {
    const i = getIndex();
    setIndex((i + 1) % maxSlides());
  };
  const prevSlide = () => {
    const i = getIndex();
    const m = maxSlides();
    setIndex((i - 1 + m) % m);
  };

  // Auto-rotate
  let auto = setInterval(nextSlide, 6000);

  // Pause auto-rotate on hover (optional)
  const sliderTrack = document.querySelector('.slider-track');
  if (sliderTrack) {
    sliderTrack.addEventListener('mouseenter', () => clearInterval(auto));
    sliderTrack.addEventListener('mouseleave', () => (auto = setInterval(nextSlide, 6000)));
  }

  // Arrow clicks -> change radios
  const leftArrow  = document.querySelector('.arrow.left');
  const rightArrow = document.querySelector('.arrow.right');
  leftArrow?.addEventListener('click', (e) => { e.preventDefault(); prevSlide(); });
  rightArrow?.addEventListener('click', (e) => { e.preventDefault(); nextSlide(); });

  // If viewport crosses 768px, clamp to valid page count
  mql.addEventListener('change', () => {
    const i = getIndex();
    if (i >= maxSlides()) setIndex(maxSlides() - 1);
  });
}



// Resume Modal Logic
const modal = document.getElementById("resumeModal");
const btn = document.getElementById("viewResumeBtn");
const closeBtn = document.querySelector(".close");

btn.onclick = () => modal.style.display = "block";
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};












