import { useEffect, useReducer } from 'react'
import { seedTasks } from '../state/seed'
import { TASKS_KEY, getStorage, loadTasks, parseTasks, saveTasks } from '../state/storage'
import { tasksReducer } from '../state/tasks'
import type { Task } from '../types'

/** Первый визит — показываем примеры. Потом всегда то, что сохранил человек, даже пустой список. */
function initTasks(): Task[] {
  return loadTasks(getStorage()) ?? seedTasks()
}

export function useTasks() {
  const [tasks, dispatch] = useReducer(tasksReducer, undefined, initTasks)

  useEffect(() => {
    saveTasks(getStorage(), tasks)
  }, [tasks])

  // Список открыт в двух вкладках — изменения из одной сразу видны в другой
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== TASKS_KEY) return
      const incoming = parseTasks(event.newValue)
      if (incoming) dispatch({ type: 'replace', tasks: incoming })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { tasks, dispatch }
}
