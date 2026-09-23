import { useCallback, useEffect, useRef } from 'react'
import type { GameState } from '../types/game'

export const SOUND_PREFERENCE_KEY = 'type-invaders-sound-enabled'

type SoundName = 'hit' | 'damage' | 'warning' | 'complete' | 'gameOver'

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
  hit: { frequency: 620, duration: 0.08, type: 'square' },
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
      if (state.score > previous.score) playTone(context, 'hit')
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
