import { evaluatePasswordStrength, FIELD_CONFIGS, fieldStates, isFormValid } from './validators.js';

export function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;
  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(toggleBtn, currentTheme);

  toggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    updateThemeIcon(toggleBtn, nextTheme);
  });
}

function updateThemeIcon(btn, theme) {
  btn.innerHTML = theme === 'dark' ? '🌙' : '☀️';
  btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}

export function initPasswordVisibility() {
  const toggleBtn = document.getElementById('password-toggle');
  const passwordInput = document.getElementById('password');
  if (!toggleBtn || !passwordInput) return;

  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    toggleBtn.innerHTML = isPassword ? '🙈' : '👁️';
  });
}

export function updateProgressRing() {
  const circle = document.getElementById('progress-circle');
  const progressText = document.getElementById('progress-percentage');
  if (!circle || !progressText) return;

  const requiredFields = Object.keys(FIELD_CONFIGS).filter((id) => FIELD_CONFIGS[id].required);
  const completedCount = requiredFields.filter((id) => fieldStates[id]).length;
  const percent = Math.round((completedCount / requiredFields.length) * 100);
  const circumference = 126;
  const offset = circumference - (percent / 100) * circumference;

  circle.style.strokeDashoffset = offset;
  progressText.textContent = `${percent}%`;

  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.disabled = !isFormValid();
    submitBtn.textContent = isFormValid() ? 'Launch the Mission 🚀' : 'Complete every field';
  }
}

export function initExplainerHighlights() {
  const inputs = document.querySelectorAll('.card input, .card textarea, .card .dropzone');
  inputs.forEach((input) => {
    const fieldId = input.id;
    const explainerCard = document.getElementById(`explain-${fieldId}`);

    input.addEventListener('focus', () => {
      if (explainerCard) explainerCard.classList.add('highlighted');
    });

    input.addEventListener('blur', () => {
      if (explainerCard) explainerCard.classList.remove('highlighted');
    });
  });
}

export function renderFieldState(fieldId, isValid, value) {
  const feedback = document.getElementById(`fb-${fieldId}`);
  const statusIcon = document.getElementById(`status-icon-${fieldId}`);
  const config = FIELD_CONFIGS[fieldId];
  if (!feedback || !config) return;

  const input = fieldId === 'file'
    ? document.getElementById('file-dropzone')
    : document.getElementById(fieldId);

  if (input) {
    input.classList.remove('valid', 'invalid');
  }
  feedback.classList.remove('visible', 'ok', 'err', 'pending');
  feedback.textContent = '';

  if (statusIcon) {
    statusIcon.classList.remove('visible');
  }

  if (String(value).trim() === '') {
    if (statusIcon) statusIcon.innerHTML = '';
    return;
  }

  if (isValid) {
    if (input) input.classList.add('valid');
    feedback.textContent = config.okMessage;
    feedback.classList.add('visible', 'ok');
    if (statusIcon) {
      statusIcon.innerHTML = '🌟';
      statusIcon.classList.add('visible');
    }
  } else {
    if (input) input.classList.add('invalid');
    feedback.textContent = config.errorMessage;
    feedback.classList.add('visible', 'err');
    if (statusIcon) {
      statusIcon.innerHTML = '⚠️';
      statusIcon.classList.add('visible');
    }
  }
}

export function renderPasswordStrength(value) {
  const meterFill = document.getElementById('strength-meter-fill');
  const strengthScore = document.getElementById('strength-score');
  const criteriaContainer = document.getElementById('password-criteria-list');

  if (!meterFill || !strengthScore || !criteriaContainer) return;

  if (String(value).trim() === '') {
    meterFill.style.width = '0%';
    strengthScore.textContent = 'Entropy score: 0 bits';
    criteriaContainer.querySelectorAll('.criterion').forEach((crit) => crit.classList.remove('passed'));
    return;
  }

  const { criteria, score, entropyBits, strengthLabel } = evaluatePasswordStrength(value);
  const percent = Math.max(0, Math.min(100, (score / 5) * 100));
  meterFill.style.width = `${percent}%`;
  meterFill.style.background = score <= 1 ? 'var(--error)' : score <= 3 ? 'var(--warning)' : score === 4 ? 'var(--accent)' : 'var(--success)';
  strengthScore.textContent = `${strengthLabel} · ${entropyBits} bits`;

  Object.entries(criteria).forEach(([key, passed]) => {
    const el = document.getElementById(`crit-${key}`);
    if (el) {
      if (passed) el.classList.add('passed');
      else el.classList.remove('passed');
    }
  });
}

let lastUnlockedBadgeIds = [];

export function initOnboardingTour() {
  const overlay = document.getElementById('onboarding-overlay');
  const stepNumber = document.getElementById('onboarding-step-number');
  const title = document.getElementById('onboarding-title');
  const copy = document.getElementById('onboarding-copy');
  const nextBtn = document.getElementById('onboarding-next');
  const skipBtn = document.getElementById('onboarding-skip');

  if (!overlay || !stepNumber || !title || !copy || !nextBtn || !skipBtn) return;

  if (localStorage.getItem('magical-validator-tour-complete') === 'true') {
    overlay.hidden = true;
    return;
  }

  const steps = [
    {
      title: 'Welcome to the mission',
      copy: 'Start by choosing a nickname. Each valid field will light up and fill your progress ring.',
      target: '#username'
    },
    {
      title: 'Watch your progress grow',
      copy: 'Complete the required fields to unlock badges and keep the mission moving.',
      target: '.progress-container'
    },
    {
      title: 'Test your pattern instincts',
      copy: 'Open the sandbox to try regex ideas and compare them against real sample strings.',
      target: '.sandbox'
    },
    {
      title: 'Launch when ready',
      copy: 'Once everything looks good, submit and celebrate your unlocked badges.',
      target: '#submit-btn'
    }
  ];

  let currentStep = 0;

  const clearHighlight = () => {
    document.querySelectorAll('.tour-target-active').forEach((element) => element.classList.remove('tour-target-active'));
  };

  const showStep = () => {
    clearHighlight();
    const step = steps[currentStep];
    if (!step) {
      overlay.hidden = true;
      localStorage.setItem('magical-validator-tour-complete', 'true');
      return;
    }

    stepNumber.textContent = `${currentStep + 1}`;
    title.textContent = step.title;
    copy.textContent = step.copy;
    nextBtn.textContent = currentStep === steps.length - 1 ? 'Start mission' : 'Next';

    const target = document.querySelector(step.target);
    if (target) target.classList.add('tour-target-active');
    overlay.hidden = false;
  };

  const finishTour = () => {
    clearHighlight();
    overlay.hidden = true;
    localStorage.setItem('magical-validator-tour-complete', 'true');
  };

  const handleNextClick = (event) => {
    event?.preventDefault();
    currentStep += 1;
    if (currentStep >= steps.length) {
      finishTour();
      return;
    }
    showStep();
  };

  nextBtn.addEventListener('click', handleNextClick);

  skipBtn.addEventListener('click', (event) => {
    event?.preventDefault();
    finishTour();
  });
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) finishTour();
  });

  document.addEventListener('keydown', (event) => {
    if (!overlay.hidden && event.key === 'Escape') finishTour();
  });

  showStep();
}

export function renderAchievements(unlockedIds = []) {
  const panel = document.getElementById('achievement-summary');
  if (!panel) return;

  const normalizedIds = [...new Set(unlockedIds)];
  const newlyUnlocked = normalizedIds.filter((id) => !lastUnlockedBadgeIds.includes(id));
  const badges = normalizedIds.length
    ? normalizedIds.map((id) => {
      const badge = ['regex-rookie', 'mailbox-master', 'security-sentinel', 'signal-keeper', 'age-gate', 'github-galaxy', 'data-overlord', 'archive-keeper'].includes(id)
        ? {
          id,
          title: id.replace(/-/g, ' '),
          description: 'Unlocked in the mission log.',
          icon: '🏅'
        }
        : null;
      return badge;
    }).filter(Boolean)
    : [];

  panel.innerHTML = badges.length
    ? `<h3>Unlocked Badges</h3><div class="achievement-grid">${badges.map((badge) => `<div class="achievement-card${newlyUnlocked.includes(badge.id) ? ' just-unlocked' : ''}" data-badge-id="${badge.id}"><span class="achievement-icon">🏅</span><strong>${badge.title}</strong><p>${badge.description}</p></div>`).join('')}</div>`
    : '<h3>Unlocked Badges</h3><p class="achievement-empty">No badges yet — complete the mission to begin your collection.</p>';

  if (newlyUnlocked.length) {
    panel.classList.remove('achievement-panel-celebrate');
    void panel.offsetWidth;
    panel.classList.add('achievement-panel-celebrate');
    triggerSuccessCelebration();
    window.setTimeout(() => panel.classList.remove('achievement-panel-celebrate'), 1800);
  }

  lastUnlockedBadgeIds = normalizedIds;
}

let confettiActive = false;
export function triggerSuccessCelebration() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas || confettiActive) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#8b5cf6', '#ec4899', '#00d4ff', '#20f5b0', '#ffb84d'];
  const particles = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: Math.random() * 5 + 4,
    speedX: Math.random() * 4 - 2,
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 4 - 2
  }));

  const rocket = { x: canvas.width / 2, y: canvas.height - 100, size: 18, velocityY: -7 };
  confettiActive = true;
  let startTime = Date.now();

  function animate() {
    if (!confettiActive) return;
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.y += particle.speedY;
      particle.x += particle.speedX;
      particle.rotation += particle.rotationSpeed;
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      ctx.restore();
    });

    rocket.y += rocket.velocityY;
    rocket.velocityY *= 0.98;
    ctx.save();
    ctx.translate(rocket.x, rocket.y);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(0, -rocket.size * 2);
    ctx.lineTo(rocket.size, rocket.size);
    ctx.lineTo(0, rocket.size / 2);
    ctx.lineTo(-rocket.size, rocket.size);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(-rocket.size / 2, rocket.size / 2, rocket.size, rocket.size / 1.4);
    ctx.restore();

    if (Date.now() - startTime < 3200) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiActive = false;
    }
  }

  animate();
}
