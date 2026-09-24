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

  it('ignores the Escape shortcut while the quit prompt is open', () => {
    render(<App />)
    startFirstMission()

    fireEvent.click(screen.getByRole('button', { name: /^quit$/i }))
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.getByText(/leave this mission\?/i)).toBeInTheDocument()
    expect(screen.queryByText(/take a breath\./i)).not.toBeInTheDocument()
  })

  it('returns to the lesson selector when the quit is confirmed', () => {
    render(<App />)
    startFirstMission()

    fireEvent.click(screen.getByRole('button', { name: /^quit$/i }))
    fireEvent.click(screen.getByRole('button', { name: /quit mission/i }))

    expect(screen.getByRole('button', { name: new RegExp(LEVELS[0].label, 'i') })).toBeInTheDocument()
  })
})
