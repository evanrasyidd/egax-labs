export function sanitize(str: unknown, maxLen = 500): string {
  let s = String(str ?? '').trim()
  s = s.replace(/<[^>]*>/g, '')
  if (s.length > maxLen) s = s.slice(0, maxLen)
  return s
}

export function adminAuth(req: Request): string | null {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return null
  const token = auth.slice(7).trim()
  return token === process.env.ADMIN_SECRET ? token : null
}
