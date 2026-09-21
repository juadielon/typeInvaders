import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StartScreen } from './StartScreen'

describe('StartScreen', () => {
  it('calls onStart when the Start Game button is clicked', () => {
    const onStart = vi.fn()
    render(<StartScreen onStart={onStart} />)

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    expect(onStart).toHaveBeenCalledTimes(1)
  })
})
