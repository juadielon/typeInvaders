import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useKeyboardInput } from './useKeyboardInput'

function pressKey(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key }))
}

describe('useKeyboardInput', () => {
  it('forwards Bottom Row punctuation keys used by later lessons', () => {
    const onKey = vi.fn()
    renderHook(() => useKeyboardInput('playing', onKey, vi.fn()))

    pressKey(',')
    pressKey('.')
    pressKey('/')
    pressKey(';')

    expect(onKey).toHaveBeenNthCalledWith(1, ',')
    expect(onKey).toHaveBeenNthCalledWith(2, '.')
    expect(onKey).toHaveBeenNthCalledWith(3, '/')
    expect(onKey).toHaveBeenNthCalledWith(4, ';')
  })

  it('forwards ordinary letter keys and the Spacebar', () => {
    const onKey = vi.fn()
    const onSpace = vi.fn()
    renderHook(() => useKeyboardInput('playing', onKey, onSpace))

    pressKey('f')
    pressKey(' ')

    expect(onKey).toHaveBeenCalledWith('f')
    expect(onSpace).toHaveBeenCalledTimes(1)
  })

  it('ignores keys while the game is not playing', () => {
    const onKey = vi.fn()
    renderHook(() => useKeyboardInput('idle', onKey, vi.fn()))

    pressKey('f')

    expect(onKey).not.toHaveBeenCalled()
  })

  it('toggles pause with the Escape key while in play', () => {
    const onPauseToggle = vi.fn()
    renderHook(() => useKeyboardInput('playing', vi.fn(), vi.fn(), onPauseToggle))

    pressKey('Escape')

    expect(onPauseToggle).toHaveBeenCalledTimes(1)
  })

  it('does not treat letter keys as pause shortcuts', () => {
    const onPauseToggle = vi.fn()
    renderHook(() => useKeyboardInput('playing', vi.fn(), vi.fn(), onPauseToggle))

    pressKey('p')

    expect(onPauseToggle).not.toHaveBeenCalled()
  })
})
