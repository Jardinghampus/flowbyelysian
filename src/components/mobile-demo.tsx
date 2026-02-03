"use client"

import * as React from "react"
import { useMobileViewport } from "@/hooks/use-mobile-viewport"
import { fluidCalc } from "@/lib/fluid"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function MobileDemo() {
    const { isMobile } = useMobileViewport()

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-fluid pt-safe pb-safe">
            <div className="w-full max-w-md space-y-4">
                <div className="text-center mb-8">
                    <h1 className="text-fluid-xl font-bold tracking-tight">Fluid Mobile System</h1>
                    <p className="text-muted-foreground text-fluid-sm mt-2">
                        Resize your viewport between 320px and 430px to see fluid scaling.
                    </p>
                    <div className="mt-2 text-xs font-mono bg-muted p-2 rounded">
                        Scale Factor: <span className="font-bold text-primary">var(--scale-factor)</span>
                    </div>
                </div>

                <Card className="w-full border-border/50 shadow-sm">
                    <CardHeader className="p-fluid">
                        <CardTitle className="text-fluid-lg">Dynamic Card</CardTitle>
                        <CardDescription className="text-fluid-sm">
                            This card scales spacing and text based on viewport width.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-fluid pt-0 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-fluid-base">Email</Label>
                            <Input
                                id="email"
                                placeholder="m@example.com"
                                className="h-[clamp(2.75rem,2.75rem+0.5vw,3.25rem)] text-fluid-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-fluid-base">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                className="h-[clamp(2.75rem,2.75rem+0.5vw,3.25rem)] text-fluid-base"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="p-fluid pt-0">
                        <Button className="w-full h-[clamp(2.75rem,2.75rem+0.5vw,3.25rem)] text-fluid-base font-medium">
                            Sign In
                        </Button>
                    </CardFooter>
                </Card>

                <div className="grid grid-cols-2 gap-fluid">
                    <Button variant="outline" className="h-[clamp(2.5rem,2.5rem+0.5vw,3rem)] text-fluid-sm">
                        Forgot Password?
                    </Button>
                    <Button variant="ghost" className="h-[clamp(2.5rem,2.5rem+0.5vw,3rem)] text-fluid-sm">
                        Create Account
                    </Button>
                </div>

                {/* Debug Info */}
                <div className="mt-8 p-4 rounded-lg border border-dashed text-xs text-muted-foreground">
                    <p>Viewport: {isMobile ? "Mobile (<768px)" : "Desktop"}</p>
                    <p>Safe Top: var(--sat)</p>
                    <p>Safe Bottom: var(--sab)</p>
                </div>
            </div>
        </div>
    )
}
