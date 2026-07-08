import { evaluatePasswordStrength, FIELD_CONFIGS, fieldStates, isFormValid } from "./validators";

// ── THEME MANAGER ──
export function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  // Check saved theme or default to light
  const currentTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon(toggleBtn, currentTheme);

  toggleBtn.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = activeTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    updateThemeIcon(toggleBtn, nextTheme);
  });
}

function updateThemeIcon(btn, theme) {
  if (theme === "dark") {
    btn.innerHTML = "☀️";
    btn.setAttribute("aria-label", "Switch to light theme");
  } else {
    btn.innerHTML = "🌙";
    btn.setAttribute("aria-label", "Switch to dark theme");
  }
}

// ── PASSWORD VISIBILITY TOGGLE ──
export function initPasswordVisibility() {
  const toggleBtn = document.getElementById("password-toggle");
  const passwordInput = document.getElementById("password");

  if (!toggleBtn || !passwordInput) return;

  toggleBtn.addEventListener("click", () => {
    const isPassword = passwordInput.getAttribute("type") === "password";
    passwordInput.setAttribute("type", isPassword ? "text" : "password");
    toggleBtn.innerHTML = isPassword ? "🙈" : "👁️";
  });
}

// ── CIRCULAR PROGRESS RING ──
export function updateProgressRing() {
  const circle = document.getElementById("progress-circle");
  const progressText = document.getElementById("progress-percentage");
  if (!circle || !progressText) return;

  // Calculate progress based on required fields (total of 4 required)
  const requiredFields = Object.keys(FIELD_CONFIGS).filter(id => FIELD_CONFIGS[id].required);
  const completedCount = requiredFields.filter(id => fieldStates[id]).length;
  const percent = Math.round((completedCount / requiredFields.length) * 100);

  // SVG circumference logic: r=20, C = 2 * PI * r = 125.66 (round to 126)
  const circumference = 126;
  const offset = circumference - (percent / 100) * circumference;
  
  circle.style.strokeDashoffset = offset;
  progressText.textContent = `${percent}%`;

  const submitBtn = document.getElementById("submit-btn");
  if (submitBtn) {
    submitBtn.disabled = !isFormValid();
  }
}

// ── HIGHLIGHT ACTIVE FIELD IN EXPLAINER ──
export function initExplainerHighlights() {
  const inputs = document.querySelectorAll(".card input");

  inputs.forEach(input => {
    const fieldId = input.id;
    const explainerCard = document.getElementById(`explain-${fieldId}`);
    
    input.addEventListener("focus", () => {
      if (explainerCard) {
        explainerCard.classList.add("highlighted");
        // Scroll explainer into view on small screens if side-by-side isn't active
        if (window.innerWidth < 768) {
          // Subtle scrolling
        }
      }
    });

    input.addEventListener("blur", () => {
      if (explainerCard) {
        explainerCard.classList.remove("highlighted");
      }
    });
  });
}

// ── RENDER INDIVIDUAL FIELD STATES ──
export function renderFieldState(fieldId, isValid, value) {
  const input = document.getElementById(fieldId);
  const feedback = document.getElementById(`fb-${fieldId}`);
  const statusIcon = document.getElementById(`status-icon-${fieldId}`);
  const config = FIELD_CONFIGS[fieldId];

  if (!input || !feedback) return;

  // Reset classes
  input.classList.remove("valid", "invalid");
  feedback.classList.remove("visible", "ok", "err");
  feedback.textContent = "";

  if (statusIcon) {
    statusIcon.classList.remove("visible");
  }

  // Handle empty
  if (value.trim() === "") {
    if (statusIcon) statusIcon.innerHTML = "";
    return;
  }

  if (isValid) {
    input.classList.add("valid");
    feedback.textContent = config.okMessage;
    feedback.classList.add("visible", "ok");
    if (statusIcon) {
      statusIcon.innerHTML = "🌟";
      statusIcon.classList.add("visible");
    }
  } else {
    input.classList.add("invalid");
    feedback.textContent = config.errorMessage;
    feedback.classList.add("visible", "err");
    if (statusIcon) {
      statusIcon.innerHTML = "⚠️";
      statusIcon.classList.add("visible");
    }
  }
}

// ── PASSWORD STRENGTH RENDERER ──
export function renderPasswordStrength(value) {
  const segments = document.querySelectorAll(".strength-segment");
  const criteriaContainer = document.getElementById("password-criteria-list");

  if (value.trim() === "") {
    segments.forEach(seg => seg.style.background = "transparent");
    if (criteriaContainer) {
      criteriaContainer.querySelectorAll(".criterion").forEach(crit => {
        crit.classList.remove("passed");
      });
    }
    return;
  }

  const { criteria, score } = evaluatePasswordStrength(value);

  // Update segments
  segments.forEach((seg, index) => {
    if (index < score) {
      // Color coding based on strength score
      if (score <= 2) {
        seg.style.background = "var(--error)"; // Red
      } else if (score <= 4) {
        seg.style.background = "var(--warning)"; // Orange/Amber
      } else {
        seg.style.background = "var(--success)"; // Green
      }
    } else {
      seg.style.background = "transparent";
    }
  });

  // Update checkmarks
  if (criteriaContainer) {
    for (const [key, passed] of Object.entries(criteria)) {
      const el = document.getElementById(`crit-${key}`);
      if (el) {
        if (passed) {
          el.classList.add("passed");
        } else {
          el.classList.remove("passed");
        }
      }
    }
  }
}

// ── CONFETTI ANIMATION ENGINE ──
let confettiActive = false;
export function triggerConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas || confettiActive) return;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = [
    "#8b5cf6", "#ec4899", "#10b981", "#3b82f6", 
    "#f59e0b", "#ff007f", "#00ffff", "#ffff00"
  ];

  const particles = [];
  const particleCount = 150;

  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.size = Math.random() * 8 + 6;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speedY = Math.random() * 5 + 4;
      this.speedX = Math.random() * 4 - 2;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;

      if (this.y > canvas.height) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  // Populate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new ConfettiParticle());
  }

  confettiActive = true;
  let startTime = Date.now();

  function animate() {
    if (!confettiActive) return;
    
    // Adjust canvas dimensions dynamically to avoid window resize listeners leaks
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Check timer (run confetti for 4 seconds)
    if (Date.now() - startTime < 4000) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiActive = false;
    }
  }

  animate();
}
