# 👾 Magical Regex Form & Secret Code Playground

A modernized, highly responsive, child-friendly web application designed to teach kids and students about Regular Expressions (Regex) through gamified interaction.

Features a playful light pastel design system, progress indicators, secret code strength checkers, and a fully interactive regex sandbox.

---

## 🚀 Interactive Features

- **🛸 Coder Nickname (Username)**: Checks if nicknames are between 3 and 20 characters, starting with a letter.
- **✉️ Magic Mailbox (Email)**: Ensures a standard mailbox structure (`name@domain.com`).
- **🔑 Secret Code (Password)**: Gamified checker that scores password difficulty based on 5 parameters, checking them off with glowing stars (`★`) in real time. Features an inline show/hide eye toggle.
- **📞 Walkie-Talkie (Phone)**: Validates Nigerian dialer patterns (standard `0` or international `+234` prefix).
- **🚀 Web Toy Link (URL)**: Parses optional website scopes starting with web protocols (`http://` or `https://`).
- **🕵️‍♂️ Secret Decoder Safari**: Focus any input field to highlight the exact regex rules powering it in the sidebar. Includes one-click copy buttons (`📋`) for easy saving.
- **👾 Alien Code Sandbox**: A real-time playground where students can type custom patterns and secret text strings to watch matches highlight dynamically.
- **🎉 Confetti Rewards**: Triggers a canvas-based falling pastel particle confetti celebration when all required fields are validated.

---

## 🛠️ Tech Stack & Architecture

- **Core**: HTML5 (Semantic & Accessible with `aria-describedby` and `aria-live` screen-reader tags).
- **Styling**: Vanilla CSS (Custom properties, HSL dynamic themes, Flexbox, Grid, keyframe animations, glassmorphic layout).
- **Logic**: Modular ES6+ JavaScript (`src/modules/`) loaded directly in the browser.
- **Hosting**: Static files for GitHub Pages, with no build step required.

---

## 📦 Project Structure

```bash
├── dist/                   # Bundled production files
├── src/
│   ├── modules/
│   │   ├── sandbox.js      # Sandbox testing, copy-to-clipboard helpers
│   │   ├── ui.js           # Confetti, progress gauges, layout highlights, theme toggling
│   │   └── validators.js   # Regex rules definitions, validation scoring
│   ├── styles/
│   │   └── main.css        # Responsive mobile-first stylesheet
│   └── main.js             # Orchestrator & DOM event listeners bindings
├── index.html              # Core application interface file
├── package.json            # Scripts & build devDependencies
└── vite.config.js          # Vite configuration
```

---

## 💻 How to Run

This project is ready to host as a static site on GitHub Pages.

### 1. Open the app locally
You can open [index.html](index.html) directly in a browser, or serve the folder with any simple static server.

### 2. Publish on GitHub Pages
Upload the repository contents to GitHub and enable GitHub Pages for the root folder.

No build step is required.