import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HUD } from './HUD'

describe('HUD', () => {
  it('shows how far through the lesson the player is', () => {
    render(
      <HUD
        shieldHp={80}
        score={120}
        levelLabel="Level 1: F & J"
        wpm={12}
        accuracy={95}
        kills={10}
        targetKills={42}
      />,
    )

    const progress = screen.getByRole('progressbar', { name: /lesson progress/i })
    expect(progress).toHaveAttribute('aria-valuenow', '10')
    expect(progress).toHaveAttribute('aria-valuemax', '42')
    expect(screen.getByText(/32 to finish/i)).toBeInTheDocument()
  })

  it('reports a completed lesson without over-counting kills', () => {
    render(
      <HUD
        shieldHp={60}
        score={400}
        levelLabel="Level 1: F & J"
        wpm={18}
        accuracy={92}
        kills={45}
        targetKills={42}
      />,
    )

    const progress = screen.getByRole('progressbar', { name: /lesson progress/i })
    expect(progress).toHaveAttribute('aria-valuenow', '42')
    expect(screen.getByText(/lesson complete/i)).toBeInTheDocument()
  })

  it('shows Word Formation progress and the active word', () => {
    render(
      <HUD
        shieldHp={90}
        score={80}
        levelLabel="Word Formation 1"
        wpm={10}
        accuracy={96}
        kills={0}
        targetKills={6}
        missionKind="wordFormation"
        wordsCompleted={2}
        wordTarget={6}
      />,
    )

    expect(screen.getByText('Word Formation')).toBeInTheDocument()
    expect(screen.getByText((_, element) => element?.textContent === '2 / 6 words')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
  })
})
