import { describe, expect, it } from 'vitest'
import { fingerLabel } from './keyboardLayout'

describe('fingerLabel', () => {
  it('returns the hand and finger for known Home Row keys', () => {
    expect(fingerLabel('f')).toBe('Left Index')
    expect(fingerLabel('j')).toBe('Right Index')
    expect(fingerLabel(';')).toBe('Right Pinky')
  })

  it('returns an empty string for keys with no finger mapping', () => {
    expect(fingerLabel('z')).toBe('')
  })
})
