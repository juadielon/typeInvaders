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

## Next priorities

1. Expand the lesson path beyond the initial home-row key set while keeping
   each lesson approachable for beginners.
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
