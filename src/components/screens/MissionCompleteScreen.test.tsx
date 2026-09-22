import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MissionCompleteScreen } from './MissionCompleteScreen'

describe('MissionCompleteScreen', () => {
  it('offers retry before continuing to the next mission', () => {
    const onRetry = vi.fn()
    const onContinue = vi.fn()

    render(
      <MissionCompleteScreen
        levelNumber={3}
        isLastLevel={false}
        score={420}
        wpm={18}
        accuracy={96}
        onRetry={onRetry}
        onContinue={onContinue}
      />,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveTextContent('Retry Mission')
    expect(buttons[1]).toHaveTextContent('Continue to Mission 4')

    fireEvent.click(buttons[0])
    fireEvent.click(buttons[1])

    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('finishes the curriculum after the final mission', () => {
    render(
      <MissionCompleteScreen
        levelNumber={15}
        isLastLevel
        score={1500}
        wpm={25}
        accuracy={98}
        onRetry={vi.fn()}
        onContinue={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Finish Curriculum' })).toBeInTheDocument()
  })
})
