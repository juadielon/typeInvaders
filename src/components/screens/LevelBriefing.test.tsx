import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LEVELS } from '../../data/levels'
import { LevelBriefing } from './LevelBriefing'

describe('LevelBriefing', () => {
  it('explains the level finger movements and lets the learner begin', () => {
    const onBegin = vi.fn()
    render(<LevelBriefing level={LEVELS[1]} onBegin={onBegin} />)

    expect(screen.getByRole('heading', { name: /place your fingers on the home row/i })).toBeInTheDocument()
    expect(screen.getByText(/middle letter row of the keyboard/i)).toBeInTheDocument()
    expect(screen.getByText(/left middle resting on d and press it in place/i)).toBeInTheDocument()
    expect(screen.getByText(/right middle resting on k and press it in place/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /begin level 2/i }))

    expect(onBegin).toHaveBeenCalledTimes(1)
  })

  it('explains the index-finger reaches for G and H', () => {
    render(<LevelBriefing level={LEVELS[4]} onBegin={vi.fn()} />)

    expect(screen.getByText(/left index sideways from f to g/i)).toBeInTheDocument()
    expect(screen.getByText(/right index sideways from j to h/i)).toBeInTheDocument()
  })
})
