import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SoundToggle } from './SoundToggle'

describe('SoundToggle', () => {
  it('describes and toggles the enabled state', () => {
    const onChange = vi.fn()
    render(<SoundToggle enabled onChange={onChange} />)

    const button = screen.getByRole('button', { name: 'Mute sound effects' })
    expect(button).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(button)

    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('offers to unmute when sound is disabled', () => {
    render(<SoundToggle enabled={false} onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Unmute sound effects' })).toHaveTextContent(
      'Sound off',
    )
  })

  it('keeps the control keyboard accessible', () => {
    render(<SoundToggle enabled onChange={vi.fn()} />)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})
