import { useEffect, useState } from 'react'
import { formatDay } from '../lib/date'

/** Сегодняшняя дата в заголовке. Обновляется, когда к вкладке возвращаются после полуночи. */
export function useToday(): string {
  const [label, setLabel] = useState(() => formatDay(new Date()))

  useEffect(() => {
    const refresh = () => setLabel(formatDay(new Date()))
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return label
}
