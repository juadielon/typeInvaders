import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GameArea } from './GameArea'

describe('GameArea alien labels', () => {
  it('renders a consistent high-contrast character badge above alien decorations', () => {
    render(
      <GameArea
        aliens={[{ id: 'giggler-1', char: 'r', variant: 'giggler', x: 100, y: 50 }]}
        lasers={[]}
        explosions={[]}
        plasmaBolts={[]}
        shieldFeedback={null}
        shieldHp={100}
        mothership={null}
        shipX={380}
        targetWarning={null}
      />,
    )

    const badge = screen.getByLabelText('Type R')
    expect(badge).toHaveTextContent('r')
    expect(badge).toHaveClass('z-30', 'bg-slate-950', 'text-white')
  })
})
