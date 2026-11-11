const SHORTCUTS: Array<{ keys: string[]; label: string }> = [
  { keys: ['N'], label: 'Новая задача' },
  { keys: ['Enter'], label: 'Добавить или сохранить' },
  { keys: ['Esc'], label: 'Отменить правку' },
  { keys: ['Ctrl', 'Z'], label: 'Вернуть удалённое' },
]

/** Подсказка по клавишам. Показывается только на широких экранах, где есть клавиатура. */
export function Shortcuts() {
  return (
    <section className="shortcuts" aria-label="Горячие клавиши">
      <ul className="shortcuts__list">
        {SHORTCUTS.map((shortcut) => (
          <li key={shortcut.label} className="shortcuts__row">
            <span>{shortcut.label}</span>
            <span className="shortcuts__keys">
              {shortcut.keys.map((key) => (
                <kbd key={key}>{key}</kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <p className="shortcuts__note">Двойной клик по задаче открывает правку</p>
    </section>
  )
}
