import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { LEVELS } from './data/levels'

function startFirstMission() {
  fireEvent.click(screen.getByRole('button', { name: /start game/i }))
  fireEvent.click(screen.getByRole('button', { name: new RegExp(LEVELS[0].label, 'i') }))
  fireEvent.click(screen.getByRole('button', { name: /^begin/i }))
}

describe('App pause and quit flow', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('resumes the run when the quit prompt is cancelled from active play', () => {
    render(<App />)
    startFirstMission()

    fireEvent.click(screen.getByRole('button', { name: /^quit$/i }))
    expect(screen.getByText(/leave this mission\?/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(screen.queryByText(/leave this mission\?/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/take a breath\./i)).not.toBeInTheDocument()
  })

  it('stays paused when the quit prompt is cancelled from a manual pause', () => {
    render(<App />)
    startFirstMission()

    fireEvent.click(screen.getByRole('button', { name: /^pause$/i }))
    expect(screen.getByText(/take a breath\./i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /quit lesson/i }))
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(screen.getByText(/take a breath\./i)).toBeInTheDocument()
  })

  it('dismisses the quit prompt with Escape and restores the prior state', () => {
    render(<App />)
    startFirstMission()

    fireEvent.click(screen.getByRole('button', { name: /^quit$/i }))
    fireEvent.keyDown(window, { key: 'Escape' })

    // Escape cancels the prompt rather than resuming the run behind it.
    expect(screen.queryByText(/leave this mission\?/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/take a breath\./i)).not.toBeInTheDocument()
  })

  it('keeps a manual pause when Escape dismisses the quit prompt', () => {
    render(<App />)
    startFirstMission()

    fireEvent.click(screen.getByRole('button', { name: /^pause$/i }))
    fireEvent.click(screen.getByRole('button', { name: /quit lesson/i }))
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByText(/leave this mission\?/i)).not.toBeInTheDocument()
    expect(screen.getByText(/take a breath\./i)).toBeInTheDocument()
  })

  it('exposes the quit prompt as a labelled modal dialog', () => {
    render(<App />)
    startFirstMission()

    fireEvent.click(screen.getByRole('button', { name: /^quit$/i }))

    const dialog = screen.getByRole('dialog', { name: /leave this mission\?/i })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('button', { name: /^cancel$/i })).toHaveFocus()
  })

  it('exposes the pause overlay as a labelled dialog', () => {
    render(<App />)
    startFirstMission()

    fireEvent.click(screen.getByRole('button', { name: /^pause$/i }))

    // Not aria-modal: the header Resume and Quit controls stay available, so
    // claiming modality would misrepresent the overlay to assistive tech.
    const dialog = screen.getByRole('dialog', { name: /take a breath\./i })
    expect(dialog).not.toHaveAttribute('aria-modal')
    expect(screen.getByRole('button', { name: /resume game/i })).toHaveFocus()
  })

  it('disables the header run controls while the quit prompt is open', () => {
    render(<App />)
    startFirstMission()

    fireEvent.click(screen.getByRole('button', { name: /^quit$/i }))

    expect(screen.getByRole('button', { name: /^resume$/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /^quit$/i })).toBeDisabled()
  })

  it('restores the paused run when the header Resume is blocked during the prompt', () => {
    render(<App />)
    startFirstMission()

    fireEvent.click(screen.getByRole('button', { name: /^quit$/i }))
    // Clicking straight through to the background control must not strand the
    // run in a state that Cancel then fails to restore.
    fireEvent.click(screen.getByRole('button', { name: /^resume$/i }))
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(screen.queryByText(/leave this mission\?/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/take a breath\./i)).not.toBeInTheDocument()
  })

  it('returns focus to the control that opened the overlay', () => {
    render(<App />)
    startFirstMission()

    const pauseButton = screen.getByRole('button', { name: /^pause$/i })
    pauseButton.focus()
    fireEvent.click(pauseButton)
    expect(screen.getByRole('button', { name: /resume game/i })).toHaveFocus()

    fireEvent.click(screen.getByRole('button', { name: /resume game/i }))

    expect(screen.getByRole('button', { name: /^pause$/i })).toHaveFocus()
  })

  it('returns to the lesson selector when the quit is confirmed', () => {
    render(<App />)
    startFirstMission()

    fireEvent.click(screen.getByRole('button', { name: /^quit$/i }))
    fireEvent.click(screen.getByRole('button', { name: /quit mission/i }))

    expect(screen.getByRole('button', { name: new RegExp(LEVELS[0].label, 'i') })).toBeInTheDocument()
  })
})
