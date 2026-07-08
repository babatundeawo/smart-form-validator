import './styles/main.css';
import { 
  validateFieldValue, 
  fieldStates, 
  FIELD_CONFIGS, 
  isFormValid 
} from './modules/validators';
import {
  initThemeToggle,
  initPasswordVisibility,
  updateProgressRing,
  initExplainerHighlights,
  renderFieldState,
  renderPasswordStrength,
  triggerConfetti
} from './modules/ui';
import {
  initClipboardHelpers,
  initRegexSandbox
} from './modules/sandbox';

document.addEventListener("DOMContentLoaded", () => {
  // ── INITIALISE MODULES ──
  initThemeToggle();
  initPasswordVisibility();
  initClipboardHelpers();
  initRegexSandbox();
  initExplainerHighlights();

  const fields = Object.keys(FIELD_CONFIGS);

  // ── ATTACH VALIDATION LISTENERS ──
  fields.forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (!input) return;

    input.addEventListener("input", () => {
      const value = input.value;
      
      // Perform validation check
      const isValid = validateFieldValue(fieldId, value);
      
      // Update validation visual feedback (borders, text messages, icons)
      renderFieldState(fieldId, isValid, value);
      
      // Password extra checklists
      if (fieldId === "password") {
        renderPasswordStrength(value);
      }
      
      // Update form completion progress indicator
      updateProgressRing();
    });
  });

  // ── HANDLE FORM SUBMIT ──
  const submitBtn = document.getElementById("submit-btn");
  const resultPanel = document.getElementById("result-panel");
  const resultTitle = document.getElementById("result-title");
  const resultList = document.getElementById("result-list");

  if (submitBtn && resultPanel && resultTitle && resultList) {
    submitBtn.addEventListener("click", () => {
      const allValid = isFormValid();
      
      // Reset list items
      resultList.innerHTML = "";

      if (allValid) {
        resultTitle.textContent = "🎉 All Fields Validated Successfully!";
        resultTitle.className = "ok";
        resultPanel.classList.remove("error-result");

        // Loop and print nice summary of fields
        fields.forEach(id => {
          const config = FIELD_CONFIGS[id];
          const input = document.getElementById(id);
          const value = input ? input.value.trim() : "";
          
          if (!config.required && value === "") return; // Skip optional empty values

          const li = document.createElement("li");
          li.className = "ok";
          
          // Mask password for security review page
          const displayVal = id === "password" ? "••••••••" : value;
          
          li.innerHTML = `
            <span><strong>${config.label}</strong></span>
            <span class="result-val-text">${displayVal}</span>
          `;
          resultList.appendChild(li);
        });

        // Show panel
        resultPanel.style.display = "block";
        resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });

        // Trigger confetti reward animation
        triggerConfetti();
      } else {
        resultTitle.textContent = "⚠️ Form has errors. Please check red fields.";
        resultTitle.className = "err";
        resultPanel.classList.add("error-result");
        
        fields.forEach(id => {
          const config = FIELD_CONFIGS[id];
          const state = fieldStates[id];
          
          const li = document.createElement("li");
          li.className = state ? "ok" : "err";
          li.innerHTML = `
            <span>${state ? "✅" : "❌"} ${config.label}</span>
            <span>${state ? "Passing" : "Fix Required"}</span>
          `;
          resultList.appendChild(li);
        });

        resultPanel.style.display = "block";
        resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
});
