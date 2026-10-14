import { createConsultoriaHandler as createHandler } from '../../lib/consultoria-submissions.js'

export function createConsultoriaHandler(options = {}) {
  return createHandler({ getEnvironment: name => process.env[name], ...options })
}

export default createConsultoriaHandler()

export const config = {
  path: '/api/consultoria/submissions',
  method: 'POST',
}
