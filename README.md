# 🎬 Quiz Host Control Panel

A local-first web application for running movie quiz games during in-person events. Built for speed, clarity, and fun.

## Features

- **Player Management** — Add/edit/remove players, upload avatars, bulk-add by pasting names, import/export JSON/CSV
- **Smart Group Selection** — Randomly choose groups with configurable size and selection modes (random, avoid repeats, fairness)
- **Fast Scoring** — Award/subtract points with large touch-friendly buttons, tag answers (correct/wrong/first/tie), see live totals
- **Live Scoreboard** — Sorted standings with ranks, optional detailed stats, presentation mode for room display
- **Round History** — Full audit log of every round with undo support
- **End Game View** — Podium/winners screen with confetti
- **Keyboard Shortcuts** — `Enter` = choose group, `R` = reroll, `Esc` = close, `Ctrl+Z` = undo
- **Persistent** — All data saved to IndexedDB, survives page refreshes
- **Dark Theme** — High-contrast dark UI optimized for party settings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI primitives (shadcn/ui style) |
| Icons | Lucide React |
| State Management | Zustand |
| Persistence | Dexie (IndexedDB) |
| Image Compression | browser-image-compression |
| Toasts | Sonner |
| Confetti | canvas-confetti |
| Testing | Jest + ts-jest |

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm test         # Run tests
```

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (dark theme)
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Tailwind + theme variables
├── components/
│   ├── ui/                 # Primitives (button, dialog, input, tabs, etc.)
│   ├── layout/             # App shell + header
│   ├── players/            # Player CRUD, avatars, bulk add, import/export
│   ├── game/               # Config, group selector, scoring modal
│   ├── scoreboard/         # Scoreboard, presentation view, end game
│   ├── history/            # Round history + audit log
│   └── shared/             # Confirmation dialog
├── lib/
│   ├── store.ts            # Zustand store (all state + actions)
│   ├── store-persistence.ts # Zustand ↔ IndexedDB sync
│   ├── db.ts               # Dexie database schema
│   ├── selection.ts        # Group selection algorithms
│   ├── scoring.ts          # Score calculation helpers
│   ├── avatar-utils.ts     # Client-side image compression
│   ├── import-export.ts    # JSON/CSV import/export
│   ├── seed-data.ts        # Demo data generator
│   └── utils.ts            # General utilities
├── types/
│   └── index.ts            # All TypeScript interfaces
└── hooks/
    ├── use-keyboard-shortcuts.ts
    └── use-fullscreen.ts
```

### Key Decisions

- **Single-page tabbed layout** — No page transitions during live game, everything accessible in one view
- **Zustand + Dexie** — Fast in-memory reads with Zustand, durable persistence with IndexedDB (handles avatar blobs without localStorage size limits)
- **Instant-apply scoring** — Points update on button click with undo support, not staged-then-committed
- **Base64 avatars** — Compressed to <200KB/each, stored in IndexedDB, survive page reloads

## How to Use

1. **Add Players** — Go to Players tab, add names (or bulk-paste 20 names at once)
2. **Configure** — Set group size and selection mode in the Game tab settings
3. **Play Rounds** — Hit "CHOOSE GROUP" to randomly select players
4. **Score** — In the popup, use +1/-1/+2 buttons and tag answers, then finalize
5. **Track** — View live scoreboard and round history
6. **End** — Show final standings with podium view

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Choose group (when modal closed) |
| `R` | Reroll group (when modal open) |
| `Escape` | Close modal |
| `Ctrl+Z` | Undo last round |

## Future Improvements

- Sound effects (buzzer/ding) on selection and scoring
- PWA support for offline tablet use
- Team-based rounds
- Timer per round
- Custom themes/colors
- Remote spectator view via WebSocket
