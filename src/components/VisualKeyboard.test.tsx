import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VisualKeyboard } from './VisualKeyboard'

describe('VisualKeyboard', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('can hide redundant finger guidance during a mission briefing', () => {
    render(<VisualKeyboard activeKeys={['f', 'j']} showHints={false} />)

    expect(screen.queryByText(/f → left index/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Spacebar')).toBeInTheDocument()
  })

  it('shows finger guidance below the Spacebar', () => {
    render(<VisualKeyboard activeKeys={['f', 'j']} />)

    const spacebar = screen.getByLabelText('Spacebar')
    const guidance = screen.getByText(/f → left index.*j → right index/i)

    expect(
      spacebar.compareDocumentPosition(guidance) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('highlights every lesson key equally when no next key is active yet', () => {
    render(<VisualKeyboard activeKeys={['f', 'j']} />)

    expect(screen.getByText('f')).toHaveClass('bg-amber-200')
    expect(screen.getByText('j')).toHaveClass('bg-amber-200')
    expect(screen.getByText('f')).not.toHaveClass('bg-amber-400')
    expect(screen.getByText('j')).not.toHaveClass('bg-amber-400')
  })

  it('uses the strong highlight for the closest alien and lighter highlights for the others', () => {
    render(<VisualKeyboard activeKeys={['j', 'f', 'd']} primaryKey="j" />)

    expect(screen.getByText('j')).toHaveClass('bg-amber-400')
    expect(screen.getByText('f')).toHaveClass('bg-amber-200')
    expect(screen.getByText('d')).toHaveClass('bg-amber-200')
  })

  it('briefly clears the hint when consecutive targets use the same key', () => {
    vi.useFakeTimers()
    const { rerender } = render(
      <VisualKeyboard activeKeys={['f']} primaryKey="f" primaryTargetId="alien-1" />,
    )

    expect(screen.getByText('f')).toHaveClass('bg-amber-400')

    rerender(
      <VisualKeyboard activeKeys={['f']} primaryKey="f" primaryTargetId="alien-2" />,
    )

    expect(screen.getByText('f')).not.toHaveClass('bg-amber-400')
    expect(screen.getByText('f')).not.toHaveClass('bg-amber-200')

    act(() => {
      vi.advanceTimersByTime(140)
    })

    expect(screen.getByText('f')).toHaveClass('bg-amber-400')
  })

  it('highlights a different next key without clearing it first', () => {
    const { rerender } = render(
      <VisualKeyboard activeKeys={['f', 'j']} primaryKey="f" primaryTargetId="alien-1" />,
    )

    rerender(
      <VisualKeyboard activeKeys={['f', 'j']} primaryKey="j" primaryTargetId="alien-2" />,
    )

    expect(screen.getByText('j')).toHaveClass('bg-amber-400')
  })

  it('highlights the spacebar only while a plasma bolt is inbound', () => {
    const { rerender } = render(<VisualKeyboard activeKeys={['f']} spaceActive={false} />)

    expect(screen.getByLabelText('Spacebar')).toBeInTheDocument()
    expect(screen.queryByLabelText('Press Space to fire at the plasma missile')).not.toBeInTheDocument()

    rerender(<VisualKeyboard activeKeys={['f']} spaceActive={true} />)

    expect(screen.getByLabelText('Press Space to fire at the plasma missile')).toBeInTheDocument()
  })

  it('briefly flashes a hit key green and then reverts to its usual highlight', () => {
    vi.useFakeTimers()
    const { rerender } = render(
      <VisualKeyboard
        activeKeys={['f']}
        primaryKey="f"
        lastKeyPress={{ id: 'key-1', key: 'f', correct: true }}
      />,
    )

    expect(screen.getByText('f')).toHaveClass('bg-emerald-400')
    expect(screen.getByText('f')).not.toHaveClass('bg-amber-400')

    act(() => {
      vi.advanceTimersByTime(150)
    })
    rerender(
      <VisualKeyboard
        activeKeys={['f']}
        primaryKey="f"
        lastKeyPress={{ id: 'key-1', key: 'f', correct: true }}
      />,
    )

    expect(screen.getByText('f')).toHaveClass('bg-amber-400')
    expect(screen.getByText('f')).not.toHaveClass('bg-emerald-400')
  })

  it('briefly flashes a misfired key red even when it has no other highlight', () => {
    vi.useFakeTimers()
    render(
      <VisualKeyboard
        activeKeys={['f']}
        lastKeyPress={{ id: 'key-1', key: 'q', correct: false }}
      />,
    )

    expect(screen.getByText('q')).toHaveClass('bg-rose-500')
  })

  it('flashes a repeated key press again when a new id arrives for the same key', () => {
    vi.useFakeTimers()
    const { rerender } = render(
      <VisualKeyboard activeKeys={['f']} lastKeyPress={{ id: 'key-1', key: 'f', correct: true }} />,
    )
    act(() => {
      vi.advanceTimersByTime(150)
    })
    rerender(
      <VisualKeyboard activeKeys={['f']} lastKeyPress={{ id: 'key-1', key: 'f', correct: true }} />,
    )
    expect(screen.getByText('f')).not.toHaveClass('bg-emerald-400')

    rerender(
      <VisualKeyboard activeKeys={['f']} lastKeyPress={{ id: 'key-2', key: 'f', correct: true }} />,
    )
    expect(screen.getByText('f')).toHaveClass('bg-emerald-400')
  })

  it('clears an in-progress flash immediately when lastKeyPress resets to null (e.g. on retry)', () => {
    vi.useFakeTimers()
    const { rerender } = render(
      <VisualKeyboard activeKeys={['f']} lastKeyPress={{ id: 'key-1', key: 'f', correct: true }} />,
    )

    expect(screen.getByText('f')).toHaveClass('bg-emerald-400')

    // Simulate a level retry/continue resetting lastKeyPress before the
    // flash's own timeout has fired.
    rerender(<VisualKeyboard activeKeys={['f']} lastKeyPress={null} />)

    expect(screen.getByText('f')).not.toHaveClass('bg-emerald-400')

    // The stale timeout must also be cancelled, so it can't reapply the
    // flash after the fact once the new level is under way.
    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(screen.getByText('f')).not.toHaveClass('bg-emerald-400')
  })
})
