import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LEVELS } from '../../data/levels'
import { LevelBriefing } from './LevelBriefing'

const level = (id: number) => LEVELS.find((entry) => entry.id === id && entry.kind !== 'wordFormation')!

describe('LevelBriefing', () => {
  it('explains the level finger movements and lets the learner begin', () => {
    const onBegin = vi.fn()
    render(<LevelBriefing level={level(2)} onBegin={onBegin} />)

    expect(screen.getByRole('heading', { name: /place your fingers on the home row/i })).toBeInTheDocument()
    expect(screen.getByText(/middle letter row of the keyboard/i)).toBeInTheDocument()
    expect(screen.getByText(/left middle resting on d and press it in place/i)).toBeInTheDocument()
    expect(screen.getByText(/right middle resting on k and press it in place/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /begin level 2/i }))

    expect(onBegin).toHaveBeenCalledTimes(1)
  })

  it('explains the index-finger reaches for G and H', () => {
    render(<LevelBriefing level={level(5)} onBegin={vi.fn()} />)

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

  it('highlights the comma mission key but not the commas separating keys', () => {
    render(<LevelBriefing level={level(12)} onBegin={vi.fn()} />)

    const keyList = screen.getByLabelText(/lesson keys:.*comma/i)
    const highlightedKeys = keyList.querySelectorAll('.text-emerald-300')
    const commaKey = Array.from(keyList.querySelectorAll('.font-mono')).find(
      (key) => key.textContent === ',',
    )

    expect(highlightedKeys.length).toBe(level(12).allowedKeys.length)
    expect(commaKey).toHaveClass('text-emerald-300')
    expect(keyList.querySelector('.text-slate-500')).not.toBeInTheDocument()
  })

  it('highlights the semicolon mission key', () => {
    render(<LevelBriefing level={level(3)} onBegin={vi.fn()} />)

    const semicolonKey = Array.from(
      screen.getByLabelText(/lesson keys:.*semicolon/i).querySelectorAll('.font-mono'),
    ).find((key) => key.textContent === ';')

    expect(semicolonKey).toHaveClass('text-emerald-300')
  })

  it('uses spoken names for every punctuation key in accessible lesson labels', () => {
    render(<LevelBriefing level={level(15)} onBegin={vi.fn()} />)

    const accessibleLabel = screen.getByLabelText(/^lesson keys:/i).getAttribute('aria-label')

    expect(accessibleLabel).toContain('semicolon')
    expect(accessibleLabel).toContain('comma')
    expect(accessibleLabel).toContain('full stop')
    expect(accessibleLabel).toContain('slash')
  })

  it('explains reaching up to the Top Row and introduces its new alien', () => {
    render(<LevelBriefing level={level(6)} onBegin={vi.fn()} />)

    expect(screen.getByText(/reach your left index up from f to r/i)).toBeInTheDocument()
    expect(screen.getByText(/reach your right index up from j to u/i)).toBeInTheDocument()
    expect(screen.getByText(/new this level/i)).toBeInTheDocument()
    expect(screen.getByText('The Giggler')).toBeInTheDocument()
  })

  it('explains reaching down to the Bottom Row', () => {
    render(<LevelBriefing level={level(11)} onBegin={vi.fn()} />)

    expect(screen.getByText(/reach your left index down from f to v/i)).toBeInTheDocument()
    expect(screen.getByText(/reach your right index down from j to m/i)).toBeInTheDocument()
  })

  it('explains a Word Formation mission and its word bank', () => {
    render(<LevelBriefing level={LEVELS[3]} onBegin={vi.fn()} />)

    expect(screen.getByText(/build 6 words from descending alien formations/i)).toBeInTheDocument()
    expect(screen.getByText(/a\s+faff\s+ad\s+add/)).toBeInTheDocument()
    expect(screen.getByText(/example english words include/i)).toBeInTheDocument()
    expect(screen.queryByText(/punctuation/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/your first alien species is/i)).not.toBeInTheDocument()
  })

  it('avoids duplicate plural examples while keeping them valid in the game pool', () => {
    render(<LevelBriefing level={LEVELS[7]} onBegin={vi.fn()} />)

    expect(screen.getByText(/glassful/i)).toBeInTheDocument()
    expect(screen.queryByText(/glassfuls/i)).not.toBeInTheDocument()
    expect(LEVELS[7].wordPool).toContain('glassfuls')
  })

  it('avoids near-duplicate word families in examples', () => {
    render(<LevelBriefing level={LEVELS[11]} onBegin={vi.fn()} />)

    const briefing = screen.getByText(/example english words include/i).parentElement
    expect(briefing).toHaveTextContent('disqualifies')
    expect(briefing).not.toHaveTextContent('disqualified')
    expect(LEVELS[11].wordPool).toContain('disqualified')
  })

  it('varies example lengths instead of showing one length range', () => {
    render(<LevelBriefing level={LEVELS[7]} onBegin={vi.fn()} />)

    const briefing = screen.getByText(/example english words include/i).parentElement
    const exampleText = briefing?.textContent ?? ''
    expect(exampleText).toMatch(/\b[a-z]{1,3}\b/)
    expect(exampleText).toMatch(/\b[a-z]{8,}\b/)
  })
})
