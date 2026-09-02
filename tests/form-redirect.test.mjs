import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('redirects successful submissions to the Trello card', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')

  assert.match(html, /result\.card\.url/)
  assert.doesNotMatch(html, /whatsappWindow|whatsappUrl/)
})
