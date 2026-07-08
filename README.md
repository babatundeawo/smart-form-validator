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
- **Logic**: Modular ES6+ JavaScript (`src/modules/`) bundled by Vite.
- **Build Stack**: Vite 6 (esbuild minification, relative assets paths, development HMR server).

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

## 💻 How to Run & Build

Make sure you have [Node.js](https://nodejs.org/) installed, then navigate to the project directory and run:

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser to [http://localhost:3000](http://localhost:3000) to view the live site with Hot Module Replacement!

### 3. Compile Production Bundle
```bash
npm run build
```
Generates a highly-optimized static bundle in the `dist/` directory.