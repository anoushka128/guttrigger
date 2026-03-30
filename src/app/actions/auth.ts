'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export type AuthState = {
  error?: string
  message?: string
} | undefined

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  let supabase
  try {
    supabase = await createClient()
  } catch {
    return { error: 'Auth service unavailable. Check your Supabase config in .env.local.' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Make Supabase error messages friendlier
    if (error.message.toLowerCase().includes('invalid login')) {
      return { error: 'Incorrect email or password.' }
    }
    if (error.message.includes('not configured')) {
      return { error: 'Auth not configured. Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.' }
    }
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'All fields are required.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (!/[A-Z]/.test(password)) {
    return { error: 'Password must contain at least one uppercase letter.' }
  }
  if (!/[0-9]/.test(password)) {
    return { error: 'Password must contain at least one number.' }
  }

  let supabase
  try {
    supabase = await createClient()
  } catch {
    return { error: 'Auth service unavailable. Check your Supabase config in .env.local.' }
  }

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.message.includes('not configured')) {
      return { error: 'Auth not configured. Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.' }
    }
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Failed to create account. Please try again.' }
  }

  // Check if Supabase requires email confirmation (session is null when it does)
  if (!data.session) {
    return {
      message: 'Check your email to confirm your account, then sign in.',
    }
  }

  // Create matching Prisma user record
  try {
    await prisma.user.upsert({
      where: { email: data.user.email! },
      update: { name },
      create: {
        id: data.user.id,
        email: data.user.email!,
        name,
      },
    })
  } catch (dbErr) {
    console.error('DB error during signup:', dbErr)
    return { error: `DB error: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}` }
  }

  redirect('/onboarding')
}

export async function logout(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
