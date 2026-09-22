# Type Invaders roadmap

This roadmap is a guide, not a fixed promise. Before starting a new feature,
read the README and `docs/product.md`, then confirm any open decision that
affects the feature's behaviour or scope.

## Completed

- Docker-based React, TypeScript, Vite, and Tailwind project setup.
- First playable game loop with aliens, lasers, shields, score, WPM, and
  accuracy.
- Five-level home-row progression and visual finger guidance.
- Game-over, level-up, and victory screens.
- A ship that glides to and fires from its target, redesigned to match the
  alien sprite aesthetic, plus a few cosmetic alien varieties.
- A brief hit explosion effect and a rescuable mothership bonus mechanic
  (multiple visual shapes, appears once the Shield has taken damage).
- The screen clears of remaining aliens before a level-up transition.
- Lesson selection and replay, so players choose the level they practise.
- Longer lessons with a gentle opening spawn cadence that ramps to a
  noticeably faster final wave.
- A lesson progress bar showing cleared and remaining aliens.
- A new alien species introduced on each level, stacking with earlier ones.
- A short hold at the end of a level so the final shot and explosion are seen.
- A documented rule reference in the README.
- Unit tests for the core rules and selected UI behaviour.
- Setup, play, test, and production-preview documentation.

## Planned lesson progression

Lessons should be replayable practice missions with enough time to build
confidence before moving on. Each module starts with a briefing, introduces
only a small number of new keys, and ends with a fun challenge that mixes the
new skill with previously learned keys. Levels should begin with a gentle
spawn cadence, then increase alien frequency as the lesson continues so the
player gets warm-up time followed by meaningful practice. The exact number of
levels and target kills in each module can change as play-testing reveals the
right difficulty curve.

1. **Launch pad: F and J** - Find the raised bumps, place both index fingers,
   and practise alternating the two anchor keys. Keep the pace gentle and
   celebrate a first clean wave of invaders.
2. **Home-row crew: D and K** - Add the middle fingers while keeping F and J
   active. Use paired left/right targets and a short `combo streak` bonus
   to make balanced hand use feel rewarding.
3. **Home-row squad: S and L** - Add the ring fingers and practise moving
   between the middle and outer home keys. Use alternating patterns so
   players learn to look at the screen rather than hunt for keys.
4. **Home-row command: A and ;** - Complete the home row with the pinkies.
   Use a rescue mission or mothership bonus to make the new outer keys feel
   useful, not merely harder.
5. **Index reaches: G and H** - Teach the left and right index fingers to
   reach sideways from F and J, then return to their home positions. Add
   brief two-key patterns such as `FG` and `JH` before mixing the full home row.
6. **Top-row scouts: R, T, Y, U, I and O** - Introduce upper-row reaches in
   small hand-based groups, first left then right. Give the player a faster
   scout wave to make the new vertical movement feel like a natural upgrade.
7. **Top-row sweep: Q, W, E and P** - Finish the upper row from the outside
   towards the centre. Add timed formation waves, but keep the target count
   low enough that accuracy remains more important than speed.
8. **Bottom-row explorers: V, B, N and M** - Introduce the lower-row reaches
   beneath the home position, using wider alien formations to reinforce hand
   movement without overwhelming beginners.
9. **Bottom-row sweep: Z, X, C and comma/full stop** - Complete the letter
   rows with a slower precision mission, then a mixed-row final wave.
10. **Space defence: Spacebar** - Introduce alien plasma bolts and the
    `Press [SPACE] to Shield!` response. Begin with generous timing, then
    gradually ask players to alternate letter shots and thumb presses.
11. **Number sector** - Add the number row only after the letter rows are
    comfortable. Teach numbers in left/right groups and use score multipliers
    or a bonus-star run to make this advanced module feel special.
12. **Pilot certification** - Mix all learned letters, numbers, and Spacebar
    defence in short missions. Reward accuracy, consistency, and improvement
    with personal bests rather than requiring a high typing speed.
13. **Pattern patrols** - Introduce common letter patterns such as `th`, `he`,
    `in`, `er`, `re`, `an`, and `ing`. Let players clear recognisable formations
    by typing each pattern accurately, building rhythm without requiring full
    words yet.
14. **Word supply run** - Progress from short, high-frequency words such as
    `the`, `and`, `you`, `is`, `to`, and `can` into slightly longer everyday
    words. Present each word as a short alien convoy so players practise
    continuous movement across several keys.
15. **Phrase missions** - Add useful beginner phrases such as `good job`,
    `well done`, `go go go`, and `type with care`. Teach the Spacebar as part
    of normal typing, with spaces creating a new target wave or a small combo
    reward.
16. **Comms challenge** - Combine common patterns, words, and short phrases
    in themed messages from the ship. Keep messages brief, repeat them with
    small variations, and measure accuracy and consistency before increasing
    speed.

## Next priorities

1. Expand the lesson path beyond the initial home-row key set while keeping
   each lesson approachable for beginners. The pacing model is settled: longer
   practice targets with a gentle opening cadence that ramps to a faster final
   wave, and a new alien species introduced on each level.
2. Expand the new plasma-defence module with more bolt patterns and timing`r`n   variations while keeping the Spacebar prompt clear for beginners.
3. Improve accessibility with reduced-motion support, clearer focus states,
   and options for colour and text size.
4. Add optional sound effects with a visible mute control.
5. Save optional lesson results and personal bests without making session
   resumption the primary progression model.
6. Design responsive controls before adding phone or tablet support.

## Open decisions

- **Recommended accuracy rule:** keep an occasional typo neutral, but apply a tiny
  shield drain after a short streak of consecutive misfires (for example, three),
  with a visible but non-alarming feedback cue. Cap the drain so mistakes cannot
  rapidly end a beginner session; accuracy should remain more important than
  punishment.
- Should lesson selection be fully open, or should later lessons unlock after
  a basic accuracy threshold while still allowing replay of completed lessons?
- Should Spacebar shields consume a limited resource, rely purely on timing,
  or use both?
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
