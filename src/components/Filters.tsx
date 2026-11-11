import { motion } from 'motion/react'
import type { TaskCounts } from '../state/tasks'
import { FILTERS } from '../types'
import type { Filter } from '../types'

const LABELS: Record<Filter, string> = {
  all: 'Все',
  active: 'Активные',
  done: 'Выполненные',
}

interface FiltersProps {
  value: Filter
  counts: TaskCounts
  onChange: (filter: Filter) => void
}

export function Filters({ value, counts, onChange }: FiltersProps) {
  return (
    <nav className="filters" aria-label="Фильтр задач">
      {FILTERS.map((filter) => {
        const active = filter === value
        return (
          <button
            key={filter}
            type="button"
            className="filter"
            aria-pressed={active}
            onClick={() => onChange(filter)}
          >
            {active && (
              <motion.span
                layoutId="filter-pill"
                className="filter__pill"
                transition={{ duration: 0.28 }}
              />
            )}
            <span className="filter__label">{LABELS[filter]}</span>
            <span className="filter__count">{counts[filter]}</span>
          </button>
        )
      })}
    </nav>
  )
}
