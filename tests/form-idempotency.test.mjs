import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

// Execute the actual submit listener: retry identity must survive failures,
// but a changed request and a new successful submission need fresh identities.
test('reuses request identity only for retries with the same form data', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
  const listener = html.slice(html.indexOf("document.getElementById('consultoria-form').addEventListener('submit'"), html.indexOf('</script>', html.indexOf("document.getElementById('consultoria-form').addEventListener('submit'")))
  let submit, sequence = 0, succeed = false
  const requests = []
  let fields = {nome: 'Teste', whatsapp: '11999999999'}
  const form = { dataset: {}, querySelector: selector => selector === '.form-status' ? {style: {}} : {}, reset() {}, setAttribute() {}, removeAttribute() {}, }
  vm.runInNewContext(listener, {
    document: {getElementById: () => ({addEventListener: (_, callback) => {submit = callback}})},
    FormData: class {entries() {return Object.entries(fields)}},
    crypto: {randomUUID: () => `id-${++sequence}`},
    fetch: async (_, init) => {requests.push(init); return {ok: succeed, json: async () => ({message: 'test'})}},
  })
  const event = {preventDefault() {}, currentTarget: form}
  await submit(event)
  await submit(event)
  assert.equal(requests[0].headers['Idempotency-Key'], requests[1].headers['Idempotency-Key'])
  fields = {...fields, nome: 'Outro teste'}
  await submit(event)
  assert.notEqual(requests[1].headers['Idempotency-Key'], requests[2].headers['Idempotency-Key'])
  succeed = true
  await submit(event)
  await submit(event)
  assert.notEqual(requests[3].headers['Idempotency-Key'], requests[4].headers['Idempotency-Key'])
})
