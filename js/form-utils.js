export function formatWhatsapp(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) return digits ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`

  const prefixLength = digits.length === 11 ? 5 : 4
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 2 + prefixLength)}-${digits.slice(2 + prefixLength)}`
}

export function normalizeWhatsapp(value) {
  return String(value ?? '').replace(/\D/g, '')
}
