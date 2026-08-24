import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const isMockMode =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-project') ||
  supabaseAnonKey.includes('your-anon-key')

if (isMockMode) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase environment variables are missing or default. App will run in Mock Mode with local simulations.',
  )
}

export const supabase = createClient(
  isMockMode ? 'https://mock.supabase.co' : supabaseUrl,
  isMockMode ? 'mock-anon-key' : supabaseAnonKey,
)

