import test from 'node:test'
import assert from 'node:assert/strict'
import { formatWhatsapp } from '../js/form-utils.js'

test('formats Brazilian mobile numbers with eleven digits', () => {
  assert.equal(formatWhatsapp('11999999999'), '(11) 99999-9999')
})

test('formats Brazilian landline numbers with ten digits', () => {
  assert.equal(formatWhatsapp('1133334444'), '(11) 3333-4444')
})

test('limits WhatsApp input to eleven numeric digits', () => {
  assert.equal(formatWhatsapp('(11) 99999-9999 ext. 42'), '(11) 99999-9999')
})
