import { MotionConfig } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Composer } from './components/Composer'
import { EmptyState } from './components/EmptyState'
import { Filters } from './components/Filters'
import { Progress } from './components/Progress'
import { RollingNumber } from './components/RollingNumber'
import { Shortcuts } from './components/Shortcuts'
import { TaskList } from './components/TaskList'
import { ThemeToggle } from './components/ThemeToggle'
import { Toast } from './components/Toast'
import { useTasks } from './hooks/useTasks'
import { useTheme } from './hooks/useTheme'
import { useToday } from './hooks/useToday'
import { plural } from './lib/plural'
import { getStorage, isStorageWritable, readPref, writePref } from './state/storage'
import { countTasks, createTask, normalizeTitle, selectVisible } from './state/tasks'
import type { RemovedTask } from './state/tasks'
import { FILTERS } from './types'
import type { Filter } from './types'

const FILTER_KEY = 'focus-tasks:filter'
const UNDO_TIMEOUT = 6000
const EASE = [0.22, 1, 0.36, 1] as const

interface UndoState {
  id: number
  message: string
  items: RemovedTask[]
}

function readFilter(): Filter {
  const saved = readPref(FILTER_KEY)
  return FILTERS.includes(saved as Filter) ? (saved as Filter) : 'all'
}

export default function App() {
  const { tasks, dispatch } = useTasks()
  const { theme, toggle: toggleTheme } = useTheme()
  const today = useToday()
  const [filter, setFilter] = useState<Filter>(readFilter)
  const [undo, setUndo] = useState<UndoState | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  // Браузер может запретить хранилище (приватный режим, настройки) — об этом нужно сказать сразу
  const [canSave] = useState(() => isStorageWritable(getStorage()))
  const [weekday, dayAndMonth] = today.split(', ')

  const counts = useMemo(() => countTasks(tasks), [tasks])
  const visible = useMemo(() => selectVisible(tasks, filter), [tasks, filter])

  useEffect(() => {
    writePref(FILTER_KEY, filter)
  }, [filter])

  useEffect(() => {
    const name = 'Фокус — список дел на день'
    document.title = counts.active > 0 ? `(${counts.active}) ${name}` : name
  }, [counts.active])

  // Подсказка «Вернуть» сама исчезает через несколько секунд
  useEffect(() => {
    if (!undo) return
    const timer = window.setTimeout(() => setUndo(null), UNDO_TIMEOUT)
    return () => window.clearTimeout(timer)
  }, [undo])

  const addTask = (raw: string): boolean => {
    const title = normalizeTitle(raw)
    if (!title) return false
    dispatch({ type: 'add', task: createTask(title) })
    // Новая задача активна — под фильтром «Выполненные» её было бы не видно
    if (filter === 'done') setFilter('all')
    setAnnouncement(`Добавлена задача: ${title}`)
    return true
  }

  const toggleTask = (id: string) => dispatch({ type: 'toggle', id })

  const renameTask = (id: string, title: string) => dispatch({ type: 'rename', id, title })

  const removeTask = (id: string) => {
    const index = tasks.findIndex((task) => task.id === id)
    if (index === -1) return
    setUndo({ id: Date.now(), message: 'Задача удалена', items: [{ task: tasks[index], index }] })
    dispatch({ type: 'remove', id })
  }

  const clearDone = () => {
    const items = tasks.flatMap((task, index) => (task.done ? [{ task, index }] : []))
    if (items.length === 0) return
    const n = items.length
    const message = `${plural(n, ['Удалена', 'Удалены', 'Удалено'])} ${n} ${plural(n, ['задача', 'задачи', 'задач'])}`
    setUndo({ id: Date.now(), message, items })
    dispatch({ type: 'clearDone' })
  }

  const restore = () => {
    if (!undo) return
    dispatch({ type: 'restore', items: undo.items })
    setAnnouncement('Удалённое возвращено в список')
    setUndo(null)
  }

  const reorder = (ids: string[]) => dispatch({ type: 'reorder', ids })

  const moveTask = (id: string, delta: -1 | 1) => {
    const ids = visible.map((task) => task.id)
    const from = ids.indexOf(id)
    const to = from + delta
    if (from === -1 || to < 0 || to >= ids.length) return
    ;[ids[from], ids[to]] = [ids[to], ids[from]]
    dispatch({ type: 'reorder', ids })
    setAnnouncement(`Задача перемещена на место ${to + 1} из ${ids.length}`)
  }

  // Горячие клавиши. Привязаны к физическим клавишам, поэтому работают и в русской раскладке
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey) return
      const target = event.target as HTMLElement | null
      const typing =
        !!target &&
        (target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'checkbox'))
      if (typing) return

      const modifier = event.ctrlKey || event.metaKey
      if (!modifier && (event.code === 'KeyN' || event.code === 'Slash')) {
        event.preventDefault()
        inputRef.current?.focus()
      } else if (modifier && !event.shiftKey && event.code === 'KeyZ' && undo) {
        event.preventDefault()
        dispatch({ type: 'restore', items: undo.items })
        setAnnouncement('Удалённое возвращено в список')
        setUndo(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, dispatch])

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.32, ease: EASE }}>
      <div className="app">
        <aside className="side">
          <div className="side__top">
            <div className="brand">
              <svg className="brand__mark" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
                <rect width="20" height="20" rx="6" />
                <path d="M5.5 10.5l3 3 6-7" />
              </svg>
              <span className="brand__name">Фокус</span>
            </div>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>

          <Filters value={filter} counts={counts} onChange={setFilter} />

          <Shortcuts />
        </aside>

        <main className="main">
          <div className="main__inner">
            <header className="dayhead">
              <h1 className="day">
                <span>{weekday},</span> <span>{dayAndMonth}</span>
              </h1>
              <Progress tasks={tasks} counts={counts} />
            </header>

            <Composer onAdd={addTask} inputRef={inputRef} />

            {!canSave && (
              <p className="notice" role="status">
                Браузер запретил сохранение. Задачи исчезнут, когда вы закроете вкладку
              </p>
            )}

            <TaskList
              tasks={visible}
              onToggle={toggleTask}
              onRename={renameTask}
              onRemove={removeTask}
              onMove={moveTask}
              onReorder={reorder}
            />

            {visible.length === 0 && <EmptyState filter={filter} hasTasks={tasks.length > 0} />}

            {tasks.length > 0 && (
              <footer className="list-foot">
                <p className="list-foot__count">
                  {counts.active === 0 ? (
                    'Все задачи выполнены'
                  ) : (
                    <>
                      {plural(counts.active, ['Осталась', 'Осталось', 'Осталось'])}{' '}
                      <RollingNumber value={counts.active} />{' '}
                      {plural(counts.active, ['задача', 'задачи', 'задач'])}
                    </>
                  )}
                </p>
                {counts.done > 0 && (
                  <button type="button" className="button button--quiet" onClick={clearDone}>
                    Очистить выполненные
                  </button>
                )}
              </footer>
            )}
          </div>
        </main>

        <Toast message={undo?.message ?? null} id={undo?.id ?? 0} onUndo={restore} />

        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>
    </MotionConfig>
  )
}
