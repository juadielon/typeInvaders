import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LEVELS } from '../../data/levels'
import { LevelBriefing } from './LevelBriefing'

describe('LevelBriefing', () => {
  it('explains the level finger movements and lets the learner begin', () => {
    const onBegin = vi.fn()
    render(<LevelBriefing level={LEVELS[1]} onBegin={onBegin} />)

    expect(screen.getByRole('heading', { name: /place your fingers on the home row/i })).toBeInTheDocument()
    expect(screen.getByText(/move your left middle from its home key to d/i)).toBeInTheDocument()
    expect(screen.getByText(/move your right middle from its home key to k/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /begin level 2/i }))

    expect(onBegin).toHaveBeenCalledTimes(1)
  })
})
