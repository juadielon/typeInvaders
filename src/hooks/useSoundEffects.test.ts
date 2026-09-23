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
})
