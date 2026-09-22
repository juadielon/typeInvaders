import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VisualKeyboard } from './VisualKeyboard'

describe('VisualKeyboard', () => {
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

  it('highlights the spacebar only while a plasma bolt is inbound', () => {
    const { rerender } = render(<VisualKeyboard activeKeys={['f']} spaceActive={false} />)

    expect(screen.getByLabelText('Spacebar')).toBeInTheDocument()
    expect(screen.queryByLabelText('Press Space to fire at the plasma missile')).not.toBeInTheDocument()

    rerender(<VisualKeyboard activeKeys={['f']} spaceActive={true} />)

    expect(screen.getByLabelText('Press Space to fire at the plasma missile')).toBeInTheDocument()
  })
})
