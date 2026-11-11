// Снимки экрана для README. Запуск при работающем dev-сервере:
//   node scripts/screenshots.mjs <путь к playwright-core> [адрес] [путь к Chrome]
// Открывает приложение в чистом профиле (первый запуск, стартовые примеры)
// и сохраняет светлую, тёмную и мобильную версии в docs/.
import { mkdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const [playwrightPath, url = 'http://localhost:5183/', chromePath] = process.argv.slice(2)
if (!playwrightPath) {
  console.error('Укажите путь к playwright-core первым аргументом')
  process.exit(1)
}

const { chromium } = await import(pathToFileURL(playwrightPath).href)
const browser = await chromium.launch({
  executablePath: chromePath ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
})

async function shot(file, { theme, width, height }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    colorScheme: theme,
    locale: 'ru-RU',
  })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(900)
  await page.screenshot({ path: file })
  await context.close()
  console.log('saved', file)
}

await mkdir('docs', { recursive: true })
await shot('docs/screenshot-light.png', { theme: 'light', width: 1280, height: 720 })
await shot('docs/screenshot-dark.png', { theme: 'dark', width: 1280, height: 720 })
await shot('docs/screenshot-mobile.png', { theme: 'light', width: 390, height: 780 })
await browser.close()
