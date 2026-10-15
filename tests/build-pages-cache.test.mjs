import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

test('published asset URLs change when their contents change', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'studio132-cache-'))
  for (const folder of ['css', 'js', 'images', 'data']) await mkdir(join(fixture, folder))
  await writeFile(join(fixture, 'favicon.ico'), '')
  await writeFile(join(fixture, 'index.html'), '<link rel="stylesheet" href="/css/style.css"><script type="module" src="/js/form.js"></script>')
  await writeFile(join(fixture, 'css/style.css'), 'body { color: black; }')
  await writeFile(join(fixture, 'js/form.js'), 'console.log("old")')
  const gitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], { encoding: 'utf8' }).trim()
  const build = async () => {
    execFileSync(process.execPath, [fileURLToPath(new URL('../scripts/build-pages.mjs', import.meta.url))], {
      cwd: fixture, env: { ...process.env, GIT_DIR: gitDir },
    })
    return readFile(join(fixture, '.pages-dist/index.html'), 'utf8')
  }
  const urls = html => [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(match => match[1])
  const first = urls(await build())
  assert.notEqual(first[1], '/js/form.js', 'the form entry point must bypass the previously cached URL')
  await writeFile(join(fixture, 'js/form.js'), 'console.log("new")')
  const second = urls(await build())
  assert.notEqual(first[1], second[1], 'a script update needs a new URL')
  assert.equal(first[0], second[0], 'unchanged styles retain their URL')
  await writeFile(join(fixture, 'css/style.css'), 'body { color: blue; }')
  const third = urls(await build())
  assert.notEqual(second[0], third[0], 'a stylesheet update needs a new URL')
  assert.equal(second[1], third[1], 'unchanged scripts retain their URL')
})
