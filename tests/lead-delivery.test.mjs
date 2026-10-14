import test from 'node:test'
import assert from 'node:assert/strict'
import { createConsultoriaHandler } from '../netlify/functions/consultoria-submissions.js'
import { onRequestPost } from '../functions/api/consultoria/submissions.js'

const env = { TRELLO_API_KEY: 'key', TRELLO_API_TOKEN: 'token', TRELLO_LIST_ID: 'list', TETOAPP_LEAD_URL: 'https://tetoapp.test/leads', TETOAPP_LEAD_TOKEN: 'lead-secret' }
const payload = { nome: 'Teste', cidade_uf: 'São Paulo / SP', whatsapp: '(11) 99999-9999', horario_contato: 'Manhã', tipo_projeto: 'Residencial', ambiente: 'Sala', nivel_escolhido: 'Nível 01' }
const request = (body = payload) => new Request('https://studio132.test/api/consultoria/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'submission-123' }, body: JSON.stringify(body) })

for (const [runtime, adapter] of Object.entries({
  netlify: (environment, fetchImpl, req) => createConsultoriaHandler({ getEnvironment: name => environment[name], fetchImpl })(req),
  cloudflare: (environment, fetchImpl, req) => onRequestPost({ env: environment, fetch: fetchImpl, request: req }),
})) {
  test(`${runtime}: delivers mapped lead before creating Trello card`, async () => {
    const calls = []
    const response = await adapter(env, async (url, init) => {
      calls.push({ url, init })
      return Response.json(url === env.TETOAPP_LEAD_URL ? { data: { id: 2 }, duplicate: false } : { id: 'card' }, { status: 201 })
    }, request())
    assert.equal(response.status, 201)
    assert.deepEqual(calls.map(c => c.url), [env.TETOAPP_LEAD_URL, 'https://api.trello.com/1/cards'])
    assert.equal(calls[0].init.redirect, 'manual')
    assert.equal(calls[0].init.headers.Authorization, 'Bearer lead-secret')
    assert.equal(calls[0].init.headers['Idempotency-Key'], 'submission-123')
    const lead = JSON.parse(calls[0].init.body)
    assert.equal(lead.nome, 'Teste')
    assert.equal(lead.whatsapp, '11999999999')
    assert.equal(lead.dados.cidade_uf, 'São Paulo / SP')
    assert.equal(lead.dados.nivel_escolhido, 'Nível 01')
    assert.match(lead.mensagem, /Sala/)
    assert.equal(lead.consentimento, undefined)
    assert.doesNotMatch(JSON.stringify(await response.json()), /lead-secret|card/)
  })
  test(`${runtime}: does not create a card when lead API rejects submission`, async () => {
    const calls = []
    const response = await adapter(env, async url => { calls.push(url); return new Response('{}', {status: 401}) }, request())
    assert.equal(response.status, 502)
    assert.deepEqual(calls, [env.TETOAPP_LEAD_URL])
  })
  test(`${runtime}: refuses lead redirects without sending to Trello`, async () => {
    const calls = []
    const response = await adapter(env, async (url, init) => {
      calls.push(url)
      assert.equal(init.redirect, 'manual')
      return new Response(null, {status: 302, headers: {Location: 'https://other.test/leads'}})
    }, request())
    assert.equal(response.status, 502)
    assert.deepEqual(calls, [env.TETOAPP_LEAD_URL])
  })
  test(`${runtime}: fails before delivery if either destination is unconfigured`, async () => {
    for (const missing of ['TETOAPP_LEAD_TOKEN', 'TRELLO_LIST_ID']) {
      const response = await adapter({ ...env, [missing]: '' }, async () => { throw new Error('must not send') }, request())
      assert.equal(response.status, 503)
    }
  })
  test(`${runtime}: accepts idempotent lead replay and completes Trello delivery`, async () => {
    let count = 0
    const response = await adapter(env, async () => { count++; return Response.json(count === 1 ? {data: {id: 2}, duplicate: true} : {id: 'card'}) }, request())
    assert.equal(response.status, 201)
    assert.equal(count, 2)
  })
  test(`${runtime}: rejects invalid WhatsApp before delivery`, async () => {
    const response = await adapter(env, async () => { throw new Error('must not send') }, request({...payload, whatsapp: '123'}))
    assert.equal(response.status, 422)
  })
  test(`${runtime}: handles lead network failure without sending to Trello`, async () => {
    const response = await adapter(env, async () => { throw new Error('network unavailable') }, request())
    assert.equal(response.status, 502)
  })
}
