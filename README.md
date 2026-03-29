# PlayersSelectorApp (Quiz Host Control Panel)

PlayersSelectorApp is a local-first web application for running in-person movie quiz events. It focuses on fast host workflows: managing players, selecting groups, scoring rounds, tracking history, and showing a live scoreboard without requiring a backend service.

## What it does

- manages player records and avatars
- supports bulk player import and export
- selects quiz groups with configurable rules
- tracks scoring across rounds
- keeps a complete round history with undo support
- shows ranked live standings and presentation views
- stores data locally so the app survives refreshes during an event

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Zustand
- Dexie / IndexedDB
- Radix UI primitives
- Jest

## Key product decisions

- Local-first persistence through IndexedDB rather than a backend dependency
- Single-page workflow so a quiz host can move quickly during a live event
- Touch-friendly scoring and keyboard shortcuts for faster in-room use
- Import/export support for managing players outside the app when needed

## Repository structure

```text
src/app/                    Next.js app entry points and API routes
src/components/game/        Group selection and scoring workflows
src/components/players/     Player CRUD, avatars, and import/export UI
src/components/scoreboard/  Live standings, presentation view, and end-game view
src/components/history/     Round history and audit log
src/hooks/                  Fullscreen and keyboard shortcut hooks
src/lib/                    Persistence, scoring, selection, and utilities
__tests__/                  Automated tests
```

## Local development

### Requirements

- Node.js 18+
- npm

### Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
```

## Notes

- Data is stored in IndexedDB, including compressed avatar images.
- The project is designed for local event use rather than multi-user remote sync.
