import { createConsultoriaHandler } from '../../../lib/consultoria-submissions.js'

export function onRequestPost({ request, env, fetch: fetchImpl }) {
  return createConsultoriaHandler({ getEnvironment: name => env[name], fetchImpl })(request)
}
