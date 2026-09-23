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

  describe('audioEvent playback branches', () => {
    function mockRunningAudioContext(frequencies: number[]) {
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
      return class MockAudioContext {
        state: AudioContextState = 'running'
        currentTime = 0
        sampleRate = 44100
        destination = {}
        resume = vi.fn().mockResolvedValue(undefined)
        close = vi.fn().mockResolvedValue(undefined)
        createOscillator = () => new MockOscillator()
        createGain = () => new MockGain()
        createBuffer = (channels: number, length: number, sampleRate: number) => ({
          getChannelData: () => new Float32Array(length),
          sampleRate,
          numberOfChannels: channels,
        })
        createBufferSource = () => ({
          buffer: null,
          connect: vi.fn(),
          start: vi.fn(),
        })
      }
    }

    it('plays the alien-voice explosion when a new alienHit audioEvent arrives', () => {
      const frequencies: number[] = []
      const originalAudioContext = window.AudioContext
      Object.defineProperty(window, 'AudioContext', {
        configurable: true,
        value: mockRunningAudioContext(frequencies),
      })
      const initial = createInitialState()
      const { rerender, unmount } = renderHook(
        ({ state }) => useSoundEffects(state, true),
        { initialProps: { state: initial } },
      )
      rerender({
        state: {
          ...initial,
          audioEvent: { id: 'audio-1', type: 'alienHit', variant: 'giggler' },
        },
      })
      // The giggler alien-voice profile plays 260 as its first note.
      expect(frequencies).toContain(260)
      unmount()
      Object.defineProperty(window, 'AudioContext', {
        configurable: true,
        value: originalAudioContext,
      })
    })

    it('plays the mothership explosion when a new mothershipHit audioEvent arrives', () => {
      const frequencies: number[] = []
      const originalAudioContext = window.AudioContext
      Object.defineProperty(window, 'AudioContext', {
        configurable: true,
        value: mockRunningAudioContext(frequencies),
      })
      const initial = createInitialState()
      const { rerender, unmount } = renderHook(
        ({ state }) => useSoundEffects(state, true),
        { initialProps: { state: initial } },
      )
      rerender({
        state: { ...initial, audioEvent: { id: 'audio-1', type: 'mothershipHit' } },
      })
      // The mothership explosion's descending sweep starts at 180.
      expect(frequencies).toContain(180)
      unmount()
      Object.defineProperty(window, 'AudioContext', {
        configurable: true,
        value: originalAudioContext,
      })
    })

    it('plays the ship explosion when a new plasmaMissileImpact audioEvent arrives', () => {
      const frequencies: number[] = []
      const originalAudioContext = window.AudioContext
      Object.defineProperty(window, 'AudioContext', {
        configurable: true,
        value: mockRunningAudioContext(frequencies),
      })
      const initial = createInitialState()
      const { rerender, unmount } = renderHook(
        ({ state }) => useSoundEffects(state, true),
        { initialProps: { state: initial } },
      )
      rerender({
        state: { ...initial, audioEvent: { id: 'audio-1', type: 'plasmaMissileImpact' } },
      })
      // The ship explosion's descending sweep starts at 260.
      expect(frequencies).toContain(260)
      unmount()
      Object.defineProperty(window, 'AudioContext', {
        configurable: true,
        value: originalAudioContext,
      })
    })
  })

  it('skips an automatic sound (rather than recreating the context) once the context has closed', () => {
    const oscillatorStarts: number[] = []
    const instances: Array<{ state: AudioContextState }> = []
    class MockAudioContext {
      state: AudioContextState = 'running'
      currentTime = 0
      destination = {}
      resume = vi.fn().mockResolvedValue(undefined)
      close = vi.fn().mockResolvedValue(undefined)
      createOscillator = () => ({
        type: 'sine',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: () => oscillatorStarts.push(1),
        stop: vi.fn(),
      })
      createGain = () => ({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      })
      constructor() {
        instances.push(this)
      }
    }
    const originalAudioContext = window.AudioContext
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: MockAudioContext })
    const initial = createInitialState()
    const { result, rerender, unmount } = renderHook(
      ({ state }) => useSoundEffects(state, true),
      { initialProps: { state: initial } },
    )
    // A user gesture constructs the single context the hook will reuse.
    result.current.unlockAudio()
    expect(instances).toHaveLength(1)

    // Simulate the browser closing the context outside any user gesture
    // (e.g. after the tab is backgrounded for a long time).
    instances[0].state = 'closed'

    // An automatic tick carrying a new sound event must not recreate the
    // closed context - it should just skip the sound.
    rerender({
      state: { ...initial, audioEvent: { id: 'audio-1', type: 'mothershipHit' } },
    })
    expect(instances).toHaveLength(1)
    expect(oscillatorStarts).toHaveLength(0)

    // A real user gesture is still allowed to recreate it.
    result.current.unlockAudio()
    expect(instances).toHaveLength(2)

    unmount()
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: originalAudioContext,
    })
  })
})
