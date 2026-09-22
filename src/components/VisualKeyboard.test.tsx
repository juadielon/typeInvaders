import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VisualKeyboard } from './VisualKeyboard'

describe('VisualKeyboard', () => {
  it('highlights the spacebar only while a plasma bolt is inbound', () => {
    const { rerender } = render(<VisualKeyboard activeKeys={['f']} spaceActive={false} />)

    expect(screen.getByLabelText('Spacebar')).toBeInTheDocument()
    expect(screen.queryByLabelText('Press Space to block plasma')).not.toBeInTheDocument()

    rerender(<VisualKeyboard activeKeys={['f']} spaceActive={true} />)

    expect(screen.getByLabelText('Press Space to block plasma')).toBeInTheDocument()
  })
})
