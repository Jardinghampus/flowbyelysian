"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function SignUpPage() {
  const router = useRouter()

  const handleSignUp = () => {
    router.push("/dashboard")
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size={44} tone="hero" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Demo Mode - Click below to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSignUp}
            className="w-full cursor-pointer"
            size="lg"
          >
            Enter Demo
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline hover:text-primary">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
