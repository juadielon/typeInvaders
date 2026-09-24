import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MissionCompleteScreen } from './MissionCompleteScreen'

describe('MissionCompleteScreen', () => {
  it('offers retry before continuing to the next mission', () => {
    const onRetry = vi.fn()
    const onContinue = vi.fn()

    render(
      <MissionCompleteScreen
        levelLabel="Word Formation 1: Home Row Basics"
        nextLevelLabel="Level 4: + S & L"
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
    expect(buttons[1]).toHaveTextContent('Continue to Level 4: + S & L')
    expect(
      screen.getByRole('heading', { name: 'Word Formation 1: Home Row Basics Complete!' }),
    ).toBeInTheDocument()

    fireEvent.click(buttons[0])
    fireEvent.click(buttons[1])

    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('finishes the curriculum after the final mission', () => {
    render(
      <MissionCompleteScreen
        levelLabel="Level 15: + B & N"
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
