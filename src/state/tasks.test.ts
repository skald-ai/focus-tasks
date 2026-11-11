import { describe, expect, it } from 'vitest'
import type { Task } from '../types'
import {
  TITLE_MAX,
  countTasks,
  createTask,
  normalizeTitle,
  reorderVisible,
  selectVisible,
  tasksReducer,
} from './tasks'

const task = (id: string, done = false): Task => ({ id, title: `Задача ${id}`, done, createdAt: 0 })
const ids = (tasks: Task[]) => tasks.map((item) => item.id)

describe('normalizeTitle', () => {
  it('обрезает пробелы по краям и схлопывает их внутри', () => {
    expect(normalizeTitle('  Купить   хлеб \n и молоко ')).toBe('Купить хлеб и молоко')
  })

  it('из одних пробелов делает пустую строку', () => {
    expect(normalizeTitle('   \t\n ')).toBe('')
  })

  it('ограничивает длину', () => {
    expect(normalizeTitle('я'.repeat(TITLE_MAX + 50))).toHaveLength(TITLE_MAX)
  })
})

describe('tasksReducer', () => {
  it('добавляет новую задачу в начало списка', () => {
    const next = tasksReducer([task('a')], { type: 'add', task: createTask('Новая', 1) })
    expect(next).toHaveLength(2)
    expect(next[0]).toMatchObject({ title: 'Новая', done: false })
  })

  it('не добавляет задачу с пустым названием', () => {
    const state = [task('a')]
    expect(tasksReducer(state, { type: 'add', task: { ...task('b'), title: '   ' } })).toBe(state)
  })

  it('отмечает задачу выполненной и снимает отметку', () => {
    const done = tasksReducer([task('a'), task('b')], { type: 'toggle', id: 'b' })
    expect(done.map((item) => item.done)).toEqual([false, true])
    expect(tasksReducer(done, { type: 'toggle', id: 'b' })[1].done).toBe(false)
  })

  it('переименовывает задачу, а пустое название игнорирует', () => {
    const state = [task('a')]
    expect(tasksReducer(state, { type: 'rename', id: 'a', title: '  Позвонить  маме ' })[0].title).toBe(
      'Позвонить маме',
    )
    expect(tasksReducer(state, { type: 'rename', id: 'a', title: '  ' })).toBe(state)
  })

  it('удаляет одну задачу', () => {
    expect(ids(tasksReducer([task('a'), task('b'), task('c')], { type: 'remove', id: 'b' }))).toEqual([
      'a',
      'c',
    ])
  })

  it('очищает выполненные и оставляет активные', () => {
    const state = [task('a', true), task('b'), task('c', true)]
    expect(ids(tasksReducer(state, { type: 'clearDone' }))).toEqual(['b'])
  })

  it('возвращает удалённые задачи на прежние места', () => {
    const state = [task('a'), task('b', true), task('c'), task('d', true)]
    const removed = state.flatMap((item, index) => (item.done ? [{ task: item, index }] : []))
    const cleared = tasksReducer(state, { type: 'clearDone' })
    expect(ids(tasksReducer(cleared, { type: 'restore', items: removed }))).toEqual(['a', 'b', 'c', 'd'])
  })

  it('не дублирует задачу при повторном возврате', () => {
    const state = [task('a')]
    const restored = tasksReducer(state, { type: 'restore', items: [{ task: task('a'), index: 0 }] })
    expect(ids(restored)).toEqual(['a'])
  })
})

describe('reorderVisible', () => {
  it('переставляет весь список', () => {
    expect(ids(reorderVisible([task('a'), task('b'), task('c')], ['c', 'a', 'b']))).toEqual(['c', 'a', 'b'])
  })

  it('под фильтром двигает только видимые задачи, скрытые остаются на местах', () => {
    const state = [task('a'), task('x', true), task('b'), task('y', true), task('c')]
    expect(ids(reorderVisible(state, ['c', 'a', 'b']))).toEqual(['c', 'x', 'a', 'y', 'b'])
  })

  it('пропускает неизвестные идентификаторы', () => {
    const state = [task('a'), task('b')]
    expect(ids(reorderVisible(state, ['zzz', 'b', 'a']))).toEqual(['b', 'a'])
  })
})

describe('выборка и счётчики', () => {
  const state = [task('a'), task('b', true), task('c')]

  it('фильтрует по состоянию', () => {
    expect(ids(selectVisible(state, 'all'))).toEqual(['a', 'b', 'c'])
    expect(ids(selectVisible(state, 'active'))).toEqual(['a', 'c'])
    expect(ids(selectVisible(state, 'done'))).toEqual(['b'])
  })

  it('считает все, активные и выполненные', () => {
    expect(countTasks(state)).toEqual({ all: 3, active: 2, done: 1 })
  })
})
