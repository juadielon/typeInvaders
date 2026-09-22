import { useCallback, useMemo, useReducer } from 'react'
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
import { getKeyboardHighlights } from './utils/alienTargets'

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  const currentLevel = LEVELS[state.levelIndex]

  useGameLoop(state.status, currentLevel, state.levelStartedAt, dispatch)

  const handleKey = useCallback((key: string) => {
    dispatch({ type: 'KEY_PRESS', key })
  }, [])
  const handleSpace = useCallback(() => {
    dispatch({ type: 'SPACE_PRESS' })
  }, [])
  useKeyboardInput(state.status, handleKey, handleSpace)

  const elapsedMinutes = Math.max((performance.now() - state.startedAt) / 60000, 1 / 60)
  const wpm = Math.round(state.correctKeystrokes / 5 / elapsedMinutes)
  const accuracy =
    state.totalKeystrokes === 0
      ? 100
      : Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)

  const { activeKeys, primaryKey } = useMemo(
    () => getKeyboardHighlights(state.status, currentLevel.allowedKeys, state.aliens),
    [currentLevel.allowedKeys, state.aliens, state.status],
  )

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 bg-slate-950 py-8 text-slate-100">
      <h1 className="text-xl font-bold tracking-wide text-emerald-300">🚀 Type Invaders</h1>

      {state.status === 'idle' && (
        <StartScreen onStart={() => dispatch({ type: 'START_GAME' })} />
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
                onBegin={() => dispatch({ type: 'BEGIN_LEVEL' })}
              />
            )}

            {state.status === 'gameOver' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
                <GameOverScreen
                  victory={state.victory}
                  score={state.score}
                  wpm={Math.max(wpm, 0)}
                  accuracy={accuracy}
                  onRestart={() => dispatch({ type: 'RESET' })}
                />
              </div>
            )}
          </div>

          <VisualKeyboard
            activeKeys={activeKeys}
            primaryKey={primaryKey}
            spaceActive={state.plasmaBolts.length > 0}
            showHints={state.status !== 'levelBriefing'}
          />
        </>
      )}
    </div>
  )
}

export default App
