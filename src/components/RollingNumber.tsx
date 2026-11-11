import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

const variants = {
  enter: (direction: number) => ({ y: direction * 10, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (direction: number) => ({ y: direction * -10, opacity: 0 }),
}

/** Число, которое «перелистывается»: растёт — выезжает снизу, уменьшается — сверху. */
export function RollingNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(value)
  const [direction, setDirection] = useState(1)

  if (shown !== value) {
    setDirection(value > shown ? 1 : -1)
    setShown(value)
  }

  return (
    <span className="roll">
      {/* Читалке экрана — только итоговое число: во время смены в разметке живут сразу две цифры */}
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.span
            key={value}
            className="roll__value"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.24 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}
