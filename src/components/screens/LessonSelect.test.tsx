import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LEVELS } from '../../data/levels'
import { LessonSelect } from './LessonSelect'

describe('LessonSelect', () => {
  it('shows the available lessons and reports the selected lesson', () => {
    const onSelect = vi.fn()
    render(<LessonSelect levels={LEVELS} onSelect={onSelect} />)

    expect(screen.getByRole('heading', { name: /which lesson would you like to practise/i })).toBeInTheDocument()
    expect(screen.getByText(/keyboard has three letter rows/i)).toBeInTheDocument()
    expect(screen.getByText(/start with mission 1/i)).toBeInTheDocument()
    expect(screen.getByText('Level 1: F & J')).toBeInTheDocument()
    expect(screen.getByText('Level 5: + G & H')).toBeInTheDocument()
    expect(screen.getByText('Word Formation 1: Home Row Basics')).toBeInTheDocument()
    expect(screen.getAllByText('Word Formation')).toHaveLength(5)

    fireEvent.click(screen.getByRole('button', { name: /mission 3/i }))

    expect(onSelect).toHaveBeenCalledWith(2)
  })
})
