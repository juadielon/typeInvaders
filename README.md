# Type Invaders

**Type Invaders** is a Space Invaders–style arcade game that doubles as a
touch-typing tutor for complete beginners. Alien "invaders" descend from the
top of the screen, each labelled with a single Home Row letter. Instead of
aiming a ship, the player destroys aliens by typing the correct letter on
their physical keyboard — the game automatically "fires" at the closest
matching alien. A Visual Keyboard overlay highlights the target key and the
correct hand/finger to use, and a simple level system gradually introduces
more keys as the player improves.

It is built with **React + TypeScript**, bundled with **Vite**, and styled
with **Tailwind CSS**. The entire toolchain runs inside **Docker** — no
Node.js/npm installation on your machine is required.

## Table of contents

- [How the game works](#how-the-game-works)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the game](#running-the-game)
- [Running the tests](#running-the-tests)
- [Adding a dependency](#adding-a-dependency)
- [Production build preview](#production-build-preview)
- [Project structure](#project-structure)

## How the game works

- Aliens descend from the top of the playfield, each labelled with a Home
  Row letter (Level 1 starts with `F` and `J` only).
- Type the letter shown on an alien to destroy it with a laser — the game
  always targets the lowest (most urgent) on-screen alien matching that
  key.
- The Visual Keyboard overlay below the playfield highlights the currently
  relevant key(s) and shows a hint such as "F → Left Index" or
  "J → Right Index". It is a reference only — gameplay only responds to
  your physical keyboard.
- Letting an alien reach the bottom costs 20 Shield HP. Your Shield starts
  at 100 HP; reaching 0 ends the game.
- Clearing the required number of aliens in a level advances you to the
  next level, which unlocks additional keys and increases difficulty
  (faster spawns, faster descent).
- Live Words Per Minute (WPM) and accuracy are shown throughout the round,
  but are not saved between sessions in this MVP.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or any
  Docker Engine with the Compose plugin) installed and running.
- That's it — no Node.js, npm, or other local toolchain is required.

## Installation

Clone the repository, then simply build the Docker image; all dependencies
are installed inside the container, never on your host machine:

```powershell
git clone https://github.com/juadielon/typeInvaders.git
cd typeInvaders
docker compose build dev
```

## Running the game

Start the Vite dev server inside Docker:

```powershell
docker compose up --build
```

Then open <http://localhost:5173> in your browser. Source changes under
`src/` hot-reload automatically thanks to the bind-mounted volume.

To stop the container:

```powershell
docker compose down
```

## Running the tests

Unit tests use [Vitest](https://vitest.dev/) with React Testing Library and
also run entirely inside the container:

```powershell
docker compose run --rm dev npm test
```

For a watch-mode loop while developing:

```powershell
docker compose run --rm dev npm run test:watch
```

Test coverage currently focuses on the core game logic (`gameReducer`),
keyboard/finger mapping utilities, and a component smoke test — the parts
most valuable to verify as the game evolves.

## Adding a dependency

Never run `npm install` on the host — always install through the
container so `package.json`/`package-lock.json` and the container image
stay in sync:

```powershell
docker compose run --rm dev npm install <package-name>
```

## Production build preview

```powershell
docker compose --profile prod up --build prod
```

Then open <http://localhost:8080> to preview the production (nginx-served)
build.

## Project structure

```
type-invaders/
├── Dockerfile              # Multi-stage build: deps -> dev -> build -> prod
├── docker-compose.yml       # Dev (Vite) and prod (nginx) services
├── src/
│   ├── App.tsx              # Main layout & game state manager
│   ├── main.tsx              # React entry point
│   ├── types/game.ts         # Alien, Laser, LevelConfig, GameState types
│   ├── data/levels.ts        # Level configuration (keys, speed, targets)
│   ├── state/gameReducer.ts  # Pure reducer driving all game logic
│   ├── hooks/
│   │   ├── useGameLoop.ts      # requestAnimationFrame + delta-time loop
│   │   └── useKeyboardInput.ts # Global keydown capture & dedupe
│   ├── utils/keyboardLayout.ts # Key → hand/finger lookup table
│   └── components/
│       ├── GameArea.tsx         # Aliens, lasers, player ship
│       ├── VisualKeyboard.tsx   # On-screen keyboard with hints
│       ├── HUD.tsx              # Shield HP, Score, Level, WPM, Accuracy
│       └── screens/             # Start / LevelUp / GameOver screens
└── ...config files (Vite, Tailwind, TypeScript)
```

## Known MVP limitations

- Physical keyboard only — there is no touch/mobile input, so the game is
  not playable on phones or tablets in this version.
- No sound effects and no persistence of scores/progress between sessions
  (both are natural fast-follow additions).

