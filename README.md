# Type Invaders

**Type Invaders** is a Space Invaders–style arcade game that doubles as a
touch-typing tutor for complete beginners. Alien "invaders" — in a few
different visual varieties — descend from the top of the screen, each
labelled with a single Home Row letter. The player destroys aliens by typing
the correct letter on their physical keyboard; the on-screen ship glides to
the closest matching alien and fires the shot from its own position. A
Visual Keyboard overlay highlights the target key and the correct
hand/finger to use, and a simple level system gradually introduces more keys
as the player improves. A rescuable "mothership" occasionally drifts across
a lane above the aliens whenever your Shield has taken damage — destroying
it restores some Shield HP and a score bonus.

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
- [Product and roadmap](#product-and-roadmap)

## How the game works

- Aliens descend from the top of the playfield, each labelled with a Home
  Row letter (Level 1 starts with `F` and `J` only). They come in a few
  visual varieties (scout, brute, trickster), which are purely cosmetic —
  the letter is all that matters for gameplay.
- Type the letter shown on an alien to destroy it with a laser — the ship
  glides to and fires from the position of the lowest (most urgent)
  on-screen alien matching that key, with a small explosion on a hit.
- The Visual Keyboard overlay below the playfield highlights the currently
  relevant key(s) and shows a hint such as "F → Left Index" or
  "J → Right Index". It is a reference only — gameplay only responds to
  your physical keyboard.
- Letting an alien reach the bottom costs 10 Shield HP. Your Shield starts
  at 100 HP; reaching 0 ends the game.
- Whenever your Shield has taken any damage, a rescuable "mothership" may
  drift across a lane above the aliens from time to time. It carries one of
  the level's practice letters — destroy it to restore some Shield HP and
  earn a score bonus. It doesn't count toward a level's kill target, so it's
  a bonus rather than a requirement.
- Starting a game opens a lesson selector so you can choose any current home-row
  mission. The selected lesson then shows its finger-position briefing before
  play begins.
- Clearing the required number of aliens in a level advances you to the
  next level, which unlocks additional keys and increases difficulty
  (longer practice targets, a gentle opening spawn cadence that becomes
  faster during the level, and faster descent); the screen is cleared of aliens before
  the next level begins. A briefing then pauses the game until you choose
  to continue. It shows the correct home-row hand positions, each key's
  finger movement, and the new level's objective.
- Live Words Per Minute (WPM) and accuracy are shown throughout the round,
  but are not saved between sessions in this MVP. WPM is an estimate based on
  five correct keystrokes per standard word: `correctKeystrokes / 5 / elapsedMinutes`.
  Since the MVP practises individual letters, it is a practice estimate rather
  than a completed-word speed; future word and phrase lessons can use completed
  text and spaces for a more natural calculation.

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

## Command-line instructions

The following commands can be run from either PowerShell or Bash.

Clone the repository and build the development image:

```PowerShell/Bash
git clone https://github.com/juadielon/typeInvaders.git
cd typeInvaders
docker compose build dev
```

Start the Vite development server:

```PowerShell/Bash
docker compose up --build
```

Stop the running containers:

```PowerShell/Bash
docker compose down
```

Run the unit tests:

```PowerShell/Bash
docker compose run --rm dev npm test
```

Run tests in watch mode while developing:

```PowerShell/Bash
docker compose run --rm dev npm run test:watch
```

Install a dependency inside the container:

```PowerShell/Bash
docker compose run --rm dev npm install <package-name>
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
├── docs/
│   ├── product.md           # Product vision, scope, and technical decisions
│   └── roadmap.md           # Completed work, upcoming priorities, open questions
├── src/
│   ├── App.tsx              # Main layout & game state manager
│   ├── main.tsx              # React entry point
│   ├── types/game.ts         # Alien, Laser, Explosion, Mothership, GameState types
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

## Product and roadmap

Read [the product guide](docs/product.md) for the intended learner,
gameplay principles, current scope, and established technical decisions.
Read [the roadmap](docs/roadmap.md) before planning new work; it records
completed milestones, prioritised next steps, and decisions that still need
input.
