import 'dotenv/config'

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env var: ${key}`)
  return value
}

export const config = Object.freeze({
  port: Number(process.env['PORT'] ?? 3000),
  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseAnonKey: requireEnv('SUPABASE_ANON_KEY'),
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:8081',
})
