import type { Filter, Task } from '../types'

export const TITLE_MAX = 200

/** Убирает лишние пробелы и переносы; пустая строка означает «добавлять нечего». */
export function normalizeTitle(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, TITLE_MAX)
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function createTask(title: string, now: number = Date.now()): Task {
  return { id: newId(), title, done: false, createdAt: now }
}

/** Удалённая задача вместе с местом в списке — чтобы отмена вернула её туда же. */
export interface RemovedTask {
  task: Task
  index: number
}

export type TaskAction =
  | { type: 'add'; task: Task }
  | { type: 'toggle'; id: string }
  | { type: 'rename'; id: string; title: string }
  | { type: 'remove'; id: string }
  | { type: 'clearDone' }
  | { type: 'restore'; items: RemovedTask[] }
  | { type: 'reorder'; ids: string[] }
  | { type: 'replace'; tasks: Task[] }

export function tasksReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'add': {
      const title = normalizeTitle(action.task.title)
      if (!title) return state
      return [{ ...action.task, title }, ...state]
    }
    case 'toggle':
      return state.map((task) => (task.id === action.id ? { ...task, done: !task.done } : task))
    case 'rename': {
      const title = normalizeTitle(action.title)
      if (!title) return state
      return state.map((task) => (task.id === action.id ? { ...task, title } : task))
    }
    case 'remove':
      return state.filter((task) => task.id !== action.id)
    case 'clearDone':
      return state.filter((task) => !task.done)
    case 'restore': {
      const known = new Set(state.map((task) => task.id))
      const next = [...state]
      for (const { task, index } of [...action.items].sort((a, b) => a.index - b.index)) {
        if (known.has(task.id)) continue
        next.splice(Math.min(Math.max(index, 0), next.length), 0, task)
        known.add(task.id)
      }
      return next
    }
    case 'reorder':
      return reorderVisible(state, action.ids)
    case 'replace':
      return action.tasks
  }
}

/**
 * Переставляет только те задачи, что сейчас видны под фильтром.
 * Скрытые задачи остаются на своих местах, видимые занимают те же «слоты» в новом порядке.
 */
export function reorderVisible(tasks: Task[], orderedIds: string[]): Task[] {
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const queue = [...new Set(orderedIds)].filter((id) => byId.has(id))
  if (queue.length === 0) return tasks
  const moving = new Set(queue)
  let next = 0
  return tasks.map((task) => (moving.has(task.id) ? byId.get(queue[next++])! : task))
}

export function selectVisible(tasks: Task[], filter: Filter): Task[] {
  if (filter === 'active') return tasks.filter((task) => !task.done)
  if (filter === 'done') return tasks.filter((task) => task.done)
  return tasks
}

export interface TaskCounts {
  all: number
  active: number
  done: number
}

export function countTasks(tasks: Task[]): TaskCounts {
  const done = tasks.reduce((sum, task) => sum + (task.done ? 1 : 0), 0)
  return { all: tasks.length, active: tasks.length - done, done }
}
