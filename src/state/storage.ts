import type { Task } from '../types'

export const TASKS_KEY = 'focus-tasks:v1'
const SCHEMA_VERSION = 1

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const PROBE_KEY = 'focus-tasks:probe'

/**
 * Проверяет, что в хранилище действительно можно писать.
 * Если нельзя, человека нужно предупредить: задачи не переживут закрытие вкладки.
 */
export function isStorageWritable(storage: StorageLike | null): boolean {
  if (!storage) return false
  try {
    storage.setItem(PROBE_KEY, '1')
    storage.removeItem(PROBE_KEY)
    return true
  } catch {
    return false
  }
}

/** localStorage бывает недоступен (приватный режим, запрет в настройках) — тогда работаем без сохранения. */
export function getStorage(): StorageLike | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'string' &&
    task.id.length > 0 &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0 &&
    typeof task.done === 'boolean' &&
    typeof task.createdAt === 'number'
  )
}

/**
 * Разбирает сохранённую строку. Возвращает null, если записи нет или она повреждена,
 * чтобы приложение не падало из-за чужих или старых данных.
 */
export function parseTasks(raw: string | null): Task[] | null {
  if (raw === null) return null
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return null
    const list = (data as { tasks?: unknown }).tasks
    if (!Array.isArray(list)) return null
    const seen = new Set<string>()
    return list.filter((item): item is Task => {
      if (!isTask(item) || seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  } catch {
    return null
  }
}

export function serializeTasks(tasks: Task[]): string {
  return JSON.stringify({ version: SCHEMA_VERSION, tasks })
}

export function loadTasks(storage: StorageLike | null): Task[] | null {
  if (!storage) return null
  try {
    return parseTasks(storage.getItem(TASKS_KEY))
  } catch {
    return null
  }
}

/** false — сохранить не удалось (переполнено хранилище или оно выключено). */
export function saveTasks(storage: StorageLike | null, tasks: Task[]): boolean {
  if (!storage) return false
  try {
    storage.setItem(TASKS_KEY, serializeTasks(tasks))
    return true
  } catch {
    return false
  }
}

export function readPref(key: string): string | null {
  try {
    return getStorage()?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function writePref(key: string, value: string): void {
  try {
    getStorage()?.setItem(key, value)
  } catch {
    // настройка просто не запомнится — работе это не мешает
  }
}
