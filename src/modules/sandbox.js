/**
 * Helper to escape HTML characters to prevent XSS in the live highlighter.
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Initializes clipboard copying for form regex code snippets.
 */
export function initClipboardHelpers() {
  const copyButtons = document.querySelectorAll(".copy-btn");

  copyButtons.forEach(button => {
    button.addEventListener("click", () => {
      const codeElement = button.parentElement.querySelector("code");
      if (!codeElement) return;

      const regexText = codeElement.textContent;
      navigator.clipboard.writeText(regexText)
        .then(() => {
          const originalText = button.innerHTML;
          button.innerHTML = "✨ Copied!";
          button.style.background = "var(--success)";
          button.style.borderColor = "var(--success)";
          button.style.color = "white";

          setTimeout(() => {
            button.innerHTML = originalText;
            button.removeAttribute("style");
          }, 1800);
        })
        .catch(err => {
          console.error("Clipboard copy failed: ", err);
        });
    });
  });
}

/**
 * Initializes and binds listeners for the live Regex Sandbox playground.
 */
export function initRegexSandbox() {
  const regexInput = document.getElementById("sandbox-regex");
  const testInput = document.getElementById("sandbox-test-string");
  const resultPanel = document.getElementById("sandbox-result-panel");

  if (!regexInput || !testInput || !resultPanel) return;

  function runSandboxTest() {
    const regexVal = regexInput.value.trim();
    const testVal = testInput.value;

    // Reset panel if fields are empty
    if (regexVal === "") {
      resultPanel.className = "sandbox-result";
      resultPanel.innerHTML = '<span class="sandbox-status-text"> Playground Idle</span><span class="hint">Type a pattern above to begin testing.</span>';
      regexInput.classList.remove("invalid", "valid");
      return;
    }

    try {
      // Build Regexp - defaults to global + multi-line to capture multiple occurrences
      const flags = "gm";
      const regex = new RegExp(regexVal, flags);
      regexInput.classList.remove("invalid");
      regexInput.classList.add("valid");

      // Execute tests
      const hasMatch = regex.test(testVal);
      
      // Reset index for match capturing
      regex.lastIndex = 0;

      if (hasMatch) {
        resultPanel.className = "sandbox-result match-ok";
        
        // Retrieve matches
        const matches = [...testVal.matchAll(regex)];
        const matchCount = matches.length;

        // Generate highlighted output safely
        let highlightedHtml = "";
        let lastIdx = 0;

        matches.forEach(match => {
          const matchText = match[0];
          const startIdx = match.index;
          const endIdx = startIdx + matchText.length;

          // Append leading un-matched text
          highlightedHtml += escapeHtml(testVal.substring(lastIdx, startIdx));
          // Append highlighted matched text
          highlightedHtml += `<span class="sandbox-highlight">${escapeHtml(matchText)}</span>`;
          
          lastIdx = endIdx;
        });
        
        // Append remaining text
        highlightedHtml += escapeHtml(testVal.substring(lastIdx));

        // Group captures info
        let groupsInfo = "";
        if (matches[0] && matches[0].length > 1) {
          groupsInfo = `<div style="margin-top: 0.5rem; font-size: 0.76rem; border-top: 1px solid var(--card-border); padding-top: 0.4rem;">`;
          groupsInfo += `<strong>Captured Groups:</strong>`;
          matches.forEach((m, mIdx) => {
            groupsInfo += `<div style="margin-left: 0.4rem; color: var(--text-muted);">Match #${mIdx + 1}: `;
            for (let g = 1; g < m.length; g++) {
              groupsInfo += `<span style="color: var(--secondary); font-family: monospace;">Group ${g}: "${escapeHtml(m[g] || '')}"</span> `;
            }
            groupsInfo += `</div>`;
          });
          groupsInfo += `</div>`;
        }

        resultPanel.innerHTML = `
          <div class="sandbox-status-text ok">🎉 Match Found! (${matchCount} occurrences)</div>
          <div class="sandbox-matches-list">
            <strong>Result preview:</strong> <div style="margin-top: 0.25rem; padding: 0.5rem; background: rgba(0,0,0,0.2); border-radius: 6px; white-space: pre-wrap;">${highlightedHtml}</div>
          </div>
          ${groupsInfo}
        `;
      } else {
        resultPanel.className = "sandbox-result match-fail";
        resultPanel.innerHTML = `
          <div class="sandbox-status-text err">❌ No Match</div>
          <div class="hint">The test string does not match the expression <code>/${regexVal}/gm</code>.</div>
        `;
      }
    } catch (err) {
      regexInput.classList.remove("valid");
      regexInput.classList.add("invalid");
      resultPanel.className = "sandbox-result match-fail";
      resultPanel.innerHTML = `
        <div class="sandbox-status-text err">⚠️ Regex Error</div>
        <div class="hint" style="color: var(--error); font-family: monospace;">${escapeHtml(err.message)}</div>
      `;
    }
  }

  // Bind sandbox tests
  regexInput.addEventListener("input", runSandboxTest);
  testInput.addEventListener("input", runSandboxTest);
}
