import { useCallback, useEffect, useRef } from 'react'
import type { GameState } from '../types/game'

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

function playExplosion(context: AudioContext): void {
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

export function useSoundEffects(
  state: GameState,
  soundEnabled: boolean,
): { unlockAudio: () => void } {
  const contextRef = useRef<AudioContext | null>(null)
  const previousState = useRef<GameState | null>(null)

  const unlockAudio = useCallback(() => {
    if (!soundEnabled) return
    const context = contextRef.current ?? getAudioContext()
    if (!context) return
    contextRef.current = context
    void context.resume().catch(() => undefined)
  }, [soundEnabled])

  useEffect(() => {
    const previous = previousState.current
    previousState.current = state
    if (!soundEnabled || !previous) return

    const context = contextRef.current ?? getAudioContext()
    if (!context) return
    contextRef.current = context
    void context.resume().catch(() => undefined)

    try {
      if (state.score > previous.score) playExplosion(context)
      if (state.shieldHp < previous.shieldHp) playTone(context, 'damage')
      if (state.plasmaBolts.length > previous.plasmaBolts.length) playTone(context, 'warning')
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
