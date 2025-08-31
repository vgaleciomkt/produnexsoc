"use client"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"

export default function LoginForm() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) console.error(error.message)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button onClick={handleGoogleLogin}>
        Iniciar sesión con Google
      </Button>
    </div>
  )
}
