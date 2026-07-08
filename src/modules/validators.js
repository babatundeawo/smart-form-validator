// ── REGEX PATTERN CONSTANTS ──
export const PATTERNS = {
  username: /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // 8+ characters with at least one lowercase, one uppercase, one number, and one special symbol
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-]).{8,}$/,
  // Nigerian Format: Starts with +234 or 0, followed by 7/8/9, followed by 9 digits
  phone: /^\+?(?:234|0)[789]\d{9}$/,
  // Must start with http:// or https://
  url: /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/
};

// ── FIELD CONFIGURATION ──
export const FIELD_CONFIGS = {
  username: {
    pattern: PATTERNS.username,
    okMessage: "🛸 Woohoo! Awesome nickname!",
    errorMessage: "Start with a letter. Use 3–20 letters or numbers, no spaces!",
    required: true,
    label: "Coder Nickname"
  },
  email: {
    pattern: PATTERNS.email,
    okMessage: "✉️ Superb! Your mailbox is ready!",
    errorMessage: "Needs a standard mailbox form (e.g. name@mailbox.com).",
    required: true,
    label: "Magic Mailbox"
  },
  password: {
    pattern: PATTERNS.password,
    okMessage: "🔑 Wow! That code is super secure! You are a master coder! 🐱‍💻",
    errorMessage: "Complete the star checks below to make it safe!",
    required: true,
    label: "Secret Code"
  },
  phone: {
    pattern: PATTERNS.phone,
    okMessage: "📞 Ring ring! Active connection found!",
    errorMessage: "Type a Nigerian phone link (starts with 0 or +234).",
    required: true,
    label: "Walkie-Talkie Number"
  },
  url: {
    pattern: PATTERNS.url,
    okMessage: "🚀 Beep boop! Awesome toy website link!",
    errorMessage: "Toy link must start with http:// or https://.",
    required: false, // Optional field
    label: "Toy Website Link"
  }
};

// ── FIELD STATE TRACKER ──
export const fieldStates = {
  username: false,
  email: false,
  password: false,
  phone: false,
  url: true // Starts true since optional URL is empty by default
};

/**
 * Calculates detailed password strength criteria checks.
 * @param {string} value 
 * @returns {object} Object detailing which rules passed, plus overall score (0-5)
 */
export function evaluatePasswordStrength(value) {
  const criteria = {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /\d/.test(value),
    special: /[!@#$%^&*()_+\-]/.test(value)
  };

  const score = Object.values(criteria).filter(Boolean).length;

  return {
    criteria,
    score
  };
}

/**
 * Validates a single field value against its configured pattern.
 * @param {string} fieldId 
 * @param {string} value 
 * @returns {boolean} Whether the field is valid
 */
export function validateFieldValue(fieldId, value) {
  const config = FIELD_CONFIGS[fieldId];
  if (!config) return false;

  const trimmed = value.trim();

  // If optional and empty, it's valid
  if (!config.required && trimmed === "") {
    fieldStates[fieldId] = true;
    return true;
  }

  // If required and empty, it's invalid
  if (trimmed === "") {
    fieldStates[fieldId] = false;
    return false;
  }

  const isValid = config.pattern.test(trimmed);
  fieldStates[fieldId] = isValid;
  return isValid;
}

/**
 * Verifies if all fields are valid.
 * @returns {boolean}
 */
export function isFormValid() {
  return Object.values(fieldStates).every(Boolean);
}
