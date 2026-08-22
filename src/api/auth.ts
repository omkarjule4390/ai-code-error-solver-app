import { supabase } from '@/supabaseClient'
import type { Profile } from '@/types'

function mapProfile(row: { id: string; email: string; full_name: string; created_at: string }): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    createdAt: row.created_at,
  }
}

export const authApi = {
  async register(email: string, password: string, fullName: string): Promise<Profile> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    if (!data.user) throw new Error('Sign up did not return a user')

    // profiles row is also created by a DB trigger (see supabase/migrations/001_init.sql),
    // but we upsert here too so the UI has the name immediately.
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({ id: data.user.id, email, full_name: fullName })
    if (upsertError) throw upsertError

    return { id: data.user.id, email, fullName, createdAt: new Date().toISOString() }
  },

  async login(email: string, password: string): Promise<Profile> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return authApi.me(data.user.id)
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async me(userId: string): Promise<Profile> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (error) throw error
    return mapProfile(data)
  },

  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },
}
