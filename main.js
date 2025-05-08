

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


/*
// Select all timeline containers
const timelineContainers = document.querySelectorAll('.timeline-container');

// Create an Intersection Observer
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        // Check if the element is visible in the viewport
        if (entry.isIntersecting) {
            // Add the 'animate' class to trigger the CSS animation
            entry.target.classList.add('animate');
            // Optionally stop observing this element after animation
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.5 // Trigger when 50% of the element is visible
});

// Attach the observer to each timeline container
timelineContainers.forEach(container => observer.observe(container));


const timeline = document.querySelector('.timeline');

const lineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            timeline.classList.add('line-animate');
            lineObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.5
});

// Observe the timeline container
lineObserver.observe(timeline);
*/

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



/*gsap.registerPlugin("ScrollTrigger");

let slideTrack = document.querySelector(".slide-track");
let slideImages = gsap.utils.toArray(".slide");

function setup(){
    let radius = slideTrack.offsetWidth / 2;
    let center = slideTrack.offsetWidth / 2;
    let total = slideImages.length;
    let slice = 2 * (Math.PI) / total;

    slideImages.forEach((item, i) => {
        let angle = i * slice;

        let x = center + radius * Math.sin(angle);
        let y = center + radius * Math.cos(angle);

        gsap.set(item, {
            rotation: angle + "-rad",
            xPercent: -50,
            yPercent: -50,
            x: x,
            y: y,
        });
    });
}

gsap.to(".slide-track", {
    rotate: () => -360,
    ease: "none",
    duration: slideImages.length,
    scrollTrigger:{
        start: 0,
        end: "max",
        scrub: 1,
        snap: 1 / slideImages.length,
        invlidateOnRefresh: true,
    },
});
//setup();
//window.addEventListener("resize", setup);
*/


//GALLERY
/*window.onload = function () {
    const gallery = document.querySelector(".gallery");
    const previewImage = document.querySelector(".preview-img img");

    document.addEventListener("mousemove", function (event) {
        const x = event.clientX;
        const y = event.clientY;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const percentX = (x - centerX) / centerX;
        const percentY = (y - centerY) / centerY;

        const rotateX = 55 + percentY * 2;
        const rotateY = percentX * 2;

        gsap.to(gallery, {
            duration: 1,
            ease: "power2.out",
            rotateX: rotateX,
            rotateY: rotateY,
            overwrite: "auto",
        });
    });

    // ✅ CREATE IMAGES
    for (let i = 0; i < 150; i++) {
        const item = document.createElement("div");
        item.className = "gallery-item";

        const img = document.createElement("img");
        img.src = "images/Grey.co_pic.png";
        img.className = "gallery-img";

        item.appendChild(img);
        gallery.appendChild(item);
    }

    const items = document.querySelectorAll(".gallery-item");
    const numberOfItems = items.length;
    const angleIncrement = 360 / numberOfItems;
    const radius = 500;

    // ✅ PLACE IN CIRCLE
    items.forEach((item, index) => {
        const angle = index * angleIncrement;

        gsap.set(item, {
            rotationY: angle,
            transformOrigin: `0px 0px -${radius}px`,
            z: radius,
        });

        item.addEventListener("mouseover", () => {
            previewImage.src = item.querySelector("img").src;
            gsap.to(item, {
                scale: 1.2,
                duration: 0.3,
                ease: "power2.out",
            });
        });

        item.addEventListener("mouseout", () => {
            previewImage.src = "images/Grey.co_pic.png";
            gsap.to(item, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
            });
        });
    });

    // ✅ ROTATE GALLERY
    gsap.to(".gallery", {
        rotateY: 360,
        repeat: -1,
        ease: "none",
        duration: 60,
        transformOrigin: `center center -${radius}px`,
    });

    // ✅ OPTIONAL: SCROLL TRIGGERED ROTATION (COMBINED WITH AUTO)
    ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 2,
        onRefresh: setupRotation,
        onUpdate: (self) => {
            const rotationProgress = self.progress * 360;
            items.forEach((item, index) => {
                const currentAngle = index * angleIncrement + rotationProgress;
                gsap.to(item, {
                    rotationY: currentAngle,
                    duration: 1,
                    ease: "power3.out",
                    overwrite: "auto",
                });
            });
        },
    });
};
*/
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
const leftArrow = document.querySelector('.arrow.left');
const rightArrow = document.querySelector('.arrow.right');
const sliderTrack = document.querySelector('.slider-track');

function updateArrowVisibility() {
    const maxScrollLeft = sliderTrack.scrollWidth - sliderTrack.clientWidth;
  
    leftArrow.style.display = sliderTrack.scrollLeft > 0 ? 'block' : 'none';
    rightArrow.style.display = sliderTrack.scrollLeft < maxScrollLeft - 1 ? 'block' : 'none';
}

leftArrow.addEventListener('click', () => {
    sliderTrack.scrollBy({ left: -window.innerWidth * 0.9, behavior: 'smooth' });
});
  

rightArrow.addEventListener('click', () => {
    sliderTrack.scrollBy({ left: window.innerWidth * 0.9, behavior: 'smooth' });
});

sliderTrack.addEventListener('scroll', updateArrowVisibility);

// Initial state
window.addEventListener('load', updateArrowVisibility);

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
