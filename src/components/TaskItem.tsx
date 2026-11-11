import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { Reorder, useDragControls } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, Ref } from 'react'
import { TITLE_MAX, normalizeTitle } from '../state/tasks'
import type { Task } from '../types'

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onRename: (id: string, title: string) => void
  onRemove: (id: string) => void
  /** Сдвиг с клавиатуры: -1 вверх, 1 вниз */
  onMove: (id: string, delta: -1 | 1) => void
  /** Нужен AnimatePresence, чтобы плавно убрать строку из списка */
  ref?: Ref<HTMLLIElement>
}

export function TaskItem({ task, onToggle, onRename, onRemove, onMove, ref }: TaskItemProps) {
  const dragControls = useDragControls()
  const [editing, setEditing] = useState(false)
  const [dragging, setDragging] = useState(false)

  const className = ['task', task.done && 'is-done', dragging && 'is-dragging', editing && 'is-editing']
    .filter(Boolean)
    .join(' ')

  const onGripKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      onMove(task.id, event.key === 'ArrowUp' ? -1 : 1)
    }
  }

  return (
    <Reorder.Item
      ref={ref}
      value={task.id}
      id={task.id}
      className={className}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.16 } }}
    >
      <button
        type="button"
        className="task__grip"
        aria-label={`Переместить задачу «${task.title}». Стрелки вверх и вниз меняют порядок`}
        onPointerDown={(event) => dragControls.start(event)}
        onKeyDown={onGripKey}
      >
        <GripVertical size={16} strokeWidth={1.5} aria-hidden="true" />
      </button>

      <label className="check">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
          aria-label={`Выполнено: ${task.title}`}
        />
        <span className="check__box" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="20" height="20">
            <path d="M5.5 10.5l3 3 6-7" />
          </svg>
        </span>
      </label>

      {editing ? (
        <TitleEditor
          initial={task.title}
          onCommit={(title) => {
            setEditing(false)
            if (title && title !== task.title) onRename(task.id, title)
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <p
          className="task__title"
          onDoubleClick={() => setEditing(true)}
          title="Двойной клик — изменить"
        >
          <span>{task.title}</span>
        </p>
      )}

      <div className="task__actions">
        <button
          type="button"
          className="icon-button icon-button--small"
          aria-label={`Изменить задачу «${task.title}»`}
          onClick={() => setEditing(true)}
        >
          <Pencil size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="icon-button icon-button--small icon-button--danger"
          aria-label={`Удалить задачу «${task.title}»`}
          onClick={() => onRemove(task.id)}
        >
          <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </Reorder.Item>
  )
}

interface TitleEditorProps {
  initial: string
  /** Пустая строка означает «оставить как было» */
  onCommit: (title: string) => void
  onCancel: () => void
}

/** Правка на месте: Enter или уход из поля сохраняют, Esc отменяет. */
function TitleEditor({ initial, onCommit, onCancel }: TitleEditorProps) {
  const [value, setValue] = useState(initial)
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const settled = useRef(false)

  // Поле растёт вместе с текстом, как обычная строка задачи
  useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    field.style.height = 'auto'
    field.style.height = `${field.scrollHeight}px`
  }, [value])

  useEffect(() => {
    const field = fieldRef.current
    field?.focus()
    field?.select()
  }, [])

  const finish = (commit: boolean) => {
    if (settled.current) return
    settled.current = true
    if (commit) onCommit(normalizeTitle(value))
    else onCancel()
  }

  return (
    <textarea
      ref={fieldRef}
      className="task__editor"
      rows={1}
      value={value}
      maxLength={TITLE_MAX}
      aria-label="Текст задачи"
      onChange={(event) => setValue(event.target.value.replace(/\n/g, ' '))}
      onBlur={() => finish(true)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          finish(true)
        } else if (event.key === 'Escape') {
          event.preventDefault()
          finish(false)
        }
      }}
    />
  )
}
