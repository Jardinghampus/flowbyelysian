"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"

export default function Page() {
  const router = useRouter()

  const handleSignIn = () => {
    router.push("/user/dashboard")
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size={48} />
          </div>
          <CardTitle className="text-2xl">Welcome to Flow</CardTitle>
          <CardDescription>
            Demo Mode - Click below to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSignIn}
            className="w-full cursor-pointer"
            size="lg"
          >
            Enter Demo
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            This is a demo version. Authentication is disabled.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
