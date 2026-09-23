import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StartScreen } from './StartScreen'

describe('StartScreen', () => {
  it('calls onStart when the Start Game button is clicked', () => {
    const onStart = vi.fn()
    render(<StartScreen onStart={onStart} />)

    expect(screen.getByText(/middle letter row of your keyboard/i)).toBeInTheDocument()
    expect(screen.getByText(/each alien shows a key/i)).toBeInTheDocument()
    expect(screen.getByText(/strongest amber key is the next key to press/i)).toBeInTheDocument()
    expect(screen.queryByText(/each alien shows a letter/i)).not.toBeInTheDocument()
    expect(screen.getByText(/spaceship's protection meter/i)).toBeInTheDocument()
    expect(screen.getByText(/starts at 100%/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /start game/i }))

    expect(onStart).toHaveBeenCalledTimes(1)
  })
})
