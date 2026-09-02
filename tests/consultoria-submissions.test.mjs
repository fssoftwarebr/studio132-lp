import test from 'node:test'
import assert from 'node:assert/strict'
import { onRequestPost } from '../functions/api/consultoria/submissions.js'

const validPayload = {
  nome: 'Maria Silva',
  cidade_uf: 'São Paulo / SP',
  whatsapp: '11999999999',
  horario_contato: 'Manhã',
  tipo_projeto: 'Residencial',
  ambiente: 'Sala de estar',
  nivel_escolhido: 'Nível 01',
}

function context(payload, fetchImpl) {
  return {
    request: new Request('https://studio132.test/api/consultoria/submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }),
    env: {
      TRELLO_API_KEY: 'test-key',
      TRELLO_API_TOKEN: 'test-token',
      TRELLO_LIST_ID: 'test-list',
    },
    fetch: fetchImpl,
  }
}

test('creates a Trello card from a valid submission', async () => {
  let request
  const response = await onRequestPost(context(validPayload, async (input, init) => {
    request = { input, init }
    return Response.json({ id: 'card-123', shortUrl: 'https://trello.com/c/card-123' })
  }))

  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), {
    message: 'Solicitação enviada com sucesso.',
    card: { id: 'card-123', url: 'https://trello.com/c/card-123' },
  })
  assert.equal(request.input, 'https://api.trello.com/1/cards')
  assert.equal(new URLSearchParams(request.init.body).get('idList'), 'test-list')
  assert.match(new URLSearchParams(request.init.body).get('desc'), /Maria Silva/)
})

test('rejects an incomplete submission before calling Trello', async () => {
  let called = false
  const response = await onRequestPost(context({ ...validPayload, ambiente: '' }, async () => {
    called = true
    return Response.json({})
  }))

  assert.equal(response.status, 422)
  assert.equal(called, false)
})

test('returns a service error when Trello rejects the submission', async () => {
  const response = await onRequestPost(context(validPayload, async () => (
    new Response('{}', { status: 500 })
  )))

  assert.equal(response.status, 502)
  assert.deepEqual(await response.json(), {
    message: 'Não foi possível registrar sua solicitação agora.',
  })
})
