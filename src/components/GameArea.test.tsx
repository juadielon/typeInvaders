import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GameArea } from './GameArea'

describe('GameArea alien labels', () => {
  it('adds contrast only to the Level 6 Giggler character', () => {
    render(
      <GameArea
        aliens={[
          { id: 'giggler-1', char: 'r', variant: 'giggler', x: 100, y: 50 },
          { id: 'scout-1', char: 'f', variant: 'scout', x: 200, y: 50 },
          { id: 'moustachio-1', char: 'w', variant: 'moustachio', x: 300, y: 50 },
        ]}
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

    expect(screen.getByText('r')).toHaveClass('z-30', 'text-white')
    expect(screen.getByText('r')).not.toHaveClass('bg-slate-950/95')
    expect(screen.getByText('f')).not.toHaveClass('z-30')
    expect(document.querySelector('.type-invader-giggler-smile')).toHaveClass('top-3', 'h-1.5', 'w-3')
    expect(document.querySelector('.type-invader-moustache')).toHaveClass('top-3.5')
    expect(screen.getByText('w')).toHaveClass('bottom-0')
    expect(screen.getByText('w').parentElement).toHaveClass('top-0', 'bottom-1')
  })
})
