import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Solver from '@/pages/Solver'
import History from '@/pages/History'
import Bookmarks from '@/pages/Bookmarks'
import { supabase } from '@/supabaseClient'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export default function App() {
  const { setUser, clearAuth, setInitializing } = useAuthStore()

  useEffect(() => {
    let mounted = true

    authApi
      .getSession()
      .then(async (session) => {
        if (!mounted) return
        if (session?.user) {
          try {
            const profile = await authApi.me(session.user.id)
            setUser(profile)
          } catch {
            clearAuth()
          }
        }
      })
      .finally(() => {
        if (mounted) setInitializing(false)
      })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        clearAuth()
        return
      }
      try {
        const profile = await authApi.me(session.user.id)
        setUser(profile)
      } catch {
        clearAuth()
      }
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/solver" element={<Solver />} />
          <Route path="/history" element={<History />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
        </Route>
      </Routes>
    </div>
  )
}
