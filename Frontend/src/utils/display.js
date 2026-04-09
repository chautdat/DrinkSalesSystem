export function idKey(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

export function shortId(value, head = 6, tail = 4) {
  const text = idKey(value)
  if (!text) return '—'
  if (text.length <= head + tail + 3) return `#${text}`
  return `#${text.slice(0, head)}...${text.slice(-tail)}`
}
