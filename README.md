# Streakly

A polished, local-first habit tracker. Create habits, check them off each day, and use the contribution heatmap to see your momentum at a glance.

## Features

- Add habits with a name, icon, and accent color
- Mark habits complete for the current day
- Track current and personal-best streaks
- Review consistency with a GitHub-style 12-week heatmap
- Persist everything in browser `localStorage` — no account or backend required
- Responsive layout for desktop and mobile

## Getting started

This project uses React and Vite. You will need Node.js 18 or later.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Data

Habit data is stored only in this browser under the `streakly-habits` localStorage key. Clearing browser site data will reset the tracker.
