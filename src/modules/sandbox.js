function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseRegexInput(pattern) {
  const trimmed = pattern.trim();
  if (!trimmed) return null;
  const slashMatch = trimmed.match(/^\/(.*)\/([a-z]*)$/i);
  if (slashMatch) {
    return { pattern: slashMatch[1], flags: slashMatch[2] || 'gm' };
  }
  return { pattern: trimmed, flags: 'gm' };
}

export function initClipboardHelpers() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const codeElement = button.parentElement?.querySelector('code');
      if (!codeElement) return;
      const regexText = codeElement.textContent;
      navigator.clipboard.writeText(regexText).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '✨ Copied!';
        button.style.background = 'var(--success)';
        button.style.borderColor = 'var(--success)';
        button.style.color = 'white';
        setTimeout(() => {
          button.innerHTML = originalText;
          button.removeAttribute('style');
        }, 1800);
      }).catch((err) => console.error('Clipboard copy failed:', err));
    });
  });
}

export function initRegexSandbox() {
  const regexInput = document.getElementById('sandbox-regex');
  const testInput = document.getElementById('sandbox-test-string');
  const resultPanel = document.getElementById('sandbox-result-panel');
  const presetList = document.getElementById('preset-list');
  const cheatToggle = document.getElementById('cheat-toggle');
  const cheatSheet = document.getElementById('cheat-sheet');

  if (!regexInput || !testInput || !resultPanel || !presetList) return;

  const presets = [
    { label: 'Match an IP address', pattern: '\\d{1,3}(?:\\.\\d{1,3}){3}', sample: '192.168.1.1' },
    { label: 'Match a hex color', pattern: '#[0-9A-Fa-f]{6}', sample: '#3B82F6' },
    { label: 'Match a username', pattern: '^[a-zA-Z][a-zA-Z0-9_]{2,19}$', sample: 'spaceRanger_99' },
    { label: 'Match a date', pattern: '\\d{4}-\\d{2}-\\d{2}', sample: '2026-07-08' }
  ];

  presetList.innerHTML = presets.map((preset) => `<button type="button" class="preset-btn" data-pattern="${preset.pattern}" data-sample="${preset.sample}">${preset.label}</button>`).join('');

  presetList.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      regexInput.value = btn.dataset.pattern || '';
      testInput.value = btn.dataset.sample || '';
      runSandboxTest();
    });
  });

  if (cheatToggle && cheatSheet) {
    cheatToggle.addEventListener('click', () => {
      const isHidden = cheatSheet.hasAttribute('hidden');
      cheatSheet.toggleAttribute('hidden', !isHidden);
      cheatToggle.textContent = isHidden ? 'Hide Cheat Sheet' : 'Show Cheat Sheet';
    });
  }

  function runSandboxTest() {
    const regexVal = regexInput.value.trim();
    const testVal = testInput.value;

    if (!regexVal) {
      resultPanel.className = 'sandbox-result';
      resultPanel.innerHTML = '<span class="sandbox-status-text">Ready to decode.</span><span class="hint">Type a pattern to begin.</span>';
      regexInput.classList.remove('invalid', 'valid');
      return;
    }

    try {
      const parsed = parseRegexInput(regexVal);
      const regex = new RegExp(parsed.pattern, parsed.flags);
      regexInput.classList.remove('invalid');
      regexInput.classList.add('valid');
      const matches = [...testVal.matchAll(regex)];
      const hasMatch = matches.length > 0;

      if (hasMatch) {
        let highlightedHtml = '';
        let lastIndex = 0;
        matches.forEach((match, index) => {
          const start = match.index ?? 0;
          const end = start + (match[0]?.length || 0);
          highlightedHtml += escapeHtml(testVal.slice(lastIndex, start));
          highlightedHtml += `<span class="sandbox-highlight sandbox-highlight-${index % 4}">${escapeHtml(match[0])}</span>`;
          lastIndex = end;
        });
        highlightedHtml += escapeHtml(testVal.slice(lastIndex));

        const groupsMarkup = matches.some((match) => match.length > 1)
          ? `<div class="sandbox-groups">${matches.map((match, idx) => `<div class="group-row">Match ${idx + 1}: ${match.slice(1).map((group, groupIndex) => `<span class="group-chip">Group ${groupIndex + 1}: ${escapeHtml(group || '')}</span>`).join(' ')}</div>`).join('')}</div>`
          : '';

        resultPanel.className = 'sandbox-result match-ok';
        resultPanel.innerHTML = `
          <div class="sandbox-status-text ok">🎉 Match found · ${matches.length} occurrences.</div>
          <div class="sandbox-preview">${highlightedHtml}</div>
          ${groupsMarkup}
        `;
      } else {
        resultPanel.className = 'sandbox-result match-fail';
        resultPanel.innerHTML = `
          <div class="sandbox-status-text err">❌ No match yet.</div>
          <div class="hint">Try a broader pattern or a different test string.</div>
        `;
      }
    } catch (error) {
      regexInput.classList.remove('valid');
      regexInput.classList.add('invalid');
      resultPanel.className = 'sandbox-result match-fail';
      resultPanel.innerHTML = `<div class="sandbox-status-text err">⚠️ ${escapeHtml(error.message)}</div>`;
    }
  }

  regexInput.addEventListener('input', runSandboxTest);
  testInput.addEventListener('input', runSandboxTest);
}
