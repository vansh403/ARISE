# ARISE — Ranked Gym Protocol

A Solo Leveling-inspired **ranked gym workouts landing page** with a signature **cursor-following spotlight reveal** effect. Built as a frontend-only React app with mock data.

![status](https://img.shields.io/badge/status-frontend%20mvp-22d3ee?style=flat-square) ![stack](https://img.shields.io/badge/stack-React%2019%20%2B%20Tailwind%20%2B%20shadcn/ui-0ea5e9?style=flat-square)

---

## The Signature Feature

On the hero section, a **soft circular spotlight follows your cursor** and reveals a second image (a muscular hunter) beneath the base image (a shadowed figure). It's the visual metaphor of the whole app: your potential is hidden inside you — reveal it.

Implementation lives in:
- `src/components/SpotlightHero.jsx` — cursor tracking, CSS variable updates
- `src/App.css` — `.spotlight-wrap`, `.spotlight-base`, `.spotlight-reveal`, `.spotlight-ring` (uses `mask-image: radial-gradient(...)` driven by `--x`, `--y`, `--r` custom properties)

---

## Sections

1. **Navbar** — fixed, blurs on scroll, mobile drawer
2. **Spotlight Hero** — the cursor reveal + system-notification HUD
3. **Rank System** — six interactive tiers (E → S), inspired by Solo Leveling hunter ranks
4. **Quest Board** — filterable workout cards, accept/locked states, XP rewards, toast notifications
5. **Hunter Dashboard** — XP bar, streak/quests/hours, stat bars, global leaderboard
6. **Testimonials + Arise CTA** — hunter quotes and the big call-to-action gate
7. **Footer** — 4 columns, social icons

---

## Tech Stack

- **React 19** with react-router-dom v7
- **Tailwind CSS 3.4** + custom utility classes (grid bg, corner brackets, shimmer, flicker)
- **shadcn/ui** components (`Button`, `Toaster`, `Progress`)
- **lucide-react** for all iconography
- **CRACO** for CRA config overrides
- Fonts: **Orbitron** (display), **Rajdhani** (body), **JetBrains Mono** (labels)
- Palette: `#000` black · `#22d3ee` neon cyan · `#ef4444` crimson red

---

## Project Structure

```
arise/
├── public/
│   └── index.html
├── src/
│   ├── App.js                # Router + Landing layout
│   ├── App.css               # Spotlight mask, auras, tilt hover
│   ├── index.js
│   ├── index.css             # Fonts, Tailwind, theme tokens, custom classes
│   ├── mock.js               # RANKS, QUESTS, HUNTER, LEADERBOARD, etc.
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── SpotlightHero.jsx   # <-- signature cursor reveal
│   │   ├── RankSystem.jsx
│   │   ├── QuestBoard.jsx
│   │   ├── StatsPanel.jsx
│   │   ├── Testimonials.jsx
│   │   ├── Footer.jsx
│   │   └── ui/                 # shadcn primitives
│   ├── hooks/
│   │   └── use-toast.js
│   └── lib/
│       └── utils.js
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── craco.config.js
├── jsconfig.json
├── components.json         # shadcn config
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Install dependencies

```bash
yarn install
```

> Note: use **yarn**, not npm (project was scaffolded with yarn.lock).

### 2. Add the shadcn/ui components

If `src/components/ui/` is missing, initialize shadcn and add the primitives used by the app:

```bash
npx shadcn@latest init
npx shadcn@latest add button toast progress
```

### 3. Start dev server

```bash
yarn start
```

App runs at `http://localhost:3000`.

### 4. Build for production

```bash
yarn build
```

Outputs to `build/`. Deploy to Vercel, Netlify, Cloudflare Pages, or any static host.

---

## Customizing the Spotlight Images

Open `src/mock.js` and swap:

```js
export const IMAGES = {
  BG_IMAGE_1: 'YOUR_BASE_IMAGE_URL',    // shown by default (shadowed / silhouette works best)
  BG_IMAGE_2: 'YOUR_REVEAL_IMAGE_URL',  // revealed under the spotlight
};
```

**Tips for best reveal:**
- Both images should have the same aspect ratio and framing (subject in same position)
- Base image: darker / muted
- Reveal image: brighter / more detailed subject
- Square images (1:1) fit the hero best

---

## Customizing Colors

Core accent colors live in two places:

**Tailwind classes** (across components) — search & replace:
- `cyan-300`, `cyan-400` → your primary accent
- `red-400`, `red-500` → your secondary accent

**CSS variables** in `src/index.css`:
```css
:root {
  --primary: 189 94% 55%;   /* neon cyan (HSL) */
  --accent: 189 94% 55%;
  --destructive: 0 84% 60%; /* crimson red */
}
```

**Custom class colors** in `src/index.css`:
- `.neon-border` — cyan glow
- `.neon-border-red` — red glow
- `.bracket-corners` — cyan corner brackets
- `.bracket-corners-red` — red corner brackets
- `.xp-shimmer` — XP bar gradient

---

## Customizing Content

All app copy lives in **`src/mock.js`** — no need to touch component code:

- `RANKS` — tier definitions (E, D, C, B, A, S)
- `QUESTS` — workout cards
- `HUNTER` — player profile (name, level, XP, stats)
- `LEADERBOARD` — top hunters
- `FEATURES` — side feature cards on the rank section
- `TESTIMONIALS` — hunter quotes

---

## Roadmap Ideas (frontend-only extensions)

- [ ] Persist accepted quests / XP to `localStorage`
- [ ] Add a "Level Up" full-screen animation when XP threshold is reached
- [ ] Add a `HunterProfile` route with detailed stat history
- [ ] Sound design (subtle system-notification pings on quest accept)
- [ ] Confetti / particle effect on rank-up
- [ ] Dark/light theme toggle (currently dark-only by design)

### Backend extensions

- FastAPI + MongoDB for real user accounts, XP tracking, live leaderboard
- Google/Emergent auth for user login
- Streak tracking with timezone-aware daily resets
- Push notifications for quest reminders

---

## License

This is a personal / portfolio project scaffold. Adapt freely. No warranty.

---

**Arise, Hunter.**
