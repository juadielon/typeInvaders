# Type Invaders roadmap

This roadmap is a guide, not a fixed promise. Before starting a new feature,
read the README and `docs/product.md`, then confirm any open decision that
affects the feature's behaviour or scope.

## Completed

- Docker-based React, TypeScript, Vite, and Tailwind project setup.
- First playable game loop with aliens, lasers, shields, score, WPM, and
  accuracy.
- Fifteen-level Home, Top and Bottom Row combat curriculum covering every
  letter, comma, full stop, slash and semicolon.
- Five Word Formation missions after Levels 3, 6, 9, 12 and 15. Each mission
  lays a word out as a horizontal alien formation that descends as one unit
  and is cleared from left to right. The word under construction is shown
  above the visual keyboard while its aliens are on screen.
- Game-over, mission briefing, mission results, and victory screens.
- A ship that glides to and fires from its target, redesigned to match the
  alien sprite aesthetic.
- A brief hit explosion effect and a rescuable mothership bonus mechanic
  (multiple visual shapes, appears once the Shield has taken damage).
- The screen clears of remaining aliens before mission results appear.
- Lesson selection and replay, so players choose the level they practise.
- Retry choices after every completed mission and after game over, without
  requiring a return through lesson selection.
- Longer lessons with the same gentle opening spawn cadence and alien descent
  speed, ramping to a noticeably faster final wave.
- A lesson progress bar showing cleared and remaining aliens.
- One new alien species introduced in every combat level, with later species
  becoming increasingly silly while remaining cosmetic, plus targeted
  readability refinements for the Giggler, Moustachio and Wobbly Cyclops.
- Closest-alien keyboard priority: the next key keeps the strong amber
  highlight while other visible keys use a lighter amber. Repeated consecutive
  targets briefly retrigger the primary highlight to prompt another press.
- A brief green/red flash on the on-screen keyboard confirming each physical
  letter/punctuation keystroke as a hit or a misfire (not yet extended to
  the Spacebar).
- Plasma-missile defence that teaches Spacebar input and contributes to WPM
  and accuracy.
- Optional sound effects with a visible mute control.
- A short hold at the end of a level so the final shot and explosion are seen.
- Exact-boundary reducer coverage for the final-shot hold and results transition.
- Accessible target terminology and spoken punctuation names for screen readers.
- A documented rule reference in the README.
- Unit tests for the core rules and selected UI behaviour.
- ESLint 9 flat configuration for TypeScript and React.
- Setup, play, test, and production-preview documentation.

## Lesson progression

Lessons should be replayable practice missions with enough time to build
confidence before moving on. Each module starts with a briefing, introduces
only a small number of new keys, and ends with a fun challenge that mixes the
new skill with previously learned keys. Levels should begin with a gentle
spawn cadence, then increase alien frequency as the lesson continues so the
player gets warm-up time followed by meaningful practice. The exact number of
levels and target kills in each module can change as play-testing reveals the
right difficulty curve. Alien descent follows the same pattern: every lesson
starts at the same speed, while later lessons reach a faster end speed.

The first curriculum milestone is complete: 15 missions introduce two keys at
a time across the Home, Top and Bottom Rows. Every mission starts with the
same gentle cadence and descent speed, then ramps towards a faster,
level-specific final wave. Plasma missiles add Spacebar practice throughout
the curriculum rather than requiring a separate lesson.

The next lesson modules remain planned:

1. **Number sector** - Add the number row only after the letter rows and Word
    Formation checkpoints are comfortable. Teach numbers in
    left/right groups and use score multipliers
    or a bonus-star run to make this advanced module feel special.
2. **Pilot certification** - Mix all learned letters, numbers, and Spacebar
    defence in short missions. Reward accuracy, consistency, and improvement
    with personal bests rather than requiring a high typing speed.
3. **Pattern patrols** - Introduce common letter patterns such as `th`, `he`,
    `in`, `er`, `re`, `an`, and `ing`. Let players clear recognisable formations
    by typing each pattern accurately, building rhythm without requiring full
    words yet.
4. **Word supply run** - Progress from short, high-frequency words such as
    `the`, `and`, `you`, `is`, `to`, and `can` into slightly longer everyday
    words. Present each word as a short alien convoy so players practise
    continuous movement across several keys.
5. **Phrase missions** - Add useful beginner phrases such as `good job`,
    `well done`, `go go go`, and `type with care`. Teach the Spacebar as part
    of normal typing, with spaces creating a new target wave or a small combo
    reward.
6. **Comms challenge** - Combine common patterns, words, and short phrases
    in themed messages from the ship. Keep messages brief, repeat them with
    small variations, and measure accuracy and consistency before increasing
    speed.

## Next priorities

1. Improve accessibility with reduced-motion support, clearer focus states,
   and options for colour and text size.
2. Save optional lesson results and personal bests without making session
   resumption the primary progression model.
3. Add number-row lessons, followed by pattern and word modules.
4. Expand plasma defence with varied but beginner-friendly bolt patterns.
5. Design responsive controls before adding phone or tablet support.

## Open decisions

- **Recommended accuracy rule:** keep an occasional typo neutral, but apply a tiny
  shield drain after a short streak of consecutive misfires (for example, three),
  with a visible but non-alarming feedback cue. Cap the drain so mistakes cannot
  rapidly end a beginner session; accuracy should remain more important than
  punishment.
- Should saved progress stay in the browser only, or eventually use an
  account-based service?
- What is the right session length and difficulty curve for complete
  beginners?
- Which accessibility settings should be available in the first post-MVP
  release?

## Working agreement

- Create a focused branch and pull request for each independent change.
- Keep the Docker-only workflow unless the product guide is intentionally
  updated.
- Add or update targeted tests whenever game logic changes.
- Update the README for installation, run, or testing changes.
- Update this roadmap after completing a milestone or changing priorities.
