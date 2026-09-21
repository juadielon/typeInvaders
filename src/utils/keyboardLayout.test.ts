import { describe, expect, it } from 'vitest'
import { KEYBOARD_ROWS, fingerLabel } from './keyboardLayout'

describe('fingerLabel', () => {
  it('returns the hand and finger for known Home Row keys', () => {
    expect(fingerLabel('f')).toBe('Left Index')
    expect(fingerLabel('j')).toBe('Right Index')
    expect(fingerLabel(';')).toBe('Right Pinky')
  })

  it('returns an empty string for keys with no finger mapping', () => {
    expect(fingerLabel('z')).toBe('')
  })

  it('includes the four standard typing rows, beginning with numbers', () => {
    expect(KEYBOARD_ROWS).toHaveLength(4)
    expect(KEYBOARD_ROWS[0]).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'])
    expect(KEYBOARD_ROWS[3]).toEqual(['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'])
  })
})
