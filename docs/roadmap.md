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
- Unit tests for the core rules and selected UI behaviour.
- Setup, play, test, and production-preview documentation.

## Planned lesson progression

Lessons should be short, replayable missions. Each module starts with a
briefing, introduces only a small number of new keys, and ends with a fun
challenge that mixes the new skill with previously learned keys. The exact
number of levels in each module can change as play-testing reveals the right
difficulty curve.

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

## Next priorities

1. Expand the lesson path beyond the initial home-row key set while keeping
   each lesson approachable for beginners. Introduce the number row only
   in advanced levels, after learners are comfortable with the letter rows.
2. Introduce alien plasma bolts in later levels, with a "Press [SPACE] to
   Shield!" prompt that teaches thumb discipline and breaks up repeated
   letter-key practice.
3. Add a lesson selection and replay experience so players can practise a
   particular set of keys.
4. Improve accessibility with reduced-motion support, clearer focus states,
   and options for colour and text size.
5. Add optional sound effects with a visible mute control.
6. Save local progress and lesson results so players can resume practice.
7. Design responsive controls before adding phone or tablet support.

## Open decisions

- Should inaccurate keystrokes have a visible penalty, or remain neutral
  while accuracy is tracked?
- How should players unlock or choose lessons: a fixed sequence, free
  selection, or both?
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
