import type { Task } from '../types'

const MINUTE = 60_000

/** Примеры для первого запуска: показывают, как выглядят активные и выполненные задачи. */
export function seedTasks(now: number = Date.now()): Task[] {
  const examples: Array<[title: string, done: boolean]> = [
    ['Созвониться с заказчиком по макету главной в 11:30', false],
    ['Отправить счёт за октябрь в бухгалтерию', false],
    ['Забрать посылку из пункта выдачи до 21:00', false],
    ['Записаться к стоматологу на следующую неделю', false],
    ['Купить продукты на ужин: рыба, лимон, зелень', true],
    ['Продлить домен и хостинг', true],
  ]
  return examples.map(([title, done], index) => ({
    id: `seed-${index + 1}`,
    title,
    done,
    createdAt: now - index * MINUTE,
  }))
}
