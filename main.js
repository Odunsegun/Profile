

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

if (darkMode === 'abled') {
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

document.addEventListener("scroll", () => {
    const timeline = document.querySelector('.timeline');
    const timelineHeight = timeline.scrollHeight; // Full height of the timeline
    const viewportHeight = window.innerHeight; // Viewport height
    const timelineTop = timeline.getBoundingClientRect().top; // Position of timeline relative to viewport

    // Calculate how much of the timeline is in the viewport
    const scrolledPercentage = Math.min(1, Math.max(0, (viewportHeight - timelineTop) / timelineHeight));

    // Dynamically set the height of the line
    const line = timeline.querySelector('::after'); // CSS ::after pseudo-element
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
    '.language-card, .tool-card, .framework-card'
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

/*Sidenav*/
/*SLIDER */


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


// ===== Responsive slider regrouping: 2-per-page (desktop) ↔ 1-per-page (mobile) =====
