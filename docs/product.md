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
- Show the correct key, hand, and finger at the point they are needed.
- Reward accurate, timely input without punishing an occasional mistake.
- Make the most urgent matching alien the target so typing feels fair and
  predictable.
- Use new threats to teach new keyboard habits, such as Spacebar shielding
  when later levels introduce incoming plasma bolts.
- Increase pressure slowly as players gain familiarity.
- Keep feedback readable and avoid visual clutter that competes with the
  typing task.

## Current MVP

The MVP includes:

- Home-row typing lessons across five progressively harder levels, with lesson selection and replay available before each briefing. Each lesson starts with a gentle spawn cadence, builds to a noticeably faster cadence by the end, and requires a longer target before advancing.
- A lesson progress bar showing cleared and remaining aliens, so learners can
  see when the level will end.
- Descending single-letter aliens with a new species introduced each level
  (Scout, Brute, Trickster, Lurker and Warden), a ship that
  glides to and fires from its target, laser feedback with a hit
  explosion, scoring, shields, and game-over and victory states.
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
- A visual keyboard that identifies the relevant key and finger.
- Unit tests for the game reducer, keyboard mapping, and start screen.
- A Docker-only development workflow.

## Deliberate MVP exclusions

- Sound effects and music.
- Persistent scores, progress, accounts, or leaderboards.
- Lesson selection and replay controls beyond starting a new game.
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
| Tests for game-logic changes | Behavioural changes should be protected by targeted unit tests before they are merged. |

## Keeping this guide useful

Update this file when the audience, product principles, scope, or a lasting
technical decision changes. Keep setup instructions in the README and
short-term priorities in the roadmap.
