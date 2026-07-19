"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { Loader2 } from "lucide-react"
import { SpaceBackground } from "@/components/landing/space-background"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Sign in failed")
      }

      if (data.user?.mustChangePassword) {
        router.push("/change-password")
        router.refresh()
        return
      }

      const next = searchParams.get("next") || "/app/dashboard"
      router.push(next)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-white/10 bg-neutral-950/75 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <Logo size={44} tone="hero" className="ring-1 ring-white/10" />
        </div>
        <CardTitle className="text-2xl text-white">Welcome to Zaylo</CardTitle>
        <CardDescription className="text-neutral-400">
          Sign in with your name or email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-300">
              Name or email
            </Label>
            <Input
              id="email"
              type="text"
              autoComplete="username"
              placeholder="hampus, aaron, elsje, laura"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-white/15 bg-white/5 text-white placeholder:text-neutral-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-neutral-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-white/15 bg-white/5 text-white"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button
            type="submit"
            className="w-full cursor-pointer rounded-full bg-white text-neutral-950 hover:bg-neutral-200"
            size="lg"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function Page() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-neutral-950 p-6 md:p-10">
      <SpaceBackground intense />
      <Suspense
        fallback={
          <Card className="relative z-10 w-full max-w-md border-white/10 bg-neutral-950/75 backdrop-blur-xl">
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </CardContent>
          </Card>
        }
      >
        <div className="relative z-10 w-full max-w-md">
          <SignInForm />
        </div>
      </Suspense>
    </div>
  )
}
