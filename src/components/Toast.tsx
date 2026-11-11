import { Undo2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

interface ToastProps {
  /** null — подсказка скрыта */
  message: string | null
  /** меняется при каждом новом удалении, чтобы подсказка появлялась заново */
  id: number
  onUndo: () => void
}

/** Всплывающая строка после удаления: даёт несколько секунд, чтобы вернуть задачу. */
export function Toast({ message, id, onUndo }: ToastProps) {
  return (
    <div className="toast-layer">
      <AnimatePresence>
        {message && (
          <motion.div
            key={id}
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
          >
            <span>{message}</span>
            <button type="button" className="toast__action" onClick={onUndo}>
              <Undo2 size={16} strokeWidth={1.5} aria-hidden="true" />
              Вернуть
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
