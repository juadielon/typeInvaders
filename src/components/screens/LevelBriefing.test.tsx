import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LEVELS } from '../../data/levels'
import { LevelBriefing } from './LevelBriefing'

describe('LevelBriefing', () => {
  it('explains the level finger movements and lets the learner begin', () => {
    const onBegin = vi.fn()
    render(<LevelBriefing level={LEVELS[1]} onBegin={onBegin} />)

    expect(screen.getByRole('heading', { name: /place your fingers on the home row/i })).toBeInTheDocument()
    expect(screen.getByText(/middle letter row of the keyboard/i)).toBeInTheDocument()
    expect(screen.getByText(/left middle resting on d and press it in place/i)).toBeInTheDocument()
    expect(screen.getByText(/right middle resting on k and press it in place/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /begin level 2/i }))

    expect(onBegin).toHaveBeenCalledTimes(1)
  })

  it('explains the index-finger reaches for G and H', () => {
    render(<LevelBriefing level={LEVELS[4]} onBegin={vi.fn()} />)

    expect(screen.getByText(/left index sideways from f to g/i)).toBeInTheDocument()
    expect(screen.getByText(/right index sideways from j to h/i)).toBeInTheDocument()
  })

  it('describes the first mission without referring to earlier aliens', () => {
    render(<LevelBriefing level={LEVELS[0]} onBegin={vi.fn()} />)

    expect(screen.getByText(/goal is to destroy 42 aliens/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Lesson keys: F, J')).toBeInTheDocument()
    expect(screen.getByText(/your first alien species is the/i)).toBeInTheDocument()
    expect(screen.queryByText(/species from earlier missions/i)).not.toBeInTheDocument()
  })

  it('distinguishes lesson keys from the commas separating them', () => {
    render(<LevelBriefing level={LEVELS[11]} onBegin={vi.fn()} />)

    const keyList = screen.getByLabelText(/lesson keys:/i)
    const separators = keyList.querySelectorAll('.text-slate-500')
    const keys = keyList.querySelectorAll('.text-emerald-300')

    expect(separators.length).toBe(LEVELS[11].allowedKeys.length - 1)
    expect(keys.length).toBe(LEVELS[11].allowedKeys.length)
    expect(Array.from(keys).some((key) => key.textContent === ',')).toBe(true)
  })

  it('explains reaching up to the Top Row and introduces its new alien', () => {
    render(<LevelBriefing level={LEVELS[5]} onBegin={vi.fn()} />)

    expect(screen.getByText(/reach your left index up from f to r/i)).toBeInTheDocument()
    expect(screen.getByText(/reach your right index up from j to u/i)).toBeInTheDocument()
    expect(screen.getByText(/new this level/i)).toBeInTheDocument()
    expect(screen.getByText('The Giggler')).toBeInTheDocument()
  })

  it('explains reaching down to the Bottom Row', () => {
    render(<LevelBriefing level={LEVELS[10]} onBegin={vi.fn()} />)

    expect(screen.getByText(/reach your left index down from f to v/i)).toBeInTheDocument()
    expect(screen.getByText(/reach your right index down from j to m/i)).toBeInTheDocument()
  })
})
