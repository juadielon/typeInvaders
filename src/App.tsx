import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { LEVELS } from './data/levels'
import { useGameLoop } from './hooks/useGameLoop'
import { useKeyboardInput } from './hooks/useKeyboardInput'
import { createInitialState, gameReducer } from './state/gameReducer'
import { GameArea } from './components/GameArea'
import { VisualKeyboard } from './components/VisualKeyboard'
import { HUD } from './components/HUD'
import { StartScreen } from './components/screens/StartScreen'
import { LevelUpBanner } from './components/screens/LevelUpBanner'
import { GameOverScreen } from './components/screens/GameOverScreen'

const LEVEL_UP_DELAY_MS = 1500

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  const currentLevel = LEVELS[state.levelIndex]

  useGameLoop(state.status, currentLevel, dispatch)

  const handleKey = useCallback((key: string) => {
    dispatch({ type: 'KEY_PRESS', key })
  }, [])
  useKeyboardInput(state.status, handleKey)

  // Auto-advance from the levelUp banner into the next level after a pause.
  useEffect(() => {
    if (state.status !== 'levelUp') return
    const timer = setTimeout(() => dispatch({ type: 'ADVANCE_LEVEL' }), LEVEL_UP_DELAY_MS)
    return () => clearTimeout(timer)
  }, [state.status])

  const elapsedMinutes = Math.max((performance.now() - state.startedAt) / 60000, 1 / 60)
  const wpm = Math.round(state.correctKeystrokes / 5 / elapsedMinutes)
  const accuracy =
    state.totalKeystrokes === 0
      ? 100
      : Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)

  const activeKeys = useMemo(
    () => Array.from(new Set(state.aliens.map((alien) => alien.char))),
    [state.aliens],
  )

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 bg-slate-950 py-8 text-slate-100">
      <h1 className="text-xl font-bold tracking-wide text-emerald-300">🚀 Type Invaders</h1>

      {state.status === 'idle' && (
        <StartScreen onStart={() => dispatch({ type: 'START_GAME' })} />
      )}

      {state.status !== 'idle' && (
        <>
          <HUD
            shieldHp={state.shieldHp}
            score={state.score}
            levelLabel={currentLevel.label}
            wpm={Math.max(wpm, 0)}
            accuracy={accuracy}
          />

          <div className="relative">
            <GameArea aliens={state.aliens} lasers={state.lasers} shipX={state.shipX} />

            {state.status === 'levelUp' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <LevelUpBanner label={LEVELS[Math.min(state.levelIndex + 1, LEVELS.length - 1)].label} />
              </div>
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

          <VisualKeyboard activeKeys={activeKeys} />
        </>
      )}
    </div>
  )
}

export default App
