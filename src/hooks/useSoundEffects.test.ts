import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createInitialState } from '../state/gameReducer'
import { useSoundEffects } from './useSoundEffects'

describe('useSoundEffects', () => {
  it('does not throw when Web Audio is unavailable or cannot be constructed', () => {
    const originalAudioContext = window.AudioContext
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: undefined })
    const first = renderHook(() => useSoundEffects(createInitialState(), true))
    expect(() => first.result.current.unlockAudio()).not.toThrow()
    first.unmount()

    class FailingAudioContext {
      constructor() {
        throw new Error('audio unavailable')
      }
    }
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: FailingAudioContext,
    })
    const second = renderHook(() => useSoundEffects(createInitialState(), true))
    expect(() => second.result.current.unlockAudio()).not.toThrow()
    second.unmount()
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: originalAudioContext,
    })
  })

  it('stops retrying AudioContext construction on every tick once it has failed', () => {
    let constructAttempts = 0
    class FailingAudioContext {
      constructor() {
        constructAttempts += 1
        throw new Error('audio unavailable')
      }
    }
    const originalAudioContext = window.AudioContext
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: FailingAudioContext,
    })
    const initial = createInitialState()
    const { rerender, unmount } = renderHook(
      ({ state }) => useSoundEffects(state, true),
      { initialProps: { state: initial } },
    )
    // Several automatic state transitions (as would happen across animation
    // frames) must only attempt construction once, not once per tick.
    rerender({ state: { ...initial, score: 1 } })
    rerender({ state: { ...initial, score: 2 } })
    rerender({ state: { ...initial, score: 3 } })
    expect(constructAttempts).toBe(1)
    unmount()
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: originalAudioContext,
    })
  })

  it('resumes a suspended context only when explicitly unlocked', () => {
    const resume = vi.fn().mockResolvedValue(undefined)
    class MockAudioContext {
      state: AudioContextState = 'suspended'
      currentTime = 0
      destination = {}
      resume = resume
      close = vi.fn().mockResolvedValue(undefined)
    }
    const originalAudioContext = window.AudioContext
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: MockAudioContext })
    const { result, rerender, unmount } = renderHook(
      ({ state }) => useSoundEffects(state, true),
      { initialProps: { state: createInitialState() } },
    )
    expect(resume).not.toHaveBeenCalled()
    rerender({ state: { ...createInitialState(), score: 1 } })
    expect(resume).not.toHaveBeenCalled()
    result.current.unlockAudio()
    expect(resume).toHaveBeenCalledTimes(1)
    unmount()
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: originalAudioContext,
    })
  })

  it('unlocks and resumes audio even when soundEnabled is currently false', () => {
    // This is the "enable from the Sound toggle" path: soundEnabled is still
    // false during the click that turns it on, so unlockAudio must not be
    // gated on the current soundEnabled value.
    const resume = vi.fn().mockResolvedValue(undefined)
    class MockAudioContext {
      state: AudioContextState = 'suspended'
      currentTime = 0
      destination = {}
      resume = resume
      close = vi.fn().mockResolvedValue(undefined)
    }
    const originalAudioContext = window.AudioContext
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: MockAudioContext })
    const { result, unmount } = renderHook(() => useSoundEffects(createInitialState(), false))
    result.current.unlockAudio()
    expect(resume).toHaveBeenCalledTimes(1)
    unmount()
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: originalAudioContext,
    })
  })

  it('plays a distinct victory tone instead of the game-over tone on the final win', () => {
    const frequencies: number[] = []
    class MockOscillator {
      type = 'sine'
      frequency = { setValueAtTime: (value: number) => frequencies.push(value) }
      connect = vi.fn()
      start = vi.fn()
      stop = vi.fn()
    }
    class MockGain {
      gain = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
      connect = vi.fn()
    }
    class MockAudioContext {
      state: AudioContextState = 'running'
      currentTime = 0
      destination = {}
      resume = vi.fn().mockResolvedValue(undefined)
      close = vi.fn().mockResolvedValue(undefined)
      createOscillator = () => new MockOscillator()
      createGain = () => new MockGain()
    }
    const originalAudioContext = window.AudioContext
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: MockAudioContext })
    const initial = createInitialState()
    const { rerender, unmount } = renderHook(
      ({ state }) => useSoundEffects(state, true),
      { initialProps: { state: initial } },
    )
    rerender({ state: { ...initial, status: 'gameOver', victory: true } })
    expect(frequencies).toContain(660)
    expect(frequencies).not.toContain(90)
    unmount()
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: originalAudioContext,
    })
  })
})
