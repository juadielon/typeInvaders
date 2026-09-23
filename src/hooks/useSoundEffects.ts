import { useCallback, useEffect, useRef } from 'react'
import type { AlienVariant, GameState } from '../types/game'

export const SOUND_PREFERENCE_KEY = 'type-invaders-sound-enabled'

type SoundName = 'damage' | 'warning' | 'complete' | 'gameOver'

interface AudioContextWindow extends Window {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const audioWindow = window as AudioContextWindow
  const AudioContextConstructor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext
  return AudioContextConstructor ? new AudioContextConstructor() : null
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
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const profile =
    variant === 'giggler'
      ? { start: 280, peak: 980, end: 220, duration: 0.28, type: 'sawtooth' as OscillatorType }
      : variant === 'toaster'
        ? { start: 90, peak: 180, end: 70, duration: 0.2, type: 'square' as OscillatorType }
        : variant === 'disco' || variant === 'partyKing'
          ? { start: 460, peak: 880, end: 520, duration: 0.16, type: 'triangle' as OscillatorType }
          : { start: 220, peak: 520, end: 160, duration: 0.12, type: 'square' as OscillatorType }

  oscillator.type = profile.type
  oscillator.frequency.setValueAtTime(profile.start, now)
  oscillator.frequency.exponentialRampToValueAtTime(profile.peak, now + profile.duration * 0.45)
  oscillator.frequency.exponentialRampToValueAtTime(profile.end, now + profile.duration)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.07, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + profile.duration)
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

  const unlockAudio = useCallback(() => {
    if (!soundEnabled) return
    const context = getActiveAudioContext(contextRef)
    if (!context) return
    contextRef.current = context
    void context.resume().catch(() => undefined)
  }, [soundEnabled])

  useEffect(() => {
    const previous = previousState.current
    previousState.current = state
    if (!soundEnabled || !previous) return

    const context = getActiveAudioContext(contextRef)
    if (!context) return
    contextRef.current = context
    void context.resume().catch(() => undefined)

    try {
      if (state.score > previous.score) {
        const mothershipDestroyed =
          previous.mothership !== null &&
          state.mothership === null &&
          state.score - previous.score >= 50
        const destroyedAlien = previous.aliens.find(
          (alien) => !state.aliens.some((remaining) => remaining.id === alien.id),
        )
        if (mothershipDestroyed) playMothershipExplosion(context)
        else if (destroyedAlien) playExplosion(context, destroyedAlien.variant)
      }
      if (state.plasmaBolts.length > previous.plasmaBolts.length) playAlarm(context)
      if (
        state.plasmaBolts.length < previous.plasmaBolts.length &&
        state.shieldHp < previous.shieldHp
      ) {
        playShipExplosion(context)
      } else if (state.shieldHp < previous.shieldHp) {
        playTone(context, 'damage')
      }
      if (state.status === 'levelResults' && previous.status !== 'levelResults') {
        playTone(context, 'complete')
      }
      if (state.status === 'gameOver' && previous.status !== 'gameOver') {
        playTone(context, 'gameOver')
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
  return window.localStorage.getItem(SOUND_PREFERENCE_KEY) !== 'false'
}
