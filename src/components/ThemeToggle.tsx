import { Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { Theme } from '../hooks/useTheme'

interface ThemeToggleProps {
  theme: Theme
  onToggle: (origin: { x: number; y: number }) => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const Icon = theme === 'dark' ? Sun : Moon

  return (
    <button
      type="button"
      className="icon-button"
      aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        onToggle({ x: box.left + box.width / 2, y: box.top + box.height / 2 })
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="icon-button__icon"
          initial={{ opacity: 0, rotate: -40 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 40 }}
          transition={{ duration: 0.16 }}
        >
          <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
