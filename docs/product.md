# Type Invaders product guide

## Purpose

Type Invaders is a small arcade game that helps complete beginners practise
touch-typing. Players destroy descending aliens by pressing the matching key
on a physical keyboard. The game should make correct finger placement feel
useful and rewarding, rather than turning practice into a test.

## Intended learner

The first audience is someone who has little or no touch-typing experience.
They need short, clear feedback and a manageable number of keys at a time.
The game must be enjoyable without assuming they already type quickly.

## Learning and gameplay principles

- Start with a small, useful key set and introduce new keys gradually.
- Define typing terms such as Home Row and game terms such as Shield before
  asking a first-time player to act on them. Prefer plain language and
  percentages over unexplained abbreviations.
- Show the correct key, hand, and finger at the point they are needed.
- Reward accurate, timely input without punishing an occasional mistake.
- Make the most urgent matching alien the target so typing feels fair and
  predictable.
- Use new threats to teach new keyboard habits, such as Spacebar laser
  practice when later levels introduce incoming plasma missiles.
- Increase pressure slowly as players gain familiarity.
- Keep feedback readable and avoid visual clutter that competes with the
  typing task.

## Current MVP

The MVP includes:

- Fifteen progressively harder lessons covering the Home, Top and Bottom Rows,
  with lesson selection and replay available before each briefing. Every
  lesson starts with the same gentle spawn cadence and alien descent speed,
  then builds to a faster cadence and descent speed before advancing.
- A lesson progress bar showing cleared and remaining aliens, so learners can
  see when the level will end.
- A brief hold at the end of a level so the final shot and explosion play out
  before a results screen offers a retry or the next mission. Game over also
  offers an immediate retry of the current mission.
- Plasma bolts home towards the spaceship, create an impact explosion, and
  visibly deteriorate the ship as its shield weakens.
- Plasma defence prompts for Spacebar practice: Trickster and Warden aliens
  can fire bolts labelled "space" (matching the letter labels on other
  aliens), which highlight the Spacebar on the on-screen keyboard while
  inbound. Learners fire the ship's laser at the missile, just like shooting
  a lettered alien, or absorb a small Shield loss if it reaches the ship.
- Descending single-key aliens with one new visual species introduced in
  every mission. The first spawn guarantees that mission's new species, then
  later spawns use the cumulative unlocked roster regardless of whether the
  first alien was destroyed or reached the ship. Later species become
  increasingly playful, while remaining cosmetic so typing rules stay consistent.
- A rescuable mothership that appears occasionally once the Shield has
  taken damage, rewarding a correct keystroke with restored Shield HP and
  bonus score without counting toward level progression.
- WPM and accuracy shown during a game.
- **WPM meaning:** Words Per Minute treats five correct keystrokes as one
  standard word. The current estimate is `correctKeystrokes / 5 / elapsedMinutes`,
  calculated from the start of the game and updated live. Incorrect keys do not
  increase WPM, and the value is not saved. Because the MVP practises individual
  letters rather than complete words, this is an estimated practice WPM; word and
  phrase lessons can later calculate it from completed text and spaces.
- A visual keyboard that identifies the relevant key and finger. The alien
  closest to the spaceship receives the strong amber "type next"
  keyboard highlight. Other visible alien keys remain available with a
  lighter amber background, and duplicate keys are collapsed.
- During a mission briefing, the visual keyboard highlights the full lesson
  key set equally so learners can locate every key before play begins.
  Screen-reader labels use spoken punctuation names so punctuation targets
  cannot be confused with separators.
- Targeted unit and component tests covering reducer rules, lesson pacing,
  keyboard input and mapping, closest-alien priority, alien readability and
  key user-interface states.
- ESLint 9 with TypeScript, React Hooks and Vite refresh rules.
- A Docker-only development workflow.

## Deliberate MVP exclusions

- Sound effects and music.
- Persistent scores, progress, accounts, or leaderboards.
- Mobile and touch-screen input.
- Accessibility settings beyond the current browser defaults.

## Established technical decisions

| Decision | Reason |
|---|---|
| React, TypeScript, Vite, and Tailwind CSS | A small, strongly typed front-end stack that keeps iteration quick. |
| Docker-only local tooling | Contributors do not need to install Node.js or npm on their host machine. |
| Native global keyboard events | The game needs consistent physical-keyboard input regardless of focused UI elements. |
| Pure reducer for game state | Rules such as scoring, targeting, damage, and level progression are easier to test and change safely. |
| Pause the game when the browser tab is hidden | Players should not lose shields because their browser was in the background. |
| Hold a cleared level for a moment before transitioning | The final shot and explosion should be seen, so a level never appears to end before the player's last keystroke landed. |
| Offer retry at every mission outcome | Learners should be able to repeat the same keys immediately after completing a mission or reaching game over, without navigating back through lesson selection. |
| Spacebar plasma defence | Firing at an incoming missile adds a small reflex exercise, and now counts toward accuracy/WPM like a letter key. |
| Closest-alien keyboard priority | Strong and secondary keyboard highlights teach the player which visible threat should be handled next without hiding other available letters. |
| ESLint 9 flat configuration | TypeScript and React quality checks run consistently inside the Docker workflow. |
| Tests for game-logic changes | Behavioural changes should be protected by targeted unit tests before they are merged. |

## Where the rules live

The complete set of gameplay rules, including scoring, shield damage, the
mothership bonus, lesson pacing and the level progression table, is documented
in the [Game rules](../README.md#game-rules) section of the README. Keep that
table up to date whenever a rule changes in `src/state/gameReducer.ts` or
`src/data/levels.ts`.

## Keeping this guide useful

Update this file when the audience, product principles, scope, or a lasting
technical decision changes. Keep setup instructions in the README and
short-term priorities in the roadmap.
