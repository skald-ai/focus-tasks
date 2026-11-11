const dayFormat = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/** «Среда, 11 ноября» */
export function formatDay(date: Date): string {
  const text = dayFormat.format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}
