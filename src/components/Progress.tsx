import { plural } from '../lib/plural'
import type { TaskCounts } from '../state/tasks'
import type { Task } from '../types'
import { RollingNumber } from './RollingNumber'

/** С этого числа задач отметки становятся мельче, чтобы ряд не разрастался */
const DENSE_FROM = 25

interface ProgressProps {
  tasks: Task[]
  counts: TaskCounts
}

/**
 * Прогресс дня: счёт «выполнено из всех» и ряд карандашных отметок —
 * по одной на задачу, в том же порядке, что и в списке.
 * Когда выполнено всё, счёт обводится красным карандашом.
 */
export function Progress({ tasks, counts }: ProgressProps) {
  const complete = counts.all > 0 && counts.done === counts.all
  const summary =
    counts.all === 0
      ? 'Задач пока нет'
      : `Выполнено ${counts.done} из ${counts.all} ${plural(counts.all, ['задачи', 'задач', 'задач'])}`

  return (
    <section className={complete ? 'progress is-complete' : 'progress'} aria-label={summary}>
      <p className="progress__figure" aria-hidden="true">
        <RollingNumber value={counts.done} />
        <span className="progress__of">из {counts.all}</span>
        <svg className="progress__circle" viewBox="0 0 200 100" preserveAspectRatio="none">
          <path
            pathLength={1}
            d="M112 9C156 5 193 22 192 51c-1 31-48 44-98 43C44 93 7 77 8 47 9 19 58 3 126 12"
          />
        </svg>
      </p>
      {tasks.length > 0 && (
        <div className={tasks.length >= DENSE_FROM ? 'tally is-dense' : 'tally'} aria-hidden="true">
          {tasks.map((task) => (
            <span key={task.id} className={task.done ? 'tally__mark is-done' : 'tally__mark'} />
          ))}
        </div>
      )}
    </section>
  )
}
