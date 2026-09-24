import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
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
import { SoundToggle } from './components/SoundToggle'
import { readSoundPreference, SOUND_PREFERENCE_KEY, useSoundEffects } from './hooks/useSoundEffects'

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const [soundEnabled, setSoundEnabled] = useState(readSoundPreference)

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
  useKeyboardInput(state.status, handleKey, handleSpace)

  const elapsedMinutes = Math.max((performance.now() - state.startedAt) / 60000, 1 / 60)
  const wpm = Math.round(state.correctKeystrokes / 5 / elapsedMinutes)
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
        <SoundToggle enabled={soundEnabled} onChange={handleSoundToggle} />
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
            wpm={Math.max(wpm, 0)}
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
                  wpm={Math.max(wpm, 0)}
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
                  wpm={Math.max(wpm, 0)}
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
