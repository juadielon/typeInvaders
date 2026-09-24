# Type Invaders

**Type Invaders** is a Space Invaders–style arcade game that doubles as a
touch-typing tutor for complete beginners. Alien "invaders" — with one
new visual species introduced in every combat level — descend from the top of the screen, each
labelled with a single keyboard key. The player destroys aliens by pressing
the matching key on their physical keyboard; the on-screen ship glides to
the closest matching alien and fires the shot from its own position. A
Visual Keyboard overlay highlights the target key and the correct
hand/finger to use, and a 15-level combat curriculum plus five Word Formation
missions gradually introduces every letter plus semicolon, comma, full stop
and slash across the Home, Top and Bottom Rows as the player improves. A rescuable
"mothership" occasionally drifts across a lane above the aliens whenever
your Shield has taken damage — destroying it restores some Shield HP and a
score bonus.

It is built with **React + TypeScript**, bundled with **Vite**, and styled
with **Tailwind CSS**. The entire toolchain runs inside **Docker** — no
Node.js/npm installation on your machine is required.

## Table of contents

- [How the game works](#how-the-game-works)
- [Game rules](#game-rules)
- [Level progression](#level-progression)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Command-line instructions](#command-line-instructions)
- [Running the game](#running-the-game)
- [Running the tests](#running-the-tests)
- [Running the linter](#running-the-linter)
- [Commit message conventions](#commit-message-conventions)
- [Adding a dependency](#adding-a-dependency)
- [Production build preview](#production-build-preview)
- [Project structure](#project-structure)
- [Product and roadmap](#product-and-roadmap)

## How the game works

- Combat aliens descend from the top of the playfield, each labelled with a keyboard key
  (Level 1 starts with `F` and `J` only). Every combat level introduces a new
  visual species, from the Scout to increasingly silly invaders such as
  Noodle Doodle, Moustachio, Cosmic Toaster and Party King. Species are
  purely cosmetic - the displayed key is all that matters for gameplay.
- Press the key shown on an alien to destroy it with a laser — the ship
  glides to and fires from the position of the lowest (most urgent)
  on-screen alien matching that key, with a small explosion on a hit.
- Word Formation missions interrupt the combat curriculum after Levels 3, 6,
  9, 12 and 15. Each word appears as a horizontal alien formation that
  descends as one unit. Press the leftmost remaining character to destroy it,
  then continue from left to right until the word is complete. The first
  formation checkpoint uses the keys released by combat Level 3 (`A D F J K ;`)
  and includes
  short entries such as `a`, `ad`, `dad`, `fad`, `faff`, `dada` and `kaf`.
  Some formations add a semicolon at the end, such as `dad;`, so punctuation
  is practised in a natural word-ending position.
- The Visual Keyboard overlay below the playfield highlights the currently
  relevant key(s) and shows a hint such as "F → Left Index" or
  "J → Right Index". The alien closest to the spaceship determines the next
  key and keeps the strong amber highlight. When consecutive targets use the
  same key, the highlight briefly clears and returns to prompt another press.
  Other available keys use a
  lighter amber background. It is a reference only — gameplay only responds
  to your physical keyboard. Whichever letter or punctuation key you actually
  press also briefly flashes green on a hit or red on a misfire, so you get
  instant confirmation of what was typed as well as what to type next
  (the Spacebar does not yet have this flash feedback).
- Optional sound effects provide arcade feedback for hits, including
  variant-specific alien voices, mothership and ship explosions, incoming
  plasma alarms, shield damage, mission completion and game over. Use the Sound on/off control to
  change the preference; it is saved in this browser.
- Letting an alien reach the bottom costs 10 Shield HP (protection points).
  Your Shield starts at 100; reaching 0 ends the game.
- Whenever your Shield has taken any damage, a rescuable "mothership" may
  drift across a lane above the aliens from time to time. It carries one of
  the level's practice keys — destroy it to restore some Shield HP and
  earn a score bonus. It doesn't count toward a level's kill target, so it's
  a bonus rather than a requirement.
- Starting a game opens a lesson selector so you can choose any current
  mission, including the indigo Word Formation checkpoints. The selected
  lesson then shows its finger-position briefing before play begins. During
  the briefing, the on-screen keyboard highlights every key used in that
  lesson so you can find them before the aliens arrive.
- Clearing the required number of aliens, or completing the required Word
  Formation set, opens a mission-results screen.
  You can retry the mission for more practice or continue to the next
  level, which unlocks additional keys and increases difficulty
  (longer practice targets, a gentle opening spawn cadence that becomes
  faster during the level, and faster descent); the screen is cleared of aliens before
  the next level begins. A briefing then pauses the game until you choose
  to continue. It shows the correct hand positions, each key's
  finger movement, and the new level's objective.
- If your Shield reaches 0%, the game-over screen lets you retry the same
  mission immediately or return to the lesson selector.
- A lesson progress bar in the status bar shows how many aliens you have
  cleared and how many remain before the level ends, so a longer lesson
  never feels open-ended.
- Every combat level introduces one new alien species. Earlier species keep
  appearing, so the fleet becomes more varied and ridiculous as you
  progress. The first alien always shows the mission's new species; later
  spawns use the full unlocked roster even if that first alien reaches the
  ship. Species are cosmetic only: every alien is still destroyed by typing
  the key it carries.
- Live Words Per Minute (WPM) and accuracy are shown throughout the round,
  but are not saved between sessions in this MVP. WPM is an estimate based on
  five correct keystrokes per standard word: `correctKeystrokes / 5 / elapsedMinutes`.
  Since the MVP practises individual keys, it is a practice estimate rather
  than a completed-word speed; future word and phrase lessons can use completed
  text and spaces for a more natural calculation.

## Game rules

A quick reference to every rule the game currently applies.

### Shooting

| Rule | Detail |
| --- | --- |
| Destroying an alien | Press the key shown on the alien. |
| Which alien is hit | The lowest (most urgent) matching alien in combat; the leftmost remaining character in Word Formation. |
| Score per alien | 10 points. |
| Priority penalty | Destroying an alien while a closer one is still descending costs 5 Shield HP, so you can't dodge the most urgent threat by picking an easier key. |
| Wrong key | Counts as a misfire against accuracy, but costs no Shield HP. |
| Input source | Only the physical keyboard; the Visual Keyboard is a reference. |
| Keystroke confirmation | A pressed letter or punctuation key briefly flashes green on a hit or red on a misfire on the Visual Keyboard (the Spacebar does not yet flash). |

### Shields and losing

| Rule | Detail |
| --- | --- |
| Starting Shield | 100 HP. |
| Alien reaching your ship | Costs 10 Shield HP and removes that alien. |
| Game over | Shield HP reaching 0. |

### Mothership bonus

| Rule | Detail |
| --- | --- |
| When it appears | Only once your Shield has taken damage, and only occasionally. |
| How to destroy it | Press the key it carries, when no descending alien matches. |
| Reward | 50 points and 30 Shield HP restored (capped at 100). |
| Progression | Does not count toward the level's kill target. |

### Lessons and levels

| Rule | Detail |
| --- | --- |
| Starting a game | Choose any lesson from the lesson selector. |
| Before each level | A briefing pauses the game until you choose to continue. |
| Replaying a lesson | Available after completing a mission or reaching game over; resets score, Shield, kills and the playfield. |
| Clearing a level | Destroy the level's target number of aliens, or complete the Word Formation word target. |
| Spawn pacing | Starts gently and speeds up as the level progresses. |
| Alien descent | Starts at the same gentle speed in every level, then ramps towards the level's faster final speed. |
| Keyboard priority | The closest alien's key uses the strong amber highlight in combat; the leftmost formation character is primary in Word Formation. |
| Progress indicator | The lesson bar shows cleared and remaining aliens or words. |
| End-of-level pause | The playfield is held briefly so the final shot is visible, then offers Retry Mission before continuing. |
| Winning | Clearing the final level offers a retry before finishing the curriculum in victory. |

### Plasma defence

| Rule | Detail |
| --- | --- |
| Who fires | Trickster and Warden aliens. |
| Bolt label | Each plasma bolt is labelled "space", just as aliens are labelled with their key. |
| Defence prompt | The Spacebar highlights on the on-screen keyboard while a bolt is inbound. |
| Fire key | Physical Spacebar. The on-screen keyboard highlight is instructional only. |
| Successful shot | Fires a laser at the inbound bolt, destroying it and awarding 5 points. |
| Missed bolt | Reaching the ship removes the bolt and costs 8 Shield HP. |
| Accuracy and WPM | Counts toward accuracy and WPM the same as another target key: a successful shot is a correct keystroke, and pressing Space with no missile inbound is a misfire. A missile that reaches the ship unshot only costs Shield HP; it isn't a keystroke, so it doesn't affect accuracy. |
| Missile path | Curves towards the spaceship's current position. |
| Impact | Creates an explosion at the ship and visibly weakens the ship as Shield HP falls. |
| Tab switching | The game loop pauses while the browser tab is hidden. |
### Scoring statistics

| Rule | Detail |
| --- | --- |
| Accuracy | `correctKeystrokes / totalKeystrokes`, shown as a percentage. |
| WPM | `correctKeystrokes / 5 / elapsedMinutes`, measured from the start of the game. |
| Persistence | Neither is saved between sessions in this MVP. |

## Level progression

Each combat level unlocks two more keys, raises the practice target, and ends at a
faster spawn cadence than the one before it. Every level opens at the same
gentle 2200 ms cadence, so a longer, later lesson never feels harder to
start than an earlier one. Alien descent also begins at the same gentle
speed in every level. The pressure instead builds from a longer ramp, a
faster minimum cadence and a faster final descent speed as the lesson goes
on. Levels 1-5 cover the Home Row, levels 6-10 add the Top Row and levels
11-15 add the Bottom Row, completing every letter plus the four punctuation
keys used by the curriculum. Every
combat mission introduces one new alien species while retaining all earlier
species, so the fleet grows throughout the full curriculum.

| Level | Keys | New alien | Aliens to clear | Opening spawn | Fastest spawn |
| --- | --- | --- | --- | --- | --- |
| 1 | F J | Scout | 42 | 2200 ms | 800 ms |
| 2 | + D K | Brute | 50 | 2200 ms | 720 ms |
| 3 | + A ; | Trickster | 58 | 2200 ms | 660 ms |
| 4 | + S L | Lurker | 66 | 2200 ms | 600 ms |
| 5 | + G H | Warden | 74 | 2200 ms | 540 ms |
| 6 | + R U | The Giggler | 80 | 2200 ms | 515 ms |
| 7 | + E I | Noodle Doodle | 86 | 2200 ms | 490 ms |
| 8 | + Q P | Disco Blob | 92 | 2200 ms | 465 ms |
| 9 | + W O | Moustachio | 98 | 2200 ms | 440 ms |
| 10 | + T Y | Propellerhead | 104 | 2200 ms | 415 ms |
| 11 | + V M | Jellybean | 110 | 2200 ms | 390 ms |
| 12 | + C , | Wobbly Cyclops | 116 | 2200 ms | 365 ms |
| 13 | + Z / | Crabster | 122 | 2200 ms | 340 ms |
| 14 | + X . | Cosmic Toaster | 128 | 2200 ms | 315 ms |
| 15 | + B N | Party King | 134 | 2200 ms | 290 ms |

Word Formation checkpoints follow Levels 3, 6, 9, 12 and 15. They use only
keys released at that checkpoint and require six, twelve, fourteen, sixteen and twenty
complete formations respectively. Every Word Formation mission starts with shorter
words and progressively introduces longer formations as its target is completed. The
second, third, fourth and fifth missions emphasise longer words
without increasing the descent pressure. Some formations also end with `;` so
punctuation is practised naturally. The lesson selector marks them with an
indigo `WORD FORMATION` badge.


The spawn rate eases from the opening cadence to the fastest cadence over the
course of the level, so the pressure builds while you settle into the new keys.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or any
  Docker Engine with the Compose plugin) installed and running.
- That's it — no Node.js, npm, or other local toolchain is required.

## Installation

Clone the repository and build the development image. All dependencies are
installed inside Docker, never on your host machine:

```powershell
git clone https://github.com/juadielon/typeInvaders.git
cd typeInvaders
docker compose build dev
```

## Command-line instructions

The following commands work in both PowerShell and Bash. Run them from the
`typeInvaders` directory.

| What you want to do | Command |
| --- | --- |
| Start the game | `docker compose up dev` |
| Stop the game | `docker compose down` |
| Run all tests once | `docker compose run --rm dev npm test` |
| Run tests while editing | `docker compose run --rm dev npm run test:watch` |
| Run the linter | `docker compose run --rm dev npm run lint` |
| Install a dependency | `docker compose run --rm dev npm install <package-name>` |
| Rebuild after changing dependencies or Docker setup | `docker compose build dev` |
| Preview the production build | `docker compose --profile prod up --build prod` |

For a first run after installation, use **Start the game**. You do not need
`--build` each time because the source code is mounted into the development
container and reloads automatically.

## Running the game

Start the Vite development server:

```powershell
docker compose up dev
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

Test coverage includes the reducer and level rules, exact mission-clear timing,
keyboard input and finger mapping, closest-alien target priority, mission retry
flows, spoken punctuation labels, and selected UI behaviour including alien
labels, keyboard highlights, keystroke hit/misfire flashing, briefings, lesson
selection, the HUD and the sound toggle.

## Running the linter

ESLint 9 checks the TypeScript and React source using the flat configuration
in `eslint.config.js`:

```powershell
docker compose run --rm dev npm run lint
```

## Commit message conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/)
for commit messages: `<type>: <description>`, for example `feat: add mothership
bonus` or `fix: reset word progress between missions`. Common types used here
are `feat` (new feature), `fix` (bug fix), `docs` (documentation only), `test`
(adding or updating tests), `refactor`, `style`, and `chore` (tooling/maintenance).
This keeps `git log` easy to scan by category and matches a widely used
industry convention for changelog and release tooling.

## Adding a dependency

Never run `npm install` on the host - always install through the
container so `package.json`/`package-lock.json` and the container image
stay in sync. After installation finishes, rebuild the development image:

```powershell
docker compose run --rm dev npm install <package-name>
docker compose build dev
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
├── eslint.config.js         # ESLint 9 TypeScript and React rules
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
│   ├── utils/
│   │   ├── alienTargets.ts     # Closest-alien keyboard priority
│   │   └── keyboardLayout.ts   # Key → hand/finger lookup table
│   └── components/
│       ├── GameArea.tsx         # Aliens, lasers, player ship
│       ├── VisualKeyboard.tsx   # On-screen keyboard with hints
│       ├── HUD.tsx              # Shield HP, Score, Level, WPM, Accuracy
│       └── screens/             # Start, lesson, briefing, results, and game-over screens
└── ...config files (Vite, Tailwind, TypeScript)
```

## Known MVP limitations

- Physical keyboard only — there is no touch/mobile input, so the game is
  not playable on phones or tablets in this version.
- Sound effects are optional and can be muted; only that on/off preference
  is saved in this browser. Scores and lesson progress are not persisted
  between sessions (a natural fast-follow addition).

## Product and roadmap

Read [the product guide](docs/product.md) for the intended learner,
gameplay principles, current scope, and established technical decisions.
Read [the roadmap](docs/roadmap.md) before planning new work; it records
completed milestones, prioritised next steps, and decisions that still need
input.
