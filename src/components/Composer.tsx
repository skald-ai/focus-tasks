import { Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import type { FormEvent, RefObject } from 'react'
import { TITLE_MAX } from '../state/tasks'

interface ComposerProps {
  /** Возвращает false, если добавлять нечего (пустая строка или одни пробелы). */
  onAdd: (title: string) => boolean
  inputRef: RefObject<HTMLInputElement | null>
}

export function Composer({ onAdd, inputRef }: ComposerProps) {
  const [value, setValue] = useState('')
  const [rejected, setRejected] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (onAdd(value)) {
      setValue('')
      setRejected(false)
      return
    }
    setValue('')
    setRejected(true)
    inputRef.current?.focus()
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      formRef.current?.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(3px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      )
    }
  }

  const isEmpty = value.trim().length === 0

  return (
    <div className="composer-wrap">
      <form ref={formRef} className="composer" onSubmit={submit} noValidate>
        <label className="sr-only" htmlFor="new-task">
          Новая задача
        </label>
        <input
          id="new-task"
          ref={inputRef}
          className="composer__input"
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setRejected(false)
          }}
          onBlur={() => setRejected(false)}
          placeholder="Что нужно сделать"
          maxLength={TITLE_MAX}
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={rejected || undefined}
          aria-describedby={rejected ? 'new-task-hint' : undefined}
        />
        <button type="submit" className="button button--primary" aria-disabled={isEmpty}>
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          <span>Добавить</span>
        </button>
      </form>
      {rejected && (
        <p id="new-task-hint" className="composer__hint" role="alert">
          Сначала напишите, что нужно сделать
        </p>
      )}
    </div>
  )
}
