import type { KeyFingerInfo } from '../types/game'

/**
 * Maps each home-row (and near-home-row) key to the hand/finger that should
 * be used to type it, for the Visual Keyboard instructor hints.
 */
export const KEY_FINGER_MAP: Record<string, KeyFingerInfo> = {
  a: { hand: 'left', finger: 'pinky' },
  s: { hand: 'left', finger: 'ring' },
  d: { hand: 'left', finger: 'middle' },
  f: { hand: 'left', finger: 'index' },
  g: { hand: 'left', finger: 'index' },
  h: { hand: 'right', finger: 'index' },
  j: { hand: 'right', finger: 'index' },
  k: { hand: 'right', finger: 'middle' },
  l: { hand: 'right', finger: 'ring' },
  ';': { hand: 'right', finger: 'pinky' },
}

/** Letter rows rendered by VisualKeyboard, top to bottom. */
export const KEYBOARD_ROWS: string[][] = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
]

export function fingerLabel(key: string): string {
  const info = KEY_FINGER_MAP[key]
  if (!info) return ''
  const handLabel = info.hand === 'left' ? 'Left' : 'Right'
  const fingerLabel = info.finger.charAt(0).toUpperCase() + info.finger.slice(1)
  return `${handLabel} ${fingerLabel}`
}
