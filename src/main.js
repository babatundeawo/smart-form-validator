import {
  validateFieldValue,
  fieldStates,
  FIELD_CONFIGS,
  isFormValid,
  ACHIEVEMENT_BADGES
} from './modules/validators.js';
import {
  initThemeToggle,
  initPasswordVisibility,
  updateProgressRing,
  initExplainerHighlights,
  renderFieldState,
  renderPasswordStrength,
  triggerSuccessCelebration,
  renderAchievements,
  initOnboardingTour
} from './modules/ui.js';
import {
  initClipboardHelpers,
  initRegexSandbox
} from './modules/sandbox.js';

const ACHIEVEMENT_STORAGE_KEY = 'magical-validator-badges';

function getStoredAchievements() {
  try {
    return JSON.parse(localStorage.getItem(ACHIEVEMENT_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function persistAchievements(ids) {
  localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(ids));
}

function syncAchievements() {
  const unlocked = new Set(getStoredAchievements());
  ACHIEVEMENT_BADGES.forEach((badge) => {
    const isUnlocked = Boolean(fieldStates[badge.field]);
    if (isUnlocked) {
      unlocked.add(badge.id);
    } else {
      unlocked.delete(badge.id);
    }
  });
  persistAchievements([...unlocked]);
  renderAchievements([...unlocked]);
}

function formatPhoneValue(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.startsWith('234')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`.trim();
  }
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
}

function handleFieldChange(fieldId, value) {
  if (fieldId === 'username' && /\s/.test(value)) {
    const cleaned = value.replace(/\s+/g, '');
    const input = document.getElementById(fieldId);
    if (input) input.value = cleaned;
  }

  if (fieldId === 'phone') {
    const input = document.getElementById(fieldId);
    if (input) {
      const formatted = formatPhoneValue(input.value);
      input.value = formatted;
    }
  }

  const currentValue = document.getElementById(fieldId)?.value ?? value;
  const shouldAsync = ['username', 'email'].includes(fieldId);
  const feedback = document.getElementById(`fb-${fieldId}`);
  const statusIcon = document.getElementById(`status-icon-${fieldId}`);

  if (shouldAsync && currentValue.trim()) {
    if (feedback) {
      feedback.textContent = fieldId === 'username' ? 'Checking nickname availability…' : 'Checking mailbox availability…';
      feedback.classList.add('visible', 'pending');
      feedback.setAttribute('aria-live', 'polite');
    }
    if (statusIcon) {
      statusIcon.innerHTML = '⏳';
      statusIcon.classList.add('visible');
    }

    window.setTimeout(() => {
      const reserved = fieldId === 'username'
        ? ['admin', 'root', 'superuser', 'octocat']
        : ['admin@example.com', 'test@example.com', 'hello@world.com'];
      const normalized = currentValue.trim().toLowerCase();
      const isTaken = reserved.includes(normalized);
      const isValid = validateFieldValue(fieldId, currentValue) && !isTaken;
      renderFieldState(fieldId, isValid, currentValue);
      syncAchievements();
      updateProgressRing();
    }, 1000);
    return;
  }

  const isValid = validateFieldValue(fieldId, currentValue);
  renderFieldState(fieldId, isValid, currentValue);
  syncAchievements();
  updateProgressRing();
}

function bindFieldInputs() {
  const fieldIds = Object.keys(FIELD_CONFIGS);
  fieldIds.forEach((fieldId) => {
    const element = document.getElementById(fieldId);
    if (!element) return;

    ['input', 'change'].forEach((eventType) => {
      element.addEventListener(eventType, () => handleFieldChange(fieldId, element.value));
    });
  });
}

function bindFileDropzone() {
  const dropzone = document.getElementById('file-dropzone');
  const fileInput = document.getElementById('file-input');
  if (!dropzone || !fileInput) return;

  const updateFileSelection = (file) => {
    if (!file) return;
    const displayName = document.createElement('span');
    displayName.className = 'dropzone-file-name';
    displayName.textContent = file.name;
    const existing = dropzone.querySelector('.dropzone-file-name');
    if (existing) existing.remove();
    dropzone.appendChild(displayName);

    const isValid = validateFieldValue('file', file);
    renderFieldState('file', isValid, file);
    syncAchievements();
    updateProgressRing();
  };

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  });

  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('dragging');
  });

  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragging'));
  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('dragging');
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      fileInput.files = event.dataTransfer.files;
      updateFileSelection(file);
    }
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) {
      updateFileSelection(file);
    }
  });
}

function buildSubmissionSummary() {
  const fields = Object.keys(FIELD_CONFIGS).filter((id) => id !== 'file');
  const summaryRows = [];

  fields.forEach((id) => {
    const config = FIELD_CONFIGS[id];
    const element = document.getElementById(id);
    const value = element?.value?.trim() || '';
    if (!config.required && value === '') return;
    const displayValue = id === 'password' ? '••••••••' : id === 'file' ? 'Uploaded' : value;
    summaryRows.push(`<li><span>${config.label}</span><strong>${displayValue}</strong></li>`);
  });

  const fileElement = document.getElementById('file-input');
  const selectedFile = fileElement?.files?.[0];
  if (selectedFile) {
    summaryRows.push(`<li><span>Profile Upload</span><strong>${selectedFile.name}</strong></li>`);
  }

  return summaryRows.join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initPasswordVisibility();
  initClipboardHelpers();
  initRegexSandbox();
  initExplainerHighlights();
  initOnboardingTour();
  bindFieldInputs();
  bindFileDropzone();

  const fieldIds = Object.keys(FIELD_CONFIGS);
  fieldIds.forEach((fieldId) => {
    const element = document.getElementById(fieldId);
    if (!element) return;
    if (fieldId === 'file') return;
    if (element.value) {
      handleFieldChange(fieldId, element.value);
    } else if (fieldId === 'url') {
      renderFieldState(fieldId, true, '');
    }
  });

  syncAchievements();
  updateProgressRing();

  const submitBtn = document.getElementById('submit-btn');
  const resultPanel = document.getElementById('result-panel');
  const resultTitle = document.getElementById('result-title');
  const resultList = document.getElementById('result-list');

  if (submitBtn && resultPanel && resultTitle && resultList) {
    submitBtn.addEventListener('click', () => {
      const allValid = isFormValid();
      resultList.innerHTML = '';

      if (allValid) {
        resultTitle.textContent = 'Mission complete';
        resultTitle.className = 'ok';
        resultPanel.classList.remove('error-result');
        resultList.innerHTML = `
          <li class="summary-card">
            <h3>Student Developer Passport</h3>
            <p>Your identity profile has been validated and archived in the orbit.</p>
            <ul class="summary-grid">${buildSubmissionSummary()}</ul>
          </li>
        `;
        resultPanel.style.display = 'block';
        resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        triggerSuccessCelebration();
      } else {
        resultTitle.textContent = 'Some fields still need attention.';
        resultTitle.className = 'err';
        resultPanel.classList.add('error-result');
        fieldIds.forEach((id) => {
          const config = FIELD_CONFIGS[id];
          const state = fieldStates[id];
          const li = document.createElement('li');
          li.className = state ? 'ok' : 'err';
          li.innerHTML = `<span>${state ? '✅' : '❌'} ${config.label}</span><span>${state ? 'Passing' : 'Fix Required'}</span>`;
          resultList.appendChild(li);
        });
        resultPanel.style.display = 'block';
        resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
});
