import { copyFileSync, cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

// Builds one unpacked extension folder per browser family from the Vite output in `dist/`.
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const base = { ...readJson('extension/manifest.base.json'), version: pkg.version }

const targets = {
  chromium: { ...base, ...readJson('extension/manifest.chromium.json') },
  firefox: { ...base, ...readJson('extension/manifest.firefox.json') },
}

rmSync('build', { recursive: true, force: true })
for (const [name, manifest] of Object.entries(targets)) {
  const out = `build/${name}`
  mkdirSync(out, { recursive: true })
  cpSync('dist', out, { recursive: true })
  if (name === 'chromium') copyFileSync('extension/background.js', `${out}/background.js`)
  writeFileSync(`${out}/manifest.json`, JSON.stringify(manifest, null, 2))
  console.log(`Extension ready: ${out}`)
}
