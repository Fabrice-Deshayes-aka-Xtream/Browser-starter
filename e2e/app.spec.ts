import { expect, test, type Page } from '@playwright/test'

const STORAGE_KEY = 'browser-starter.config'

test.beforeEach(async ({ page }) => {
  // Keep tests offline and fast: external requests (favicons, feeds, weather) fail immediately.
  await page.route(/^(?!http:\/\/localhost)/, (route) => route.abort())
})

const readConfig = (page: Page) => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)

test('search engine menu lets the user switch engine', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /search engine|moteur/i }).click()
  await page.getByRole('option', { name: 'DuckDuckGo' }).click()
  await page.getByRole('button', { name: /search engine|moteur/i }).click()
  await expect(page.getByRole('option', { name: 'DuckDuckGo' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

test('blocks can be added in edit mode and persist after reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /^(Edit|Modifier)$/ }).click()
  await page
    .getByRole('button', { name: /Add block|Ajouter un bloc/ })
    .first()
    .click()
  await page.getByRole('button', { name: /Bookmarks|Favoris/ }).click()
  await expect(page.locator('[data-block-id]')).toHaveCount(1)

  await expect.poll(() => readConfig(page)).toContain('"bookmarks"')
  await page.reload()
  await expect(page.locator('[data-block-id]')).toHaveCount(1)
})

test('a bookmark can be added to a group', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /^(Edit|Modifier)$/ }).click()
  await page
    .getByRole('button', { name: /Add block|Ajouter un bloc/ })
    .first()
    .click()
  await page.getByRole('button', { name: /Bookmarks|Favoris/ }).click()

  await page.getByRole('button', { name: /Add link|Ajouter un lien/ }).click()
  await page.getByPlaceholder('https://example.com').fill('example.com')
  await page.getByRole('button', { name: /^(Save|Enregistrer)$/ }).click()

  await page.getByRole('button', { name: /^(Done|Terminer)$/ }).click()
  const link = page.getByRole('link', { name: /example/ })
  await expect(link).toHaveAttribute('href', 'https://example.com/')
  await expect(link).toHaveAttribute('target', '_blank')
})

test('configuration can be exported and imported', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Settings|Paramètres/ }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Export|Exporter/ }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('browser-starter-config.json')

  const imported = JSON.parse(
    await (await import('node:fs/promises')).readFile((await download.path())!, 'utf8'),
  )
  imported.settings.theme = 'dark'
  page.once('dialog', (dialog) => dialog.accept())
  await page.locator('input[type="file"]').setInputFiles({
    name: 'config.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(imported)),
  })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('search engines are managed in edit mode only', async ({ page }) => {
  await page.goto('/')
  const manage = page.getByRole('button', { name: /Manage search engines|Gérer les moteurs/ })
  await expect(manage).toHaveCount(0)

  await page.getByRole('button', { name: /^(Edit|Modifier)$/ }).click()
  await manage.click()
  await page.getByRole('button', { name: /Add engine|Ajouter un moteur/ }).click()
  await page.getByPlaceholder('DuckDuckGo', { exact: true }).fill('Qwant')
  await page
    .getByPlaceholder('https://duckduckgo.com/?q={query}')
    .fill('https://www.qwant.com/?q={query}')
  await page.getByRole('button', { name: /^(Save|Enregistrer)$/ }).click()
  await page
    .getByRole('button', { name: /Remove|Supprimer/ })
    .first()
    .click()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /^(Done|Terminer)$/ }).click()

  await page.getByRole('button', { name: /search engine|moteur/i }).click()
  await expect(page.getByRole('option', { name: 'Qwant' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Google' })).toHaveCount(0)
})

test('bookmarks can be displayed as tiles', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /^(Edit|Modifier)$/ }).click()
  await page
    .getByRole('button', { name: /Add block|Ajouter un bloc/ })
    .first()
    .click()
  await page.getByRole('button', { name: /Bookmarks|Favoris/ }).click()
  await page.getByRole('combobox', { name: /Display|Affichage/ }).selectOption('tiles')
  await expect(page.locator('.links.tiles')).toHaveCount(1)
})

test('workspaces can be added, switched and deleted with a typed confirmation', async ({
  page,
}) => {
  await page.goto('/')
  const switcher = page.getByRole('combobox', { name: /^(Workspace|Espace de travail)$/ })
  await expect(switcher).toHaveCount(0)

  await page.getByRole('button', { name: /^(Settings|Paramètres|Réglages)$/ }).click()
  await page.getByPlaceholder(/^(New workspace name|Nom du nouvel espace de travail)$/).fill('Work')
  await page.getByRole('button', { name: /^\+ / }).click()
  await page.keyboard.press('Escape')

  await expect(switcher).toBeVisible()
  await switcher.selectOption({ label: 'Work' })
  await expect
    .poll(async () => {
      const config = JSON.parse((await readConfig(page)) ?? '{}')
      return config.workspaces?.find((w: { id: string }) => w.id === config.activeWorkspaceId)?.name
    })
    .toBe('Work')
  await page.reload()
  await expect(switcher.locator('option:checked')).toHaveText('Work')

  await page.getByRole('button', { name: /^(Settings|Paramètres|Réglages)$/ }).click()
  await page
    .getByRole('button', { name: /^(Delete workspace|Supprimer l'espace de travail)$/ })
    .nth(1)
    .click()
  const confirm = page.getByRole('button', {
    name: /^(Delete permanently|Supprimer définitivement)$/,
  })
  await expect(confirm).toBeDisabled()
  await page.getByPlaceholder('Work', { exact: true }).fill('Work')
  await confirm.click()
  await expect(switcher).toHaveCount(0)
})
