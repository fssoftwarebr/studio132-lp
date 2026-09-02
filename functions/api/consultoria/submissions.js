const fields = {
  nome: 255,
  cidade_uf: 255,
  whatsapp: 50,
  horario_contato: 100,
  tipo_projeto: 100,
  ambiente: 255,
  nivel_escolhido: 100,
}

export async function onRequestPost({ request, env, fetch: fetchRequest }) {
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

  for (const [field, maxLength] of Object.entries(fields)) {
    const value = typeof payload[field] === 'string' ? payload[field].trim() : ''

    if (!value || value.length > maxLength) {
      return json({ message: 'Preencha todos os campos obrigatórios.' }, 422)
    }

    data[field] = value
  }

  if (!env.TRELLO_API_KEY || !env.TRELLO_API_TOKEN || !env.TRELLO_LIST_ID) {
    console.error('Studio132 Trello integration is not configured.')
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

  const cardData = new URLSearchParams({
    key: env.TRELLO_API_KEY,
    token: env.TRELLO_API_TOKEN,
    idList: env.TRELLO_LIST_ID,
    name: `${data.nome} - ${data.tipo_projeto}`,
    desc: description,
    pos: 'top',
  })

  const trelloFetch = fetchRequest ?? fetch
  let response

  try {
    response = await trelloFetch('https://api.trello.com/1/cards', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: cardData,
    })
  } catch (error) {
    console.error('Trello request failed.', error)
    return json({ message: 'Não foi possível registrar sua solicitação agora.' }, 502)
  }

  if (!response.ok) {
    console.error(`Trello rejected the submission with status ${response.status}.`)
    return json({ message: 'Não foi possível registrar sua solicitação agora.' }, 502)
  }

  await response.json()

  return json({ message: 'Solicitação enviada com sucesso.' }, 201)
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
