import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { LEVELS } from './data/levels'
import { useGameLoop } from './hooks/useGameLoop'
import { useKeyboardInput } from './hooks/useKeyboardInput'
import { createInitialState, gameReducer } from './state/gameReducer'
import { GameArea } from './components/GameArea'
import { VisualKeyboard } from './components/VisualKeyboard'
import { HUD } from './components/HUD'
import { StartScreen } from './components/screens/StartScreen'
import { LessonSelect } from './components/screens/LessonSelect'
import { LevelBriefing } from './components/screens/LevelBriefing'
import { GameOverScreen } from './components/screens/GameOverScreen'
import { MissionCompleteScreen } from './components/screens/MissionCompleteScreen'
import { getKeyboardHighlights } from './utils/alienTargets'
import { calculateWpm } from './utils/stats'
import { SoundToggle } from './components/SoundToggle'
import { readSoundPreference, SOUND_PREFERENCE_KEY, useSoundEffects } from './hooks/useSoundEffects'

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const [soundEnabled, setSoundEnabled] = useState(readSoundPreference)
  const [quitConfirmOpen, setQuitConfirmOpen] = useState(false)
  // Tracks whether the quit prompt is what paused the run, so cancelling can
  // restore the exact state the player was in rather than always resuming.
  const quitPausedRunRef = useRef(false)
  const quitCancelButtonRef = useRef<HTMLButtonElement | null>(null)
  const resumeButtonRef = useRef<HTMLButtonElement | null>(null)

  const currentLevel = LEVELS[state.levelIndex]

  useGameLoop(state.status, currentLevel, state.levelStartedAt, dispatch)
  const { unlockAudio } = useSoundEffects(state, soundEnabled)

  useEffect(() => {
    try {
      window.localStorage.setItem(SOUND_PREFERENCE_KEY, String(soundEnabled))
    } catch {
      // Sound preference persistence is optional and must not block gameplay.
    }
  }, [soundEnabled])

  const handleKey = useCallback((key: string) => {
    unlockAudio()
    dispatch({ type: 'KEY_PRESS', key })
  }, [unlockAudio])
  const handleSoundToggle = useCallback((enabled: boolean) => {
    if (enabled) unlockAudio()
    setSoundEnabled(enabled)
  }, [unlockAudio])
  const handleSpace = useCallback(() => {
    unlockAudio()
    dispatch({ type: 'SPACE_PRESS' })
  }, [unlockAudio])
  const handleQuitCancel = useCallback(() => {
    setQuitConfirmOpen(false)
    if (quitPausedRunRef.current && state.status === 'paused') {
      dispatch({ type: 'RESUME_GAME' })
    }
    quitPausedRunRef.current = false
  }, [dispatch, state.status])

  const handlePauseToggle = useCallback(() => {
    // Escape dismisses the quit prompt rather than toggling the pause beneath
    // it, which is both the expected dialog behaviour and avoids resuming the
    // run behind an open modal.
    if (quitConfirmOpen) {
      handleQuitCancel()
      return
    }

    if (state.status === 'paused') {
      unlockAudio()
      dispatch({ type: 'RESUME_GAME' })
      return
    }

    if (state.status === 'playing') {
      unlockAudio()
      dispatch({ type: 'PAUSE_GAME' })
    }
  }, [handleQuitCancel, quitConfirmOpen, state.status, unlockAudio])

  const handleQuitGame = useCallback(() => {
    unlockAudio()
    dispatch({ type: 'QUIT_GAME' })
    quitPausedRunRef.current = false
    setQuitConfirmOpen(false)
  }, [unlockAudio])

  const handleQuitClick = useCallback(() => {
    quitPausedRunRef.current = state.status === 'playing'
    if (state.status === 'playing') {
      dispatch({ type: 'PAUSE_GAME' })
    }
    setQuitConfirmOpen(true)
  }, [dispatch, state.status])

  // Move focus into whichever overlay just opened so keyboard and screen-reader
  // users land on the primary action instead of staying behind the dialog.
  useEffect(() => {
    if (quitConfirmOpen) {
      quitCancelButtonRef.current?.focus()
    } else if (state.status === 'paused') {
      resumeButtonRef.current?.focus()
    }
  }, [quitConfirmOpen, state.status])

  useKeyboardInput(state.status, handleKey, handleSpace, handlePauseToggle)

  const wpm = calculateWpm(state, performance.now())
  const accuracy =
    state.totalKeystrokes === 0
      ? 100
      : Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)

  const { activeKeys, primaryKey, primaryTargetId } = useMemo(
    () =>
      getKeyboardHighlights(
        state.status,
        currentLevel.allowedKeys,
        state.aliens,
        currentLevel.kind === 'wordFormation',
      ),
    [currentLevel.allowedKeys, currentLevel.kind, state.aliens, state.status],
  )

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 bg-slate-950 py-8 text-slate-100 max-[940px]:gap-0 max-[940px]:py-0.5">
      <div
        className="flex w-full items-center justify-between px-4 max-[940px]:px-3"
        style={{ maxWidth: 760 }}
      >
        <h1 className="text-xl font-bold tracking-wide text-emerald-300 max-[940px]:text-base">
          🚀 Type Invaders
        </h1>
        <div className="flex items-center gap-2">
          {(state.status === 'playing' || state.status === 'paused') && (
            <>
              <button
                type="button"
                onClick={handlePauseToggle}
                className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                {state.status === 'paused' ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={handleQuitClick}
                className="rounded-full border border-red-500/60 bg-red-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-200 transition hover:border-red-300 hover:text-red-100"
              >
                Quit
              </button>
            </>
          )}
          <SoundToggle enabled={soundEnabled} onChange={handleSoundToggle} />
        </div>
      </div>

      {state.status === 'idle' && (
        <StartScreen
          onStart={() => {
            unlockAudio()
            dispatch({ type: 'START_GAME' })
          }}
        />
      )}

      {state.status === 'lessonSelect' && (
        <LessonSelect levels={LEVELS} onSelect={(levelIndex) => dispatch({ type: 'SELECT_LEVEL', levelIndex })} />
      )}

      {state.status !== 'idle' && state.status !== 'lessonSelect' && (
        <>
          <HUD
            shieldHp={state.shieldHp}
            score={state.score}
            levelLabel={currentLevel.label}
            wpm={wpm}
            accuracy={accuracy}
            kills={state.kills}
            targetKills={currentLevel.targetKills}
            missionKind={currentLevel.kind}
            wordsCompleted={state.wordsCompleted}
            wordTarget={currentLevel.wordTarget}
          />

          <div className="relative">
            <GameArea
              aliens={state.aliens}
              lasers={state.lasers}
              explosions={state.explosions}
              plasmaBolts={state.plasmaBolts}
              shieldFeedback={state.shieldFeedback}
              shieldHp={state.shieldHp}
              mothership={state.mothership}
              shipX={state.shipX}
              targetWarning={state.targetWarning}
            />

            {state.status === 'paused' && !quitConfirmOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="pause-overlay-title"
                className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
              >
                <div className="rounded-2xl border border-slate-700 bg-slate-900/95 px-8 py-6 text-center shadow-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Paused</p>
                  <h2 id="pause-overlay-title" className="mt-3 text-2xl font-bold text-slate-50">
                    Take a breath.
                  </h2>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      ref={resumeButtonRef}
                      type="button"
                      onClick={handlePauseToggle}
                      className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                    >
                      Resume game
                    </button>
                    <button
                      type="button"
                      onClick={handleQuitClick}
                      className="rounded-full border border-red-500/70 bg-red-950/40 px-5 py-2 text-sm font-semibold text-red-200 transition hover:border-red-300 hover:text-red-100"
                    >
                      Quit lesson
                    </button>
                  </div>
                </div>
              </div>
            )}

            {quitConfirmOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="quit-confirm-title"
                aria-describedby="quit-confirm-description"
                className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm"
              >
                <div className="w-[min(90vw,22rem)] rounded-2xl border border-slate-700 bg-slate-900/95 p-6 text-center shadow-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-300">Quit lesson</p>
                  <h3 id="quit-confirm-title" className="mt-3 text-2xl font-bold text-slate-50">
                    Leave this mission?
                  </h3>
                  <p id="quit-confirm-description" className="mt-2 text-sm text-slate-300">
                    Your score and progress for this run will be cleared and you will return to the lesson menu.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      ref={quitCancelButtonRef}
                      type="button"
                      onClick={handleQuitCancel}
                      className="rounded-full border border-slate-600 bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleQuitGame}
                      className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
                    >
                      Quit mission
                    </button>
                  </div>
                </div>
              </div>
            )}

            {state.status === 'levelBriefing' && (
              <LevelBriefing
                level={currentLevel}
                onBegin={() => {
                  unlockAudio()
                  dispatch({ type: 'BEGIN_LEVEL' })
                }}
              />
            )}

            {state.status === 'gameOver' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
                <GameOverScreen
                  victory={state.victory}
                  score={state.score}
                  wpm={wpm}
                  accuracy={accuracy}
                  onRetry={() => {
                    unlockAudio()
                    dispatch({ type: 'RETRY_LEVEL' })
                  }}
                  onChooseMission={() => {
                    unlockAudio()
                    dispatch({ type: 'START_GAME' })
                  }}
                />
              </div>
            )}

            {state.status === 'levelResults' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
                <MissionCompleteScreen
                  levelLabel={currentLevel.label}
                  nextLevelLabel={LEVELS[state.levelIndex + 1]?.label}
                  isLastLevel={state.levelIndex === LEVELS.length - 1}
                  score={state.score}
                  wpm={wpm}
                  accuracy={accuracy}
                  onRetry={() => {
                    unlockAudio()
                    dispatch({ type: 'RETRY_LEVEL' })
                  }}
                  onContinue={() => {
                    unlockAudio()
                    dispatch({ type: 'CONTINUE_LEVEL' })
                  }}
                />
              </div>
            )}
          </div>

          <VisualKeyboard
            activeKeys={activeKeys}
            primaryKey={primaryKey}
            primaryTargetId={primaryTargetId}
            spaceActive={state.plasmaBolts.length > 0}
            showHints={state.status !== 'levelBriefing'}
            lastKeyPress={state.lastKeyPress}
            currentWord={currentLevel.kind === 'wordFormation' ? state.currentWord : null}
            showWordHint={currentLevel.kind === 'wordFormation'}
          />
        </>
      )}
    </div>
  )
}

export default App
