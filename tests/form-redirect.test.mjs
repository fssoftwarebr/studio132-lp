import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('keeps the visitor on the landing page after creating a Trello card', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')

  assert.match(html, /Recebemos sua solicitação\. Em breve entraremos em contato\./)
  assert.doesNotMatch(html, /location\.assign\(result\.card\.url\)/)
  assert.doesNotMatch(html, /whatsappWindow|whatsappUrl|Abrindo o card no Trello/)
})
