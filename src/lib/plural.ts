const rules = new Intl.PluralRules('ru-RU')

/** Русское склонение по числу: plural(3, ['задача', 'задачи', 'задач']) → «задачи». */
export function plural(count: number, forms: readonly [one: string, few: string, many: string]): string {
  const rule = rules.select(Math.abs(count))
  if (rule === 'one') return forms[0]
  if (rule === 'few') return forms[1]
  return forms[2]
}
