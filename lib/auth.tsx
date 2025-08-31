"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { supabase } from "@/lib/supabaseClient"

type UserData = {
  id?: string
  email?: string
  username?: string
  area?: string
}

const AuthContext = createContext<{ user: UserData | null }>({ user: null })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    // Ver si hay login local guardado
    const localUsername = localStorage.getItem("username")
    if (localUsername) {
      setUser({ username: localUsername, area: "Equipo" })
    }

    // Ver si hay login con Google en Supabase
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? undefined,
          username: data.user.email?.split("@")[0],
          area: "Google",
        })
      }
    })

    // Escuchar cambios de sesión en Supabase
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? undefined,
          username: session.user.email?.split("@")[0],
          area: "Google",
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
