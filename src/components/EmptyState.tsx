import type { Filter } from '../types'

const COPY: Record<Filter, { title: string; text: string }> = {
  all: {
    title: 'Список пуст',
    text: 'Запишите первую задачу — она сохранится на этом устройстве',
  },
  active: {
    title: 'Активных задач нет',
    text: 'Всё, что было записано, выполнено',
  },
  done: {
    title: 'Выполненных задач пока нет',
    text: 'Отмеченные задачи появятся здесь',
  },
}

/** Пустой лист ежедневника: строки есть, записей нет. */
export function EmptyState({ filter, hasTasks }: { filter: Filter; hasTasks: boolean }) {
  const copy = hasTasks ? COPY[filter] : COPY.all

  return (
    <div className="empty">
      <div className="empty__lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="empty__title">{copy.title}</p>
      <p className="empty__text">{copy.text}</p>
    </div>
  )
}
