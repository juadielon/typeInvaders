import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GameOverScreen } from './GameOverScreen'

describe('GameOverScreen', () => {
  it('offers the failed mission again before lesson selection', () => {
    const onRetry = vi.fn()
    const onChooseMission = vi.fn()

    render(
      <GameOverScreen
        victory={false}
        score={120}
        wpm={14}
        accuracy={88}
        onRetry={onRetry}
        onChooseMission={onChooseMission}
      />,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveTextContent('Retry Mission')
    expect(buttons[1]).toHaveTextContent('Choose Another Mission')

    fireEvent.click(buttons[0])
    fireEvent.click(buttons[1])

    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onChooseMission).toHaveBeenCalledTimes(1)
  })
})
