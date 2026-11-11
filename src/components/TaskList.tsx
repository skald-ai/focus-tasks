import { AnimatePresence, Reorder } from 'motion/react'
import type { Task } from '../types'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onToggle: (id: string) => void
  onRename: (id: string, title: string) => void
  onRemove: (id: string) => void
  onMove: (id: string, delta: -1 | 1) => void
  onReorder: (ids: string[]) => void
}

export function TaskList({ tasks, onToggle, onRename, onRemove, onMove, onReorder }: TaskListProps) {
  return (
    <Reorder.Group
      axis="y"
      className="tasks"
      values={tasks.map((task) => task.id)}
      onReorder={onReorder}
      aria-label="Задачи"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onRename={onRename}
            onRemove={onRemove}
            onMove={onMove}
          />
        ))}
      </AnimatePresence>
    </Reorder.Group>
  )
}
