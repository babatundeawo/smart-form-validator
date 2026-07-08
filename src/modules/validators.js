export const PATTERNS = {
  username: /^(?=.{3,20}$)[a-zA-Z][a-zA-Z0-9_]*$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-]).{8,}$/,
  phone: /^(?:\+?(?:234|0)[789]\d{9}|\+?\d{11})$/,
  url: /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/,
  github: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i,
  postal: /^(?:\d{6}|\d{5}(?:-\d{4})?|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/i
};

export const FIELD_CONFIGS = {
  username: {
    pattern: PATTERNS.username,
    okMessage: '🛸 Nickname accepted by the galaxy.',
    errorMessage: 'Start with a letter and use 3–20 letters, digits, or underscores.',
    required: true,
    label: 'Coder Nickname'
  },
  email: {
    pattern: PATTERNS.email,
    okMessage: '✉️ Mailbox is operational.',
    errorMessage: 'Please enter a standard email address.',
    required: true,
    label: 'Developer Mailbox'
  },
  password: {
    pattern: PATTERNS.password,
    okMessage: '🔐 Security sentinel unlocked.',
    errorMessage: 'Use at least 8 characters with upper, lower, number, and symbol.',
    required: true,
    label: 'Access Key'
  },
  phone: {
    pattern: PATTERNS.phone,
    okMessage: '📡 Signal pattern confirmed.',
    errorMessage: 'Use a valid Nigerian-style number or international format.',
    required: true,
    label: 'Signal Number'
  },
  dob: {
    pattern: PATTERNS.username,
    okMessage: '🎂 Access granted to the academy.',
    errorMessage: 'You must be at least 13 years old.',
    required: true,
    label: 'Date of Birth'
  },
  github: {
    pattern: PATTERNS.github,
    okMessage: '🐙 GitHub identity looks correct.',
    errorMessage: 'Use 1–39 characters, letters, numbers, or single hyphens.',
    required: true,
    label: 'GitHub Username'
  },
  postal: {
    pattern: PATTERNS.postal,
    okMessage: '📮 Postal code matched the network.',
    errorMessage: 'Enter a 6-digit Nigerian code or common ZIP format.',
    required: true,
    label: 'Postal / ZIP Code'
  },
  url: {
    pattern: PATTERNS.url,
    okMessage: '🌐 Portfolio link is live.',
    errorMessage: 'Optional links need http:// or https://.',
    required: false,
    label: 'Portfolio Link'
  },
  file: {
    pattern: /\.(jpg|jpeg|png|pdf)$/i,
    okMessage: '📁 File accepted for the archive.',
    errorMessage: 'Upload a JPG, PNG, or PDF file up to 2MB.',
    required: true,
    label: 'Profile Upload'
  }
};

export const fieldStates = {
  username: false,
  email: false,
  password: false,
  phone: false,
  dob: false,
  github: false,
  postal: false,
  url: true,
  file: false
};

export const ACHIEVEMENT_BADGES = [
  { id: 'regex-rookie', field: 'username', title: 'Regex Rookie', description: 'Unlocked by securing a valid coder nickname.', icon: '🧠' },
  { id: 'mailbox-master', field: 'email', title: 'Mailbox Master', description: 'Unlocked by validating a real developer mailbox.', icon: '📬' },
  { id: 'security-sentinel', field: 'password', title: 'Security Sentinel', description: 'Unlocked by building a strong access key.', icon: '🛡️' },
  { id: 'signal-keeper', field: 'phone', title: 'Signal Keeper', description: 'Unlocked by validating the contact signal.', icon: '📡' },
  { id: 'age-gate', field: 'dob', title: 'Age Gate', description: 'Unlocked by proving a valid age threshold.', icon: '🎂' },
  { id: 'github-galaxy', field: 'github', title: 'GitHub Galaxy', description: 'Unlocked by matching GitHub naming rules.', icon: '🐙' },
  { id: 'data-overlord', field: 'postal', title: 'Data Overlord', description: 'Unlocked by passing address validation.', icon: '🗺️' },
  { id: 'archive-keeper', field: 'file', title: 'Archive Keeper', description: 'Unlocked by uploading a valid profile artifact.', icon: '📁' }
];

function isAtLeast13YearsOld(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 13;
}

export function evaluatePasswordStrength(value) {
  const criteria = {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /\d/.test(value),
    special: /[!@#$%^&*()_+\-]/.test(value)
  };

  const score = Object.values(criteria).filter(Boolean).length;
  const poolSize = [criteria.lowercase, criteria.uppercase, criteria.number, criteria.special]
    .filter(Boolean).length;
  const entropyBits = value.length > 0 && poolSize > 0
    ? Math.round(value.length * Math.log2(Math.pow(26, Number(criteria.lowercase)) * Math.pow(26, Number(criteria.uppercase)) * Math.pow(10, Number(criteria.number)) * Math.pow(32, Number(criteria.special))))
    : 0;

  const strengthLabel = score <= 1 ? 'Weak' : score <= 3 ? 'Moderate' : score === 4 ? 'Strong' : 'Excellent';

  return { criteria, score, entropyBits, strengthLabel };
}

export function validateFieldValue(fieldId, value) {
  const config = FIELD_CONFIGS[fieldId];
  if (!config) return false;

  if (fieldId === 'dob') {
    const isValid = isAtLeast13YearsOld(String(value).trim());
    fieldStates[fieldId] = isValid;
    return isValid;
  }

  if (fieldId === 'phone') {
    const normalized = String(value).trim().replace(/[\s-]/g, '');
    const isValid = PATTERNS.phone.test(normalized);
    fieldStates[fieldId] = isValid;
    return isValid;
  }

  if (fieldId === 'file') {
    const isValid = Boolean(value instanceof File && value.size <= 2 * 1024 * 1024 && config.pattern.test(value.name));
    fieldStates[fieldId] = isValid;
    return isValid;
  }

  const trimmed = String(value).trim();

  if (!config.required && trimmed === '') {
    fieldStates[fieldId] = true;
    return true;
  }

  if (trimmed === '') {
    fieldStates[fieldId] = false;
    return false;
  }

  const isValid = config.pattern.test(trimmed);
  fieldStates[fieldId] = isValid;
  return isValid;
}

export function isFormValid() {
  return Object.values(fieldStates).every(Boolean);
}
