import test from 'node:test'
import assert from 'node:assert/strict'
import {
  config,
  createConsultoriaHandler,
} from '../netlify/functions/consultoria-submissions.mts'

const validPayload = {
  nome: 'Maria Silva',
  cidade_uf: 'São Paulo / SP',
  whatsapp: '11999999999',
  horario_contato: 'Manhã',
  tipo_projeto: 'Residencial',
  ambiente: 'Sala de estar',
  nivel_escolhido: 'Nível 01',
}

function createRequest(payload) {
  return new Request('https://studio132.test/api/consultoria/submissions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

function handler(fetchImpl) {
  const environment = {
    TRELLO_API_KEY: 'test-key',
    TRELLO_API_TOKEN: 'test-token',
    TRELLO_LIST_ID: 'test-list',
  }

  return createConsultoriaHandler({
    fetchImpl,
    getEnvironment: (name) => environment[name],
  })
}

test('creates a Trello card from a valid submission', async () => {
  let trelloRequest
  const submit = handler(async (input, init) => {
    trelloRequest = { input, init }
    return Response.json({ id: 'card-123', shortUrl: 'https://trello.com/c/card-123' })
  })
  const response = await submit(createRequest(validPayload))

  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), {
    message: 'Solicitação enviada com sucesso.',
  })
  assert.equal(trelloRequest.input, 'https://api.trello.com/1/cards')
  assert.equal(new URLSearchParams(trelloRequest.init.body).get('idList'), 'test-list')
  assert.match(new URLSearchParams(trelloRequest.init.body).get('desc'), /Maria Silva/)
})

test('rejects an incomplete submission before calling Trello', async () => {
  let called = false
  const submit = handler(async () => {
    called = true
    return Response.json({})
  })
  const response = await submit(createRequest({ ...validPayload, ambiente: '' }))

  assert.equal(response.status, 422)
  assert.equal(called, false)
})

test('returns a service error when Trello rejects the submission', async () => {
  const submit = handler(async () => (
    new Response('{}', { status: 500 })
  ))
  const response = await submit(createRequest(validPayload))

  assert.equal(response.status, 502)
  assert.deepEqual(await response.json(), {
    message: 'Não foi possível registrar sua solicitação agora.',
  })
})

test('exposes the existing form endpoint as a native Netlify route', () => {
  assert.equal(config.path, '/api/consultoria/submissions')
  assert.equal(config.method, 'POST')
})
