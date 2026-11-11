import { describe, expect, it } from 'vitest'
import { formatDay } from './date'
import { plural } from './plural'

describe('plural', () => {
  const forms = ['задача', 'задачи', 'задач'] as const

  it.each([
    [1, 'задача'],
    [2, 'задачи'],
    [4, 'задачи'],
    [5, 'задач'],
    [11, 'задач'],
    [12, 'задач'],
    [21, 'задача'],
    [22, 'задачи'],
    [100, 'задач'],
    [0, 'задач'],
  ])('%i → %s', (count, expected) => {
    expect(plural(count, forms)).toBe(expected)
  })
})

describe('formatDay', () => {
  it('пишет день недели с заглавной буквы и дату словами', () => {
    expect(formatDay(new Date(2026, 10, 11))).toBe('Среда, 11 ноября')
  })
})
