// Keep dark mode permanently for a consistent black theme.
document.body.classList.add("dark-theme");

// Custom Cursor (with smooth lerp)
const cursorDot = document.getElementById("cursor-dot");
const cursorRing = document.getElementById("cursor-ring");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

if (cursorDot && cursorRing && window.innerWidth > 768) {
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  const loop = () => {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(loop);
  };
  loop();

  document.querySelectorAll("a, button, .bento-cell").forEach((el) => {
    el.addEventListener("mouseenter", () => cursorRing.classList.add("active"));
    el.addEventListener("mouseleave", () =>
      cursorRing.classList.remove("active"),
    );
  });
}

// 3D Canvas Background Particles
const canvas = document.getElementById("canvas3d");
const ctx = canvas.getContext("2d");
let width, height;
let particles = [];

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.x = (Math.random() - 0.5) * 3000;
    this.y = (Math.random() - 0.5) * 3000;
    this.z = Math.random() * 2000;
    this.speedZ = Math.random() * 2 + 0.5;
  }
  update() {
    this.z -= this.speedZ;
    if (this.z <= 0) {
      this.z = 2000;
      this.x = (Math.random() - 0.5) * 3000;
      this.y = (Math.random() - 0.5) * 3000;
    }
  }
  draw() {
    const fov = 350;
    const scale = fov / (fov + this.z);
    const projX = this.x * scale + width / 2;
    const projY = this.y * scale + height / 2;

    const size = Math.max(0.1, 3 * scale);
    const opacity = Math.max(0, 1 - this.z / 2000);

    // Dynamic color based on theme would be cool, but neon blue/purple fits both well
    ctx.fillStyle = `rgba(96, 165, 250, ${opacity})`;
    ctx.beginPath();
    ctx.arc(projX, projY, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for (let i = 0; i < 300; i++) particles.push(new Particle());

function render3DCanvas() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(render3DCanvas);
}
render3DCanvas();

// Advanced 3D Tilt & Glare Effect (Vanilla JS)
const tiltCells = document.querySelectorAll(".bento-cell[data-tilt]");

tiltCells.forEach((cell) => {
  const inner = cell.querySelector(".bento-inner");
  if (!inner) return;

  // Create glare
  const glare = document.createElement("div");
  glare.className = "bento-glare";
  inner.appendChild(glare);

  const parallaxEls = inner.querySelectorAll(".parallax-el");

  cell.addEventListener("mousemove", (e) => {
    if (window.innerWidth < 1024) return;

    const rect = cell.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate tilt angles (Max 8 degrees for premium feel)
    const tiltX = ((y - centerY) / centerY) * -8;
    const tiltY = ((x - centerX) / centerX) * 8;

    cell.style.transform = `perspective(1500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;

    // Apply glare
    const angle = (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI - 90;
    glare.style.transform = `translateY(${y - centerY}px) translateX(${x - centerX}px) translateZ(10px)`;
    glare.style.opacity = "1";

    // Parallax depth for internal elements
    parallaxEls.forEach((el) => {
      const z = el.getAttribute("data-z") || 20;
      const xOffset = (x - centerX) * (z / 1000);
      const yOffset = (y - centerY) * (z / 1000);
      el.style.transform = `translateZ(${z}px) translateX(${xOffset}px) translateY(${yOffset}px)`;
    });
  });

  cell.addEventListener("mouseleave", () => {
    cell.style.transform = `perspective(1500px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    glare.style.opacity = "0";
    parallaxEls.forEach((el) => {
      const z = el.getAttribute("data-z") || 20;
      el.style.transform = `translateZ(0px) translateX(0px) translateY(0px)`;
    });
  });
});

// Staggered 3D Reveal Observer
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    let delay = 0;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("revealed");
        }, delay);
        delay += 100; // Stagger effect
        observer.unobserve(entry.target);
      }
    });
  },
  { rootMargin: "0px", threshold: 0.1 },
);

document
  .querySelectorAll(".bento-anim")
  .forEach((el) => revealObserver.observe(el));
