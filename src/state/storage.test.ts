import { describe, expect, it } from 'vitest'
import type { Task } from '../types'
import { TASKS_KEY, isStorageWritable, loadTasks, parseTasks, saveTasks, serializeTasks } from './storage'
import type { StorageLike } from './storage'

const sample: Task[] = [
  { id: '1', title: 'Отправить счёт', done: false, createdAt: 10 },
  { id: '2', title: 'Забрать посылку', done: true, createdAt: 20 },
]

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

const blockedStorage: StorageLike = {
  getItem: () => null,
  setItem: () => {
    throw new DOMException('quota', 'QuotaExceededError')
  },
  removeItem: () => {},
}

describe('хранилище задач', () => {
  it('сохраняет и читает список без потерь — как после обновления страницы', () => {
    const storage = memoryStorage()
    expect(saveTasks(storage, sample)).toBe(true)
    expect(loadTasks(storage)).toEqual(sample)
  })

  it('отличает «ничего не сохранено» от сохранённого пустого списка', () => {
    expect(loadTasks(memoryStorage())).toBeNull()
    expect(loadTasks(memoryStorage({ [TASKS_KEY]: serializeTasks([]) }))).toEqual([])
  })

  it('не падает на повреждённой записи', () => {
    expect(parseTasks('{не json')).toBeNull()
    expect(parseTasks('"строка"')).toBeNull()
    expect(parseTasks('{"tasks":"нет"}')).toBeNull()
  })

  it('отбрасывает битые элементы и дубликаты, остальное сохраняет', () => {
    const raw = JSON.stringify({
      version: 1,
      tasks: [sample[0], { id: '', title: 'без id', done: false, createdAt: 1 }, null, sample[0], sample[1]],
    })
    expect(parseTasks(raw)).toEqual(sample)
  })

  it('сообщает о неудаче, если хранилище недоступно или переполнено', () => {
    expect(saveTasks(blockedStorage, sample)).toBe(false)
    expect(saveTasks(null, sample)).toBe(false)
    expect(loadTasks(null)).toBeNull()
  })

  it('заранее определяет, можно ли писать в хранилище, и не оставляет после проверки следов', () => {
    const storage = memoryStorage()
    expect(isStorageWritable(storage)).toBe(true)
    expect(storage.data.size).toBe(0)
    expect(isStorageWritable(blockedStorage)).toBe(false)
    expect(isStorageWritable(null)).toBe(false)
  })
})
