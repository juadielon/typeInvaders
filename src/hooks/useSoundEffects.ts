import { useCallback, useEffect, useRef } from 'react'
import type { AlienVariant, GameState } from '../types/game'

export const SOUND_PREFERENCE_KEY = 'type-invaders-sound-enabled'

type SoundName = 'damage' | 'warning' | 'complete' | 'gameOver' | 'victory'

interface AudioContextWindow extends Window {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const audioWindow = window as AudioContextWindow
  const AudioContextConstructor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext
  if (!AudioContextConstructor) return null
  try {
    return new AudioContextConstructor()
  } catch {
    return null
  }
}

function getActiveAudioContext(contextRef: { current: AudioContext | null }): AudioContext | null {
  if (contextRef.current?.state === 'closed') {
    contextRef.current = null
  }
  contextRef.current ??= getAudioContext()
  return contextRef.current
}

const SOUND_NOTES: Record<SoundName, { frequency: number; duration: number; type: OscillatorType }> = {
  damage: { frequency: 130, duration: 0.16, type: 'sawtooth' },
  warning: { frequency: 260, duration: 0.12, type: 'triangle' },
  complete: { frequency: 780, duration: 0.24, type: 'sine' },
  gameOver: { frequency: 90, duration: 0.3, type: 'sawtooth' },
  victory: { frequency: 660, duration: 0.3, type: 'triangle' },
}

function playTone(context: AudioContext, sound: SoundName): void {
  const note = SOUND_NOTES[sound]
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const now = context.currentTime

  oscillator.type = note.type
  oscillator.frequency.setValueAtTime(note.frequency, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + note.duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + note.duration)
}

function playAlarm(context: AudioContext): void {
  const now = context.currentTime
  for (const [offset, frequency] of [
    [0, 920],
    [0.12, 620],
    [0.24, 920],
  ] as const) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(frequency, now + offset)
    gain.gain.setValueAtTime(0.0001, now + offset)
    gain.gain.exponentialRampToValueAtTime(0.08, now + offset + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.1)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now + offset)
    oscillator.stop(now + offset + 0.1)
  }
}

function playAlienVoice(context: AudioContext, variant: AlienVariant): void {
  const now = context.currentTime
  const profile =
    variant === 'giggler'
      ? { notes: [260, 880, 360, 1040, 220], duration: 0.42, type: 'sawtooth' as OscillatorType }
      : variant === 'toaster'
        ? { notes: [90, 140, 90], duration: 0.3, type: 'square' as OscillatorType }
        : variant === 'disco' || variant === 'partyKing'
          ? { notes: [520, 780, 1040, 780], duration: 0.28, type: 'triangle' as OscillatorType }
          : variant === 'crabster' || variant === 'cyclops'
            ? { notes: [150, 110, 75], duration: 0.3, type: 'sawtooth' as OscillatorType }
            : variant === 'noodle' || variant === 'jellybean'
              ? { notes: [340, 520, 700], duration: 0.24, type: 'sine' as OscillatorType }
              : { notes: [240, 480], duration: 0.16, type: 'square' as OscillatorType }
  const noteDuration = profile.duration / profile.notes.length

  profile.notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const start = now + index * noteDuration
    const end = start + noteDuration * 0.92
    oscillator.type = profile.type
    oscillator.frequency.setValueAtTime(frequency, start)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(start)
    oscillator.stop(end)
  })
}

function playExplosion(context: AudioContext, variant: AlienVariant): void {
  playAlienVoice(context, variant)
  const now = context.currentTime
  const oscillator = context.createOscillator()
  const oscillatorGain = context.createGain()
  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(180, now)
  oscillator.frequency.exponentialRampToValueAtTime(42, now + 0.28)
  oscillatorGain.gain.setValueAtTime(0.0001, now)
  oscillatorGain.gain.exponentialRampToValueAtTime(0.2, now + 0.015)
  oscillatorGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
  oscillator.connect(oscillatorGain)
  oscillatorGain.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.3)

  const buffer = context.createBuffer(1, context.sampleRate * 0.24, context.sampleRate)
  const noise = buffer.getChannelData(0)
  for (let index = 0; index < noise.length; index += 1) {
    noise[index] = (Math.random() * 2 - 1) * (1 - index / noise.length)
  }
  const source = context.createBufferSource()
  const noiseGain = context.createGain()
  source.buffer = buffer
  noiseGain.gain.setValueAtTime(0.18, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)
  source.connect(noiseGain)
  noiseGain.connect(context.destination)
  source.start(now)
}

function playShipExplosion(context: AudioContext): void {
  const now = context.currentTime
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(260, now)
  oscillator.frequency.exponentialRampToValueAtTime(28, now + 0.65)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.28, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.65)

  const buffer = context.createBuffer(1, context.sampleRate * 0.55, context.sampleRate)
  const noise = buffer.getChannelData(0)
  for (let index = 0; index < noise.length; index += 1) {
    noise[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / noise.length, 2)
  }
  const source = context.createBufferSource()
  const noiseGain = context.createGain()
  source.buffer = buffer
  noiseGain.gain.setValueAtTime(0.3, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55)
  source.connect(noiseGain)
  noiseGain.connect(context.destination)
  source.start(now)
}

function playMothershipExplosion(context: AudioContext): void {
  const now = context.currentTime
  for (const [offset, frequency] of [
    [0, 180],
    [0.08, 260],
    [0.16, 420],
  ] as const) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(frequency, now + offset)
    gain.gain.setValueAtTime(0.0001, now + offset)
    gain.gain.exponentialRampToValueAtTime(0.16, now + offset + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.16)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now + offset)
    oscillator.stop(now + offset + 0.16)
  }
  playShipExplosion(context)
}

export function useSoundEffects(
  state: GameState,
  soundEnabled: boolean,
): { unlockAudio: () => void } {
  const contextRef = useRef<AudioContext | null>(null)
  const previousState = useRef<GameState | null>(null)

  // Callers only invoke this from explicit user interactions (Start, Space,
  // letter keys, or enabling the Sound toggle), so it must not be gated on
  // the current `soundEnabled` value - that value can still be stale/false
  // at the exact moment the user is turning sound on.
  const unlockAudio = useCallback(() => {
    const context = getActiveAudioContext(contextRef)
    if (!context) return
    contextRef.current = context
    if (context.state === 'suspended') {
      void context.resume().catch(() => undefined)
    }
  }, [])

  useEffect(() => {
    const previous = previousState.current
    previousState.current = state
    if (!soundEnabled || !previous) return

    const context = getActiveAudioContext(contextRef)
    if (!context) return
    contextRef.current = context

    try {
      const newAudioEvent =
        state.audioEvent && state.audioEvent.id !== previous.audioEvent?.id
          ? state.audioEvent
          : null
      if (newAudioEvent) {
        if (newAudioEvent.type === 'alienHit') playExplosion(context, newAudioEvent.variant)
        if (newAudioEvent.type === 'mothershipHit') playMothershipExplosion(context)
        if (newAudioEvent.type === 'plasmaMissileImpact') playShipExplosion(context)
      }
      if (state.alarmEvent && state.alarmEvent.id !== previous.alarmEvent?.id) playAlarm(context)
      if (
        state.shieldHp < previous.shieldHp &&
        newAudioEvent?.type !== 'plasmaMissileImpact'
      ) {
        playTone(context, 'damage')
      }
      if (state.status === 'levelResults' && previous.status !== 'levelResults') {
        playTone(context, 'complete')
      }
      if (state.status === 'gameOver' && previous.status !== 'gameOver') {
        playTone(context, state.victory ? 'victory' : 'gameOver')
      }
    } catch {
      // Audio failures must never interrupt gameplay.
    }
  }, [soundEnabled, state])

  useEffect(() => {
    return () => {
      void contextRef.current?.close()
    }
  }, [])

  return { unlockAudio }
}

export function readSoundPreference(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(SOUND_PREFERENCE_KEY) !== 'false'
  } catch {
    return true
  }
}
