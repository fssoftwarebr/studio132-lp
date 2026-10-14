function requiredFields() {
  return {
    nome: 255,
    cidade_uf: 255,
    whatsapp: 50,
    horario_contato: 100,
    tipo_projeto: 100,
    ambiente: 255,
    nivel_escolhido: 100,
  }
}

function json(body, status) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export function createConsultoriaHandler({
  fetchImpl = fetch,
  getEnvironment,
} = {}) {
  return async function consultoriaHandler(request) {
    let payload

    try {
      payload = await request.json()
    } catch {
      return json({ message: 'Dados inválidos.' }, 422)
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return json({ message: 'Dados inválidos.' }, 422)
    }

    const data = {}

    for (const [field, maxLength] of Object.entries(requiredFields())) {
      const value = typeof payload[field] === 'string' ? payload[field].trim() : ''

      if (!value || value.length > maxLength) {
        return json({ message: 'Preencha todos os campos obrigatórios.' }, 422)
      }

      data[field] = value
    }

    const whatsapp = data.whatsapp.replace(/\D/g, '')
    if (!/^\d{10,11}$/.test(whatsapp)) {
      return json({ message: 'Informe um WhatsApp válido com DDD.' }, 422)
    }

    const idempotencyKey = request.headers.get('Idempotency-Key') || crypto.randomUUID()
    if (!/^[A-Za-z0-9._:-]{1,255}$/.test(idempotencyKey)) {
      return json({ message: 'Identificador de solicitação inválido.' }, 422)
    }

    const leadUrl = getEnvironment('TETOAPP_LEAD_URL')
    const leadToken = getEnvironment('TETOAPP_LEAD_TOKEN')
    const trelloApiKey = getEnvironment('TRELLO_API_KEY')
    const trelloApiToken = getEnvironment('TRELLO_API_TOKEN')
    const trelloListId = getEnvironment('TRELLO_LIST_ID')

    if (!leadUrl || !leadToken || !trelloApiKey || !trelloApiToken || !trelloListId) {
      console.error('Studio132 lead integrations are not configured.')
      return json({ message: 'Não foi possível registrar sua solicitação agora.' }, 503)
    }

    const description = [
      'Nova solicitação de consultoria Studio132',
      '',
      `Nome: ${data.nome}`,
      `Cidade/UF: ${data.cidade_uf}`,
      `WhatsApp: ${data.whatsapp}`,
      `Melhor horário: ${data.horario_contato}`,
      `Tipo de projeto: ${data.tipo_projeto}`,
      `Ambiente: ${data.ambiente}`,
      `Nível de interesse: ${data.nivel_escolhido}`,
    ].join('\n')

    let leadResponse
    try {
      leadResponse = await fetchImpl(leadUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${leadToken}`,
          'Idempotency-Key': idempotencyKey,
          'User-Agent': 'Mozilla/5.0 (compatible; Studio132/1.0)',
        },
        body: JSON.stringify({ nome: data.nome, whatsapp, mensagem: description, dados: data }),
        signal: AbortSignal.timeout(15000),
        redirect: 'manual',
      })
    } catch (error) {
      const reason = String(error?.message || 'Unknown network error').replaceAll(leadToken, '[REDACTED]').replace(/https?:\/\/\S+/g, '[URL]')
      console.error('TetoApp lead request failed.', reason)
      return json({ message: 'Não foi possível registrar sua solicitação agora.' }, 502)
    }

    if (!leadResponse.ok) {
      console.error(`TetoApp rejected the submission with status ${leadResponse.status}.`)
      return json({ message: 'Não foi possível registrar sua solicitação agora.' }, 502)
    }

    const cardData = new URLSearchParams({
      key: trelloApiKey,
      token: trelloApiToken,
      idList: trelloListId,
      name: `${data.nome} - ${data.tipo_projeto}`,
      desc: description,
      pos: 'top',
    })

    let response

    try {
      response = await fetchImpl('https://api.trello.com/1/cards', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: cardData,
        signal: AbortSignal.timeout(15000),
      })
    } catch {
      console.error('Trello request failed.')
      return json({ message: 'Não foi possível registrar sua solicitação agora.' }, 502)
    }

    if (!response.ok) {
      console.error(`Trello rejected the submission with status ${response.status}.`)
      return json({ message: 'Não foi possível registrar sua solicitação agora.' }, 502)
    }

    return json({ message: 'Solicitação enviada com sucesso.' }, 201)
  }
}
