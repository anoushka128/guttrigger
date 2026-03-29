import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const isConfigured = SUPABASE_URL.startsWith('https://') && SUPABASE_KEY.length > 20

export async function createClient() {
  const cookieStore = await cookies()

  // Return a no-op client stub when Supabase isn't configured (local preview)
  if (!isConfigured) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: {}, error: { message: 'Supabase not configured' } }),
        signUp: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({}),
      },
    } as ReturnType<typeof createServerClient>
  }

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
