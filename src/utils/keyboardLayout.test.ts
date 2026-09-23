import { describe, expect, it } from 'vitest'
import { KEYBOARD_ROWS, fingerLabel, spokenKeyName } from './keyboardLayout'

describe('fingerLabel', () => {
  it('provides spoken names for punctuation keys', () => {
    expect(spokenKeyName(';')).toBe('semicolon')
    expect(spokenKeyName(',')).toBe('comma')
    expect(spokenKeyName('.')).toBe('full stop')
    expect(spokenKeyName('/')).toBe('slash')
    expect(spokenKeyName('f')).toBe('F')
  })

  it('returns the hand and finger for known Home Row keys', () => {
    expect(fingerLabel('f')).toBe('Left Index')
    expect(fingerLabel('j')).toBe('Right Index')
    expect(fingerLabel(';')).toBe('Right Pinky')
  })

  it('returns an empty string for keys with no finger mapping', () => {
    expect(fingerLabel('1')).toBe('')
  })

  it('returns the hand and finger for Top and Bottom Row keys', () => {
    expect(fingerLabel('r')).toBe('Left Index')
    expect(fingerLabel('u')).toBe('Right Index')
    expect(fingerLabel('v')).toBe('Left Index')
    expect(fingerLabel('m')).toBe('Right Index')
  })

  it('includes the three letter rows without the advanced number row', () => {
    expect(KEYBOARD_ROWS).toHaveLength(3)
    expect(KEYBOARD_ROWS[0]).toEqual(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'])
    expect(KEYBOARD_ROWS[2]).toEqual(['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'])
  })
})
