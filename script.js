// ═══════════════════════════════════════════════════
//  Smart Form Validator — by Babatunde Awoyemi
//  Techbase STEM Academy — JavaScript Regex Lesson
// ═══════════════════════════════════════════════════

"use strict"; // tells JavaScript to be extra careful with our code

// ── STEP 1: DEFINE OUR REGEX PATTERNS ──────────────
// Each pattern is a rule that says what counts as valid

// Username: must start with a letter, then letters/digits/underscores
const PATTERN_USERNAME = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;

// Email: must have letters, then @, then domain, then .com etc
const PATTERN_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password: 8+ chars AND must have upper, lower, digit, special char
// (?=.*[A-Z]) is a lookahead — checks WITHOUT moving forward in text
const PATTERN_PASSWORD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-]).{8,}$/;

// Phone: Nigerian format — starts with 0 or +234, then 7/8/9 series
const PATTERN_PHONE = /^\+?(?:234|0)[789]\d{9}$/;

// URL: must start with http:// or https://
const PATTERN_URL = /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/;


// ── STEP 2: FIELD SETTINGS ──────────────────────────
// One object that stores the pattern and messages for each field

const FIELDS = {
  username: {
    pattern:      PATTERN_USERNAME,
    okMessage:    "✅ Great username!",
    errorMessage: "Start with a letter. Letters, digits or _ only. 3–20 chars.",
    required:     true,
  },
  email: {
    pattern:      PATTERN_EMAIL,
    okMessage:    "✅ Valid email address!",
    errorMessage: "Must look like name@domain.com",
    required:     true,
  },
  password: {
    pattern:      PATTERN_PASSWORD,
    okMessage:    "✅ Strong password!",
    errorMessage: "Need 8+ chars with UPPER, lower, digit and symbol.",
    required:     true,
  },
  phone: {
    pattern:      PATTERN_PHONE,
    okMessage:    "✅ Valid phone number!",
    errorMessage: "Try: 08012345678 or +2348012345678",
    required:     true,
  },
  url: {
    pattern:      PATTERN_URL,
    okMessage:    "✅ Valid website URL!",
    errorMessage: "Must start with https:// or http://",
    required:     false, // this field is optional!
  },
};


// ── STEP 3: TRACK WHICH FIELDS ARE VALID ───────────
// This object remembers true/false for each field

const fieldState = {
  username: false,
  email:    false,
  password: false,
  phone:    false,
  url:      true, // optional — starts as passing
};


// ── STEP 4: PASSWORD STRENGTH HELPER ───────────────
// Counts how many strength rules the password passes (score 0–5)

function getPasswordStrength(value) {
  let score = 0;

  // Each check adds 1 point to the score
  if (value.length >= 8)               score++; // long enough
  if (/[A-Z]/.test(value))             score++; // has uppercase
  if (/[a-z]/.test(value))             score++; // has lowercase
  if (/\d/.test(value))                score++; // has a digit
  if (/[!@#$%^&*()_+\-]/.test(value)) score++; // has special char

  return score; // returns a number from 0 to 5
}


// ── STEP 5: UPDATE THE STRENGTH BAR ────────────────
// Makes the coloured bar grow and change colour as you type

function updateStrengthBar(value) {
  // Get the bar element from the HTML
  const bar = document.getElementById("strength-bar");

  // Calculate strength score and turn it into a percentage
  const score   = getPasswordStrength(value);
  const percent = (score / 5) * 100;

  // If the box is empty, reset the bar to zero
  bar.style.width = value.length === 0 ? "0%" : percent + "%";

  // Change colour based on score
  if (score <= 1)      bar.style.background = "#EF4444"; // red: weak
  else if (score <= 3) bar.style.background = "#F97316"; // orange: medium
  else                 bar.style.background = "#10B981"; // green: strong
}


// ── STEP 6: UPDATE A FIELD'S LOOK ──────────────────
// Shows green/red border and the feedback message

function updateField(fieldId, isValid, message) {
  // Get the input box and feedback paragraph from the HTML
  const input    = document.getElementById(fieldId);
  const feedback = document.getElementById("fb-" + fieldId);

  // Remove any old valid/invalid styling first
  input.classList.remove("valid", "invalid");

  // If message is empty, just reset and stop
  if (message === "") {
    feedback.textContent = "";
    feedback.className   = "feedback";
    return;
  }

  if (isValid) {
    // Add green border to input
    input.classList.add("valid");
    // Show green success message
    feedback.textContent = message;
    feedback.className   = "feedback ok";
  } else {
    // Add red border to input
    input.classList.add("invalid");
    // Show red error message
    feedback.textContent = message;
    feedback.className   = "feedback err";
  }
}


// ── STEP 7: VALIDATE ONE FIELD ──────────────────────
// This runs every time the user types in a field

function validateField(fieldId) {
  // Get what the user typed (trim removes extra spaces)
  const input      = document.getElementById(fieldId);
  const value      = input.value.trim();
  const config     = FIELDS[fieldId];
  const isOptional = !config.required;

  // Update the strength bar only for the password field
  if (fieldId === "password") {
    updateStrengthBar(value);
  }

  // If the field is empty, reset it
  if (value === "") {
    fieldState[fieldId] = isOptional; // optional empty = passing
    updateField(fieldId, false, "");
    updateSubmitButton();
    return;
  }

  // ✨ THE MAGIC LINE — test the value against our regex pattern!
  const isValid = config.pattern.test(value);

  // Save the result in our fieldState object
  fieldState[fieldId] = isValid;

  // Show the right message on screen
  updateField(
    fieldId,
    isValid,
    isValid ? config.okMessage : config.errorMessage
  );

  // Check if the submit button should light up
  updateSubmitButton();
}


// ── STEP 8: ENABLE / DISABLE THE BUTTON ────────────
// Button only lights up when ALL fields are valid

function updateSubmitButton() {
  const btn = document.getElementById("submit-btn");

  // .every(Boolean) checks that every value in fieldState is true
  const allValid = Object.values(fieldState).every(Boolean);

  // disabled = true means the button is greyed out
  btn.disabled = !allValid;
}


// ── STEP 9: ATTACH LISTENERS ────────────────────────
// Tell JavaScript to watch each input for typing

document.getElementById("username")
  .addEventListener("input", () => validateField("username"));

document.getElementById("email")
  .addEventListener("input", () => validateField("email"));

document.getElementById("password")
  .addEventListener("input", () => validateField("password"));

document.getElementById("phone")
  .addEventListener("input", () => validateField("phone"));

document.getElementById("url")
  .addEventListener("input", () => validateField("url"));


// ── STEP 10: HANDLE THE SUBMIT BUTTON CLICK ────────
// This runs when the user clicks "Validate All Fields"

function handleSubmit() {
  // Get the panel, title and list elements from the HTML
  const panel = document.getElementById("result-panel");
  const title = document.getElementById("result-title");
  const list  = document.getElementById("result-list");

  // Check if every field is currently valid
  const allValid = Object.values(fieldState).every(Boolean);

  // Clear any old results from last time
  list.innerHTML = "";

  // Friendly names to show in the report
  const labels = {
    username: "Username",
    email:    "Email",
    password: "Password",
    phone:    "Phone Number",
    url:      "Website URL",
  };

  // Loop through every field and add a line to the results list
  for (const [id, valid] of Object.entries(fieldState)) {
    const input = document.getElementById(id);
    const value = input.value.trim();

    // Skip the URL field if the user left it empty (it's optional)
    if (!FIELDS[id].required && value === "") continue;

    // Create a new list item element
    const li       = document.createElement("li");
    li.className   = valid ? "ok" : "err";
    li.textContent = (valid ? "✅ " : "❌ ") + labels[id];
    list.appendChild(li);
  }

  // Set the big heading message
  if (allValid) {
    title.textContent = "🎉 All fields valid! Amazing work, Babatunde!";
    title.className   = "ok";
  } else {
    title.textContent = "⚠️ Some fields need fixing — check the red ones!";
    title.className   = "err";
  }

  // Make the panel visible
  panel.style.display = "block";

  // Smoothly scroll down so the user can see the results
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Tell JavaScript to run handleSubmit when the button is clicked
document.getElementById("submit-btn")
  .addEventListener("click", handleSubmit);
