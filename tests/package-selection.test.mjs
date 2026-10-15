import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

// Catch missing/wrong package selection and loss of keyboard focus at the form.
test('each package link selects its matching service and focuses the field', async () => {
  const source = await readFile(new URL('../js/form.js', import.meta.url), 'utf8')
  const values = [
    'Nível 01 – Reunião com Especialista',
    'Nível 02 – Consultoria de Layout',
    'Nível 03 – Consultoria Completa',
  ]
  let focused = false
  const changes = []
  const select = {
    value: '', options: values.map(value => ({ value })),
    focus() { focused = true },
    dispatchEvent(event) { changes.push(event.type) },
  }
  const links = values.map(value => ({
    dataset: { package: value },
    addEventListener(type, listener) { this[type] = listener },
  }))
  vm.runInNewContext(source.replace(/^import .*\n/, ''), {
    document: {
      querySelector: selector => selector === 'select[name="nivel_escolhido"]' ? select : null,
      querySelectorAll: () => links,
    }, Event,
  })
  for (const [index, link] of links.entries()) {
    focused = false
    let prevented = false
    link.click?.({ preventDefault() { prevented = true } })
    assert.equal(prevented, true)
    assert.equal(select.value, values[index])
    assert.equal(focused, true)
  }
  assert.deepEqual(changes, ['change', 'change', 'change'])
})
